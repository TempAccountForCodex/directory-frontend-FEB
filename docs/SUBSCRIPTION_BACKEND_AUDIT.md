I completed the backend audit without modifying code. Key files inspected include [app.js](/Users/apple/Desktop/Projects/techietribe-directory/backend/app.js), [schema.prisma](/Users/apple/Desktop/Projects/techietribe-directory/backend/prisma/schema.prisma), [planConfig.js](/Users/apple/Desktop/Projects/techietribe-directory/backend/config/planConfig.js), [planService.js](/Users/apple/Desktop/Projects/techietribe-directory/backend/services/planService.js), auth/ownership middleware, route files, controllers, services, migrations, and targeted tests.

**Executive Summary**
The backend already has meaningful subscription foundations, but it is not yet an authoritative entitlement system across the product.

Implemented plan foundations:
- User-level website/store plan fields: `websitePlan`, `storePlan`, Stripe customer/subscription IDs, subscription status, period end, cancellation/past-due fields.
- Central website/store plan config with limits for sites, pages, blocks, directory eligibility, storage, forms, collaborators, custom domains, AI generations, SEO level, video blocks, custom CSS.
- Stripe subscription service, webhook sync, dunning, invoices, admin plan overrides, credits, refunds, promo/referral support.
- Some backend enforcement for website count, page count, block count, custom domains, premium DB templates, account delegates, products/stores, and website AI quota.

Main problem:
- Entitlements are configured more broadly than they are enforced. Several paid features are only represented in config or UI-facing summaries, not guarded at every backend mutation/read path.

**Current Backend Feature Inventory**
Core product areas currently implemented:
- Auth: email/password signup/signin, passwordless signin codes, email verification, password reset, email change, Google OAuth, signout token blacklist, blocked users, login history.
- Accounts/billing: profile, billing details, payment methods, plan updates, setup intents, cancellation/reactivation, invoices, admin billing controls.
- Website builder: websites, pages, blocks, bulk autosave, publishing/unpublishing, deletion/restore/permanent delete, templates, frontend templates, themes, global components, menus, media, domains, preview, public rendering.
- Directory/listings: public directory search/meta/autocomplete/location-category pages, website-backed listing lifecycle, listing extraction, listing AI enhancement, rich listing descriptions, moderation, archive/republish.
- Collaboration/agency: website collaborators, roles, presets, invites, account delegation, delegated account context.
- AI: OpenAI-style legacy content generation, website AI provider chain using NVIDIA NIM / Cloudflare Workers AI / OpenRouter, website AI sessions/history/context, AI usage rows, listing generation, moderation.
- Forms/leads: public form submission, spam heuristics, owner notification/email, authenticated inbox, bulk update/delete, CSV export.
- Analytics: page views, website events, unique visitors, traffic sources, devices, country inference, daily snapshots, dashboard/admin metrics.
- Social/trust: reviews, review votes, owner replies, comments/reactions, favourites, moderation routes, audit logs.
- Commerce: stores, products, orders, checkout PaymentIntents, coupons, platform-fee calculation.
- Admin/support: docs CMS, incidents, broadcasts, finance reporting, categories, users.

**Plan/Entitlement Model**
Current website plan codes:
- `website_free`
- `website_core`
- `website_growth`
- `website_agency`

The user-facing target names Free, Pro, Business, Agency do not exactly match current backend names. `website_core` likely maps to Pro, `website_growth` to Business, but that needs an explicit mapping before pricing rollout.

Current store plan codes:
- `store_free`
- `store_starter`
- `store_pro`

Existing configured website limits:
- Sites per account
- Pages per site
- Blocks per page
- Directory listing eligibility
- Powered-by badge flag
- Images/storage MB
- Forms per site
- Analytics level
- Directory boost score
- Subdomain/custom domain access
- Template access label
- Delegates/collaborators
- Video blocks
- Custom CSS
- AI generations/month
- SEO level

Existing enforcement:
- Website count: enforced in `websiteController`, `websiteFromTemplateService`, `frontendTemplateService`.
- Page count: enforced in `pageController`.
- Block count: enforced in `blockController` create/bulk upsert.
- Custom domain: enforced in `domainController`.
- DB premium template use: blocked for free users in `websiteFromTemplateService`.
- Account delegate count: enforced in account delegation routes.
- Website AI quota: enforced in `aiRoutes` when quota enforcement is enabled, production by default.
- Store/product limits: helper support exists and store/product controllers use store plan checks.

