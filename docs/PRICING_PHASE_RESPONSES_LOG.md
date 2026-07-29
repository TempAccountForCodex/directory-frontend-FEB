# Pricing Phase Responses Log

Use this file to store the output of each implementation phase. Backend and frontend agents may not have access to this documentation repo, so they should return detailed phase responses in chat. Paste those responses here under the matching phase section. Future frontend or backend AI agents should be able to read this file plus `docs/PRICING_PHASED_IMPLEMENTATION_PLAN.md` and continue without prior chat context.

Rules for updating this file:

- Add one entry after each phase attempt.
- Do not delete previous entries.
- Include exact files changed.
- Include exact commands run.
- Include manual testing results.
- Include blockers and open decisions.
- Mark incomplete work clearly.
- Do not paste secrets, tokens or private credentials.

## Current Status Summary

Last updated: July 29, 2026

Overall status:

- Backend phases: Phases 1-5 complete; DB-backed migration/seed/manual validation remains blocked by local Postgres; Phase 6 not started
- Frontend phases: not started
- Super Admin configurability: planned, not implemented
- Final pricing source of truth: planned backend ownership

Latest manager pricing direction:

- Paid users must be able to buy 1 website; do not force a 5-website minimum.
- Pro package planning price: `$9/website/month`.
- Pro early-bird price: `$7/website/month`.
- Business package planning price: `$17/website/month`.
- Business early-bird price: `$15/website/month`.
- Do not show a separate bulk/volume discount chip on pricing cards unless Super Admin enables that display.

## Phase Entry Template

Copy this template under the relevant phase section.

````md
### Attempt YYYY-MM-DD HH:mm

Agent/context:

- Agent:
- Repo/path:
- Branch:
- Goal:

Scope completed:

- 

Files changed:

- 

Commands run:

- 

Automated validation:

- 

Manual testing:

- 

Plan activation/user testing:

- Test user:
- Activated plan:
- Expected user behavior:
- Observed user behavior:

API examples:

```json
{}
```

Important findings:

- 

Blockers:

- 

Open decisions:

- 

Next recommended step:

- 
````

## Backend Phase 1: Discover Existing Billing And Plan System

Status: Complete.

### Attempt 2026-07-29

Agent/context:

- Agent: Backend agent
- Repo/path: `/Users/apple/Desktop/Projects/techietribe-directory/backend`
- Branch: Not reported
- Goal: Read-only discovery of billing, subscription, Stripe, promo, referral, plan config and entitlement code.

Scope completed:

- Read-only discovery only.
- No code was modified.
- No app testing was run.
- Report maps existing files, endpoints, plan codes, pricing logic, subscription storage, promo/referral support, entitlement checks and gaps.

Files inspected:

- `/Users/apple/Desktop/Projects/techietribe-directory/backend/config/planConfig.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/services/planService.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/controllers/accountController.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/services/subscriptionService.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/controllers/checkoutController.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/services/adminBillingService.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/services/financeService.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/config/referralConfig.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/services/referralService.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/routes/referralRoutes.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/services/promoService.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/routes/promoRoutes.js`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/prisma/schema.prisma`
- `/Users/apple/Desktop/Projects/techietribe-directory/backend/app.js`

Files changed:

- None.

Commands run:

- Not reported.

Automated validation:

- None. Discovery phase only.

Manual testing:

- No app testing required or run.

Existing endpoints:

- `/api/account`: billing details, payment methods, `PUT /plan`, `GET /plan-preview`, `POST /cancel-subscription`, `POST /reactivate-subscription`, `GET /billing-history`.
- `/api/billing`: `GET /plan-summary`.
- `/api/checkout`: `POST /create`, `POST /stripe-webhook`.
- `/api/admin`: Super Admin billing controls from `adminBillingRoutes`.
- `/api/admin/finances`: finance dashboard/reporting endpoints.
- `/api/referral`: referral user/public/admin endpoints.
- `/api/promo`: promo public/user/admin endpoints.

Existing plan codes:

- `website_free`: maps cleanly to baseline Free. Current price `$0`, `maxSites: 1`.
- `website_core`: closest equivalent to baseline Pro, but not aligned. Current price `$19/month`, `maxSites: 1`.
- `website_growth`: closest equivalent to baseline Business, but not aligned. Current price `$49/month`, `maxSites: 3`.
- `website_agency`: legacy extra tier. Current price `$149/month`, `maxSites: 10`.
- `store_free`: separate legacy store plan, no direct baseline equivalent.
- `store_starter`: separate legacy store plan, current price `$29/month`.
- `store_pro`: separate legacy store plan, current price `$99/month`.

Display-only plan config also exists in `DISPLAY_PLANS`:

- `website_free` displayed as `STARTUP` at `0`.
- `website_core` displayed as `STANDARD` at `14.99`.
- `website_growth` displayed as `BUSINESS` at `29.99`.
- This conflicts with main `WEBSITE_PLANS` prices.

Pricing logic findings:

- Current website prices are hard-coded in `backend/config/planConfig.js`, not database-editable.
- Stripe price IDs come from env vars: `STRIPE_PRICE_WEBSITE_CORE`, `STRIPE_PRICE_WEBSITE_GROWTH`, `STRIPE_PRICE_WEBSITE_AGENCY`, `STRIPE_PRICE_STORE_STARTER`, `STRIPE_PRICE_STORE_PRO`.
- `subscriptionService.createSubscription()` uses the plan Stripe price ID for paid website plans.
- `accountController.getPlanPreview()` uses Stripe invoice preview when Stripe is configured; otherwise it estimates from `priceMonthlyUsd`.
- `financeService.computeMRR()` uses hard-coded plan prices from `planConfig.js`.
- Store checkout uses `Product.priceCents` from DB and `storePlan.platformFeePercent`; it creates a Stripe PaymentIntent, not a website subscription checkout session.
- No verified backend implementation of Pro/Business early-bird prices, per-website quantity pricing, site-count stops, or bulk/volume discount chip configuration.

Subscription storage:

- User subscription state is stored directly on `User`.
- Fields include `websitePlan`, `storePlan`, `websiteStripeSubscriptionId`, `storeStripeSubscriptionId`, `stripeCustomerId`, `subscriptionStatus`, `currentPeriodEnd`, `cancelledAt`, `pastDueAt`, `websitePlanChangedAt`, `storePlanChangedAt`, `accountCreditCents`.
- Supporting storage includes `PaymentMethod`, `Invoice`, `ConsentLedger`, `PlanOverride`, and `AccountCredit`.

Promo/referral findings:

- `PromoDeal` stores `discountType`, `discountValue`, `startAt`, `endAt`, `maxRedemptions`, `targetSegment`, `promoCode`, Stripe coupon/promo code IDs, `isActive`, and `bannerConfig`.
- Public `GET /api/promo/active` returns active deal summaries for banners.
- Authenticated `POST /api/promo/redeem` applies a Stripe coupon to an existing website subscription when possible.
- Super Admin can create deals, deactivate deals, list deals, get metrics, and update only `bannerConfig`/`isActive`.
- Promo gap: discount amount/type/code/date/segment/max redemptions are editable at creation but not generally editable after creation.
- Referral settings are hard-coded in `backend/config/referralConfig.js`: `$10` referrer credit, `20%` referee discount, 30-day expiry, 5 conversions/month, code length 10, click dedupe 3600s, cache TTLs.
- Registration auto-creates referral codes and attributes signup when `referralCode` is posted.
- First paid plan activation triggers reward from `accountController.updatePlan()`.
- Rewards create Stripe coupon/balance transactions when Stripe/customer IDs exist.
- Super Admin can view referral analytics and toggle/flag referral codes.
- Referral gap: reward amounts, percentages, expiry, caps, dedupe windows and TTLs are not Super Admin editable.

Existing entitlement checks:

- Website count limit: `canCreateAnotherWebsite()` used by `websiteController`, `frontendTemplateService`, `websiteFromTemplateService`.
- Page limit: `canAddPageToWebsite()` used by `pageController`.
- Block count limit: `canAddBlockToPage()` used by `blockController`.
- Delegate limit: `canInviteDelegate()` used by `accountDelegationRoutes`.
- Store count limit: `canCreateAnotherStore()` used by `storeController`.
- Product count limit: `canAddProductToStore()` used by `productController`.
- Directory eligibility and ranking boost: `getDirectoryEligibility()` used by `directoryController`; `publicSiteController` also filters eligible plans in production.
- Website AI quota: implemented separately in `websiteAiConfig.js`/`aiRoutes.js`.
- Listing AI quota: implemented separately in `aiContentService.js`.

Helpers that exist but appear not wired into main controllers from verified search:

- `canUseBlockType()` gates only `VIDEO`, but `blockController` only imports `canAddBlockToPage`.
- `canUseCustomCSS()` exists, but no backend usage found outside tests.
- `canUseAIGeneration()` exists, but AI quota enforcement is duplicated elsewhere.

Key gaps against baseline:

- No backend Free/Pro/Business plan source of truth exists yet.
- Current plan codes/prices do not match baseline Pro `$9/$7` or Business `$17/$15`.
- No per-website subscription quantity pricing found.
- No site-count stops found.
- No early-bird pricing model found.
- No Super Admin-editable plan/pricing/entitlement configuration storage found.
- No backend-controlled `show bulk/volume discount chip` setting found.
- Promo deals are partly DB-backed, but all promo/deal/banner behavior is not fully editable after creation.
- Referral settings are constants, not DB-backed.
- Business/light-shop entitlement is not modeled as part of Business; current commerce exists as separate store plans with store/product/order/coupon capabilities.
- Backend is not yet the final source of truth for checkout pricing and entitlements.
- Current website subscriptions depend on hard-coded config plus Stripe price IDs, while entitlement checks are partly centralized and partly duplicated.

Blockers:

- None for discovery.

Open decisions:

- Decide whether to keep legacy `website_core`/`website_growth` codes and remap them to Pro/Business, or introduce new canonical `pro`/`business` plan codes with backward compatibility.
- Decide whether legacy `website_agency` remains hidden/deprecated, migrates to a future tier, or is removed from public pricing.
- Decide how store plans relate to the current Business light shop/catalog/payment-link entitlement.

Next recommended step:

- Backend Phase 2: Pricing Schema And Super Admin Config Model.

## Backend Phase 2: Pricing Schema And Super Admin Config Model

Status: Complete, with local DB migration/seed verification blocked by unavailable Postgres.

### Attempt 2026-07-29

Agent/context:

- Agent: Codex backend implementation phase
- Repo/path: `/Users/apple/Desktop/Projects/techietribe-directory`
- Branch: `main`
- HEAD: `c2fd688`
- Goal: Implement configurable pricing/model layer.
- Working tree status: modified `backend/prisma/schema.prisma`, `backend/prisma/seed.js`; added `backend/prisma/migrations/20260728000000_add_configurable_pricing_models/`.
- Unrelated existing change reported by backend agent: `frontend/src/main.tsx`.

Scope completed:

- Added database/model layer for configurable pricing, plans, entitlements, pricing rules, promo codes, referrals, promo banners, audit logs, normalized subscriptions and subscription discounts.
- Preserved existing `users` subscription fields.
- Added idempotent pricing seed defaults.
- Did not change existing store plan behavior.

Files inspected:

- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/package.json`
- Existing migration files for billing, promo and consent ledger.

