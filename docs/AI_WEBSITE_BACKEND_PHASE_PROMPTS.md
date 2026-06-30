# AI Website Backend Phase Prompts

Use these prompts one at a time with the backend AI/agent. Each prompt is self-contained because the backend AI may not remember previous prompts or previous responses.

Slack response rule for every phase:

- Keep the response short enough for Slack.
- Do not paste long code blocks.
- Summarize files changed, key decisions, tests run, and blockers.
- If code was changed, include only tiny snippets when essential.
- If the answer is too long, give a concise summary plus a file/checklist reference.

## Phase 1 Prompt: Data and Context Foundation

```text
You do not have memory of prior prompts. This is Phase 1 of the AI website creation and editing backend implementation.

Goal: fully implement the Website AI Context foundation and creation-time editable schema. Inspect the existing repository first, then modify the code. Do not stop at recommendations or proposed code. Reuse compatible existing work and do not duplicate fields, migrations, services, or routes that already exist.

Core behavior:
- Every website owns a separate, versioned AI context JSON document.
- The context is created when the website is created, before any AI request.
- It contains the website's creation data, template reference, current persisted structure, editable schema, listing data, AI/edit history, active request, restorable full-site versions, and metadata.
- It must contain only website-scoped information. Do not copy unrelated user/profile/account, auth, billing, secrets, tokens, image binary/base64, or image-analysis data into it.
- The editable schema is the backend source of truth for later AI edits. It must map every persisted UI property that the editor can modify to a stable target and a real persisted field path.

Implement all of the following:

1. Website persistence
- Add these fields only if an equivalent does not already exist:
  - aiContext: nullable JSON
  - aiContextVersion: string with default "1.0"
  - lastAiModifiedAt: nullable datetime
- Create the required migration using the repository's migration conventions.
- Preserve compatibility with existing Website records whose aiContext is null.

2. AI context service
- Create or complete an aiContext service using existing project conventions.
- Export:
  - createInitialAIContext
  - deriveAIContext
  - syncCurrentStructure
  - generateEditableSchema
  - syncEditableSchema
  - updateAIContext
  - appendAIHistory
  - setActiveAIRequest
  - clearActiveAIRequest
  - getRecentRevertibleTurns
- Avoid lost updates when changing one context section. Preserve all valid sections not being changed.
- Set lastAiModifiedAt for AI-driven context changes.

3. Required initial context shape
- createInitialAIContext must produce a JSON object with:
  - version
  - templateInfo
  - creationData
  - currentStructure
  - editableSchema
  - listingData
  - aiHistory
  - activeRequest
  - fullSiteVersions
  - metadata
- Use sensible empty values for information not available at creation time.
- Store timestamps in a consistent backend-supported format.

4. Complete editable schema
- generateEditableSchema must inspect the real persisted website/page/section/block/element structure and its actual schemas.
- Generate one target for every persisted property that users can edit in the website editor, including editable content, layout, spacing, typography, colors, borders, radius, shadows, visibility, alignment, links/actions, and other supported settings.
- Do not include image binary data or require visual image analysis. A normal persisted image reference may remain part of website structure only when the existing editor already treats that reference as an editable field.
- Each target must include:
  - aiEditKey
  - kind
  - label
  - pageId
  - sectionId when relevant
  - blockId or elementId when relevant
  - blockType or elementType when relevant
  - fieldPath
  - valueType
  - allowedOperations
  - currentValue
- aiEditKey must be deterministic and stable for the same website object and property.
- fieldPath must identify a real persisted property that backend code can later resolve and update. Never invent a field path merely to increase coverage.
- Use IDs/stable identifiers rather than array positions wherever the data model permits it.
- Do not create editable targets for read-only, computed, internal, identity, ownership, auth, billing, audit, or secret fields.
- Deduplicate targets by aiEditKey and reject or surface invalid/duplicate mappings during development or tests.
- editableSchema must contain version, generatedAt, and targets.

5. Context synchronization
- deriveAIContext must build current context from the saved website and preserve valid history/metadata.
- syncCurrentStructure must refresh the persisted website structure without erasing other context sections.
- syncEditableSchema must add new targets, update current values, and remove targets for deleted UI objects while preserving stable keys for unchanged objects.
- Connect structure/schema synchronization to the existing website structure mutation paths where practical so pages, sections, blocks, elements, and editable properties do not leave the schema stale.

6. Creation-path integration
- Inspect all actual website creation services/controllers/routes.
- Initialize and persist aiContext and editableSchema for every supported creation path:
  - database template creation
  - frontendTemplateId creation
  - blank website creation
- Generate the schema only after the initial website structure has been persisted and real IDs/paths are available.
- If one of these paths genuinely does not exist, report it as NA. Do not invent an unrelated route.
- If initialization fails, handle the creation transaction consistently with existing backend error conventions; do not silently create a website with an unusable partial context.

7. History and request helpers
- appendAIHistory must support prompt, response, operation/status, target aiEditKey, page/section/block/element references, before state, after state, timestamps, and error information when applicable.
- setActiveAIRequest and clearActiveAIRequest must preserve all other context data.
- getRecentRevertibleTurns must return no more than the two latest successfully applied revertible edits.
- Keep fullSiteVersions initialized for later implementation; do not build Phase 6 restore endpoints now.

8. Data protection
- Build context with explicit allowlisting and recursive sanitization.
- Exclude unrelated profile/account data, auth and billing data, passwords, API keys, access/refresh tokens, cookies, secrets, image binary/base64 payloads, and visual-analysis data.
- Ensure logs and tests do not expose sensitive values.

9. Tests and validation
- Add and run focused tests for:
  - initial context shape and defaults
  - supported creation-path initialization
  - editable target coverage for representative persisted editor fields
  - deterministic aiEditKey values
  - resolvable real fieldPath values
  - target deduplication
  - schema synchronization after add/update/delete structure changes
  - preservation of context sections during updates
  - sanitization/exclusions
  - active-request helpers
  - history traceability and the two-turn revert limit
  - legacy Website records with null aiContext
- Run the relevant migration/schema validation, formatter/linter if configured, and focused test suite.
- Fix failures caused by this implementation before replying.

Do not implement Phase 2 or later-phase endpoints in this task.

Your response may only be one line. Use exactly:
STATUS=COMPLETE|PARTIAL; FILES=<comma-separated paths>; MIGRATION=PASS|FAIL|NA; CREATION_PATHS=<db-template:yes/no/na,frontend-template:yes/no/na,blank:yes/no/na>; CONTEXT=PASS|FAIL; SCHEMA=PASS|FAIL; SYNC=PASS|FAIL; EXCLUSIONS=PASS|FAIL; TESTS=PASS|FAIL|NOT_RUN; MISSING=<comma-separated missing items or NONE>

Use COMPLETE only if the implementation and relevant tests are finished. Use PASS/YES only when verified from code or test output. Do not paste code or add explanations outside that one line.
```