Not fully enforced:
- `maxFormsPerSite`
- `maxUploadStorageMb` from plan config; media service uses hard-coded 500 MB per website instead.
- `maxImagesPerSite`
- `analyticsLevel`
- `templatesAccess` beyond DB premium/free guard
- `customCSS`
- `videoBlocks` broadly across all block write paths
- `maxCollaborators` for website collaborators
- directory boost/featured/sponsored beyond plan score
- SEO level
- lead retention/export by plan
- bandwidth
- agency/client ownership features

**Authorization**
Role structure:
- Global roles: `USER`, `ADMIN`, `SUPER_ADMIN`, `CONTENT_CREATOR`.
- Website roles: `OWNER`, `ADMIN`, `EDITOR`, `VIEWER`.
- Collaborator presets: `CONTENT_ONLY`, `REVIEWER`.
- Account delegation roles: `ACCOUNT_ADMIN`, `ACCOUNT_COLLABORATOR`.

Strong areas:
- `authenticateToken` validates JWT, email verification, blocked status, password-change invalidation, Redis blacklist.
- `requireAdmin` / `requireSuperAdmin` protect admin routes.
- Website permissions are centralized in `permissionService`, `websiteAccess` middleware, and `WEBSITE_ACTIONS`.
- Website access generally returns 404 for inaccessible resources to reduce enumeration.
- Account delegation is integrated into website access and accessible website lists.

Gaps:
- Some controllers still perform owner/admin checks after route-level `requireWebsiteAccess`, which can accidentally block valid collaborators.
- Some route families use ad hoc owner checks instead of centralized `requireWebsiteAccess`.
- Form submission inbox/export routes require login but do not apply website access middleware; the service only filters by `websiteId`.
- General `/api/upload/image` and `/api/upload/video` can record media against a submitted `websiteId` without verifying access to that website.
- Listing management is owner/admin only, not collaborator-role aware.
- Domain management uses owner/effective owner checks, not `MANAGE_DOMAIN` middleware.
- Auth comments say refresh cookie in places, but the inspected implementation uses one JWT cookie/header path rather than a modeled refresh-token/session table.

**Data Model Findings**
There is no separate `Business` or `Listing` model. Directory listings are `Website` rows with listing fields:
- `businessName`, `businessCategory`, `shortDescription`, `descriptionContent`
- `city`, `region`, `country`, `postalCode`, `fullAddress`, lat/lng, remote flag
- `priceLevel`, `tags`, phone/email
- `directoryOptedIn`, `isDirectoryArchived`, archive metadata
- `averageRating`, `reviewCount`, `favouriteCount`, search vector

Relationships supported:
- One user with multiple websites: yes.
- One website with multiple pages: yes.
- One page with multiple blocks: yes.
- One website with one store: yes.
- One website with blogs/events/forms/media/reviews/comments/integrations/menus/theme presets.
- Team access: yes via website collaborators.
- Agency-like access: partial via account delegates and multi-site limits.
- Ownership transfer: supported for websites.
- One business with multiple websites: not cleanly modeled; `businessId` exists on `Website` but no actual `Business` model was found.
- Multiple listings per user: yes indirectly through multiple websites.
- Client ownership: partial, not explicit.
- Listing claim/verification ownership transfer: not found.

Ambiguity:
- `businessId` is an orphan-ish field without a matching business table in Prisma.
- Listing identity equals website identity, which simplifies MVP but complicates paid directory-only listings, claims, and one business with multiple sites/listings.

**Monetizable Backend Features**
Strong candidates:
- Websites per account
- Pages per website
- Blocks/sections per page
- Website templates and premium templates
- Custom domains
- Subdomains
- Storage quota
- Video uploads/video blocks
- Media library
- Forms per site
- Monthly form submissions
- Lead inbox retention
- CSV export
- Analytics depth/date range/export
- Website AI generations/credits
- Listing AI enhancement
- Directory inclusion
- Directory ranking boost
- Enhanced listing content/rich media
- Additional tags/categories/service areas
- Reviews/owner replies
- Featured/sponsored listings
- Collaborators
- Account delegates/client access
- Multi-site/agency management
- Integrations: GA, Facebook Pixel, GTM, Hotjar, Intercom, custom script
- Stores/products/orders/coupons/platform fee levels
- Blog/events/content features
- Broadcast/referral/promo/admin billing capabilities

Not implemented as paid fields yet:
- Featured listing flag
- Sponsored listing campaign model
- Verified badge / verification workflow
- Claim listing workflow
- Service areas/counts
- Paid additional categories
- Priority placement inventory
- Bandwidth tracking
- AI image/logo generation
- Overage billing/credit ledger for AI units separate from account dollar credits

**AI Audit**
Implemented AI operations:
- Website generation/regeneration/editing/chat/draft through `aiRoutes`, `websiteAiService`, `websiteAiClientService`.
- Block content generation through `aiContentService`.
- Listing content generation through `generateListingContent`.
- Content moderation for listing/review/comment-like content through OpenRouter moderation.
- AI context/history/version/revert support.

Providers/models:
- Legacy OpenAI SDK uses `OPENAI_API_KEY`, default `gpt-4o-mini`.
- Website AI provider chain defaults to NVIDIA NIM, Cloudflare Workers AI, OpenRouter.
- Default NVIDIA model: `nvidia/nemotron-3-ultra-550b-a55b`.
- Default OpenRouter website model: `openrouter/free`.
- Cloudflare default: `@cf/meta/llama-3-8b-instruct`.

Usage tracking:
- `AIUsage` stores `userId`, optional `websiteId`, `tokensUsed`, `blocksGenerated`, `cacheHits`, `createdAt`.
- `AIGenerationSession` stores session status/progress.
- Website AI quota counts `AIUsage` rows monthly, not weighted token cost.
- Provider token usage is logged and sometimes persisted to `AIUsage`.

Risk:
- Quota measured by row count can undercharge high-token operations and overcharge cheap/cache operations.
- Listing AI and website AI are partly separate conceptually but share `AIUsage` storage in places.
- Image/logo generation is not present as a backend endpoint despite product positioning.

Recommended AI billing basis:
- Use operation type plus weighted cost units.
- Track provider, model, prompt tokens, completion tokens, total tokens, generated blocks, cache hit, status, latency, and error code.
- Keep monthly hard caps for Free/Pro/Business and optional overage for Business/Agency.
- Separate content moderation from billable AI unless product wants moderation cost pass-through.

**Media/Storage**
Implemented:
- Local disk uploads under `backend/uploads`.
- Public static serving via `/uploads`.
- Website media metadata in `WebsiteMedia`.
- Website media library, stats, soft delete, metadata updates.
- Image size limit 10 MB, video size limit 100 MB on website media.
- Listing inline media: image 5 MB, video 10 MB, safe MIME/extension list.
- Docs uploads allow SVG for admin docs.
- Sharp metadata extraction for images.
- Cleanup jobs/services for assets/previews.

Gaps:
- Plan config says 100 MB/1 GB/5 GB/20 GB, but `websiteMediaService` enforces a hard-coded 500 MB per website.
- General upload endpoints can attach uploads to arbitrary `websiteId` without ownership checks.
- `/uploads` is public; no signed URLs or tenant-isolated object storage.
- No bandwidth tracking.
- No storage retention/downgrade policy enforcement.
- No user/account-level storage rollup tied to subscription.

**Domains/Publishing**
Implemented:
- Subdomain availability and change.
- Reserved subdomains.
- Custom domain add/verify/remove.
- DNS TXT verification.
- Domain status fields: pending, verified, SSL provisioning, active, failed.
- Canonical URL updates.
- Public site routing by slug/subdomain/custom domain middleware.
- Publish/unpublish website.
- Sitemap/robots.

Partial:
- SSL provisioning is a placeholder/status, not full backend automation.
- Multiple custom domains per website are not supported; one `customDomain`.
- Domain limits are not modeled beyond boolean custom-domain entitlement.
- Subdomain plan entitlement exists in config but subdomain change does not clearly enforce it.

Paid recommendation:
- Free: platform path or no custom domain.
- Pro/Business: subdomain and one custom domain depending final plan.
- Business/Agency: custom domains, advanced SEO/canonical controls, multiple domains if modeled later.

**Forms/Leads**
Implemented:
- Public submissions with burst and scoped Redis rate limits.
- Honeypot and keyword spam detection.
- Notifications and email to owner.
- Lead inbox, read/spam status, single/bulk update/delete.
- CSV export.
- `formId`/`formName` support.

Gaps:
- No plan enforcement for forms per site.
- No monthly submission limits.
- No lead retention enforcement.
- No CAPTCHA integration found.
- No lead assignment, CRM/webhooks, WhatsApp/SMS, automated replies.
- Authenticated inbox/export routes lack website access enforcement.

**Analytics**
Implemented:
- Event model for `PAGE_VIEW` and `CTA_CLICK`.
- `PageView` model for page views, visitor/session IDs, referrer, user agent/device/browser/os, IP hash, country from Accept-Language.
- Daily `AnalyticsSnapshot`.
- Dashboard analytics endpoints for overview, pages, traffic sources, visitors, geographic.
- Legacy summary uses `WebsiteEvent`; newer endpoints use `PageView`.

Gaps:
- Public tracking can be spoofed by anyone with `websiteId`; rate limit is IP-only.
- No de-duplication/fraud filtering beyond visitor/session IDs supplied by client.
- No plan enforcement for analytics depth/date ranges/export.
- Avg session duration is always `0`.
- City is always null.
- Search impressions, listing impressions, phone/WhatsApp/email/directions clicks are not comprehensively modeled.

**Templates**
Implemented:
- DB `Template` model with `isPremium`, status, publish, approval, history, previews/screenshots, favorites, usage.
- Public template listing only exposes approved/published templates.
- Content creators can manage own templates with approval workflow.
- DB template application blocks free users from premium templates.

Gaps:
- Frontend/local template catalog does not appear to have premium gating.
- `templatesAccess` in plan config is not generally enforced.
- Public can view metadata for premium approved templates; that may be acceptable, but applying must be guarded consistently.
- Template preview routes need review if premium preview HTML/screenshots should be restricted.

**Verification/Moderation**
Implemented:
- Email verification.
- Listing publish completeness validation.
- Listing content moderation.
- Review/comment moderation routes.
- Blog/template approval/rejection workflows.
- Website/content approval workflow and section locks.
- Audit logs.
- User block/suspension flag.
- Admin moderation routes.

Missing:
- Business verification model/workflow.
- Verified badge field.
- Claim listing.
- Identity/document verification.
- Reported listing model.
- Fraud scoring.
- Separate "basic authenticity check" vs "paid verification product".

Recommendation:
- Do not make all verification paid. Keep baseline authenticity/admin safety free or required, and create a separate paid enhanced verification/badge product if desired.

**Billing/Subscription**
Implemented:
- Stripe subscription creation/update/cancel/reactivate for website plans.
- Stripe webhook signature verification.
- Webhook handling for payment success/failure, subscription updated/deleted.
- Local invoices, payment methods, consent ledger, dunning notifications.
- Admin plan overrides and account credits.
- Promo deals and referrals.
- Store checkout via Stripe PaymentIntent and platform fee tracking.

Gaps:
- No first-class `Subscription` table; subscription state is denormalized onto `User`.
- No entitlement table/service that returns normalized effective features.
- No usage ledger by billing period for non-AI features.
- Store Stripe subscription IDs exist on `User`, but store plan subscription lifecycle appears less complete than website subscriptions.
- No overage invoices or metered billing.
- No downgrade enforcement job that archives/locks excess sites/pages/media/forms after plan reduction.

**Highest-Risk Access-Control Gaps**
1. Authenticated form inbox/export routes need `requireWebsiteAccess(MANAGE_FORMS)` or equivalent.
2. General upload routes need website ownership/access checks before recording media against `websiteId`.
3. Listing management should use centralized website permissions instead of owner/admin only, or explicitly declare owner-only policy.
4. Domain routes should use `MANAGE_DOMAIN` permission middleware plus plan checks.
5. Analytics endpoints should enforce `analyticsLevel` by date range/detail/export capability.
6. Block/custom CSS/video gates must be enforced at all block create/update/bulk paths, not just helper availability.

**Data Needed for Billing/Usage Tracking**
Add or normalize:
- Effective subscription/entitlement record: user/account, plan code, status, billing period, source, override, expiry.
- Usage ledger: accountId/userId/websiteId, feature key, quantity, period start/end, source request ID.
- AI usage detail: operation type, provider, model, prompt tokens, completion tokens, total tokens, cached, success/failure, estimated cost.
- Storage rollups: account and website bytes, file counts, video bytes, bandwidth if needed.
- Forms usage: forms per site, submissions per month, export events, retention cutoff.
- Directory usage: listing status, visibility tier, boost/featured/sponsored state, impressions/views/clicks.
- Team usage: collaborators/delegates/client seats.
- Domain usage: custom domains per account/site, verification status, primary domain.
- Downgrade remediation state: locked/archived resources, grace period, user notices.

**Recommended Entitlement Architecture**
Create a backend `entitlementService` that all controllers call before protected reads/mutations:
- `assertCan(user, feature, context)`
- `getEffectivePlan(userId)`
- `getLimit(userId, limitKey)`
- `recordUsage(userId, feature, amount, context)`
- `getUsage(userId, feature, period)`

Start enforcement with these feature keys:
- `websites.create`
- `pages.create`
- `blocks.create`
- `blocks.video`
- `blocks.customCss`
- `templates.premium.use`
- `domains.custom`
- `media.upload`
- `media.video`
- `forms.create`
- `forms.submissions.read`
- `forms.export`
- `analytics.basic`
- `analytics.advanced`
- `ai.website.generate`
- `ai.listing.enhance`
- `directory.publish`
- `directory.boost`
- `collaborators.invite`
- `delegates.invite`

**Verification**
No tests were run because this was a read-only audit task. No files were modified.