Files changed:

- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/prisma/migrations/20260728000000_add_configurable_pricing_models/migration.sql`

Migration added:

- `20260728000000_add_configurable_pricing_models`

Models/tables added:

- `plans`
- `plan_prices`
- `plan_entitlements`
- `plan_features`
- `pricing_rules`
- `pricing_rule_tiers`
- `promo_codes`
- `referral_program_settings`
- `referrals`
- `referral_credit_ledger`
- `promo_banners`
- `pricing_audit_log`
- `subscriptions`
- `subscription_discounts`

Seed updates:

- Updated `backend/prisma/seed.js` with idempotent `seedPricingDefaults()`.

Seeded defaults:

- Plans: `free`, `pro`, `business`
- Pro prices:
  - `pro_standard_monthly_per_website` = `900`
  - `pro_early_bird_monthly_per_website` = `700`
- Business prices:
  - `business_standard_monthly_per_website` = `1700`
  - `business_early_bird_monthly_per_website` = `1500`
- Site stops: `1 -> 5 -> 10 -> 20 -> 25 -> 50 -> 100 -> 150 -> 200 -> 250`
- Bulk discount visibility rule with `showSeparateBulkDiscountChip: false`
- Annual discount placeholder disabled at `0`
- Default referral setting:
  - `$10` referrer credit
  - `20%` referee discount
  - 30 days
  - 5 conversions/month
- Disabled promo template: `SUPERADMIN_EDITABLE_PROMO_TEMPLATE`
- Disabled pricing banner: `default_pricing_banner`, `showBulkDiscountChip: false`

Legacy plan mapping:

- `website_free` -> `free`
- `website_core` -> `pro`
- `website_growth` -> `business`
- `website_agency` -> preserved as legacy extra tier mapped into `business` metadata/legacy codes for safe continuity.
- Store plan codes are not deleted.

Commands run:

- `npx prisma format --schema prisma/schema.prisma`
- `npx prisma validate --schema prisma/schema.prisma`
- `node --check prisma/seed.js`
- `npx prisma generate --schema prisma/schema.prisma`
- `git diff --check ...`
- `npm test -- --runTestsByPath tests/planService.test.js --runInBand`
- `pg_isready -h localhost -p 5432`
- `npx prisma migrate dev --skip-generate`
- `npx prisma migrate status`
- `npx prisma db execute ...`
- `npm run prisma:seed`

Automated validation:

- `npx prisma format --schema prisma/schema.prisma` passed.
- `npx prisma validate --schema prisma/schema.prisma` passed.
- `node --check prisma/seed.js` passed.
- `npx prisma generate --schema prisma/schema.prisma` passed.
- `git diff --check ...` passed.
- `npm test -- --runTestsByPath tests/planService.test.js --runInBand` passed: 69 tests.

Manual testing:

- Blocked by local Postgres being down.

DB blocker evidence:

- `pg_isready -h localhost -p 5432` -> `no response`
- `npx prisma migrate dev --skip-generate` failed with generic schema engine error against `localhost:5432`.
- `npx prisma migrate status` failed against `localhost:5432`.
- `npx prisma db execute ...` returned `P1001 Can't reach database server at localhost:5432`.
- `npm run prisma:seed` failed at DB connection for the same reason.

Database verification status:

- Actual inserted DB rows could not be confirmed locally because the DB was unavailable.
- Seed records are present in `backend/prisma/seed.js`.
- Prisma client generation confirms the new models compile.

How existing users are preserved:

- No existing `User` subscription columns are removed or changed.
- New normalized `subscriptions` can reference users and preserve:
  - `legacyPlanCode`
  - `stripeCustomerId`
  - `stripeSubscriptionId`
  - period dates
  - status
  - quantity
  - selected plan/price for future service migration.

Blockers:

- Local PostgreSQL at `localhost:5432` is not running/reachable, so migration application and seed verification could not be completed.

Open decisions:

- Whether `website_agency` should become a hidden legacy Business variant, a grandfathered plan, or a future Enterprise/Admin-only plan.
- Whether existing `PromoDeal` should be migrated into new `promo_codes`/`promo_banners` or kept as a legacy flash-deal table.
- How normalized `subscriptions` should backfill from existing `users.website_plan` and Stripe fields.