## Phase 2 Prompt: Categories and Creation Integration

```text
 This is Phase 2 of AI website creation/editing backend work.

Goal: add website category support and store required creation data for AI.

Product context:
- V1 requires only website/business name and website/business category.
- Category dropdown should include categories used by templates plus categories users added during website creation.
- Users can add a new category during website creation.
- Website creation data must be stored in Website.aiContext.creationData.
- Creation and AI generation remain separate calls.

Please inspect the backend repo and implement/propose:
1. GET /api/website-categories
   - returns template categories + user-created categories
   - shape: { success: true, data: [{ value, label, source }] }
2. POST /api/website-categories
   - auth required
   - accepts { label }
   - normalizes slug/value
   - prevents duplicates
3. Extend POST /api/websites/from-template to accept:
   - businessCategory
   - listing.optIn
4. Persist businessCategory/listing opt-in where appropriate.
5. Store businessName, businessCategory, subdomain, listingOptIn in aiContext.creationData.
6. If blank website creation exists, create a default empty page/section AI can modify.
7. Add focused tests if practical.

Reply in Slack-friendly format:
- Files changed
- Endpoints added/updated
- Storage choice for user categories
- Tests run
- Frontend contract notes
- Blockers/assumptions
Keep it concise.
```

## Phase 3 Prompt: Website AI Generation

