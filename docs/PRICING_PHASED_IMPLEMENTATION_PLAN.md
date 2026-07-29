# Pricing, Entitlements, Promos And Super Admin Phased Implementation Plan

This document is written for frontend and backend AI agents that have no prior chat context. Every phase includes a self-contained prompt, scope, acceptance criteria and manual testing steps.

Related tracking file:

- `docs/PRICING_PHASE_RESPONSES_LOG.md`

Separate implementation prompt files:

- `docs/PRICING_BACKEND_PHASES.md`
- `docs/PRICING_FRONTEND_PHASES.md`

## Non-Negotiable Product Rule

Every value that can change for business reasons must be configurable from the Super Admin dashboard and must not require a code deploy.

This includes:

- plan names
- plan descriptions
- plan feature copy
- plan status: active, hidden, coming soon, deprecated
- plan pricing
- price per website
- billing cycles
- annual savings
- months free
- early-bird pricing
- early-bird duration
- volume discount percentage
- volume discount thresholds
- volume discount caps
- volume discount display visibility
- promo codes
- promo percentages
- promo fixed discounts
- promo start/end dates
- promo usage limits
- promo stackability
- referral code
- referral discount percentage
- referral credit amount
- referral max benefit
- referral eligibility
- renewal copy
- promo banner copy
- promo banner order
- promo banner visibility
- comparison table display values
- free-plan upsell/nudge banners
- Super Admin-selected free templates

Backend must remain the source of truth for all final pricing calculations and entitlement enforcement. Frontend can preview pricing, but checkout and plan access must use backend-calculated results.

## Phase Response Handling

Agents may not have access to this frontend documentation repo. For every backend or frontend phase, the agent must return a detailed phase response in chat instead of trying to update `docs/PRICING_PHASE_RESPONSES_LOG.md` directly.

The response should include:

- agent/context
- repo/path and branch
- exact files inspected
- exact files changed
- commands run
- automated validation
- manual testing
- API examples where relevant
- database/model/migration details where relevant
- plan activation/user behavior where relevant
- blockers
- open decisions
- next recommended phase

The user will paste the response back into the frontend repo response log separately.

## Current Product Model

Techietribe is a website builder, AI website assistant and business directory/discovery product.

Plans:

- Free
- Pro
- Business

Recommended pricing model for planning:

- Paid users can buy a 1-website plan. There is no 5-website minimum.
- Pro package: recommended standard price `$9/website/month`.
- Pro early-bird price: `$7/website/month`.
- Business package: recommended standard price `$17/website/month`.
- Business early-bird price: `$15/website/month`.
- Keep Business as the current higher-tier implementation name unless product naming is changed separately.

Current site-count stops for paid plans:

- `1 -> 5 -> 10 -> 20 -> 25 -> 50 -> 100 -> 150 -> 200 -> 250`

Current planned discount behavior:

- annual billing gives configurable months free
- early-bird promo can reduce first-payment or promotional-period pricing according to Super Admin config
- volume discount can still exist in backend calculation, but it should not be called out as a separate visible chip on the pricing card unless Super Admin enables that display
- launch promo can apply to first annual paid payment according to Super Admin config
- referral promo can apply to first payment according to Super Admin config
- renewal uses configured regular monthly or annual price unless a deal explicitly changes renewal behavior

## Fixed Entitlement Gates

The exact prices and percentages are configurable, but the product capabilities below are the gates the system must enforce.

### Free

- 1 single-page landing site
- only Super Admin-selected free templates
- no duplicate/additional blocks beyond allowed template structure
- 1 built-in form
- 50 form submissions/month
- 5 blog posts
- 50 MB storage
- 5 AI actions/day
- `techietribe.app` subdomain only
- upgrade nudges when a gated action is attempted

### Pro

- everything in Free, plus paid site-count scaling
- directory listing for each paid site
- custom domain support
- built-in forms with no plan-level limit unless backend defines one
- unlimited blog posts
- up to 200 MB storage/site
- 100 AI actions/day
- custom code and embeds
- SEO optimization
- premium templates
- basic analytics
- 2 collaborators per website

### Business

- everything in Pro, plus higher-scale business features
- priority based directory listing
- advanced integrations
- built-in forms
- unlimited blog posts
- 1 GB storage/site
- 500 AI actions/day
- custom code, CSS and embeds
- SEO optimization
- blog comments and moderation controls
- conversion, funnel and real-time analytics
- 10 collaborators per website
- custom domains
- priority support
- light shop/catalog and payment-link features

## Architecture Requirements

Backend should own:

- pricing schema
- pricing calculation service
- checkout validation
- subscription state
- entitlement checks
- referral system
- promo/deal system
- promo banners
- Super Admin APIs
- audit logs and rollback

Frontend should own:

- public pricing page rendering
- pricing preview UI
- checkout form UI
- billing/account UI
- locked/upgrade UI states
- Super Admin screens
- frontend fallback config only for local development

## Backend Phases

### Backend Phase 1: Discover Existing Billing And Plan System

Self-contained prompt:

```text
You are working on the Techietribe directory backend. Your task is discovery only. Do not modify code.

Find the existing billing, subscription, Stripe, promo, referral, plan config and entitlement code. Produce a short implementation map that lists existing files, existing endpoints, current plan codes, current pricing logic, current promo/referral support and gaps.

Important business rule: every price, percentage, promo, referral setting, deal setting and banner setting must be editable from Super Admin eventually. Backend must become the final source of truth for checkout pricing and entitlements.

Do not assume prior chat context. Read the repo and report only verified facts with file paths.
```

Acceptance criteria:

- Lists existing plan codes and maps them to Free/Pro/Business if possible.
- Identifies whether there is an existing `Subscription` table or only user-level subscription fields.
- Identifies existing Stripe checkout/subscription flow.
- Identifies existing promo/referral support.
- Identifies entitlement checks already enforced and missing.
- Does not change code.

Manual testing:

- No app testing required.
- Confirm the report can be used by a backend agent without chat history.

Response log:

- Return the full detailed phase response in chat so it can be copied into `docs/PRICING_PHASE_RESPONSES_LOG.md` separately.

### Backend Phase 2: Pricing Schema And Super Admin Config Model

Self-contained prompt:

```text
You are working on the Techietribe directory backend. Implement the database/model layer for backend-owned pricing, plans, entitlements, promos, referrals and promo banners.

Strict rule: every price, percentage, promo, referral percentage, referral credit, volume discount, annual discount, deal and promo banner must be configurable through Super Admin, not hardcoded in frontend code.

Required models or equivalent storage:
- plans
- plan_prices
- plan_entitlements
- plan_features
- pricing_rules
- promo_codes
- referral_program_settings
- referrals
- referral_credit_ledger
- promo_banners
- pricing_audit_log
- subscriptions or normalized subscription state
- subscription_discounts

Preserve existing data and current app behavior. Add migrations safely. If current backend has different model names, adapt to existing conventions and document the mapping.
```

Acceptance criteria:

- Database/model changes exist for configurable plans, pricing, rules, promos, referrals and banners.
- All configurable business values are stored in data, not constants.
- Default seed data exists for Free, Pro and Business.
- Site-count stops are stored/configurable: `1, 5, 10, 20, 25, 50, 100, 150, 200, 250`. The `1` stop must be purchasable.
- Audit log model can record before/after values.
- Migration is non-destructive.

Manual testing:

- Run backend migration in local dev.
- Confirm seeded plans appear in DB.
- Confirm Pro and Business price-per-website values can be changed in DB without code changes.
- Confirm promo/referral/banner records can be created in DB.

Response log:

- Return the full detailed phase response in chat, including exact migration names, model names and seed command results.

### Backend Phase 3: Pricing Calculation Service

Self-contained prompt:

```text
You are working on the Techietribe directory backend. Build a single pricing calculation service that is used by pricing preview, checkout, renewals and Super Admin preview.

Inputs:
- plan id
- billing cycle
- site count
- promo code, optional
- referral code, optional
- user id, optional

Outputs:
- selected plan
- selected billing cycle
- selected site count
- price per website
- list price
- annual savings
- volume discount percentage
- volume savings
- early-bird discount
- promo discount
- referral discount
- final first payment
- renewal price
- applied rules
- rejected rules
- validation errors

Strict rule: frontend must not calculate final checkout price. Backend result is authoritative.
```