Next recommended phase:

- Backend Phase 3: Pricing Calculation Service.
- The backend agent also recommended implementing pricing read services and Super Admin CRUD APIs backed by the new tables, then updating checkout/subscription preview logic to resolve amounts from `plan_prices`/`pricing_rules` instead of frontend or `planConfig.js` constants.

## Backend Phase 3: Pricing Calculation Service

Status: Complete, with DB-backed preview/checkout manual testing blocked by unavailable Postgres.

### Attempt 2026-07-29

Agent/context:

- Agent: Codex backend implementation phase
- Repo/path: `/Users/apple/Desktop/Projects/techietribe-directory`
- Branch: `main`
- HEAD: `c2fd688`
- Goal: Implement backend pricing calculation service and mocked unit coverage.
- Working tree status: backend pricing/model changes are uncommitted; unrelated `frontend/src/main.tsx` is also modified.

Scope completed:

- Implemented backend pricing calculation service.
- Added mocked unit coverage for requested pricing behavior.
- Service uses Phase 2 tables through a repository abstraction.
- DB-backed preview/checkout manual testing could not run because local Postgres is unavailable.

Files inspected:

- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/package.json`
- `backend/config/prisma.js`
- `backend/services/financeService.js`
- `backend/tests/planService.test.js`

Files changed:

- `backend/services/pricingCalculationService.js`
- `backend/tests/pricingCalculationService.test.js`
- Existing uncommitted Phase 2 files remain changed:
  - `backend/prisma/schema.prisma`
  - `backend/prisma/seed.js`
  - `backend/prisma/migrations/20260728000000_add_configurable_pricing_models/migration.sql`

Pricing service:

- `backend/services/pricingCalculationService.js`

Exports:

- `calculatePricing(input, options)`
- `createPrismaPricingRepository(client)`
- `LEGACY_PLAN_CODE_MAP`
- `DEFAULT_SITE_COUNT_STOPS`

Repository/model usage:

- `plans`
- `plan_prices`
- `pricing_rules`
- `pricing_rule_tiers`
- `promo_codes`
- `referral_program_settings`
- legacy `referral_codes`/`referral_rewards`

Test file:

- `backend/tests/pricingCalculationService.test.js`

Test coverage:

- Pro monthly, 1 site
- Pro monthly, 5 sites
- Pro annual, 10 sites
- Business monthly, 1 site
- Business annual, 250 sites
- Invalid site count `7`
- Hidden plan
- Coming-soon plan
- Expired promo
- Referral max cap
- Volume discount configured but chip hidden
- `website_core` -> Pro
- `website_growth` -> Business
- Promo/referral stackability

Commands run:

- `npx prettier --write services/pricingCalculationService.js tests/pricingCalculationService.test.js`
- `node --check services/pricingCalculationService.js && node --check tests/pricingCalculationService.test.js`
- `npm test -- --runTestsByPath tests/pricingCalculationService.test.js --runInBand`
- `npm test -- --runTestsByPath tests/planService.test.js --runInBand`
- `npx prisma validate --schema prisma/schema.prisma`
- `git diff --check ...`
- `pg_isready -h localhost -p 5432`
- `npx prisma db execute --schema prisma/schema.prisma --stdin`

Automated validation:

- Pricing service tests passed: 14 tests.
- Existing plan service tests passed: 69 tests.
- Prisma schema validation passed.
- JavaScript syntax checks passed.
- Diff whitespace check passed.

Manual testing:

- DB-backed preview/checkout manual testing blocked by unavailable local DB.
- Mocked unit tests cover requested pricing behavior.

DB blocker evidence:

```text
P1001 Can't reach database server at `localhost:5432`
```

```text
localhost:5432 - no response
```

Sample JSON:

Pro monthly, 1 site:

```json
{
  "request": { "planId": "pro", "billingCycle": "month", "siteCount": 1 },
  "response": {
    "selectedPlan": { "code": "pro" },
    "pricePerWebsiteCents": 700,
    "listPriceCents": 900,
    "earlyBirdDiscountCents": 200,
    "finalFirstPaymentCents": 700,
    "renewalPriceCents": 900,
    "validationErrors": []
  }
}
```

Pro annual, 10 sites:

```json
{
  "response": {
    "selectedPlan": { "code": "pro" },
    "selectedBillingCycle": "annual",
    "selectedSiteCount": 10,
    "listPriceCents": 108000,
    "annualSavingsCents": 8400,
    "volumeDiscountPercent": 10,
    "volumeSavingsCents": 7560,
    "finalFirstPaymentCents": 68040,
    "renewalPriceCents": 87480
  }
}
```

Business annual, 250 sites:

```json
{
  "response": {
    "selectedPlan": { "code": "business" },
    "listPriceCents": 5100000,
    "annualSavingsCents": 450000,
    "volumeDiscountPercent": 20,
    "volumeSavingsCents": 810000,
    "finalFirstPaymentCents": 3240000,
    "renewalPriceCents": 3672000
  }
}
```

Invalid site count `7`:

```json
{
  "response": {
    "finalFirstPaymentCents": 0,
    "validationErrors": [
      {
        "code": "INVALID_SITE_COUNT_STOP",
        "siteCount": 7,
        "allowedSiteCounts": [1, 5, 10, 20, 25, 50, 100, 150, 200, 250]
      }
    ]
  }
}
```

Expired promo:

```json
{
  "response": {
    "promoDiscountCents": 0,
    "rejectedRules": [
      {
        "code": "LAUNCH20",
        "type": "PROMO_CODE",
        "reason": "expired_or_not_started"
      }
    ]
  }
}
```

Referral max cap:

```json
{
  "response": {
    "referralDiscountCents": 0,
    "rejectedRules": [
      {
        "type": "REFERRAL_CODE",
        "reason": "max_conversions_per_month_reached"
      }
    ]
  }
}
```

Calculation rules:

- Annual savings for first payment are calculated from the active first-payment price after early-bird pricing.
- Renewal annual savings are calculated from the standard renewal base, so early bird does not depress renewal pricing.
- Active `plan_prices.isEarlyBird` monthly price replaces the default monthly price for first payment.
- Renewal uses standard/default monthly price.
- Promo applies first, then referral.
- Promo metadata can set `stackableWithReferral: false`, which rejects referral with `not_stackable_with_promo`.
- `maxBenefitCents` is supported through metadata.
- Promo/referral renewal effects only apply when metadata explicitly sets `appliesToRenewals: true`.

Legacy mapping:

- `website_free` -> `free`
- `website_core` -> `pro`
- `website_growth` -> `business`
- `website_agency` -> `business` compatibility only; it does not become public baseline pricing unless configured as such in DB.

Display flags:

- `showSeparateBulkDiscountChip` comes from active `BULK_DISCOUNT_VISIBILITY` pricing rule config.
- Default mocked/seed behavior is `false`.

Blockers:

- Local Postgres is down, so migration/seed-backed manual validation could not run.

Open decisions:

- How Super Admin will choose early-bird eligibility and expiration.
- Whether `website_agency` becomes hidden Business, grandfathered, or a future Enterprise tier.
- Whether existing `PromoDeal` should be migrated into `promo_codes`/`promo_banners`.

Next recommended phase:

- Backend Phase 4: Public Pricing And Checkout APIs.
- Add API endpoints for public pricing preview and Super Admin pricing preview using `calculatePricing`.
- Wire checkout/subscription flows to this service so checkout amounts stop depending on legacy hardcoded plan config.

## Backend Phase 4: Public Pricing And Checkout APIs

Status: Complete, with DB-backed manual endpoint testing blocked by unavailable Postgres.

### Attempt 2026-07-29

Agent/context:

- Agent: Codex backend pricing API phase
- Repo/path: `/Users/apple/Desktop/Projects/techietribe-directory`
- Branch: `main`
- HEAD: `c2fd688`
- Goal: Implement public pricing, preview, promo/referral validation, and pricing checkout-intent APIs backed by configurable pricing service/model layer.
- Working tree status: uncommitted backend changes plus unrelated existing `frontend/src/main.tsx`.

Scope completed:

- Added public pricing config API.
- Added public pricing preview API.
- Added promo/referral validation API.
- Added authenticated pricing checkout-intent API.
- Added Super Admin pricing preview API.
- Integrated new APIs with `calculatePricing()`.
- Checkout intent ignores client-provided price fields.

Files inspected:

- `backend/app.js`
- `backend/routes/checkoutRoutes.js`
- `backend/routes/promoRoutes.js`
- `backend/routes/financeRoutes.js`
- `backend/controllers/checkoutController.js`
- `backend/services/pricingCalculationService.js`
- `backend/services/financeService.js`
- `backend/config/prisma.js`
- `backend/utils/asyncHandler.js`
- `backend/utils/errors/AppError.js`
- `backend/tests/planService.test.js`
- `backend/tests/webhook.test.js`

Files changed:

- `backend/services/pricingPublicService.js`
- `backend/controllers/pricingController.js`
- `backend/routes/pricingRoutes.js`
- `backend/tests/pricingController.test.js`
- `backend/app.js`
- `backend/tests/pricingCalculationService.test.js`

Carried from prior uncommitted phases:

- `backend/services/pricingCalculationService.js`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/prisma/migrations/20260728000000_add_configurable_pricing_models/migration.sql`