```text
 This is Phase 3 of AI website creation/editing backend work.

Goal: make website AI generation use Website.aiContext, separate OpenRouter website key, and website AI access/quota rules.

Product context:
- Website creation and AI generation are separate calls.
- Website AI uses OpenRouter with a separate key from listings AI.
- Model is openrouter/free.
- Website.aiContext includes an editableSchema generated at website creation time.
- If generation updates existing website UI fields, patches must target real fieldPaths from Website.aiContext.editableSchema.targets.
- Website AI quota is separate from listings AI quota.
- Only website owners/admins can use website AI.
- Only one website AI request can be active at a time.
- No image upload, image URL visual judgment, binary media, or visual analysis should be sent to AI.
- Use the same moderation rules as listings AI.

Please inspect current aiRoutes/generate-content/listings AI code and implement/propose:
1. Env/config:
   - OPENROUTER_WEBSITE_AI_API_KEY=<provided separately in environment>
   - OPENROUTER_WEBSITE_AI_MODEL=openrouter/free
2. Update POST /api/ai/generate-content:
   - auth required
   - owner/admin required
   - website AI quota required
   - one active request check
   - derive Website.aiContext
   - include Website.aiContext.editableSchema when existing UI fields may be patched
   - create AIGenerationSession
   - build dynamic prompt from website context
   - validate generated block content against schemas
   - validate any UI patch paths against editableSchema targets
   - persist content and AI history/context
   - clear active request on completion/failure
3. Keep or document GET /api/ai/progress/:sessionId behavior.
4. Add focused tests if practical.

Reply in Slack-friendly format:
- Files changed
- Config/env added
- Access/quota behavior
- Progress behavior
- Tests run
- Frontend contract notes
- Blockers/assumptions
Keep it concise.
```

## Phase 4 Prompt: Selected Element Ask AI

```text
 This is Phase 4 of AI website creation/editing backend work.

Goal: add backend support for selected field/section/page Ask AI edits.

Product context:
- Editor will call Ask AI on selected editable fields, sections, or pages.
- A website-specific editable schema is stored in Website.aiContext.editableSchema.
- That editable schema is the source of truth for what AI can edit.
- It is generated when the website is created from the selected template or blank flow.
- It must cover every editable UI element/property the editor exposes.
- AI can only modify real persisted schema paths listed in Website.aiContext.editableSchema.targets.
- Examples of editable properties include text, links, colors, background colors, border color/width/style/radius, spacing, layout, alignment, visibility, and other persisted style controls.
- AI returns one best result, not variants.
- Backend returns structured patches, not raw arbitrary HTML.
- If a requested UI change has no schema-backed field, return a structured UNSUPPORTED_EDIT_FIELD response instead of inventing a field.
- User applies/cancels on frontend.
- AI history should be stored in Website.aiContext.aiHistory with exact target and before/after state.
- Same edit can have 3 total attempts: original + 2 retries.
- Only one active website AI request at a time.
- Owner/admin only.

Please implement/propose:
1. POST /api/ai/edit-element
2. Request shape:
   { websiteId, pageId, blockId, target: { kind, fieldPath, aiEditKey }, instruction }
3. Backend behavior:
   - auth + owner/admin + website quota
   - one active request check
   - 3-attempt same-edit limit
   - derive aiContext
   - load Website.aiContext.editableSchema.targets
   - confirm target.aiEditKey and target.fieldPath exist in editableSchema
   - build dynamic prompt from context + target + instruction
   - require JSON patch output
   - validate patch paths against editableSchema targets and resulting block content
   - reject invented fields
   - return UNSUPPORTED_EDIT_FIELD for requested edits with no persisted schema path
   - return patch for preview/apply
   - store prompt, response, target, beforeState, afterState in aiContext.aiHistory
4. Add or sync stable AI edit keys if current identifiers are not reliable enough.
5. Inventory editable UI properties and note any missing schema fields needed for full coverage.
6. Add focused tests if practical.

Reply in Slack-friendly format:
- Files changed
- Endpoint details
- Patch validation approach
- editableSchema validation approach
- Unsupported-field behavior
- Missing schema fields found, if any
- aiHistory shape summary
- Tests run
- Frontend contract notes
- Blockers/assumptions
Keep it concise.
```