Acceptance criteria:

- One reusable service handles all pricing math.
- Validates selected plan is active and purchasable.
- Rejects hidden plans.
- Rejects coming-soon plans unless explicitly allowed for Super Admin preview.
- Validates site count against configured stops.
- Applies annual savings according to stored config.
- Applies volume discounts according to stored config.
- Applies early-bird discounts according to stored config.
- Applies promo/referral according to stored config.
- Enforces stackability and max benefit settings.
- Returns rejected-rule reasons for invalid promo/referral cases.
- Has unit tests for boundaries: 1, 5, 10, 20, 250, invalid 7, hidden plan, expired promo, referral max cap.

Manual testing:

- Calculate Pro monthly for 1, 5, 10 and 250 sites.
- Calculate Business annual for 5 and 250 sites.
- Apply launch promo and verify first-payment discount only.
- Apply referral promo and verify friend discount plus referrer credit rules.
- Try invalid site count `7`; backend should reject it.
- Try hidden/coming-soon paid-plan checkout; backend should reject unless configured purchasable.

Response log:

- Return the full detailed phase response in chat, including sample JSON request/response examples for each manual test.

### Backend Phase 4: Public Pricing And Checkout APIs

Self-contained prompt:

```text
You are working on the Techietribe directory backend. Expose backend-owned pricing to the frontend.

Implement or update APIs for:
- public pricing config
- active early-bird deals
- active promo banners
- pricing preview calculation
- checkout creation
- promo/referral validation

Backend must calculate final checkout amounts. Frontend may send plan id, billing cycle, site count and optional codes, but frontend price values must be ignored.
```

Acceptance criteria:

- Public pricing endpoint returns active plans, features, comparison rows, billing cycles, site stops, early-bird deal state, active banners and display copy.
- Pricing preview endpoint returns the pricing calculation service output.
- Checkout endpoint recalculates price server-side and does not trust frontend amounts.
- Checkout persists plan, billing cycle, site count, discounts and referral attribution.
- API errors are structured for frontend display.
- Tests prove client-side price tampering fails.

Manual testing:

- Open public pricing endpoint and confirm values match Super Admin/seed data.
- Use pricing preview for Pro 1 site monthly.
- Use pricing preview for Pro 5 sites annual.
- Use pricing preview for Business 250 sites annual.
- Send checkout request with a fake lower frontend price; backend should ignore it.
- Apply invalid promo code; response should explain why it was rejected.

Response log:

- Return the full detailed phase response in chat, including endpoint URLs, payloads and response examples.

### Backend Phase 5: Entitlement Enforcement

Self-contained prompt:

```text
You are working on the Techietribe directory backend. Implement backend entitlement enforcement for Free, Pro and Business plans.

Pricing values are configurable through Super Admin, but entitlement gates must be enforced by backend services/controllers. Add a normalized entitlement service if one does not exist.

Enforce gates for:
- number of websites
- number of directory listings
- free template restrictions
- block duplication/addition
- forms
- form submissions per month
- storage
- AI actions per day
- custom domains
- custom code/CSS/embed access
- collaborators
- analytics depth
- blog comments/moderation
- priority directory listing
- integrations
- shops
```

Acceptance criteria:

- Effective entitlement service exists and is used by protected controllers.
- Free user cannot create a second website.
- Free user cannot use a premium template.
- Free user cannot add/duplicate restricted blocks.
- Free user cannot add a custom domain.
- Pro user can use Pro features but not Business-only features.
- Business user can use Business features.
- Entitlement responses include enough detail for frontend upgrade UI.
- Existing users are handled safely.

Manual testing:

- Activate Free for a test user from Super Admin or backend admin tooling.
- Log in as that user and attempt:
  - create second website
  - select premium template
  - add custom domain
  - use more than 5 AI actions/day
- Activate Pro for the same user and verify:
  - custom domain works
  - premium templates work
  - Business analytics are locked
- Activate Business and verify:
  - priority listing/advanced analytics/Business features become available.

Response log:

- Return the full detailed phase response in chat, including exact test user id, plan changes and observed backend responses.

### Backend Phase 6: Super Admin Backend APIs

Self-contained prompt:

```text
You are working on the Techietribe directory backend. Build Super Admin APIs to manage all pricing, plan, promo, referral and banner configuration.

Strict rule: every configurable price, percentage, promo, deal, referral value and banner must be editable from Super Admin. Changes must be audited.

Required capabilities:
- list/create/update/publish/unpublish plans
- update plan prices
- update site-count stops
- update annual savings settings
- update volume discount settings
- update plan features and comparison rows
- update entitlement display values
- list/create/update/deactivate promo codes
- list/create/update/deactivate referral settings
- list referral usage and credit ledger
- list/create/update/reorder/deactivate promo banners
- preview pricing before publish
- view audit log
- rollback previous pricing config
```

Acceptance criteria:

- All APIs require Super Admin authorization.
- Every mutation writes an audit log entry.
- Draft and published states are supported or equivalent safe publishing exists.
- Pricing preview can run against draft config.
- Rollback or restore previous published config is possible.
- API tests cover unauthorized access and successful Super Admin changes.

Manual testing:

- Log in as non-admin and confirm all endpoints are forbidden.
- Log in as Super Admin and change Pro price.
- Preview pricing before publish.
- Publish change and confirm public pricing endpoint updates.
- Reorder promo banners and confirm public endpoint order updates.
- Roll back the Pro price and confirm public pricing endpoint updates again.

Response log:

- Return the full detailed phase response in chat, including admin endpoint list, auth behavior and audit-log examples.

## Frontend Phases

### Frontend Phase 1: Discover Existing Pricing, Billing And Super Admin UI

Self-contained prompt:

```text
You are working on the Techietribe frontend. Discovery only. Do not modify code.

Find all pricing, checkout, billing, plan, entitlement, promo/referral and Super Admin management UI currently in the repo. Produce a short map of files, existing API calls, current hardcoded plan definitions and gaps.

Important business rule: every price, percentage, promo, referral value, deal and promo banner must be configurable through Super Admin and should come from backend data in production.
```

Acceptance criteria:

- Lists public pricing files.
- Lists checkout/billing files.
- Lists Super Admin promo/deal/pricing files if they exist.
- Lists hardcoded pricing sources.
- Lists current backend endpoints used by frontend.
- No code changes.

Manual testing:

- No app testing required.
- Confirm map is enough for a frontend agent with no chat context.

Response log:

- Return the full detailed phase response in chat so it can be copied into `docs/PRICING_PHASE_RESPONSES_LOG.md` separately.

### Frontend Phase 2: Shared Pricing Types And API Client

Self-contained prompt:

```text
You are working on the Techietribe frontend. Add shared TypeScript types and API client functions for backend-owned pricing.

Production pricing must come from backend APIs. Local pricing config may remain only as fallback/default development data.

Create or update frontend types for:
- plans
- plan features
- entitlements
- billing cycles
- site-count stops
- pricing preview request/response
- promo/referral validation
- promo banners
- comparison table rows
- Super Admin draft/published pricing config
```

Acceptance criteria:

- Frontend has one shared pricing API/type layer.
- Existing pricing page can still render if backend is unavailable, using fallback data.
- No production path relies on hardcoded prices for checkout.
- API errors have typed frontend handling.
- Types align with backend response shape.

Manual testing:

- Start frontend with backend available; confirm pricing loads from backend.
- Stop backend or force API failure; confirm fallback pricing page still renders with a visible non-production fallback behavior if appropriate.
- Confirm TypeScript build/check passes.

Response log:

- Return the full detailed phase response in chat, including type file paths, API functions and backend contract notes.

### Frontend Phase 3: Public Pricing Page Integration

Self-contained prompt:

```text
You are working on the Techietribe frontend public pricing page.

Replace production hardcoded pricing with backend-loaded pricing config and backend pricing preview. Preserve the existing visual design unless a change is required by data integration.

Required UI:
- Free, Pro and Business cards
- site-count arrows using backend-provided stops
- monthly/annual toggle
- savings badges from backend preview, excluding separate bulk/volume discount chip unless enabled by Super Admin
- promo banner carousel from backend active banners
- dot indicators for promo banners
- comparison section from backend data
- loading/error/fallback states
```

Acceptance criteria:

- Pricing page renders backend plans and features.
- Site-count arrows move only through configured stops.
- Pricing preview calls backend and displays backend-calculated list price, final price, annual savings, early-bird savings and renewal copy. Volume discount can affect the price but should not appear as a separate chip unless Super Admin enables it.
- Promo banner carousel uses backend active banners and order.
- Promo/referral percentages shown on the page come from backend.
- Business coming-soon/active state is controlled by backend/Super Admin data.
- Long prices do not overlap arrows, suffixes or badges.
- Mobile and desktop layouts do not break.

Manual testing:

- Set Pro and Business active from Super Admin/backend seed.
- Visit `/pricing`.
- Toggle monthly/annual and confirm prices update.
- Click Pro site arrows through `1 -> 5 -> 10 -> 20 -> 25 -> 50 -> 100 -> 150 -> 200 -> 250`.
- Confirm arrows disable at first and last stop.
- Confirm promo banners rotate and dots switch banners.
- Change a promo banner in Super Admin/backend and refresh pricing page; confirm no code change is needed.
- Change Pro price and Business price in Super Admin/backend and refresh pricing page; confirm page updates.
- Enable/disable the visible volume-discount chip from Super Admin and confirm the pricing card respects that display setting.

Response log:

- Return the full detailed phase response in chat, including screenshots or written observations for desktop/mobile pricing page tests.

### Frontend Phase 4: Checkout And Code Entry UI

Self-contained prompt:

```text
You are working on the Techietribe frontend checkout flow.

Checkout must use backend pricing preview and checkout creation. The frontend must never send or trust final price as authority.

Add UI for:
- selected plan
- billing cycle
- site count
- promo code input
- referral code input or referral link handling
- list price
- annual savings
- volume discount
- early-bird discount
- promo discount
- referral discount
- first payment due
- renewal price
- backend validation errors
```

Acceptance criteria:

- Checkout shows the same backend-calculated breakdown as pricing page.
- Promo/referral code validation uses backend.
- Invalid promo/referral codes show clear errors.
- Checkout creation ignores local/calculated frontend price and uses backend amount.
- Coming-soon or hidden plans cannot be checked out.
- Refreshing checkout preserves selected plan/billing/site count where appropriate.

Manual testing:

- From pricing page, start Pro checkout for 1 site monthly.
- From pricing page, start Pro checkout for 5 sites annual.
- Apply launch promo and confirm first-payment discount.
- Apply referral code and confirm configured friend discount.
- Try invalid promo code and confirm error.
- Try client-side tampering if possible; backend should reject/ignore fake price.
- Complete a test checkout or simulate it in local test mode.

Response log:

- Return the full detailed phase response in chat, including checkout test observations, request ids and backend response summaries.

### Frontend Phase 5: Account/Billing And Locked Feature UX

Self-contained prompt:

```text
You are working on the Techietribe frontend account, dashboard and editor experience.

Use backend entitlement responses to show what a user can do and what is locked. Do not rely only on frontend plan names for security; backend enforcement remains authoritative.

Add or update UI for:
- current plan
- billing cycle
- selected site count
- renewal amount/date
- active discounts
- referral credit balance
- usage counters
- upgrade prompts
- locked feature states
```

Acceptance criteria:

- Free user sees accurate usage and upgrade prompts.
- Pro user sees Pro limits and Business-only locks.
- Business user sees Business capabilities.
- Locked UI aligns with backend entitlement errors.
- Upgrade prompts link to correct pricing/checkout path.
- No hidden frontend-only bypass for gated features.

Manual testing:

- Activate Free for test user from Super Admin/backend.
- Log in and verify:
  - can create first landing site
  - cannot create second site
  - sees upgrade prompt
  - cannot add custom domain
  - cannot use premium templates
- Activate Pro and verify:
  - custom domain option appears
  - premium templates appear
  - Pro usage limits show
  - Business-only analytics remain locked
- Activate Business and verify Business-only UI unlocks.

Response log:

- Return the full detailed phase response in chat, including each user-plan state and visible UI result.

### Frontend Phase 6: Super Admin Pricing Management UI

Self-contained prompt:

```text
You are working on the Techietribe frontend Super Admin dashboard.

Build or update Super Admin screens so every business-configurable pricing value can be changed without code.

Required sections:
- Plans
- Prices
- Billing cycles
- Site-count stops
- Annual savings
- Volume discounts
- Features and comparison rows
- Entitlement display values
- Promo codes and deals
- Referral program
- Promo banners
- Pricing preview
- Audit log and rollback

Strict rule: every price, percentage, promo, referral value, deal and promo banner must be configurable from Super Admin.
```

Acceptance criteria:

- Super Admin can edit Free/Pro/Business names, copy, status and feature display.
- Super Admin can edit Pro/Business price per website.
- Super Admin can edit site-count stops.
- Super Admin can edit annual free months or equivalent annual savings.
- Super Admin can edit volume discount settings, cap and whether the volume discount is visibly shown as a pricing-card chip.
- Super Admin can create/edit/deactivate early-bird deals and promo codes.
- Super Admin can edit referral discount, credit and cap.
- Super Admin can create/edit/reorder/deactivate promo banners.
- Super Admin can preview pricing before publish.
- Super Admin can view audit logs.
- Non-admin users cannot access these screens.

Manual testing:

- Log in as non-admin and verify access denied.
- Log in as Super Admin.
- Change Pro price and Business price and preview.
- Configure early-bird Pro pricing at `$7/website/month` and Business early-bird pricing at `$15/website/month`, then preview.
- Publish Pro price and confirm public pricing page updates.
- Change referral percentage and confirm pricing/checkout displays new value.
- Add a promo banner and confirm it appears in carousel.
- Reorder banners and confirm dots/order update.
- Roll back a price change and confirm public page updates.

Response log:

- Return the full detailed phase response in chat, including changed config values, screenshots/observations and audit-log ids.

## Cross-Functional Testing Matrix

| Scenario | Free User | Pro User | Business User |
| --- | --- | --- | --- |
| Create website | 1 single-page site only | Up to selected paid site count | Up to selected paid site count |
| Directory listing | Standard listing only | Listing per site | Priority listing per site |
| Templates | Super Admin-selected free templates | Free + premium | All templates |
| Add/duplicate blocks | Restricted | Allowed by Pro gates | Allowed |
| Forms | 1 form | Built-in forms per config | Built-in forms per config |
| Submissions | 50/month | Higher/backend-configured | Higher/backend-configured |
| Storage | 50 MB | 200 MB/site | 1 GB/site |
| AI actions | 5/day | 100/day | 500/day |
| Custom domain | Locked | Available | Available |
| Custom code/embed | Locked | Available | Available |
| Custom CSS | Locked unless configured | Limited/locked unless configured | Available |
| Analytics | Basic/limited | Basic | Advanced conversion/funnel |
| Collaborators | Owner only unless configured | 2/site | 10/site |
| Comments/moderation | Locked | Locked unless configured | Available |
| Integrations | Locked | Limited/locked unless configured | Advanced |
| Shops | Locked | Locked unless configured | Available |

## Final Release Acceptance

Do not mark the pricing project complete until all are true:

- Backend owns all production pricing calculations.
- Super Admin can configure every price, percentage, promo, referral value, deal and banner.
- Frontend pricing page reads backend config.
- Checkout uses backend-calculated final price.
- Entitlements are enforced by backend.
- Free/Pro/Business user manual tests pass, depending which plans are active.
- Non-admin users cannot access Super Admin pricing controls.
- Audit logs record pricing/config changes.
- The response log has entries for every completed phase.
