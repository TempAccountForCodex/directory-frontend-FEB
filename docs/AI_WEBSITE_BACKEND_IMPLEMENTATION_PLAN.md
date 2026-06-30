# AI Website Backend Implementation Plan

## Purpose

This document converts `docs/AI_WEBSITE_CREATION_PRD.md` into backend-specific implementation work. It is intended for a backend engineer or backend AI agent working in the backend repository.

The product goal is to support AI-assisted website creation and editing with:

- Separate create-then-generate API flow.
- Website-level AI context stored on the website.
- Website-specific editable schema generated at website creation time and stored in AI context.
- Dynamic backend prompts using website context and schemas.
- "Ask AI" edits for fields, sections, pages, and full-site chat.
- Owner/admin-only access.
- Separate quota bucket and OpenRouter key for website AI.
- No image generation, image upload, image rating, or image visual analysis.

## Existing Backend Facts

Backend analysis confirmed:

- `Template` stores DB templates with `pages`, `slug`, `name`, `category`, `features`, and `blockTypes`.
- `TemplateHistory` stores template version history.
- `template_instances` stores website-specific template snapshots.
- `Website` stores `templateId`, `frontendTemplateId`, `template_snapshot`, and `template_source_type`.
- `Page` stores `websiteId`, `title`, `path`, `sortOrder`, and `isPublished`.
- `Block` stores `pageId`, `blockType`, `content`, `sortOrder`, `isVisible`, and `variant`.
- `AIGenerationSession` stores AI generation sessions.
- `AIUsage` tracks AI usage.
- DB templates and frontend/local templates share the same persisted page/block schema after website creation.
- Block validation exists in `backend/services/contentTypeService.js` and `backend/contentTypes/registry.js`.
- Listing moderation/extraction/enhancement already exists and should be reused for moderation rules.
- Auth and access checks already include `authenticateToken`, `requireWebsiteAccess`, plan gating in `aiRoutes.js`, and rate limiting.

## Architecture Decisions

- Keep website creation and AI generation as separate API calls.
- Store website AI context on `Website`, not in a separate table for V1.
- Store two-turn AI history in `Website.aiContext.aiHistory` for V1.
- Add dedicated history table only later if querying/scale requires it.
- Use OpenRouter with a separate website AI API key from listings AI.
- Use model `openrouter/free`.
- Use separate quota bucket for website creation/editing AI.
- Owner/admin only for website AI.
- One website AI request in progress at a time per website/user editing session.
- Same edit gets three total attempts: original request plus two retries.
- Full-site recreation creates a restorable website version.

## Database Changes

### Website Model Fields

Add fields to `Website`:

```prisma
aiContext Json?
aiContextVersion String? @db.VarChar(20)
lastAiModifiedAt DateTime?
```

Recommended defaults:

- `aiContext`: initialized at website creation.
- `aiContextVersion`: `"1.0"`.
- `lastAiModifiedAt`: `null` until first AI modification.

### Optional Website Version Model

Add a restorable version model for full-site recreation.

Suggested shape:

```prisma
model WebsiteVersion {
  id String @id @default(uuid())
  websiteId Int
  userId Int
  source String @default("ai_full_recreation")
  label String?
  snapshot Json
  aiSessionId String?
  createdAt DateTime @default(now())
  restoredAt DateTime?

  website Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)
}
```

If an existing website version/history table exists, use it instead of adding a new one.

### Website Category Storage

Support categories from:

- Existing template categories.
- User-created categories during website creation.

If no category table exists, add:

```prisma
model WebsiteCategory {
  id String @id @default(uuid())
  value String @unique
  label String
  source String // "template" | "user"
  createdById Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Backend can also derive template categories live from `Template.category` and store only user-created categories.

## AI Context Schema

Store on `Website.aiContext`.

Initial context should be created at website creation time with empty/default arrays and objects.

Suggested V1 shape:

```json
{
  "version": "1.0",
  "websiteId": 123,
  "templateInfo": {
    "templateId": null,
    "frontendTemplateId": "company",
    "templateSourceType": "frontend",
    "name": "Company",
    "category": "business",
    "blockTypes": ["HERO", "FEATURES", "CONTACT"]
  },
  "creationData": {
    "createdAt": "2026-06-23T00:00:00.000Z",
    "businessName": "Northlane Studio",
    "businessCategory": "Agency",
    "subdomain": "northlane-studio",
    "listingOptIn": true
  },
  "currentStructure": {
    "pages": [],
    "lastSyncedAt": null
  },
  "editableSchema": {
    "generatedAt": null,
    "version": "1.0",
    "targets": []
  },
  "listingData": {
    "directoryOptedIn": false,
    "readinessStatus": "unknown",
    "lastSyncedAt": null
  },
  "aiHistory": [],
  "activeRequest": null,
  "fullSiteVersions": [],
  "metadata": {
    "lastAiModifiedAt": null,
    "lastManualModifiedAt": null
  }
}
```

### AI History Entry

Each AI edit/chat/generation should append a traceable entry:

```json
{
  "turnId": "turn_uuid",
  "sessionId": "session_uuid",
  "type": "element_edit",
  "scope": "editable",
  "status": "applied",
  "createdAt": "2026-06-23T00:00:00.000Z",
  "userId": 99,
  "target": {
    "websiteId": 123,
    "pageId": 456,
    "blockId": 789,
    "fieldPath": "heading",
    "aiEditKey": "home.hero.heading"
  },
  "prompt": {
    "userRequest": "Make this headline shorter",
    "systemRole": "website_editor",
    "responseShape": "json_patch"
  },
  "response": {
    "summary": "Shortened hero headline.",
    "patches": [
      {
        "path": "content.heading",
        "value": "Premium websites for growing brands"
      }
    ]
  },
  "beforeState": {
    "content.heading": "Professional website services for growing businesses"
  },
  "afterState": {
    "content.heading": "Premium websites for growing brands"
  },
  "userAction": "applied",
  "retryOfTurnId": null,
  "attempt": 1,
  "error": null
}
```

Keep enough history for complete website context, but only the last two applied AI turns need to be revertible in V1.

### Editable Schema Target

Each website should have an editable schema generated deterministically from its template/editor/block structure when the website is created. This schema is the source of truth for what AI can edit.

Suggested target shape:

```json
{
  "aiEditKey": "home.hero.cta.buttonStyle.borderColor",
  "kind": "style",
  "label": "Hero CTA border color",
  "pageId": 1,
  "blockId": 10,
  "blockType": "HERO",
  "fieldPath": "content.buttonStyle.borderColor",
  "valueType": "color",
  "allowedOperations": ["set"],
  "currentValue": "#111827"
}
```

The editable schema should cover every editable UI element/property exposed by the editor. AI prompts should use this schema, and AI patches must validate against it before applying.

When pages, blocks, sections, or editable properties are added/removed/changed, backend must sync this schema so future AI edits target the current website structure.

## Services to Add or Update

### `aiContextService`

Create `backend/services/aiContextService.js`.

Responsibilities:

- `createInitialAIContext(website, options)`
- `deriveAIContext(websiteId)`
- `syncCurrentStructure(websiteId)`
- `generateEditableSchema(websiteId)`
- `syncEditableSchema(websiteId)`
- `updateAIContext(websiteId, patchOrUpdater)`
- `appendAIHistory(websiteId, entry)`
- `setActiveAIRequest(websiteId, requestInfo)`
- `clearActiveAIRequest(websiteId)`
- `getRecentRevertibleTurns(websiteId, limit = 2)`
- `recordManualEdit(websiteId, changeMetadata)`
- `recordListingSync(websiteId, listingData)`

Implementation notes:

- Derive page/block structure with `pages` ordered by `sortOrder`, blocks ordered by `sortOrder`.
- Generate editable schema targets from pages, blocks, block content, style controls, and stable AI edit keys.
- Keep editable schema updated when pages/blocks/properties are added, removed, or changed.
- Do not include image binary data or visual analysis fields.
- Filter or omit large image fields from AI prompts.
- Keep a context version so future migrations can update shape.

### `websiteCategoryService`

Responsibilities:

- Read categories from `Template.category`.
- Read user-created categories.
- Normalize labels to values/slugs.
- Prevent duplicate labels/values.
- Create user category.

### `websiteAIService`

Responsibilities:

- Build dynamic prompts.
- Call OpenRouter with website AI key.
- Enforce structured output.
- Parse and validate AI JSON.
- Apply schema validation through existing block content validation.
- Save AI history.
- Enforce retry limits.
- Enforce one active request.

### `websiteVersionService`

Responsibilities:

- Snapshot current website pages/blocks before full-site recreation.
- Save AI-created website version.
- Restore a selected version.
- Record version metadata in `aiContext`.

## Environment Configuration

Add separate website AI configuration:

```env
OPENROUTER_WEBSITE_AI_API_KEY=
OPENROUTER_WEBSITE_AI_MODEL=openrouter/free
WEBSITE_AI_REQUESTS_PER_MINUTE=5
```

Do not reuse the listings AI key for website AI.

## API Endpoints

### Categories

`GET /api/website-categories`

Returns template categories plus user-created categories.

`POST /api/website-categories`

Auth required.

Request:

```json
{
  "label": "Custom Landscaping"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "value": "custom-landscaping",
    "label": "Custom Landscaping",
    "source": "user"
  }
}
```

### Website Creation

Continue to use:

`POST /api/websites/from-template`

Extend accepted payload:

```json
{
  "templateId": "uuid-string",
  "frontendTemplateId": "company",
  "name": "Northlane Studio",
  "subdomain": "northlane-studio",
  "businessCategory": "Agency",
  "customization": {
    "primaryColor": "#378C92"
  },
  "listing": {
    "optIn": true
  }
}
```

On success:

- Create website as today.
- Persist template/frontend template metadata.
- Create initial `aiContext`.
- Generate and store initial `aiContext.editableSchema` from the created pages/blocks/template structure.
- Create default blank page/section when no template is used and blank-page AI is requested/available.

### Start Website AI Generation

Continue or update:

`POST /api/ai/generate-content`

Request:

```json
{
  "websiteId": 123,
  "businessCategory": "Agency"
}
```

Backend behavior:

- Auth required.
- Owner/admin required.
- Website AI quota required.
- One active request check.
- Load/derive `aiContext`.
- Include `aiContext.editableSchema` in prompt context when generation may update existing UI fields.
- Create `AIGenerationSession`.
- Start async generation.
- Store prompt/session metadata in `aiContext`.

### AI Progress

Continue:

`GET /api/ai/progress/:sessionId`

Use existing SSE/progress behavior. Frontend owns friendly rotating copy.

### Edit Selected Element

New:

`POST /api/ai/edit-element`

Request:

```json
{
  "websiteId": 123,
  "pageId": 456,
  "blockId": 789,
  "target": {
    "kind": "editable",
    "fieldPath": "heading",
    "aiEditKey": "home.hero.heading"
  },
  "instruction": "Make this headline shorter and more premium"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "turnId": "turn_uuid",
    "summary": "Shortened the hero headline and shifted the tone more premium.",
    "patch": {
      "content.heading": "Premium websites for growing brands"
    },
    "previewText": "Premium websites for growing brands"
  }
}
```

Backend behavior:

- Auth required.
- Owner/admin required.
- Quota required.
- One active request check.
- Three-attempt limit for same edit target/request chain.
- Build context from `aiContext`.
- Validate target against `aiContext.editableSchema.targets`.
- Call OpenRouter.
- Validate patch shape.
- Validate patch paths against `aiContext.editableSchema.targets`.
- Validate patched block content against schema.
- Store before/after in `aiContext.aiHistory`.
- Return patch for frontend preview/apply.

### Editor Chat

New:

`POST /api/ai/editor-chat`

Request:

```json
{
  "websiteId": 123,
  "scope": "page",
  "pageId": 456,
  "target": {
    "kind": "page"
  },
  "message": "Rewrite this page to sound more premium"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "turnId": "turn_uuid",
    "reply": "I updated the page copy to use a more premium tone.",
    "patches": [
      {
        "blockId": 789,
        "path": "content.heading",
        "value": "Premium websites for ambitious brands"
      }
    ],
    "requiresConfirmation": false
  }
}
```

### Revert AI Turn

New:

`POST /api/ai/revert-turn`

Request:

```json
{
  "websiteId": 123,
  "turnId": "turn_uuid"
}
```

Backend behavior:

- Auth required.
- Owner/admin required.
- Turn must be among last two revertible AI turns.
- Restore exact before state for targeted fields/blocks.
- Append revert action to `aiContext`.

### Full-Site Recreation

Add endpoint or support through `editor-chat` with `scope = "website"`.

Required behavior:

- Explicit confirmation required from frontend before starting/applying.
- Create website version snapshot before applying generated changes.
- Return generation session ID if async.
- Store version metadata in `aiContext`.
- Support restore endpoint if no restore endpoint already exists.

## AI Output Schemas

### Patch Output

AI should return JSON only:

```json
{
  "summary": "Short summary for the user",
  "patches": [
    {
      "blockId": 789,
      "path": "content.heading",
      "value": "New value"
    }
  ]
}
```

Rules:

- No raw arbitrary HTML.
- Paths must target allowed content fields.
- Backend validates patch paths.
- Backend validates resulting block content.
- Unsupported fields are rejected.
- AI must not invent new content/style fields.
- Every supported editable UI property must map to a real persisted schema path before AI can modify it.
- AI patch paths must exist in `Website.aiContext.editableSchema.targets`.
- If the requested UI change has no persisted schema path, return a structured unsupported-field response.

Unsupported-field response:

```json
{
  "success": false,
  "code": "UNSUPPORTED_EDIT_FIELD",
  "message": "This element property is not editable yet.",
  "details": {
    "requestedChange": "button border color",
    "missingSchemaPath": "content.buttonStyle.borderColor"
  }
}
```

Backend should support schema-backed targeting for every editable UI property the editor exposes, including text, links, colors, background colors, border color, border width, border style, border radius, spacing, layout, alignment, visibility, and other persisted style controls.

## Access, Quota, and Request Control

Required checks for every website AI endpoint:

- `authenticateToken`
- `requireWebsiteAccess`
- Role is owner/admin.
- Website AI quota available.
- Separate website AI quota bucket, not listings AI quota.
- One active request per website/user editing session.
- Same edit attempt count is less than 3.

Quota exhausted response should include reset time:

```json
{
  "success": false,
  "code": "WEBSITE_AI_QUOTA_EXHAUSTED",
  "message": "AI quota used",
  "resetAt": "2026-07-01T00:00:00.000Z"
}
```

## Moderation and Safety

- Reuse the same moderation rules used by listing creation/editing AI.
- Do not send image data or image URLs for visual judgment.
- Do not include unrelated profile/account/billing/auth data.
- Validate generated listing content before auto-publish.
- Validate generated website block content against block schemas.

## Logging and Telemetry

Log:

- Request ID.
- Website ID.
- User ID.
- Target IDs.
- Action type.
- Model/key group.
- Status.
- Timestamps.
- Retry count.
- Affected page/block IDs.
- Token or usage estimate if available.
- Error code/message.
- User action: applied, cancelled, retried, reverted.

Do not log:

- Heavy full-page snapshots except where explicitly needed.
- Image binary data.
- Unrelated user personal/profile/account data.

## Backend Tests

Add tests for:

- Category list includes template categories and user categories.
- User can create a category.
- Website creation initializes `aiContext`.
- Blank website creation creates default empty page/section when needed.
- `generate-content` uses website AI key/config.
- Owner/admin can use website AI.
- Non-owner/non-admin cannot use website AI.
- Website AI quota is separate from listings AI quota.
- Quota exhaustion returns reset time.
- One active request blocks another.
- Same edit blocks after three attempts.
- AI patch rejects unsupported fields.
- AI unsupported UI-property request returns `UNSUPPORTED_EDIT_FIELD`.
- AI patch validates against block schema.
- AI edit stores prompt/response/before/after in `aiContext`.
- Revert works for last two AI turns.
- Revert rejects older turns.
- Full-site recreation creates restorable version.
- Moderation failure blocks persistence.

## Phase-by-Phase Backend Plan

### Phase 1: Data and Context Foundation

- Add migrations for `Website.aiContext`, `Website.aiContextVersion`, `Website.lastAiModifiedAt`.
- Add website version storage if needed.
- Add category storage if needed.
- Implement `aiContextService`.
- Initialize context on website creation.
- Add context sync for pages/blocks.
- Inventory editable UI properties and identify persisted schema paths or missing fields.
- Generate initial editable schema at website creation.

### Phase 2: Category and Creation Integration

- Add category list/create routes.
- Extend website creation payload with `businessCategory` and listing opt-in.
- Create initial blank page/section for blank-page AI.
- Store creation data in `aiContext`.

### Phase 3: Website AI Generation

- Configure OpenRouter website AI key/model.
- Update generation route to use `aiContext`.
- Store session/prompt/result/error metadata.
- Enforce owner/admin, quota bucket, and one active request.
- Validate generated block content.

### Phase 4: Ask AI Element/Page Editing

- Add edit-element route.
- Add dynamic prompt builder.
- Include website-specific editable schema in prompts.
- Add structured output parser/validator.
- Add patch application or patch preview response.
- Add unsupported-field handling for requested edits without schema-backed paths.
- Store before/after state and prompt history.
- Add retry limit.

### Phase 5: AI Chat and Failures

- Add editor-chat route.
- Support selected target, section, page, and website scopes.
- Return patches or async session IDs.
- Store chat turns.
- Store failures in reusable form.

### Phase 6: Revert and Full-Site Versions

- Add revert-turn route.
- Enforce two-turn revert limit.
- Add full-site recreation version snapshot.
- Add restore support.

### Phase 7: Hardening

- Add tests.
- Add telemetry.
- Add moderation integration.
- Add quota reset behavior.
- Add documentation for frontend API use.
