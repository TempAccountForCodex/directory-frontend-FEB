# Pricing Backend Phases

This file is for a backend AI agent with no prior chat context. Backend implementation should happen before frontend API integration because backend must be the source of truth for production pricing, checkout amounts and entitlement enforcement.

Related files:

- `docs/PRICING_PHASE_RESPONSES_LOG.md`
- `docs/PRICING_PHASED_IMPLEMENTATION_PLAN.md`
- `docs/PRICING_IMPLEMENTATION_HANDOFF.md`

## Non-Negotiable Rule

Every business-configurable value must be editable from Super Admin and must not require a code deploy:

- plan names, descriptions, feature copy and status
- Pro and Business price per website
- billing cycles, annual savings and months free
- early-bird pricing and duration
- volume discount thresholds, percentages, caps and display visibility
- promo codes, percentages, fixed discounts, dates, usage limits and stackability
- referral code, friend discount, referrer credit, cap, eligibility and renewal copy
- promo banner copy, order and visibility
- comparison table display values
- Super Admin-selected free templates

Frontend may preview prices, but backend must calculate final checkout amounts and enforce entitlements.

## Required Phase Response Format

The backend agent does not have access to this frontend documentation repo. At the end of every phase, return a detailed response in chat using this structure so it can be copied into `docs/PRICING_PHASE_RESPONSES_LOG.md` later:

```md
## Backend Phase X Response

Agent/context:
- Agent:
- Backend repo/path:
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

API endpoints found or created:
- Method/path:
- Purpose:
- Auth:
- Request example:
- Response example:

Database/models/migrations:
-

Plan/pricing/entitlement findings:
-

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

Pricing baseline for seed/default config:

- Pro standard: `$9/website/month`
- Pro early bird: `$7/website/month`
- Business standard: `$17/website/month`
- Business early bird: `$15/website/month`
- 1 website must be purchasable; no 5-site minimum.
- Site-count stops: `1 -> 5 -> 10 -> 20 -> 25 -> 50 -> 100 -> 150 -> 200 -> 250`
- Do not show a separate visible bulk/volume discount chip unless Super Admin enables it.
- Business can include light shop/catalog/payment-link features. Full Shopify-like commerce should remain a future add-on or higher tier.

## Entitlement Gates

Free:

- 1 single-page landing site
- only Super Admin-selected free templates
- no duplicate/additional restricted blocks
- 1 built-in form
- 50 form submissions/month
- 5 blog posts
- 50 MB storage
- 5 AI actions/day
- `techietribe.app` subdomain only

Pro:

- everything in Free, plus paid site-count scaling
- directory listing for each paid site
- custom domain support
- built-in forms with no plan-level limit unless configured
- unlimited blog posts
- up to 200 MB storage/site
- 100 AI actions/day
- custom code and embeds
- SEO optimization
- premium templates
- basic analytics
- 2 collaborators per website

Business:

- everything in Pro
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

## Backend Phase 1: Discover Existing Billing And Plan System

Prompt:

```text
You are working on the Techietribe directory backend. Discovery only. Do not modify code.

Find the existing billing, subscription, Stripe, promo, referral, plan config and entitlement code. Produce a short implementation map that lists existing files, endpoints, plan codes, pricing logic, promo/referral support and gaps.

Important rule: every price, percentage, promo, referral setting, deal setting and banner setting must be editable from Super Admin eventually. Backend must become the final source of truth for checkout pricing and entitlements.

Do not assume prior chat context. Read the repo and report only verified facts with file paths.
```

Acceptance criteria:

- Existing plan codes are listed and mapped to Free/Pro/Business where possible.
- Existing subscription storage is identified.
- Existing checkout/subscription flow is identified.
- Existing promo/referral support is identified.
- Existing and missing entitlement checks are listed.
- No code changes.

Manual testing:

- No app testing required.
- Confirm the report is enough for a backend agent without chat history.
- Return the full detailed phase response in chat using the required phase response format above.

## Backend Phase 2: Pricing Schema And Super Admin Config Model

Prompt:

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

Preserve existing data and current app behavior. Add migrations safely. If current backend uses different model names, adapt to existing conventions and document the mapping.
```

Acceptance criteria:

- Configurable models exist for plans, pricing, rules, promos, referrals and banners.
- Business values are stored in data, not constants.
- Default seed data exists for Free, Pro and Business.
- Site-count stops are stored/configurable and include `1`.
- Audit log can record before/after values.
- Migration is non-destructive.

Manual testing:

- Run migrations locally.
- Confirm seeded plans appear in DB.
- Change Pro and Business price-per-website in DB without code changes.
- Create promo/referral/banner records in DB.
- Return the full detailed phase response in chat, including migration/model/seed results.

## Backend Phase 3: Pricing Calculation Service

Prompt:

```text
You are working on the Techietribe directory backend. Build one pricing calculation service used by pricing preview, checkout, renewals and Super Admin preview.

Inputs: plan id, billing cycle, site count, optional promo code, optional referral code, optional user id.

Outputs: selected plan, billing cycle, site count, price per website, list price, annual savings, volume discount percentage, volume savings, early-bird discount, promo discount, referral discount, final first payment, renewal price, applied rules, rejected rules and validation errors.

Strict rule: frontend must not calculate final checkout price. Backend result is authoritative.
```

Acceptance criteria:

- One reusable service handles all pricing math.
- Active/purchasable plan validation exists.
- Hidden plans are rejected.
- Coming-soon plans are rejected except for Super Admin preview if allowed.
- Site count is validated against configured stops.
- Annual, volume, early-bird, promo and referral rules apply from stored config.
- Stackability and max-benefit settings are enforced.
- Unit tests cover `1`, `5`, `10`, `20`, `250`, invalid `7`, hidden plan, expired promo and referral cap.

Manual testing:

- Calculate Pro monthly for 1, 5, 10 and 250 sites.
- Calculate Business annual for 5 and 250 sites.
- Apply launch promo and referral promo.
- Try invalid site count `7`.
- Try hidden/coming-soon checkout.
- Return the full detailed phase response in chat, including sample JSON request/response examples.

## Backend Phase 4: Public Pricing And Checkout APIs

Prompt:

```text
You are working on the Techietribe directory backend. Expose backend-owned pricing to the frontend.

Implement or update APIs for public pricing config, active early-bird deals, active promo banners, pricing preview calculation, checkout creation and promo/referral validation.

Backend must calculate final checkout amounts. Frontend may send plan id, billing cycle, site count and optional codes, but frontend price values must be ignored.
```

Acceptance criteria:

- Public pricing endpoint returns active plans, features, comparison rows, billing cycles, site stops, early-bird deal state, active banners and display copy.
- Pricing preview endpoint returns calculation-service output.
- Checkout recalculates price server-side.
- Checkout persists plan, billing cycle, site count, discounts and referral attribution.
- API errors are structured for frontend display.
- Tests prove client-side price tampering fails.

Manual testing:

- Confirm public pricing values match seed/Super Admin data.
- Preview Pro 1 monthly, Pro 5 annual and Business 250 annual.
- Send checkout request with fake lower frontend price; backend ignores it.
- Apply invalid promo code and confirm clear rejection.
- Return the full detailed phase response in chat, including endpoint URLs, payloads and responses.

## Backend Phase 5: Entitlement Enforcement

Prompt:

```text
You are working on the Techietribe directory backend. Implement backend entitlement enforcement for Free, Pro and Business plans.

Pricing values are configurable through Super Admin, but entitlement gates must be enforced by backend services/controllers. Add a normalized entitlement service if one does not exist.

Enforce gates for websites, directory listings, free templates, block duplication/addition, forms, form submissions, storage, AI actions, custom domains, custom code/CSS/embed, collaborators, analytics depth, comments/moderation, priority listing, integrations and shops.
```

Acceptance criteria:

- Effective entitlement service exists and is used by protected controllers.
- Free cannot create a second website, use premium templates, add restricted blocks or add custom domains.
- Pro can use Pro features but not Business-only features.
- Business can use Business features.
- Entitlement errors include enough detail for frontend upgrade UI.
- Existing users are handled safely.

Manual testing:

- Activate Free for a test user and attempt gated actions.
- Activate Pro and verify Pro unlocks plus Business locks.
- Activate Business and verify Business features unlock.
- Return the full detailed phase response in chat, including test user id, plan changes and backend responses.

## Backend Phase 6: Super Admin Backend APIs

Prompt:

```text
You are working on the Techietribe directory backend. Build Super Admin APIs to manage all pricing, plan, promo, referral and banner configuration.

Strict rule: every configurable price, percentage, promo, deal, referral value and banner must be editable from Super Admin. Changes must be audited.

Required capabilities: manage plans, prices, site-count stops, annual savings, volume discounts, features, comparison rows, entitlement display values, promo codes, referral settings, referral usage/credit ledger, promo banners, pricing preview, audit log and rollback.
```

Acceptance criteria:

- All APIs require Super Admin authorization.
- Every mutation writes an audit log entry.
- Draft/published states or equivalent safe publishing exists.
- Pricing preview can run against draft config.
- Rollback or restore previous published config is possible.
- API tests cover unauthorized access and successful Super Admin changes.

Manual testing:

- Non-admin requests are forbidden.
- Super Admin changes Pro price, previews, publishes and confirms public pricing updates.
- Super Admin reorders promo banners and public order updates.
- Super Admin rolls back Pro price and public pricing updates again.
- Return the full detailed phase response in chat, including endpoint list, auth behavior and audit-log examples.
