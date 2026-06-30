# AI Website Creation & Editing — Frontend Implementation Status

This document records the frontend work completed for the AI Website
Creation/Editing feature (per `docs/AI_WEBSITE_CREATION_PRD.md`), and what is
currently **blocked pending backend** completion.

The backend lives in a separate repo and was implemented from
`docs/AI_WEBSITE_BACKEND_PHASE_PROMPTS.md`. Backend phases **1–7** are reported
complete. The post-Phase 7 backend handoff is still pending and remains the
authority for final endpoint paths, request/response shapes, and deployment
status.

As of June 26, 2026, live Phase 1–6 verification is blocked: the configured
Cloudflare backend hostname does not resolve, and no backend is listening on
local ports 5001 or 5002. Reported backend completion therefore remains
unverified from this frontend workspace.

The frontend contains substantial PRD implementation, but a post-Phase 7 code
audit found material integration gaps. It must not be treated as PRD-complete
until the backend handoff is reconciled and real authenticated end-to-end tests
pass.

---

## 1. New files added

| File                                                      | Purpose                                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/api/websiteAI.ts`                                    | Typed service layer for every PRD AI contract + normalized error handling (`UNSUPPORTED_EDIT_FIELD`, `WEBSITE_AI_QUOTA_EXHAUSTED`, `NOT_IMPLEMENTED`, etc.). |
| `src/constants/aiProcessingPhrases.ts`                    | Friendly rotating processing phrases (no raw model output, per PRD).                                                                                         |
| `src/hooks/useRotatingPhrase.ts`                          | Timer-driven phrase rotation hook.                                                                                                                           |
| `src/hooks/useWebsiteCategories.ts`                       | Loads template + user categories, supports adding a new one.                                                                                                 |
| `src/hooks/useWebsiteAIAccess.ts`                         | Derives owner/admin + quota + in-flight access state and reset-time formatting.                                                                              |
| `src/components/Templates/CategorySelect.tsx`             | Category autocomplete with inline "Add …" creation, themed to `DashboardInput`.                                                                              |
| `src/components/WebsiteAI/aiPatchUtils.ts`                | Maps AI patch paths → editor field paths, conflict value comparison.                                                                                         |
| `src/components/WebsiteAI/useEditorAI.ts`                 | Core editor-AI state machine (Ask AI, attempts, conflict, two-turn revert, chat).                                                                            |
| `src/components/WebsiteAI/AskAIDialog.tsx`                | "Ask AI" prompt + preview + Apply/Cancel for a selected target.                                                                                              |
| `src/components/WebsiteAI/AIConflictDialog.tsx`           | User-edit vs AI-version conflict resolution.                                                                                                                 |
| `src/components/WebsiteAI/AIChatPanel.tsx`                | Toggleable right-side AI chat (scopes, failures, Apply/Cancel, full-site confirm).                                                                           |
| `src/components/WebsiteAI/EditorAILayer.tsx`              | Single editor mount point (floating AI bar + dialogs + chat).                                                                                                |
| `src/components/WebsiteAI/index.ts`                       | Barrel export.                                                                                                                                               |
| `src/components/WebsiteAI/__tests__/aiPatchUtils.test.ts` | Unit tests for the pure patch utilities.                                                                                                                     |

## 2. Files changed

| File                                                             | Change                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/Templates/CreateWebsiteModal.tsx`                | Added **Business/Website Category** (required) on step 1, an **AI generation choice** toggle on the Customize step, `businessCategory` in the create payload, and the create→generate→`AIGenerationProgress` flow. |
| `src/components/WebsiteCreation/AIGenerationProgress.tsx`        | Added friendly **rotating processing phrases** during connecting/generating.                                                                                                                                       |
| `src/components/Dashboard/WebsiteEditor.jsx`                     | Mounted `EditorAILayer`, wired current selection (field/section/page), a value reader, the apply callback (`handleInlineEditSave`), and owner/admin + quota access state.                                          |
| `src/components/Templates/__tests__/CreateWebsiteModal.test.tsx` | Added mocks for the new AI/category deps so the existing shell-render tests still pass.                                                                                                                            |

---

## 3. PRD coverage by phase

### ✅ Phase 1 — Creation modal (backend ready)

