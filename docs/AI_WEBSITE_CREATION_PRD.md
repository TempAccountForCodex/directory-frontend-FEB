# AI Website Creation and Editing PRD

## Overview

Build AI assistance into the website creation and editing experience. Users should be able to create a website from any template with minimal required data, then continue improving the website through "Ask AI" actions on selected fields, sections, pages, and a toggleable editor AI chat panel.

V1 includes:

- AI-assisted website creation from all templates, including blank pages and store/e-commerce templates.
- A unified creation modal with website name, subdomain, business/website category, listing opt-in, and AI start controls.
- Website-level AI context stored in the database and updated over time.
- A website-specific editable schema generated at website creation time and stored in AI context.
- Selected-element, section, page, and full-site AI editing in the canonical editor.
- A right-side AI chat panel in the editor.
- Directory listing setup using website creation data and AI-generated missing fields where allowed.
- Owner/admin-only AI access, placeholder plan/quota logic, and separate website AI quota from listings AI quota.

## Product Goals

- Reduce manual setup work during website creation.
- Support AI on every editable template without hardcoding template-specific AI behavior.
- Cover every editable UI element and editable property in the editor with schema-backed AI targeting.
- Preserve the current template-first creation flow.
- Make generated content immediately editable in the canonical editor.
- Keep AI output structured, reviewable, revertible, and traceable.
- Reuse website creation data during listing setup and future AI edits.
- Avoid image AI work in V1 to keep scope focused on text/content and structure.

## Non-Goals

- Replacing the template-first flow with an AI-only website builder.
- AI image generation, replacement, rating, judgment, or visual analysis.
- Multiple generated variants for one request.
- Applying AI changes without user review, Apply, or confirmation.
- Supporting deprecated `src/pages/CustomizeWebsite.tsx` as an implementation target.
- Final pricing/plan design. V1 only needs placeholder/configurable plan and quota logic.

## Current System Context

Frontend paths already relevant:

- Template browsing and creation:
  - `src/pages/Templates.tsx`
  - `src/pages/CreateWebsiteWizard.tsx`
  - `src/components/Templates/CreateWebsiteModal.tsx`
- Existing AI intake/progress:
  - `src/pages/AIQuestionnairePage.tsx`
  - `src/components/WebsiteCreation/AIQuestionnaire.tsx`
  - `src/components/WebsiteCreation/AIGenerationProgress.tsx`
  - `src/hooks/useAIQuestionnaire.ts`
- Canonical editor:
  - `src/components/Dashboard/WebsiteEditor.jsx`
  - `src/components/WebsiteEditor/PreviewPanel.tsx`
- Deprecated route:
  - `src/pages/CustomizeWebsite.tsx` is explicitly deprecated and should not be used for the production implementation.

Existing AI/backend calls in the frontend:

- `GET /api/ai/usage`
- `POST /api/ai/generate-content`
- `GET /api/ai/progress/:sessionId`
- `POST /api/ai/generate-block`
- `POST /api/websites/:websiteId/listing/enhance`

Backend findings from the backend analysis:

- Templates are stored in `Template`; template history is stored in `TemplateHistory`; website-specific snapshots are stored in `template_instances`.
- Websites are stored in `Website` with `templateId`, `frontendTemplateId`, `template_snapshot`, and `template_source_type`.
- Pages are stored in `Page` with `websiteId`, `title`, `path`, `sortOrder`, and `isPublished`.
- Blocks are stored in `Block` with `pageId`, `blockType`, `content`, `sortOrder`, `isVisible`, and `variant`.
- AI generation sessions are stored in `AIGenerationSession`; usage is tracked in `AIUsage`.
- After website creation, DB templates and frontend/local templates use the same persisted page/block schema.
- Block validation exists in `backend/services/contentTypeService.js` and `backend/contentTypes/registry.js`.
- Bulk block updates use `PUT /api/websites/:websiteId/pages/:pageId/blocks`.
- Single-block update exists as `PUT /api/websites/:websiteId/pages/:pageId/blocks/:blockId`, but may not be fully implemented.
- Auth/permission controls include `authenticateToken`, `requireWebsiteAccess`, plan gating in `aiRoutes.js`, and rate limiting.

## Users and Permissions

Primary users:

- Website owners creating a new site from a template.
- Website owners editing an existing site.
- Admins managing or editing websites.

Access rules:

- Only website owners and admins can use website AI features.
- Collaborators who are not owners/admins should not see enabled website AI actions.
- Backend must enforce owner/admin access even if frontend controls are bypassed.

## User Experience

### Website Creation Flow