## Phase 5 Prompt: Editor AI Chat and Failure Continuation

```text
 This is Phase 5 of AI website creation/editing backend work.

Goal: add backend support for right-side editor AI chat and reusable failure context.

Product context:
- Chat can operate on selected target, section, page, or full website.
- Chat uses Website.aiContext and recent edit history.
- Chat-generated UI patches must use Website.aiContext.editableSchema.targets.
- If the user asks chat to edit a property that is not present in editableSchema, return UNSUPPORTED_EDIT_FIELD instead of inventing a field.
- Failed AI responses/errors should be stored so frontend can show them under chat and user can continue from the failure.
- Backend returns structured patches or session IDs, not raw arbitrary HTML.
- Owner/admin only, website quota, one active request.

Please implement/propose:
1. POST /api/ai/editor-chat
2. Request shape:
   { websiteId, scope, pageId?, target?, message }
3. Supported scopes:
   - editable target
   - section
   - page
   - website
4. Backend behavior:
   - auth + owner/admin + website quota
   - one active request check
   - derive aiContext
   - load editableSchema targets for patchable scopes
   - include recent chat/edit/failure history
   - validate patch paths against editableSchema targets
   - return UNSUPPORTED_EDIT_FIELD when no schema-backed target exists
   - return structured patches or generation session ID
   - store chat turn and failures in aiContext
5. Add focused tests if practical.

Reply in Slack-friendly format:
- Files changed
- Endpoint details
- Failure storage shape
- editableSchema validation approach
- Tests run
- Frontend contract notes
- Blockers/assumptions
Keep it concise.
```

## Phase 6 Prompt: Revert and Full-Site Versions

### Pre-Phase 6 Integration Repair Prompt

Run this once before the Phase 6 prompt:

```text
You do not have memory of prior prompts. Backend Phases 1-5 were implemented, but frontend integration has exposed API failures and contract gaps. Inspect and FIX the backend implementation before starting Phase 6. Do not only explain or propose changes.

Current failures:
- GET /api/websites?page=1&limit=12 returns a server error and the dashboard cannot display websites.
- POST /api/website-categories fails when the creation modal adds a new category.

Required repair and verification:
1. Reproduce GET /api/websites with an authenticated owner/admin and inspect the real stack trace. Fix any migration, ORM selection, JSON serialization, null legacy aiContext, editable-schema derivation, or response-mapping error introduced by Phases 1-5.
2. Confirm all Phase 1-5 migrations are applied and existing Website rows with null/legacy aiContext remain listable and editable.
3. GET /api/websites must not derive or regenerate heavy AI context/schema for every list row. Return normal lightweight website list data and preserve the existing pagination envelope.
4. GET /api/websites/:id must return the saved website aiContext, including aiContext.editableSchema.targets, because the editor uses it to resolve stable aiEditKey values.
5. Fix GET /api/website-categories and POST /api/website-categories. POST accepts { label }, requires auth, normalizes duplicates safely, and returns the created or existing category without a 500.
6. Use these category response contracts:
   GET: { success: true, data: [{ value, label, source: "template"|"user" }] }
   POST: { success: true, data: { value, label, source: "user" } }
7. Verify POST /api/websites/from-template accepts businessCategory for both DB-template and frontendTemplateId creation and stores it in Website.aiContext.creationData.
8. Verify POST /api/ai/edit-element accepts target { kind, fieldPath, aiEditKey }, confirms both values against editableSchema, and returns every validated requested patch in data.patch. Multi-property requests must not be reduced to one patch.
9. Verify POST /api/ai/editor-chat returns patches with blockId, path, and value so the frontend can apply them. Selected-target chat must accept/pass aiEditKey when supplied.
10. Ensure activeRequest is always cleared in finally/error paths for generate-content, edit-element, and editor-chat.
11. Add/run focused integration tests for:
   - website list with null and populated aiContext
   - website detail exposing editableSchema
   - category list/create/duplicate behavior
   - DB-template and frontendTemplateId creation with businessCategory
   - edit-element aiEditKey validation and multi-property patch output
   - editor-chat patch identifiers
   - activeRequest cleanup after success and failure
12. Do not implement Phase 6 revert/version work in this repair task.

Reply with EXACTLY ONE LINE:
STATUS=COMPLETE|PARTIAL; WEBSITES_LIST=PASS|FAIL; WEBSITE_DETAIL_SCHEMA=PASS|FAIL; CATEGORIES=PASS|FAIL; CREATION=PASS|FAIL; EDIT_ELEMENT=PASS|FAIL; EDITOR_CHAT=PASS|FAIL; ACTIVE_REQUEST_CLEANUP=PASS|FAIL; TESTS=PASS|FAIL|NOT_RUN; FILES=<comma-separated paths>; MISSING=<comma-separated items or NONE>
```