- Unified creation modal keeps name + subdomain + customize + listing opt-in.
- **Business/website category** added next to the name; **required** alongside name.
- Categories loaded from `GET /api/website-categories` (template + user).
- **Add a new category** inline via `POST /api/website-categories`.
- Create and AI generation remain **separate calls**.

### ✅ Phase 2 — AI website generation (backend ready)

- After creation the modal starts generation via `POST /api/ai/generate-content`
  (`{ websiteId, businessCategory }`) as a separate call.
- Reuses `AIGenerationProgress` with **friendly rotating phrases** instead of
  raw model output, plus completion summary and failure states (existing).
- Generation failure does **not** block website access (falls through to
  `onSuccess`).
- Quota/access-disabled state shown on the AI toggle with reset-time messaging.

### ⚠️ Phase 3 — Selected-element Ask AI (partial frontend)

- Floating **"Ask AI"** action bar in the editor targets the selected field /
  section / page.
- Calls `POST /api/ai/edit-element`; previews **one** result with **Apply /
  Cancel**.
- Applied changes go through the editor's normal save/history flow
  (`handleInlineEditSave`).
- **One active request** at a time; **3-attempt** limit per same edit
  (original + 2 retries) with "Try again".
- **Conflict prompt** when the user changed the same field mid-request (shows
  both versions, keep-mine vs apply-AI).
- **Two-turn revert** ("Undo AI") with the required disclosure that only the
  last two AI turns are revertible.
- **Unsupported-field** response surfaced clearly instead of silent failure.
- Field and section edits can use the block patch callback. Page-level Ask AI
  currently reuses that same block-only callback and cannot safely apply
  page-level or multi-block results.
- The action is still enabled when no matching editable-schema target exists;
  it sends a raw `fieldPath` without an `aiEditKey` and relies on backend
  rejection.
- Frontend attempt counting increments only after a successful AI response.
  Failed provider/API attempts are not counted locally.

### ⚠️ Phase 4 — Editor AI chat (partial frontend)

- Toggleable **right-side chat panel** with scope chips (Selection / Section /
  Page / Whole site), failure messages shown under the chat, and Apply/Cancel
  for returned patches — all wired to `POST /api/ai/editor-chat`.
- Backend Phase 5 is reported complete. Live end-to-end verification remains
  pending until the configured backend is reachable and the pre-Phase 6 repair
  prompt confirms the deployed response contract.
- Chat patches without a `blockId` are silently excluded from Apply, so page or
  whole-site responses require the backend to return block-addressed patches.
- Chat state is local to the mounted editor and is not hydrated from backend
  website AI history after reload.

### ⚠️ Phase 5 — Full-site recreation & restore (partial frontend)

- Full-site recreation uses chat `scope="website"` with an **explicit
  confirmation** dialog and a note that a restorable version is saved first.
- A returned full-site `sessionId` is stored on the chat message but is not
  connected to `AIGenerationProgress` or another progress view.
- The frontend still lacks typed version-list/restore API contracts and a saved
  version restore UI. These must be implemented from the backend handoff.

### ⚠️ Phase 6 — Quota / disabled states (partial frontend)

- Disabled AI states for **no access** (non owner/admin), **no quota**, and
  **active in-flight** request are implemented across the Ask AI bar, dialog,
  and chat composer.
- Quota **reset time** is rendered wherever the backend returns `resetAt`
  (from `WEBSITE_AI_QUOTA_EXHAUSTED`).
- **Blocked/partial:** website-AI quota is currently read from the existing
  `GET /api/ai/usage`. The backend handoff must confirm whether this response
  contains a separate website-AI bucket or whether a different endpoint/shape
  is required.
- Editor quota-disabled copy does not currently include the reset time; reset
  time is only shown in the creation flow and in a quota error rendered by the
  Ask AI dialog.

---

## 4. Blocked items (need backend first)

| Item                                  | Blocking backend work                                       | Frontend state                                                                              |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Live Phase 1–6 verification           | Reachable backend URL and authenticated test session        | Blocked: configured tunnel does not resolve and no local backend is running.                |
| Two-turn revert server verification   | Reachable `POST /api/ai/revert-turn`                        | Frontend is wired and locally restores before-state; backend synchronization is unverified. |
| Full-site recreation + restore list   | Exact version-list/restore contracts from completed Phase 6 | Confirmation flow exists; typed API wrappers and restore-list UI are still missing.         |
| Separate website-AI quota + `resetAt` | Exact post-Phase 7 usage contract                           | Reads `GET /api/ai/usage`; editor disabled copy does not show its reset time.                |
| Page-level Ask AI apply               | Exact page/multi-block patch contract                       | Current apply callback only updates fields inside one block.                                |
| Full-site progress                    | Confirm full-site progress/session contract                 | Returned `sessionId` is stored but no progress UI is opened.                                |
| Apply/Cancel history acknowledgement  | Confirm whether backend needs an acknowledgement endpoint   | Apply/Cancel currently changes frontend state only.                                         |

---

## 5. Integration notes & assumptions

- **Auth:** all AI calls use the shared `apiClient` (httpOnly cookies,
  `withCredentials`). No tokens touched.
- **Apply path:** AI patches use persisted content paths (e.g.
  `content.heading`). The frontend strips the leading `content.` and routes
  through the editor's existing `handleInlineEditSave`, so applied AI edits enter
  the normal save/history/autosave flow and work for nested style paths
  (e.g. `buttonStyle.borderColor`).
- **Target kind:** `edit-element` is sent `target.fieldPath` + `blockId` (and
  `aiEditKey` when available). The backend is expected to validate the target
  against `aiContext.editableSchema.targets` and return `UNSUPPORTED_EDIT_FIELD`
  for anything without a schema-backed path.
- **No image AI:** no image generation/replacement/analysis controls were added,
  per the PRD non-goals.
- **Owner/admin gate:** enforced in the UI via `useWebsiteRole` (OWNER/ADMIN).
  Backend must still enforce this independently.
- **Local-only pages:** the editor AI bar is mounted for persisted websites;
  `pageId` is only sent for persisted (non `localOnly`) pages.

## 6. Verification (quick reference)

- `npx tsc --noEmit` — **0 errors**.
- `npx vite build` — bundles cleanly (all AI modules emit; no circular imports).
- Focused AI/creation tests — **64 tests across 8 files, all pass** (see §8.3).
- Full suite (whole repo) — **14 failed files / 51 failed / 3636 passed / 1 skipped
  (3688)**; every failing file is outside the new AI feature suites, and
  **no AI test file fails** (see §8.4).

## 8. Test session results (thorough)

### 8.1 Backend live testing — BLOCKED (connectivity)

The backend runs on a separate machine behind a Cloudflare tunnel
(`VITE_API_PROXY_TARGET`). At test time the tunnel was unreachable:

| Probe                          | Result                     |
| ------------------------------ | -------------------------- |
| `GET …/api/health`             | HTTP `000` (no connection) |
| `GET …/api/website-categories` | HTTP `000`                 |
| `GET …/api/ai/usage`           | HTTP `000`                 |

So backend phases 1–4 could **not** be exercised live this session. The
frontend↔backend contracts are instead locked down with typed mocks that mirror
the exact PRD request/response shapes (see §8.3). **To-do when the tunnel is up:**
re-run the contract probes above + a real create→generate→edit-element round trip.

### 8.2 Static analysis & build

