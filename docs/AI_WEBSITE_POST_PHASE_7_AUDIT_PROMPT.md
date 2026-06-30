# Post-Phase 7 Backend Verification Prompt

Provide this prompt together with `AI_WEBSITE_CREATION_PRD.md`.

```text
You have no memory of earlier prompts. Read the separately provided
AI_WEBSITE_CREATION_PRD.md completely; it is the authoritative requirement.

Inspect the current backend repository and verify what is actually implemented
for AI website creation/editing. Do not trust previous completion claims,
comments, or phase names. Inspect executable code, models, migrations, routes,
middleware, services, validators, configuration, tests, and API docs.

This is primarily an audit. Fix only small defects needed for accurate
verification; report substantial missing work. Never expose secrets.

Use:
- IMPLEMENTED: executable code exists.
- VERIFIED: relevant tests or safe API checks pass.
- PARTIAL, MISSING, NOT_APPLICABLE, or NOT_VERIFIED otherwise.

Distinguish code presence, migration creation/application, endpoint
implementation/testing, and deployment verification.

Create or replace:

docs/AI_WEBSITE_BACKEND_IMPLEMENTATION_HANDOFF.md

The document must let a frontend engineer integrate and test the feature
without backend-repository access or guesswork. Use these sections:

# AI Website Backend Implementation Handoff

## 1. Executive Status
State COMPLETE, PARTIAL, or NOT READY; audit date/commit; summary; blockers and
risks; and whether frontend development, integration testing, and release can
proceed.

## 2. PRD Traceability
Create one row per material PRD requirement:
requirement | status | exact file/symbol | test/evidence | frontend impact |
remaining work.

Cover every PRD area, including creation paths/fields, categories, aiContext,
editable schema and complete editor-field coverage, generation/progress,
Ask AI, chat/failures, conflict data, revert, full-site versions/restore,
listing integration, permissions, separate quotas/resetAt, locks/retries,
moderation, provider configuration, telemetry/privacy, legacy compatibility,
blank/store templates, and non-goals.

## 3. Backend Inventory and Persistence
List feature files, purposes, and important symbols. Document models, tables,
fields, relationships, indexes, defaults/nullability, migrations/order/status,
backfills, and legacy behavior.

Identify storage for aiContext, versions, generation sessions, website-AI
usage/quota, user categories, history/failures, and active-request locks.

## 4. AI Context and Editable Schema
Show the exact current redacted aiContext JSON and document each field's type,
default/nullability, writer, update timing, and frontend exposure. Explain
creation-path initialization, legacy/null handling, concurrent updates,
retention, sanitization, and excluded data.

Provide TypeScript-ready editable-target types and explain aiEditKey stability,
fieldPath format, nested/array paths, frontend target resolution, required
request identifiers, section/page targets, schema synchronization, stale
targets, and website-detail exposure.

Verify whether the schema supports every editor-visible property. List exact
gaps. Include supported examples for text, text color+shadow, button borders,
section background+spacing, layout/alignment/visibility, and nested fields.

## 5. Complete API Catalog
Document every feature/dependency endpoint, including:
- website list/detail and all creation paths;
- category list/create;
- website-AI usage/quota;
- generation and progress;
- edit-element and editor-chat;
- revert;
- full-site recreation;
- version list/restore;
- listing opt-in/readiness/enhance/publish.

For each endpoint provide method/path, purpose, auth/role/middleware order,
headers/parameters, exact typed request example, success status/envelope, actual
error statuses/codes/envelopes, duplicate/idempotency behavior, quota/lock/retry
effects, persistence/history/version side effects, async/SSE/polling behavior,
and required frontend action. Show exact JSON; do not say "standard response."

## 6. Frontend Integration and Types
Document the exact flow:
create -> optional listing -> optional generation -> progress -> editor.

Explain required fields; category duplicates; DB-template,
frontendTemplateId, blank, and store behavior; schema hydration and selection
resolution; Ask AI preview/apply/cancel and multi-patch application; whether
Apply/Cancel is acknowledged; conflict handling; chat scopes and multi-block
patches; failure continuation; revert; full-site confirmation/progress;
version list/restore; permission/quota/lock/retry UI; resetAt; progress
reconnect/cancel; and cache invalidation after mutations.

Provide TypeScript-ready types for all requests, successes, errors, AI context,
editable targets, patches, history, active requests, quota, progress events,
versions, revert, and restore.

## 7. Errors, Access, Quotas, and Provider
Create an error table:
HTTP status | code | response field locations | trigger | retryable |
frontend behavior.

Confirm actual behavior for authorization/not-found, unsupported/invalid patch,
quota, active request, retry limit, moderation, provider/timeout/session,
non-revertible turn, missing version, conflict, validation, and rate limiting.
Do not invent codes; show actual responses for missing requested codes.

Document owner/admin calculation, collaborator behavior, middleware per
endpoint, separate quota storage/counters, plan defaults, reset period,
operation charging/refunds, rate limits, lock scope/cleanup/recovery, retries,
environment variable names (not values), website model/fallback, separate
listings config, prompt builders, model response parsing/repair, validation
order, moderation, provider timeout/retries, and included/excluded provider
data.

## 8. History, Revert, Versions, and Listings
Document prompt/response/failure storage; before/after capture; applied,
cancelled, and rejected proposal tracking; turn identity; last-two revert
calculation; multi-property/multi-block and repeated revert; snapshot timing;
version schema/list ordering; restore transactions/backups; and frontend
refetches. If no Apply/Cancel acknowledgement exists, explain how applied state
is known.

Document listing creation-data reuse, opt-in contract, readiness rules,
AI-fillable fields, publishing, conflict precedence, and separation of listing
versus website AI keys/quotas/context.

## 9. Security, Tests, and Deployment
Document telemetry, correlation IDs, metrics, retention, access controls,
redaction, and protections against arbitrary paths, prototype pollution,
prompt injection, secret leakage, oversized context, binary/image leakage, and
cross-website access. List unresolved risks.

List relevant test files and run/report exact commands/results for migrations,
unit/integration/routes/auth/permissions, quota/locks/retries, schema/patches,
revert/versions/restore, legacy context, categories, and website-list
regressions. Name failures and never call unrun tests passing.

List environment names, migration/seed/backfill commands, services, deployment
order, rollback, smoke checks, and how to verify use of the separate website
OpenRouter key without exposing it.

## 10. Gaps and Final Frontend Handoff
List gaps by BLOCKER/HIGH/MEDIUM/LOW with owner, file/endpoint, fix, and impact
on development, integration, or release.

Provide an executable acceptance checklist covering all PRD flows, especially:
legacy website listing; every creation path; categories; with/without AI;
progress success/failure/reconnect; text and multi-style edits; button,
section/page/site edits; unsupported fields; retry/lock/conflict; all chat
scopes/failure continuation; two-turn revert; recreation/version restore;
roles; quota/resetAt; and listing completion/publish.

End with:
- Frontend can implement now.
- Frontend must wait.
- Exact endpoint/type changes required in the existing frontend.
- Ordered frontend implementation and integration-test plans.
- Go/no-go release recommendation.

Be concrete, cite exact paths/symbols, use actual JSON, separate inference from
verification, expose no secrets, and do not claim completion without evidence.
Run relevant tests and update the handoff with actual results.
```