Endpoint files/routes/services changed:

- `backend/app.js`: mounts `app.use('/api/pricing', pricingRoutes)`.
- `backend/routes/pricingRoutes.js`
- `backend/controllers/pricingController.js`
- `backend/services/pricingPublicService.js`
- `backend/services/pricingCalculationService.js`

New endpoint list:

- `GET /api/pricing/config`
  - Auth: public.
  - Returns active public plans, features, entitlements/comparison rows, billing cycles, site-count stops, early-bird state, annual savings config, active promo banners, referral display settings, display flags, and legacy plan mapping.
- `POST /api/pricing/preview`
  - Auth: public with optional auth if token is provided.
  - Accepts `planId`/`planCode`, `billingCycle`, `siteCount`, optional `promoCode`, optional `referralCode`.
  - Calls `calculatePricing()` and returns full pricing output.
- `POST /api/pricing/validate-code`
  - Auth: public with optional auth if token is provided.
  - Uses `calculatePricing()` to validate promo/referral applicability without mutating redemption/reward state.
- `POST /api/pricing/checkout`
  - Auth: authenticated user required.
  - Recalculates authoritative checkout amount server-side, ignores client price fields, persists normalized pending subscription/discount attribution when possible, and returns a pricing checkout intent.
- `POST /api/pricing/admin/preview`
  - Auth: `SUPER_ADMIN` required.
  - Supports `allowComingSoonPlans` and `allowHiddenPlans` for admin-only preview.