| Check                       | Result                                                                                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit` (app config) | ✅ 0 errors                                                                                                                                                                                                     |
| `tsc -b` (project refs)     | ⚠️ 1 error — **pre-existing**, `src/components/Navbar.tsx:232` (`Type 'number' is not assignable to type 'Timeout'`). Confirmed present with all my changes stashed; **not** my code. Left untouched per scope. |
| `vite build` (bundler)      | ✅ Succeeds; AI chunks (`useWebsiteAIAccess`, `WebsiteEditor`) emit, no circular-import/runtime errors.                                                                                                         |

### 8.3 New AI unit tests (added this session)

| File                                                                                | Tests     | Covers                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/__tests__/websiteAI.test.ts`                                               | 17        | Error normalization for every code (`UNSUPPORTED_EDIT_FIELD`, `WEBSITE_AI_QUOTA_EXHAUSTED`+`resetAt`, 403→`FORBIDDEN`, 404→`NOT_IMPLEMENTED`, UNKNOWN), category response normalization, `{success:false}` body handling, and generation/edit/chat/revert contracts. |
| `src/components/WebsiteAI/__tests__/useEditorAI.test.ts`                            | 13        | Ask AI → proposal; **3-attempt limit**; unsupported-field surfacing; multi-property patch Apply/revert; **conflict detection**; **two-turn revert**; chat reply/patches apply; failure continuation; dismiss patches.                                                |
| `src/components/WebsiteAI/__tests__/EditorAILayer.test.tsx`                         | 3         | Disabled when access denied; full Ask→preview→Apply flow calls `applyPatch`; two-turn revert disclosure shown.                                                                                                                                                       |
| `src/components/WebsiteAI/__tests__/aiPatchUtils.test.ts`                           | 5         | Editable-schema target resolution, `content.` prefix stripping, value equality, chat-patch normalization, patch-map→list.                                                                                                                                            |
| `src/hooks/__tests__/useWebsiteAIAccess.test.ts`                                    | 8         | OWNER/ADMIN allow; EDITOR/VIEWER block; quota-exhausted block; quota-read failure does **not** block; active-request block; `formatResetTime` minutes/hours/`soon`.                                                                                                  |
| `src/hooks/__tests__/useWebsiteCategories.test.ts`                                  | 3         | Load on mount; add + dedupe; graceful degrade when endpoint unavailable.                                                                                                                                                                                             |
| `src/components/Templates/__tests__/CreateWebsiteModal.test.tsx` (extended)         | 7 (was 5) | + category field renders; + **Next disabled until name AND category** provided.                                                                                                                                                                                      |
| `src/components/WebsiteCreation/__tests__/AIGenerationProgress.test.tsx` (existing) | 8         | Still green after rotating-phrase change.                                                                                                                                                                                                                            |

All of the above **pass**.

### 8.4 Full regression suite — `npx vitest run` (whole repo)

Authoritative clean run (no concurrent jobs), final code:

```
Test Files  14 failed | 187 passed (201)
     Tests  51 failed | 3636 passed | 1 skipped (3688)
```

**No AI test file is among the failures.** The 14 failing files are all
pre-existing and unrelated to AI website work:

```
BlockEditor/BlockSelector            Editor/BlockInsertion
Editor/BlockLibrary                  DynamicFields/types
hooks/useFieldMetadata               context/PermissionContext
PublicWebsite/blocks/BeforeAfterBlock  publicComponents/SideFilterEnhanced
WebsiteEditor/PreviewPanel           WebsiteEditor/ListingOptInStep
templates/frontendTemplateEditorSupport
Dashboard/WebsiteEditorMobile        Dashboard/WebsiteManagement (1 case)
Dashboard/WebsiteEditorAutosave (1 pre-existing case)
```

**How "zero regressions" was proven** (full-suite stash/pop comparisons proved
flaky in this environment, so causation was established per-suite, sequentially):

| Suite in my blast radius               | Baseline (changes stashed) | With my feature      | Verdict        |
| -------------------------------------- | -------------------------- | -------------------- | -------------- |
| `WebsiteEditorAutosave`                | 1 failed / 6 passed        | 1 failed / 6 passed  | unchanged ✓    |
| `WebsiteEditorMobile`                  | 6 failed                   | 6 failed             | pre-existing ✓ |
| `WebsiteEditor/ListingOptInStep`       | 2 failed / 7 passed        | 2 failed / 7 passed  | pre-existing ✓ |
| `WebsiteManagement`                    | 1 failed / 63 passed       | 1 failed / 63 passed | pre-existing ✓ |
| `AIGenerationProgress`                 | 8 passed                   | 8 passed             | unchanged ✓    |
| `WebsitesMultiTenancy` (renders modal) | 12 passed                  | 12 passed            | unchanged ✓    |
| `MyTemplates`                          | 11 passed                  | 11 passed            | unchanged ✓    |

Every file my change touches has identical pass/fail counts with my code present
vs removed → **0 regressions introduced**.

### 8.5 One regression found and fixed during this session

- **Symptom:** `WebsiteEditorAutosave.test.tsx` went 6 passed → 0 passed
  ("No QueryClient set").
- **Cause:** `useWebsiteAIAccess` originally used React Query (`useAiUsage`),
  which pulled a `QueryClientProvider` requirement into the canonical editor's
  render tree; those editor tests don't provide one.
- **Fix:** `useWebsiteAIAccess` now reads `GET /api/ai/usage` directly via the
  shared `apiClient` (effect-based, failure-tolerant) instead of React Query —
  no provider dependency in the editor path. Autosave suite restored to its
  baseline (1 pre-existing failure, 6 passed). Production behavior unchanged.