```text
 This is Phase 6 of AI website creation/editing backend work.

Goal: implement two-turn AI revert and full-site recreation with restorable website versions.

Product context:
- Users can revert only the last two applied AI turns.
- AI history is stored in Website.aiContext.aiHistory.
- Revert must restore exact beforeState for targeted fields/blocks.
- Full-site recreation must create a new saved website version that can be restored.
- Full-site recreation requires frontend confirmation before starting/applying.

Please implement/propose:
1. POST /api/ai/revert-turn
   - request: { websiteId, turnId }
   - owner/admin required
   - only last two applied AI turns revertible
   - restore exact beforeState
   - append revert action to aiContext
2. Full-site recreation:
   - support via editor-chat scope="website" or a dedicated endpoint
   - create restorable website version snapshot
   - store version metadata in aiContext.fullSiteVersions
   - add restore support if not already present
3. Add focused tests if practical.

Reply in Slack-friendly format:
- Files changed
- Revert algorithm summary
- Website version/restore approach
- Tests run
- Frontend contract notes
- Blockers/assumptions
Keep it concise.
```

## Phase 7 Prompt: Hardening, Quota, Telemetry, Documentation

```text
 This is Phase 7 of AI website creation/editing backend work.

Goal: harden backend AI website feature for frontend integration and QA.

Product context:
- Plans/pricing are placeholder/configurable for now.
- Website AI quota is separate from listings AI quota.
- Quota exhausted responses need resetAt.
- Website AI is owner/admin only.
- One active request at a time.
- Same edit max 3 attempts.
- Logging should be useful but not heavy.

Please implement/propose:
1. Finalize placeholder website AI quota config.
2. Ensure every website AI endpoint enforces:
   - authenticateToken
   - requireWebsiteAccess
   - owner/admin
   - website AI quota
   - one active request
   - retry limit where relevant
3. Add lightweight telemetry:
   - request ID, website ID, user ID, target IDs, action type, model/key group, status, timestamps, retry count, affected IDs, token/usage estimate if available, error code/message, user action
4. Ensure logs exclude:
   - image binary data
   - unrelated profile/account data
   - heavy full-page snapshots unless needed for audit/debug
5. Add/update backend API docs for frontend contracts.
6. Run relevant tests.

Reply in Slack-friendly format:
- Files changed
- Final endpoint list
- Final response contracts for quota/active-request/retry errors
- Tests run
- Known limitations
- Frontend integration notes
Keep it concise.
```

## Post-Phase 7 Final Audit and Frontend Handoff

After Phase 7 finishes, do not send another short phase prompt.

Copy and send the backend AI the **entire contents** of:

`docs/AI_WEBSITE_POST_PHASE_7_AUDIT_PROMPT.md`

Also provide:

`docs/AI_WEBSITE_CREATION_PRD.md`

The verification prompt is standalone and assumes no memory of earlier phases.
The PRD is supplied separately as the authoritative product source. The prompt
instructs the backend AI to inspect actual code and tests and create
`docs/AI_WEBSITE_BACKEND_IMPLEMENTATION_HANDOFF.md`.