Pricing service integration:

- `pricingPublicService.previewPricing()` delegates to `calculatePricing()`.
- `pricingPublicService.createPricingCheckoutIntent()` delegates to `calculatePricing()` before persistence.
- Frontend can send plan/cycle/site/promo/referral identifiers only; amount fields are ignored.

Checkout integration details:

- New checkout behavior lives at `POST /api/pricing/checkout`.
- It accepts selected plan context.
- It ignores `amountCents`, `totalCents`, `finalFirstPaymentCents`, `renewalPriceCents`, `lineItems`, and `discounts`.
- It recalculates via `calculatePricing()`.
- It rejects validation errors and rejected requested promo/referral codes.
- It creates a normalized `subscriptions` row with `status: pending_checkout`.
- It creates `subscription_discounts` rows for pending promo/referral discounts when present.
- Stripe dynamic subscription amount/quantity creation is not wired in this phase.
- Response includes `"requiresStripeDynamicPriceWiring": true`.

Still legacy / not yet replaced:

- `PUT /api/account/plan`
- `backend/services/subscriptionService.js`
- Legacy website Stripe price IDs such as `STRIPE_PRICE_WEBSITE_CORE`
- Existing store checkout at `POST /api/checkout/create`, which still uses store/product checkout logic and store plan fee config.
- New `/api/pricing/*` endpoints do not use frontend prices as source of truth.

Commands run:

```bash
npx prettier --write services/pricingPublicService.js controllers/pricingController.js routes/pricingRoutes.js tests/pricingController.test.js tests/pricingCalculationService.test.js
node --check services/pricingPublicService.js && node --check controllers/pricingController.js && node --check routes/pricingRoutes.js && node --check tests/pricingController.test.js
npm test -- --runTestsByPath tests/pricingCalculationService.test.js tests/pricingController.test.js --runInBand
npm test -- --runTestsByPath tests/planService.test.js --runInBand
npx prisma validate --schema prisma/schema.prisma
git diff --check -- backend/app.js backend/controllers/pricingController.js backend/routes/pricingRoutes.js backend/services/pricingPublicService.js backend/services/pricingCalculationService.js backend/tests/pricingController.test.js backend/tests/pricingCalculationService.test.js
pg_isready -h localhost -p 5432
npx prisma db execute --schema prisma/schema.prisma --stdin
```

Automated validation:

- Pricing calculator/controller tests passed: 21 tests.
- Existing plan service tests passed: 69 tests.
- Prisma schema validation passed.
- JavaScript syntax checks passed.
- Diff whitespace check passed.

Manual testing:

- DB-backed manual endpoint testing is blocked.
- Mocked unit/controller tests cover the requested API behavior.

DB blocker evidence:

```text
localhost:5432 - no response
```

```text
P1001 Can't reach database server at `localhost:5432`
```

Sample JSON:

Public pricing config:

```json
{
  "success": true,
  "data": {
    "plans": [{ "code": "pro", "name": "Pro", "prices": [], "features": [] }],
    "billingCycles": [{ "code": "month" }, { "code": "annual" }],
    "siteCountStops": [1, 5, 10, 20, 25, 50, 100, 150, 200, 250],
    "earlyBird": { "active": true },
    "annualSavings": { "enabled": true, "discountPercent": 10 },
    "activePromoBanners": [],
    "displayFlags": { "showSeparateBulkDiscountChip": false },
    "legacyPlanCodeMap": {
      "website_free": "free",
      "website_core": "pro",
      "website_growth": "business",
      "website_agency": "business"
    }
  }
}
```

Pro monthly 1-site preview:

```json
{
  "planId": "pro",
  "billingCycle": "month",
  "siteCount": 1
}
```

```json
{
  "success": true,
  "pricing": {
    "selectedPlan": { "code": "pro" },
    "pricePerWebsiteCents": 700,
    "listPriceCents": 900,
    "earlyBirdDiscountCents": 200,
    "finalFirstPaymentCents": 700,
    "renewalPriceCents": 900,
    "validationErrors": []
  }
}
```

Pro annual 5-site preview:

```json
{
  "pricing": {
    "selectedPlan": { "code": "pro" },
    "selectedBillingCycle": "annual",
    "selectedSiteCount": 5,
    "listPriceCents": 54000,
    "annualSavingsCents": 4200,
    "volumeDiscountPercent": 5,
    "volumeSavingsCents": 1890,
    "finalFirstPaymentCents": 35910,
    "renewalPriceCents": 46170
  }
}
```

Business annual 250-site preview:

```json
{
  "pricing": {
    "selectedPlan": { "code": "business" },
    "selectedBillingCycle": "annual",
    "selectedSiteCount": 250,
    "listPriceCents": 5100000,
    "annualSavingsCents": 450000,
    "volumeDiscountPercent": 20,
    "volumeSavingsCents": 810000,
    "finalFirstPaymentCents": 3240000,
    "renewalPriceCents": 3672000
  }
}
```

Invalid site count 7:

```json
{
  "success": false,
  "pricing": {
    "validationErrors": [
      {
        "code": "INVALID_SITE_COUNT_STOP",
        "message": "site count is not a configured purchasable stop",
        "siteCount": 7,
        "allowedSiteCounts": [1, 5, 10, 20, 25, 50, 100, 150, 200, 250]
      }
    ],
    "finalFirstPaymentCents": 0
  }
}
```

Invalid/expired promo:

```json
{
  "success": true,
  "valid": false,
  "rejectedRules": [
    {
      "code": "LAUNCH20",
      "type": "PROMO_CODE",
      "reason": "expired_or_not_started"
    }
  ]
}
```

Fake lower frontend checkout price request:

```json
{
  "planId": "pro",
  "billingCycle": "month",
  "siteCount": 1,
  "amountCents": 1,
  "totalCents": 1
}
```

Fake lower frontend checkout price response:

```json
{
  "success": true,
  "checkout": {
    "mode": "pricing_intent",
    "ignoredClientAmountFields": true,
    "amountCents": 700,
    "renewalAmountCents": 900,
    "ignoredClientFields": {
      "amountCents": 1,
      "totalCents": 1
    }
  },
  "pricing": {
    "finalFirstPaymentCents": 700,
    "renewalPriceCents": 900
  }
}
```

Structured API error example:

```json
{
  "success": false,
  "error": {
    "code": "PRICING_VALIDATION_FAILED",
    "message": "Pricing request is invalid",
    "validationErrors": [{ "code": "PLAN_HIDDEN" }],
    "rejectedRules": []
  },
  "pricing": {}
}
```

Frontend consumption:

- Use `GET /api/pricing/config` to render plan cards, features, site stops, banners, early-bird state, and display flags.
- Use `POST /api/pricing/preview` whenever plan/cycle/site/promo/referral changes.
- Use `POST /api/pricing/validate-code` for non-mutating promo/referral validation.
- Use `POST /api/pricing/checkout` to start checkout; do not send or trust frontend totals.

Blockers:

- Local Postgres remains unavailable, so DB-backed migration/seed/manual API verification could not run.

Open decisions:

- How to wire Stripe dynamic prices or invoice items for per-website quantity.
- Whether `website_agency` becomes hidden Business, grandfathered, or a separate future tier.
- Whether existing `PromoDeal` should migrate into `promo_codes`/`promo_banners`.
- Whether checkout intent should become a durable order-like table separate from `subscriptions`.

Next recommended phase:

- Backend Phase 5: Entitlement Enforcement.
- Backend agent also recommended wiring Stripe subscription creation to the pricing checkout intent, creating/updating Stripe subscriptions using backend-calculated quantity, price, discounts, and normalized subscription records, then phasing out legacy `/api/account/plan` amount logic.

## Backend Phase 5: Entitlement Enforcement

Status: Complete, with DB-backed manual activation tests blocked by unavailable Postgres.

### Attempt 2026-07-29

Agent/context:

- Agent: Codex backend entitlement enforcement phase
- Repo/path: `/Users/apple/Desktop/Projects/techietribe-directory/backend`
- Branch: `main`
- HEAD: `c2fd688`
- Goal: Implement normalized backend entitlement enforcement for Free, Pro, and Business plans.
- Working tree status: dirty working tree.
- Documentation note: backend agent did not write `docs/PRICING_PHASE_RESPONSES_LOG.md`.

Scope completed:

- Added normalized entitlement service.
- Added DB-backed lookup through `subscriptions -> plans -> plan_entitlements` when available.
- Added fallback Free/Pro/Business entitlements for tests, legacy behavior, and offline DB.
- Wired entitlement gates into multiple protected backend controllers/services.
- Added mocked unit coverage for entitlement behavior.

Files inspected:

- Backend Phase 5 prompt attachment
- `backend/services/planService.js`
- `backend/config/planConfig.js`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/config/prisma.js`
- `backend/config/websiteAiConfig.js`
- `backend/controllers/websiteController.js`
- `backend/services/websiteFromTemplateService.js`
- `backend/services/frontendTemplateService.js`
- `backend/services/templateService.js`
- `backend/controllers/pageController.js`
- `backend/controllers/blockController.js`
- `backend/routes/blockRoutes.js`
- `backend/controllers/domainController.js`
- `backend/routes/domainRoutes.js`
- `backend/routes/aiRoutes.js`
- `backend/routes/accountDelegationRoutes.js`
- `backend/controllers/integrationController.js`
- `backend/routes/integrationRoutes.js`
- `backend/controllers/commentController.js`
- `backend/controllers/formSubmissionController.js`
- `backend/services/formSubmissionService.js`
- `backend/routes/formSubmissionRoutes.js`
- `backend/controllers/websiteMediaController.js`
- `backend/services/websiteMediaService.js`

Files changed:

- `backend/services/entitlementService.js`
- `backend/tests/entitlementService.test.js`
- `backend/controllers/websiteController.js`
- `backend/services/websiteFromTemplateService.js`
- `backend/services/frontendTemplateService.js`
- `backend/controllers/pageController.js`
- `backend/controllers/blockController.js`
- `backend/controllers/domainController.js`
- `backend/routes/aiRoutes.js`
- `backend/routes/accountDelegationRoutes.js`
- `backend/controllers/integrationController.js`
- `backend/controllers/commentController.js`
- `backend/services/formSubmissionService.js`
- `backend/services/websiteMediaService.js`

Entitlement service:

- `backend/services/entitlementService.js`

Service capabilities:

- Legacy mapping:
  - `website_free` -> `free`
  - `website_core` -> `pro`
  - `website_growth` -> `business`
  - `website_agency` -> `business`
- DB-backed lookup through `subscriptions -> plans -> plan_entitlements` when available.
- Fallback Free/Pro/Business entitlements for tests, legacy behavior, and offline DB.
- Effective fields for:
  - site count
  - directory listing
  - template restrictions
  - pages
  - blocks
  - forms
  - submissions
  - storage
  - AI/day
  - custom domain
  - custom code/CSS/embed
  - collaborators
  - analytics
  - moderation
  - integrations
  - light shop/payment links
  - support
- Structured errors through `buildEntitlementError()`.

Structured entitlement error example:

```json
{
  "code": "ENTITLEMENT_REQUIRED",
  "feature": "custom_domain",
  "requiredPlan": "pro",
  "currentPlan": "free",
  "message": "Custom domains require Pro or Business.",
  "upgradePath": "/pricing"
}
```

Feature gates wired:

- Website creation.
- DB/frontend template creation.
- Premium templates.
- Page creation.
- Block create/bulk save restricted block types.
- Custom CSS on block update.
- Custom domains.
- Daily website AI quota.
- Account delegates/collaborators.
- Advanced integrations create/update/toggle.
- Comment moderation status changes.
- Public form submission monthly quota.
- Website media storage quota.

Feature gates not yet wired:

- Store/product/order/payment-link flows still use existing store-plan logic.
- Business light shop/catalog/payment-link gating was left untouched because the product decision against current `storePlan` tiers is still open.
- Directory eligibility still uses legacy `planService`.
- Analytics route tiering beyond AI usage was not changed because endpoint-level Business analytics distinctions need a separate route map.

Commands run:

- `node --check` on changed service/controller/route files.
- `npm test -- --runTestsByPath tests/entitlementService.test.js tests/pricingCalculationService.test.js tests/pricingController.test.js tests/planService.test.js --runInBand`
- `npx prisma validate --schema prisma/schema.prisma`
- `git diff --check`
- Follow-up quick check after domain owner-plan fix: `tests/entitlementService.test.js tests/pricingController.test.js`
- `pg_isready -h localhost -p 5432`

Automated validation:

- `node --check` passed on changed service/controller/route files.
- Entitlement, pricing calculation, pricing controller, and plan service tests passed: 100 tests.
- Prisma schema validation passed.
- Diff whitespace check passed.
- Follow-up quick check after domain owner-plan fix passed: 16 tests.

Manual testing:

- DB unavailable, so no test user/plan activation was possible.
- Mocked coverage verifies DB entitlement overlay through an injected repository and fallback behavior without DB.

DB blocker evidence:

```text
localhost:5432 - no response
```

```text
P1001 Can't reach database server at localhost:5432
```

Blockers:

- Local Postgres must be running for migration/seed/manual Super Admin activation tests.

Open decisions:

- Product decision needed for Business light commerce versus existing store plans.
- Super Admin UI/API needed for editing every seeded entitlement key, including:
  - `custom_code_embeds`
  - `custom_code_css_embeds`
  - `advanced_integrations`
  - banners
  - deals
  - promos
  - referrals
  - pricing rules
- Remaining route map needed for analytics, directory priority, and light commerce/payment-link enforcement.

Next recommended phase:

- Backend Phase 6: Super Admin Backend APIs.
- Backend agent also recommended running DB-backed migration/seed, verifying Super Admin-editable entitlement values flow into protected endpoints, then mapping and wiring remaining analytics, directory priority, and light commerce/payment-link enforcement.

## Backend Phase 6: Super Admin Backend APIs

Status: Not started.

## Frontend Phase 1: Discover Existing Pricing, Billing And Super Admin UI

Status: Not started.

## Frontend Phase 2: Shared Pricing Types And API Client

Status: Not started.

## Frontend Phase 3: Public Pricing Page Integration

Status: Not started.

## Frontend Phase 4: Checkout And Code Entry UI

Status: Not started.

## Frontend Phase 5: Account/Billing And Locked Feature UX

Status: Not started.

## Frontend Phase 6: Super Admin Pricing Management UI

Status: Not started.

## Final Release Validation

Status: Not started.

Required evidence:

- Backend pricing calculation tests:
- Checkout tamper-proofing tests:
- Entitlement tests:
- Super Admin authorization tests:
- Super Admin update/publish/audit tests:
- Public pricing page manual test:
- Checkout manual test:
- Free user manual test:
- Pro user manual test:
- Business user manual test:
