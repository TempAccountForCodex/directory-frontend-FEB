# Pricing, Plan Gating, Promos and Super Admin Handoff

This document turns the current pricing page work into an implementation plan for frontend, backend and Super Admin management.

Current frontend files:

- `src/components/publicComponents/Pricing/pricingConfig.ts`
- `src/components/publicComponents/Pricing/PricingDetail.tsx`

Production direction:

- Prices, percentages, promo codes, referral rules, deal copy and promo banners must be editable from Super Admin.
- Pure product logic and entitlement gates must be enforced by backend and respected by frontend.
- `pricingConfig.ts` can remain a local fallback/default config during development, but backend-owned data should become the production source of truth.

## Short Plan Changes And Gates

### Free Plan

Editable from Super Admin:

- Plan name, tagline, description, CTA and visible feature copy
- Free plan upsell/nudge banners
- Which 2-3 single-page templates are available to Free users

Fixed product gates:

- Free users can create only 1 single-page landing site.
- Free users can only use Super Admin-selected single-page templates.
- Free users cannot duplicate or add extra blocks beyond the allowed template structure.
- Free users get 1 built-in form.
- Free users get 50 form submissions per month.
- Free users get 5 blog posts.
- Free users get 50 MB storage.
- Free users get 5 AI actions per day.
- Free users get a `techietribe.app` subdomain only.
- Free users should see timely upgrade nudges and banners.

### Pro Plan

Editable from Super Admin:

- Monthly base price, annual/list price and CTA
- Base site count, min site count, max site count and site-count step
- Whether site count can exceed the default max if Super Admin allows it
- Annual savings amount/percent/free-month logic
- Volume discount percent and cap
- Visible feature copy and comparison-table copy

Fixed product gates:

- Pro includes everything in Free, plus paid site-count scaling.
- Pro gets a directory listing for each site.
- Pro gets custom domain support.
- Pro gets built-in forms with no plan-level limit unless backend defines one.
- Pro gets unlimited blog posts.
- Pro gets up to 200 MB storage per site.
- Pro gets 100 AI actions per day.
- Pro gets custom code and embeds.
- Pro gets SEO optimization.
- Pro gets premium templates.
- Pro gets basic analytics.
- Pro gets 2 collaborators per website.

### Business Plan

Editable from Super Admin:

- Monthly base price, annual/list price and CTA
- Coming-soon, active or hidden status
- Base site count, min site count, max site count and site-count step
- Volume discounts, promo eligibility and banner copy
- Visible feature copy and comparison-table copy

Fixed product gates:

- Business includes everything in Pro, plus higher-scale business features.
- Business gets priority based directory listing.
- Business gets advanced integrations.
- Business gets built-in forms.
- Business gets unlimited blog posts.
- Business gets 1 GB storage per site.
- Business gets 500 AI actions per day.
- Business gets custom code, CSS and embeds.
- Business gets SEO optimization.
- Business gets blog comments and moderation controls.
- Business gets conversion, funnel and real-time analytics.
- Business gets 10 collaborators per website.
- Business gets custom domains.
- Business gets priority support.
- Business gets light shop/catalog and payment-link features.

## Current Pricing Defaults

These values are current frontend defaults and should become backend-managed values.

### Site Count

- Pricing base/reference site count: `1` for purchasable paid plans.
- Site-count stops: `1 -> 5 -> 10 -> 20 -> 25 -> 50 -> 100 -> 150 -> 200 -> 250`
- The `1` website stop must be purchasable. Do not force a 5-website minimum.
- Default maximum site count: `250`
- Pro can potentially increase beyond `250` only if Super Admin/backend explicitly allows it.

### Planning Price Direction

- Free: `$0/month`, `$0/year`
- Pro: `$9/website/month`
- Early-bird Pro: `$7/website/month`, configurable from Super Admin
- Business: `$17/website/month`
- Early-bird Business: `$15/website/month`, configurable from Super Admin
- Current hardcoded frontend prices are placeholders only.

### Annual Billing

- Annual billing currently gives `2` months free.
- Annual price formula should use monthly price per website times selected site count times the configured paid-month count.
- Annual savings should be shown as a savings line item, but final authority must come from backend.

### Volume Discount

- Current default: `1%` per every `10` added sites.
- Current cap: `20%`.
- Added sites should be calculated from the configured discount threshold, not from a purchase minimum.
- Volume discount applies only to eligible paid plans configured by Super Admin.
- Do not show volume/bulk discount as a separate pricing-card chip unless Super Admin enables that display.

### Launch Promo

- Code: `LAUNCH20`
- Discount: `20%`
- Applies to first annual Pro or Business payment.
- Renewal should use regular monthly or annual price unless backend defines another rule.

### Referral Program

- Code: `REFERRAL20`
- Friend receives `20%` off first payment.
- Discount duration: once
- Referrer receives `$5` credit.
- Maximum backend-controlled benefit: `$20`
- Eligible plans: Pro and Business
- Renewal: regular monthly or annual price

## Phase 1: Frontend Plan

Goal: make the pricing page, checkout UI and Super Admin UI ready to consume backend-managed pricing and entitlement data.

### 1. Pricing Page Data Model

Frontend should stop hardcoding production pricing once backend APIs are ready.

Required frontend model groups:

- plans
- plan features
- plan entitlement display limits
- billing cycles
- site-count rules
- annual savings rules
- volume discount rules
- promo/deal rules
- referral rules
- promo banner carousel items
- comparison table rows

`pricingConfig.ts` should become:

- fallback/default data for local development
- TypeScript shape reference
- optional seed data for backend setup

### 2. Pricing Cards

Pricing cards should support backend-returned values:

- plan id
- plan name
- tagline
- description
- CTA
- active/hidden/coming-soon state
- base price
- billing cycle
- selected site count
- calculated list price
- calculated final price
- annual savings
- volume discount
- promo/referral savings
- renewal amount
- plan feature list

UI behavior:

- Users can increase/decrease paid plan site count.
- Long prices must not overlap arrows, suffix or badges.
- Monthly/annual toggle must update pricing from the same calculation source.
- Savings badges must use backend calculation results when available.

### 3. Promo Banner Carousel

Current frontend behavior:

- Single stable promo card shell
- Inner content slides/fades
- 3-second loop
- Dot indicators for manual switching
- Copyable code button

Backend-driven behavior needed:

- Fetch active promo banners from backend.
- Respect Super Admin sort order.
- Show one dot per active banner.
- Support action types:
  - copy code
  - open checkout
  - open URL
  - scroll to pricing cards
  - no action
- Keep local fallback banners for development only.

### 4. Checkout UI

Checkout must show the same breakdown as pricing page:

- selected plan
- billing cycle
- site count
- base/list price
- annual savings
- volume savings
- promo discount
- referral discount
- final payment due
- renewal amount
- applied code

Important:

- Frontend may preview pricing, but backend must calculate final checkout amount.
- Frontend must not trust local price calculations for payment.

### 5. Account/Billing UI

Account billing pages should show:

- active plan
- billing cycle
- site count
- renewal date
- renewal amount
- active discounts
- referral credit balance
- usage against gated limits

### 6. Super Admin Frontend Screens

Required Super Admin screens:

- Pricing Plans
- Plan Features and Entitlements
- Promo Codes and Deals
- Referral Program
- Promo Banners
- Pricing Preview
- Audit Log

Super Admin should be able to manage display and pricing values without code changes:

- plan names and copy
- base prices
- site-count min/max/step
- annual discount/free months
- volume discount percent and cap
- promo codes
- referral code and reward settings
- deal start/end dates
- banner carousel content
- active/hidden/coming-soon states

Super Admin should not directly bypass backend entitlement logic. Entitlement behavior must still map to backend-supported gates.

## Phase 2: Backend Plan

Goal: make backend the authoritative source for pricing, checkout, subscriptions, referrals, promos and entitlement enforcement.

### 1. Backend Source Of Truth

Backend should own:

- plan definitions
- base prices
- billing cycles
- site-count rules
- discount/deal rules
- referral rules
- promo banner records
- entitlement gates
- comparison-table values
- checkout calculations
- renewal calculations

Recommended records/tables:

- `plans`
- `plan_prices`
- `plan_entitlements`
- `plan_features`
- `pricing_rules`
- `promo_codes`
- `referral_program_settings`
- `referrals`
- `referral_credit_ledger`
- `promo_banners`
- `pricing_audit_log`
- `subscriptions`
- `subscription_discounts`

### 2. Pricing Calculation Service

Create one backend pricing calculation service used by:

- pricing preview API
- checkout API
- subscription renewal logic
- Super Admin pricing preview

Inputs:

- plan id
- billing cycle
- site count
- promo code, optional
- referral code, optional
- user id, optional

Outputs:

- base price
- list price
- annual savings
- volume discount percent
- volume savings
- promo discount
- referral discount
- final price
- renewal price
- applied rules
- rejected rules
- validation errors

Backend must validate:

- selected plan exists and is purchasable
- plan is not hidden
- coming-soon plans cannot be purchased unless allowed
- site count respects min/max/step
- promo code is active and eligible
- referral code is active and eligible
- discount stacking rules
- max benefit caps

### 3. Checkout

Checkout must:

- call backend pricing calculation
- persist selected plan, billing cycle and site count
- persist applied discounts/referral attribution
- send final server-calculated amount to payment provider
- prevent client-side price tampering
- show renewal behavior clearly

### 4. Subscription And Entitlement Enforcement

Persist:

- user id
- plan id
- billing cycle
- selected site count
- status
- current period start/end
- renewal amount
- applied promo/referral codes
- referral source
- referrer credit state

Enforce gates:

- number of sites/listings
- template availability
- block duplication/addition permissions
- forms
- submissions per month
- storage
- AI actions per day
- custom domains
- custom code/CSS/embed access
- collaborators
- analytics level
- blog comments/moderation
- priority listing/support
- integrations
- shops

### 5. Referral System

Backend must implement:

- referral code validation
- one-time friend discount
- referrer credit issuance
- `$20` max benefit cap
- referral attribution
- referral credit ledger
- fraud/abuse controls
- renewal behavior without first-payment discount

Referral record fields:

- referral id
- referral code
- referrer user id
- referred user id
- subscription id
- status
- friend discount amount
- referrer credit amount
- created at
- credited at

### 6. Promo Codes, Deals And Stacking Rules

Backend must define if these can stack:

- annual savings
- volume discount
- launch discount
- referral discount
- seasonal deals
- manual Super Admin discount

Each promo/deal should support:

- code
- name
- discount type
- value
- duration
- eligible plans
- eligible billing cycles
- start date
- end date
- usage limits
- per-user limits
- maximum benefit
- stackability rules
- active/inactive state

### 7. Super Admin Backend APIs

Required admin APIs:

- list/create/update/publish/unpublish plans
- list/create/update plan entitlements
- list/create/update promo codes and deals
- activate/deactivate promo codes and deals
- list/update referral program settings
- list referral usage and credit ledger
- list/create/update/reorder promo banners
- activate/deactivate promo banners
- preview pricing result
- view pricing audit log

### 8. Audit And Safety

Pricing changes require auditability.

Backend should store:

- editor/admin user id
- changed record
- previous value
- new value
- timestamp
- publish status
- affected plans

Safety requirements:

- role-based access control
- draft/published states
- preview before publish
- scheduled publishing
- confirmation for major price changes
- rollback to previous version

## Open Decisions

- Business is planned as purchasable at `$17/website/month`, with early-bird `$15/website/month`.
- Can Pro site count exceed `250` for all users, or only after Super Admin approval?
- Can launch and referral codes stack?
- Can referral discount stack with annual and volume discounts?
- Is the `$20` referral cap per referral, per user, or per billing period?
- Does referrer credit apply to future invoices only or current checkout too?
- Should volume discount apply before or after promo/referral discount?
- Should annual savings be stored as free months, percentage, fixed annual price, or a line-item discount?

## Implementation Checklist

### Frontend

- Keep `pricingConfig.ts` as fallback/default data.
- Add backend pricing preview integration.
- Update pricing cards to use backend-calculated breakdown.
- Add checkout promo/referral input.
- Add account billing discount/referral display.
- Build Super Admin pricing screens.
- Build Super Admin promo/referral/banner screens.
- Add loading, empty and error states.

### Backend

- Create backend pricing schema.
- Create pricing calculation service.
- Add public pricing preview endpoint.
- Add checkout validation and payment-provider integration.
- Add subscription persistence and renewal logic.
- Add entitlement enforcement.
- Add referral system and credit ledger.
- Add promo/deal system.
- Add promo banner system.
- Add Super Admin APIs.
- Add audit log and rollback support.
- Add tests for pricing boundaries and stacking rules.
