# Pricing Frontend Phases

This file is for a frontend AI agent with no prior chat context. Backend implementation should happen first. Frontend production pricing must eventually come from backend APIs, with local config used only as a development fallback.

Related files:

- `docs/PRICING_PHASE_RESPONSES_LOG.md`
- `docs/PRICING_PHASED_IMPLEMENTATION_PLAN.md`
- `docs/PRICING_IMPLEMENTATION_HANDOFF.md`
- `docs/PRICING_BACKEND_PHASES.md`

## Non-Negotiable Rule

Every business-configurable value must be manageable through Super Admin and must not require a code deploy:

- plan names, descriptions, feature copy and status
- Pro and Business price per website
- billing cycles, annual savings and months free
- early-bird pricing and duration
- volume discount thresholds, percentages, caps and display visibility
- promo/referral values, limits, caps, codes and eligibility
- promo banner copy, order and visibility
- comparison table display values

Frontend can preview and render pricing, but backend must calculate final checkout amounts and enforce entitlements.

## Required Phase Response Format

If the frontend agent cannot write to this documentation repo directly, it must return a detailed response in chat using this structure so it can be copied into `docs/PRICING_PHASE_RESPONSES_LOG.md` later:

```md
## Frontend Phase X Response

Agent/context:
- Agent:
- Frontend repo/path:
- Branch:
- Commit or working tree status:
- Date/time:

Scope completed:
-

Files inspected:
-

Files changed:
-

Commands run:
-

Automated validation:
-

Manual testing:
-

Screens/routes tested:
-

API contracts used:
- Endpoint:
- Request example:
- Response example:
- Fallback behavior:

UI behavior by plan:
- Free:
- Pro:
- Business:

Responsive testing:
- Desktop:
- Tablet:
- Mobile:

Important implementation details:
-

Blockers:
-

Open decisions:
-

Next recommended phase:
-
```

## Product Baseline

Plans:

- Free
- Pro
- Business

Default pricing for display/fallback until backend data is available:

- Pro standard: `$9/website/month`
- Pro early bird: `$7/website/month`
- Business standard: `$17/website/month`
- Business early bird: `$15/website/month`
- 1 website must be purchasable.
- Site-count stops: `1 -> 5 -> 10 -> 20 -> 25 -> 50 -> 100 -> 150 -> 200 -> 250`
- Do not show a separate visible bulk/volume chip unless backend/Super Admin enables it.
- Business includes light shop/catalog/payment-link features only; full Shopify-like commerce is future add-on/tier work.

## Frontend Phase 1: Discover Existing Pricing, Billing And Super Admin UI

Prompt:

```text
You are working on the Techietribe frontend. Discovery only. Do not modify code.

Find all pricing, checkout, billing, plan, entitlement, promo/referral and Super Admin management UI currently in the repo. Produce a short map of files, existing API calls, current hardcoded plan definitions and gaps.

Important rule: every price, percentage, promo, referral value, deal and promo banner must be configurable through Super Admin and should come from backend data in production.
```

Acceptance criteria:

- Public pricing files are listed.
- Checkout/billing files are listed.
- Super Admin promo/deal/pricing files are listed if they exist.
- Hardcoded pricing sources are listed.
- Current backend endpoints used by frontend are listed.
- No code changes.

Manual testing:

- No app testing required.
- Confirm map is enough for a frontend agent without chat history.
- Return the full detailed phase response in chat using the required phase response format above.

## Frontend Phase 2: Shared Pricing Types And API Client

Prompt:

```text
You are working on the Techietribe frontend. Add shared TypeScript types and API client functions for backend-owned pricing.

Production pricing must come from backend APIs. Local pricing config may remain only as fallback/default development data.

Create or update frontend types for plans, plan features, entitlements, billing cycles, site-count stops, pricing preview request/response, promo/referral validation, promo banners, comparison rows and Super Admin draft/published pricing config.
```

Acceptance criteria:

- Frontend has one shared pricing API/type layer.
- Existing pricing page can still render if backend is unavailable, using fallback data.
- No production checkout path relies on hardcoded prices.
- API errors have typed frontend handling.
- Types align with backend response shape.

Manual testing:

- Start frontend with backend available and confirm pricing loads from backend.
- Stop backend or force API failure and confirm fallback rendering.
- Confirm TypeScript checks pass.
- Return the full detailed phase response in chat, including type file paths, API functions and backend contract notes.

## Frontend Phase 3: Public Pricing Page Integration

Prompt:

```text
You are working on the Techietribe frontend public pricing page.

Replace production hardcoded pricing with backend-loaded pricing config and backend pricing preview. Preserve the existing visual design unless a change is required by data integration.

Required UI: Free, Pro and Business cards; site-count arrows using backend stops; monthly/annual toggle; backend savings badges; promo banner carousel; dot indicators; comparison section from backend data; loading/error/fallback states.
```

Acceptance criteria:

- Pricing page renders backend plans and features.
- Site-count arrows move only through configured stops.
- Pricing preview displays backend-calculated list price, final price, annual savings, early-bird savings and renewal copy.
- Volume discount can affect price but should not appear as a separate chip unless Super Admin enables it.
- Promo banner carousel uses backend active banners and order.
- Promo/referral percentages shown on page come from backend.
- Business coming-soon/active state is controlled by backend/Super Admin data.
- Long prices do not overlap arrows, suffixes or badges.
- Mobile and desktop layouts do not break.

Manual testing:

- Set Pro and Business active from backend/Super Admin seed.
- Visit `/pricing`.
- Toggle monthly/annual and confirm prices update.
- Click Pro site arrows through all configured stops.
- Confirm arrows disable at first and last stop.
- Confirm promo banners rotate and dots switch banners.
- Change a banner, Pro price and Business price in backend/Super Admin and refresh page; confirm updates without code changes.
- Enable/disable visible volume chip and confirm UI respects it.
- Return the full detailed phase response in chat, including desktop/mobile observations.

## Frontend Phase 4: Checkout And Code Entry UI

Prompt:

```text
You are working on the Techietribe frontend checkout flow.

Checkout must use backend pricing preview and checkout creation. Frontend must never send or trust final price as authority.

Add UI for selected plan, billing cycle, site count, promo code, referral code/link, list price, annual savings, volume discount, early-bird discount, promo discount, referral discount, first payment due, renewal price and backend validation errors.
```

Acceptance criteria:

- Checkout shows same backend-calculated breakdown as pricing page.
- Promo/referral code validation uses backend.
- Invalid promo/referral codes show clear errors.
- Checkout creation uses backend amount.
- Coming-soon or hidden plans cannot be checked out.
- Refreshing checkout preserves selected plan/billing/site count where appropriate.

Manual testing:

- Start Pro checkout for 1 site monthly.
- Start Pro checkout for 5 sites annual.
- Apply launch promo and confirm first-payment discount.
- Apply referral code and confirm configured friend discount.
- Try invalid promo code and confirm error.
- Try client-side tampering if possible; backend should reject/ignore fake price.
- Complete or simulate test checkout.
- Return the full detailed phase response in chat, including observations, request ids and backend response summaries.

## Frontend Phase 5: Account/Billing And Locked Feature UX

Prompt:

```text
You are working on the Techietribe frontend account, dashboard and editor experience.

Use backend entitlement responses to show what a user can do and what is locked. Do not rely only on frontend plan names for security; backend enforcement remains authoritative.

Add or update UI for current plan, billing cycle, selected site count, renewal amount/date, active discounts, referral credit balance, usage counters, upgrade prompts and locked feature states.
```

Acceptance criteria:

- Free user sees accurate usage and upgrade prompts.
- Pro user sees Pro limits and Business-only locks.
- Business user sees Business capabilities.
- Locked UI aligns with backend entitlement errors.
- Upgrade prompts link to correct pricing/checkout path.
- No hidden frontend-only bypass for gated features.

Manual testing:

- Activate Free for a test user and verify first site works while second site, custom domain and premium templates are locked.
- Activate Pro and verify custom domain, premium templates and Pro limits appear while Business-only analytics remain locked.
- Activate Business and verify Business-only UI unlocks.
- Return the full detailed phase response in chat, including each user-plan state and visible UI result.

## Frontend Phase 6: Super Admin Pricing Management UI

Prompt:

```text
You are working on the Techietribe frontend Super Admin dashboard.

Build or update Super Admin screens so every business-configurable pricing value can be changed without code.

Required sections: Plans, Prices, Billing cycles, Site-count stops, Annual savings, Volume discounts, Features and comparison rows, Entitlement display values, Promo codes and deals, Referral program, Promo banners, Pricing preview, Audit log and rollback.

Strict rule: every price, percentage, promo, referral value, deal and promo banner must be configurable from Super Admin.
```

Acceptance criteria:

- Super Admin can edit Free/Pro/Business names, copy, status and feature display.
- Super Admin can edit Pro/Business price per website.
- Super Admin can edit site-count stops.
- Super Admin can edit annual free months/equivalent annual savings.
- Super Admin can edit volume discount settings, cap and visible-chip setting.
- Super Admin can create/edit/deactivate early-bird deals and promo codes.
- Super Admin can edit referral discount, credit and cap.
- Super Admin can create/edit/reorder/deactivate promo banners.
- Super Admin can preview pricing before publish.
- Super Admin can view audit logs.
- Non-admin users cannot access these screens.

Manual testing:

- Log in as non-admin and verify access denied.
- Log in as Super Admin.
- Change Pro and Business prices and preview.
- Configure early-bird Pro at `$7/website/month` and Business at `$15/website/month`, then preview.
- Publish and confirm public pricing page updates.
- Change referral percentage and confirm pricing/checkout displays new value.
- Add and reorder promo banners and confirm carousel/dots update.
- Roll back a price change and confirm public page updates.
- Return the full detailed phase response in chat, including changed config values, observations and audit-log ids.