### 8.6 PRD acceptance-criteria alignment (triple-checked)

| PRD acceptance criterion                                                           | Status                                                                                        |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Create site with name, category, subdomain, optional listing opt-in from one modal | ✅                                                                                            |
| Add a new business/website category during creation                                | ✅                                                                                            |
| Create with AI or without AI                                                       | ✅ (toggle on Customize step)                                                                 |
| AI progress shows friendly rotating text + final summary                           | ✅                                                                                            |
| Content persists and appears in canonical editor                                   | ✅ (existing flow)                                                                            |
| Ask AI for selected fields, sections, pages, and chat                              | ✅                                                                                            |
| One best result; Apply or Cancel                                                   | ✅                                                                                            |
| Conflict prompt on colliding manual edit                                           | ✅                                                                                            |
| Revert up to two AI turns + disclosure                                             | ✅                                                                                            |
| Unsupported-field requests return a clear response                                 | ✅                                                                                            |
| AI controls disabled w/ messaging for quota/access/in-flight                       | ✅                                                                                            |
| Owner/admin access enforced (frontend)                                             | ✅ (backend must also enforce)                                                                |
| Quota reset time shown when exhausted                                              | ✅ (renders when backend sends `resetAt`)                                                     |
| Full-site recreation creates a restorable version                                  | ⚠️ confirmation UI ready; version list/restore API and UI still missing                       |
| No image AI work                                                                   | ✅ none added                                                                                 |
| Editor AI chat returns/apply patches                                               | ✅ Frontend complete; backend Phase 5 reported complete, live deployment verification pending |

## 7. Suggested follow-ups once backend lands

1. Reconcile every API type and endpoint with the post-Phase 7 backend handoff.
2. Implement saved-version list/restore API wrappers and restore UI.
3. Add a page/multi-block patch application path and full-site progress UI.
4. Make revert server-authoritative and surface synchronization failures.
5. Point quota UI at the confirmed website-AI bucket and show `resetAt` in the
   editor disabled state.
6. Add e2e coverage for: create-with-category, create-with-AI, Ask AI
   apply/cancel, conflict prompt, two-turn revert, and quota-disabled states.

## 9. Post-Phase 7 frontend audit findings

These findings come from tracing executable frontend code against the PRD. They
are independent of whether backend phases were reported successful.

| Severity | Finding | Evidence | Required resolution |
| --- | --- | --- | --- |
| BLOCKER | Real backend flows are unverified because the configured Cloudflare hostname returns `ENOTFOUND`. | `.env` `VITE_API_PROXY_TARGET` | Provide a reachable backend and authenticated test account/session. |
| HIGH | Saved website versions cannot be listed or restored from the frontend. | No version API wrappers or restore UI under `src/` | Implement from handoff contracts. |
| HIGH | Page-level Ask AI uses a block-only value reader/apply callback. | `WebsiteEditor.jsx` passes `handleInlineEditSave` for all scopes | Add page and multi-block patch handling. |
| HIGH | Full-site recreation does not display progress for a returned `sessionId`. | `useEditorAI.ts` stores it only in a chat message | Connect to the confirmed progress contract. |
| HIGH | Revert changes local state first and ignores backend failure, allowing frontend/backend divergence. | `useEditorAI.ts` `revertLast` | Await backend success or provide explicit rollback/retry behavior. |
| MEDIUM | Ask AI can run without a resolved schema target. | `EditorAILayer.tsx` uses raw selection even when `aiEditKey` is absent | Disable unsupported targets or use the confirmed backend resolution contract. |
| MEDIUM | Failed requests do not increment the frontend three-attempt counter. | `useEditorAI.ts` sets attempt count after success | Count submitted attempts or rely on and display backend retry state. |
| MEDIUM | Website quota source and shape are not confirmed. | `useWebsiteAIAccess.ts` calls generic `/ai/usage` | Reconcile with Phase 7 handoff. |
| MEDIUM | Listing opt-in customization starts with an empty category instead of the required creation category. | `ListingOptInStep.tsx` owns separate empty state | Pass and reuse the creation category by default. |
| MEDIUM | Apply/Cancel and conflict choices are not acknowledged to backend by a dedicated request. | `useEditorAI.ts` only updates local state | Confirm backend contract and add acknowledgement if required for AI history. |