1. User opens the template gallery.
2. User previews a template and clicks "Use Template".
3. A unified creation modal asks for:
   - Website name.
   - Subdomain.
   - Business/website category.
   - Directory listing opt-in.
   - AI generation choice.
4. User can create with AI or create without AI.
5. Frontend creates the website first.
6. Frontend starts AI generation as a separate API call.
7. User sees AI progress and rotating friendly processing copy.
8. On completion, generated content is saved into pages/blocks and the user lands in the editor/manage overview.
9. If listing opt-in is enabled and required listing data is complete enough, AI can fill missing fields and publish after readiness checks pass.

### Required Creation Data

Only two fields are truly required for V1:

- Business/website name.
- Business/website category.

These fields must be used for:

- Website generation.
- Directory listing setup.
- Future editor-side AI context.

### Category Selection

The category selector must include:

- Categories currently used by templates.
- Categories added by users during website creation.

Users must be able to add a new category from the creation flow if existing options do not fit.

### AI Progress and Processing Copy

The UI should not stream exact model output in V1.

Instead:

- Show progress states such as connecting, processing, failed, disconnected, complete.
- Use predefined rotating status phrases while AI is working.
- Example tone: "surfing through sections", "dunking fresh copy", "spelunking through your site context".
- On completion, show a summary/confirmation popup and populate the relevant content.

### Editor "Ask AI"

In the canonical editor, "Ask AI" should be available on supported:

- Editable fields.
- Sections.
- Pages.
- Full website through the chat panel.

Behavior:

- The label is `Ask AI`.
- AI returns one best result, not variants.
- Frontend previews the proposed change and lets the user Apply or Cancel.
- Applied changes enter the normal editor save/history flow.
- AI-applied changes support two-turn revert.
- The UI must disclose that only the last two AI turns can be reverted.

Example requests:

- "Make this headline shorter."
- "Rewrite this section for lawyers."
- "Make this CTA more direct."
- "Generate three testimonial options."

### Editor AI Chat Panel

The editor should include a toggleable right-side AI chat panel.

The chat can operate on:

- Current selected field.
- Current selected section.
- Current page.
- Full website.

Chat requirements:

- Uses website AI context and recent edit history.
- Failed responses and errors appear in the sidebar under the chat.
- User can reference failures in follow-up chat requests.
- Full-site recreation requires explicit confirmation.
- Full-site recreation creates a new saved website version that can be restored.

### Conflict Handling

If a user manually changes a field while an AI request is processing for that same field:

- Do not silently overwrite the user edit.
- Show a conflict prompt.
- Display both the user's version and the AI version.
- Ask whether to keep the user's edit or apply the AI version.

## Website AI Context

Every website must have a default AI context JSON document created in the database at website creation time. The initial context can contain empty/default fields. It must populate and expand as the website changes.

Recommended storage:

- `Website.aiContext`
- `Website.aiContextVersion`
- `Website.lastAiModifiedAt`

Recommended service:

- `backend/services/aiContextService.js`

The website AI context should include:

- Website ID.
- Template used at creation:
  - DB template ID or frontend template ID.
  - Template name/category.
  - Template source type.
- Website creation data:
  - Website/business name.
  - Business/website category.
  - Subdomain.
  - Listing opt-in choice.
- Current website structure:
  - Pages.
  - Blocks.
  - Editable fields.
  - Stable AI edit keys.
- Website-specific editable schema:
  - Generated deterministically from the selected template/editor/block structure at website creation time.
  - Maps every editable UI element/property to a stable AI edit key.
  - Maps every editable UI element/property to a persisted content/style schema path.
  - Updated when pages, blocks, sections, or editable properties are added/removed/changed.
- Creation and edit history:
  - Website data changes.
  - Page changes.
  - Section changes.
  - Block changes.
  - Field-level before/after states.
- Prompt and response history:
  - Dynamic system prompt components.
  - Assigned AI role/instructions.
  - Website schema/context supplied to AI.
  - User request text.
  - AI structured response.
  - User reaction/action: applied, cancelled, retried, reverted, edited further.
  - Retry count and failure details.
- Listing data:
  - Listing opt-in state.
  - Generated listing data.
  - Listing publish/readiness state.
- Usage metadata:
  - AI generation sessions.
  - AI chat turns.
  - Selected-element edits.
  - Full-site regeneration attempts.
  - Errors.
- Two-turn revert history.

Context restrictions:

- Do not include unrelated user profile/account data.
- Do not include billing/auth data.
- Do not include image files or image visual analysis.
- Do not send uploaded images, image URLs for visual judgment, or binary media to AI.

## Stable AI Edit Keys

When a website is created from any template, backend must generate and store a website-specific editable schema in `Website.aiContext`. This schema is the source of truth for what AI can edit.

Backend should add stable AI edit keys wherever current identifiers are not reliable enough.

Stable keys and schema paths should make it possible to target every editable UI element and property, including:

- Pages.
- Sections.
- Blocks.
- Editable fields.
- Inner blocks or nested content where applicable.
- Text content.
- Button labels and links.
- Colors.
- Background colors.
- Borders, including color, width, style, and radius.
- Spacing, padding, margins, layout, alignment, visibility, and similar persisted style controls.

Existing backend identifiers include:

- Block `id`.
- `blockType`.
- Optional `variant`.
- AI metadata in `content`.

These can be used where reliable, but explicit AI edit keys should be added where needed for durable targeting and history tracing.

AI can only apply changes to real persisted schema paths listed in the website-specific editable schema. If the user asks for a UI change that does not yet have a schema-backed editable field, backend should return a structured unsupported-field response instead of inventing a field. Frontend/backend should then add the missing schema-backed field before that kind of AI edit can visually apply.

## AI Provider and Prompting

Provider/model:

- Use OpenRouter for website creation/editing AI.
- Use a separate OpenRouter API key from the listings AI flow.
- Model: `openrouter/free`.

Prompting:

- Prompts are backend-managed and dynamic.
- Prompt construction should include:
  - Website AI context.
  - Website-specific editable schema.
  - Relevant page/block/schema metadata.
  - User request.
  - Edit history.
  - Assigned AI role.
  - Required structured response shape.
- Recent prompt and AI result should be stored in website AI context.

Caching:

- Do not cache generated AI content across websites or users.
- Each website has its own context, so the same user request can require a different answer.
- Caching static template metadata or schema lookups is acceptable.

Moderation:

- Use the same moderation rules already used by the listings creation/editing AI flow.

## Quotas, Plans, and Rate Limits

V1 should include placeholder/configurable plan and quota logic. Exact pricing and quota amounts will be defined later.

Requirements:

- Separate quota buckets for:
  - Listings AI.
  - Website creation/editing AI.
- Owner/admin-only website AI usage.
- AI entry points clearly show access/quota state.
- If quota is exhausted, show disabled AI controls with a clear message and reset time.
- Backend enforces quotas even if frontend controls are bypassed.
- Only one website AI request can be in progress at a time for the current editing session.
- Same edit is limited to three total attempts: original request plus two retries.
- After three attempts, ask the user to work on something else or try again later.

## Directory Listing Behavior

Listing opt-in stays in the current creation flow.

If the user opts in:

- Website creation data should be reused as default listing data.
- AI can generate missing listing fields such as description.
- Auto-publish is allowed only after readiness/completeness checks pass.
- Required readiness fields confirmed by backend:
  - `businessName`
  - `businessCategory`
  - `description`
  - `city`
  - `region`
  - `country`
  - `phone`
  - `contactEmail`
  - `directoryOptedIn = true`
- Publish endpoint: `POST /api/websites/:id/publish`.
- Generated listing fields remain editable after creation.

## API Contracts

### List Website Categories

`GET /api/website-categories`

```json
{
  "success": true,
  "data": [
    {
      "value": "business",
      "label": "Business",
      "source": "template"
    },
    {
      "value": "custom-landscaping",
      "label": "Custom Landscaping",
      "source": "user"
    }
  ]
}
```

### Add Website Category

`POST /api/website-categories`

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

### Create Website From Template

Use the existing separate website creation call.

`POST /api/websites/from-template`

```json
{
  "templateId": "uuid-string",
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

For frontend/local templates, use `frontendTemplateId` instead of `templateId`.

### Start AI Website Generation

Use a separate call after website creation.

`POST /api/ai/generate-content`

```json
{
  "websiteId": 123,
  "businessCategory": "Agency"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "sessionId": "ai_session_abc",
    "status": "queued"
  }
}
```

### AI Generation Progress

`GET /api/ai/progress/:sessionId`

Should support current progress behavior and friendly processing/status phrases on the frontend.

### Edit Selected Element

`POST /api/ai/edit-element`

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
    "turnId": "turn_2",
    "patch": {
      "content.heading": "Premium websites for growing brands"
    },
    "previewText": "Premium websites for growing brands",
    "summary": "Shortened the hero headline and shifted the tone more premium."
  }
}
```

Unsupported field response:

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

### Editor AI Chat

`POST /api/ai/editor-chat`

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

### Full Website Recreation

Full website recreation should:

- Require explicit confirmation before starting/applying.
- Create a new saved website version.
- Allow restore to the previous version.
- Return a generation session ID if long-running.

### Revert AI Turn

`POST /api/ai/revert-turn`

```json
{
  "websiteId": 123,
  "turnId": "turn_2"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "revertedTurnId": "turn_2",
    "remainingRevertDepth": 1
  }
}
```

## Frontend Requirements

- Use one unified creation modal.
- Add business/website category next to website name.
- Load categories from template-used categories and user-created categories.
- Allow adding a new category during website creation.
- Keep name and category as the only truly required V1 fields.
- Keep listing opt-in where it appears today.
- Create website first, then start AI generation as a separate call.
- Reuse `AIGenerationProgress` for generation status.
- Show friendly rotating processing phrases instead of exact model output.
- Add "Ask AI" controls for selected fields, sections, pages, and the chat panel.
- Ensure every editable UI element/property exposed in the editor has a stable target and a persisted schema path before AI can modify it.
- Add a toggleable right-side AI chat panel.
- Show failed AI responses/errors under the AI chat.
- Add Apply/Cancel UI for AI patches.
- Add conflict UI when user edits collide with in-flight AI changes.
- Add disabled AI states for no access, no quota, and active in-flight request.
- Show quota reset time when quota is exhausted.
- Add two-turn revert UI and disclosure.
- Do not implement image AI controls.

## Backend Requirements

- Add category list/create support.
- Create `Website.aiContext`, `Website.aiContextVersion`, and `Website.lastAiModifiedAt`, or equivalent.
- Create `backend/services/aiContextService.js`, or equivalent.
- Create initial AI context on website creation.
- Update AI context after:
  - Website metadata changes.
  - Page/block edits.
  - AI edits.
  - Listing updates.
  - Full-site recreation.
  - Reverts.
- Add stable AI edit keys where needed.
- Generate and maintain website-specific editable schema in `Website.aiContext`.
- Ensure every supported editable UI property maps to a real persisted schema path.
- Return a structured unsupported-field response when a requested edit cannot be represented in the current schema.
- Configure OpenRouter website AI with a separate key from listings AI.
- Use `openrouter/free`.
- Enforce one active website AI request at a time per editing session.
- Enforce three attempts per same edit.
- Use listings AI moderation rules.
- Validate AI patches against block schemas before persistence.
- Store prompt/result history in AI context.
- Store element-level before/after state for AI edits.
- Support saved website versions for full-site recreation.
- Enforce owner/admin access and placeholder quota logic.

## Telemetry and Logging

Keep logging useful but not heavy.

Log:

- Request ID.
- Website ID.
- User ID.
- Target IDs.
- Action type.
- Model/key group.
- Status.
- Start/end timestamps.
- Retry count.
- Affected page/block IDs.
- Token/usage estimate if available.
- Error code/message.
- User action: applied, cancelled, retried, reverted.

Avoid:

- Heavy duplicated page snapshots in ordinary logs.
- Image data.
- Unrelated user profile/account data.

Store detailed before/after history only in AI context where needed for traceability and revert.

## Acceptance Criteria

- User can create a website with name, category, subdomain, and optional listing opt-in from one modal.
- User can add a new business/website category during creation.
- User can create with AI or without AI.
- AI generation creates and uses website AI context.
- AI progress displays friendly rotating processing text and final summary.
- Website content persists and appears in the canonical editor.
- AI controls appear for supported selected fields, sections, pages, and chat.
- Every editable UI element/property that AI supports maps to a stable target and persisted schema path.
- Unsupported UI property requests return a clear unsupported-field response instead of silently failing or inventing fields.
- AI controls are disabled with clear messaging when quota/access/in-flight state blocks usage.
- Owner/admin access is enforced on frontend and backend.
- AI selected-element edits return one best result.
- User can Apply or Cancel AI changes.
- User sees a conflict prompt if manual edits collide with AI results.
- User can revert up to two AI turns.
- Full-site recreation creates a restorable website version.
- Listing opt-in reuses website creation data and can auto-complete/publish only after readiness checks.
- No image AI work is included.

## Risks and Constraints

- `openrouter/free` may have availability, rate, or quality limitations.
- Website AI context can grow large; backend should version and prune/summarize if needed.
- Stable edit keys must be durable across template types and editor operations.
- Full-site recreation needs careful versioning to avoid destructive changes.
- Separate quota buckets and keys must be enforced backend-side, not only in UI.
- Conflict handling must prevent accidental overwrite of user edits.

## Phase-by-Phase Execution Plan

### Phase 1: Foundation and Contracts

Backend:

- Add category list/create endpoints using template categories plus user-created categories.
- Add `Website.aiContext`, `Website.aiContextVersion`, and `Website.lastAiModifiedAt`, or equivalent.
- Add `aiContextService` to create, derive, update, and persist website AI context.
- Add initial stable AI edit key strategy for pages, blocks, sections, and editable fields.
- Inventory editor editable UI properties and ensure schema-backed AI paths for each supported property.
- Configure separate OpenRouter key for website AI and model `openrouter/free`.
- Add placeholder quota config for website AI separate from listings AI.

Frontend:

- Update creation modal to include business/website category.
- Load template/user categories and support adding a new category.
- Keep required validation to website name and category.
- Preserve current subdomain and listing opt-in behavior.
- Keep creation and AI generation as separate calls.

Exit criteria:

- Website can be created with name/category.
- Initial `aiContext` is created.
- Category list and add flow works.

### Phase 2: AI Website Generation

Backend:

- Update `POST /api/ai/generate-content` to use `aiContext`.
- Ensure generated content validates against block schemas.
- Persist generation session, prompt, response, usage, and errors into `aiContext`.
- Update listing extraction/enhancement to reuse creation data and AI context.
- Enforce owner/admin access and website AI quota bucket.

Frontend:

- Start AI generation after website creation.
- Extend `AIGenerationProgress` with friendly rotating phrases.
- Show completion summary and failure states.
- Show quota/access-disabled AI states with reset time.
- Route users to editor/manage overview after completion.

Exit criteria:

- Create-with-AI works on DB templates, frontend templates, blank page, and store templates.
- Failures do not block website access.
- AI context records generation details.

### Phase 3: Selected-Element Ask AI

Backend:

- Add `POST /api/ai/edit-element`.
- Build dynamic prompts from website AI context, target metadata, user request, and required response schema.
- Return structured patches only.
- Validate patches before persistence.
- Store before/after state and prompt/response in `aiContext.aiHistory`.
- Enforce one active request and three attempts per same edit.

Frontend:

- Add "Ask AI" controls for supported selected fields, sections, and pages in `WebsiteEditor.jsx`/`PreviewPanel.tsx`.
- Ensure Ask AI is wired only to schema-backed editable properties, or shows/handles unsupported state clearly.
- Add prompt input, processing state, Apply/Cancel UI, and completion summary.
- Block additional AI requests while one is in progress.
- Add conflict prompt for in-flight AI results when user manually changed the same field.
- Add two-turn revert UI and disclosure.

Exit criteria:

- User can ask AI to edit a selected target.
- User can apply/cancel.
- Conflicts are handled.
- Two-turn revert works.

### Phase 4: Editor AI Chat

Backend:

- Add `POST /api/ai/editor-chat`.
- Support scopes: selected target, section, page, full website.
- Store chat turns and outcomes in website AI context.
- Return structured patches or session IDs.
- Surface failed requests/errors in a reusable format for follow-up prompts.

Frontend:

- Add toggleable right-side AI chat panel.
- Let chat use current selection/page/site scope.
- Show failed responses/errors under chat.
- Let user reference failures in follow-up requests.
- Support Apply/Cancel for chat patches.

Exit criteria:

- Chat can modify selected targets/page.
- Failed AI work can be continued from the chat.
- Chat history is stored in website AI context.

### Phase 5: Full-Site Recreation and Version Restore

Backend:

- Add saved website-version creation for full-site AI recreation.
- Support restore to previous website version.
- Store full-site recreation attempts in `aiContext`.
- Keep full-site changes non-destructive until confirmed.

Frontend:

- Add explicit confirmation for full-site recreation.
- Show processing/progress.
- Show generated summary.
- Add restore UI for saved website versions.

Exit criteria:

- Full-site recreation creates a restorable version.
- User can restore previous version.
- Current website is not destructively overwritten without confirmation.

### Phase 6: Quota, Plans, QA, and Hardening

Backend:

- Finalize placeholder plan config structure.
- Enforce separate website/listings AI quota buckets.
- Add telemetry/logging.
- Add tests for auth, quota, schema validation, retry limit, context updates, and revert.

Frontend:

- Add disabled state coverage for quota/access/in-flight request.
- Add reset-time messaging.
- Add tests for creation, AI generation, Ask AI, chat, conflict prompt, revert, and quota disabled states.
- Validate responsive behavior for creation modal and editor chat.

Exit criteria:

- Owner/admin AI access works.
- Quota-disabled UI is clear.
- Core flows pass automated and manual QA.
