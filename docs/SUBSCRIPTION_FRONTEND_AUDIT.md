# Techietribe.ai — Frontend Subscription Audit

**Scope:** `directory-frontend-FEB-merge`, branch `main`, audited 2026-07-24. Read-only; no files modified.
**Method:** route map (`src/App.tsx`), full API-endpoint extraction, per-directory component sweep, plan/entitlement grep, provider-mount verification.

---

## A. Executive summary

### What the frontend actually supports

This is **not** a greenfield subscription project. A substantial, partially-wired billing and plan system already exists:

- A canonical 4-tier website plan taxonomy — `website_free` / `website_core` / `website_growth` / `website_agency` — plus a separate 3-tier store taxonomy (`store_free` / `store_starter` / `store_pro`).
- A working Stripe integration for **payment methods** (SetupIntent + `CardElement`) and for **store checkout** (PaymentIntent). Stripe SDK is a real dependency; `VITE_STRIPE_PUBLISHABLE_KEY` is configured with a test key.
- A real billing backend contract: `GET /billing/plan-summary`, `GET/PUT /account/plan`, `GET /account/plan-preview` (proration preview), `GET /account/billing`, `GET /account/billing-history`, `POST /account/cancel-subscription`, `POST /account/reactivate-subscription`, `POST /account/setup-intent`, full payment-method CRUD.
- Settings → **Billing & plans** renders `ChangePlanCard`, `BillingPreview` (proration), `BillingHistoryCard`, `CancellationFlow` (with churn-reason capture and a "what you lose" screen), and `CardManagementDialog`.
- A real AI quota contract: `GET /ai/usage` returning `{ plan, used, limit, remaining, resetAt }`, plus a full normalized AI error taxonomy including `QUOTA_EXCEEDED`, `AI_QUOTA_EXHAUSTED`, `PLAN_UPGRADE_REQUIRED`, `DAILY_REGEN_LIMIT`, `EDIT_ATTEMPT_LIMIT`.
- Real, non-placeholder implementations for: the website editor (57 block types, autosave, 50-deep undo/redo, section-level custom CSS, responsive per-breakpoint visibility), per-website analytics with CSV export and date ranges, form submissions with spam flagging and CSV export, per-website blog, domains (subdomain + custom-domain wizard with DNS/verify/SSL steps), collaborators with role hierarchy and ownership transfer, account delegation, and a public directory with search/filter/sort/geo.

### Is it subscription-ready?

**No — roughly 60% of the plumbing exists but the entitlement layer is disconnected.** Three specific blockers:

1. **`useFeatureGate` has zero production consumers.** `src/hooks/useFeatureGate.js` defines the entire feature-gate matrix (videoBlocks, customCSS, aiGeneration, collaborators, customDomain, seo_advanced, delegates) and is imported by *nothing* except its own test file. Every feature it claims to gate is currently fully open.
2. **`PermissionProvider` is never mounted.** It appears in neither `src/main.tsx` nor `src/App.tsx`. `usePermissionContext()` therefore always returns `fallbackPermissionContext`, so `usePermission()` and `useHasRole()` always return `false`, and `useWebsiteRole()` always returns `null`. `src/components/Dashboard/WebsiteEditor.jsx:4041` compensates with `useWebsiteRole(...) || "OWNER"` — **every editor user is treated as OWNER**. `PermissionGate` and `ProtectedRoute` likewise have zero production consumers.
3. **Four mutually contradictory plan/price definitions ship simultaneously** (detailed in §C.1). A user can see $19/mo in the dashboard modal, $14.99/mo in the plan picker, and $36/yr on the public pricing page.

### Major gaps

- No central plan config. Plan codes are hard-coded as local arrays in at least 8 files.
- No proactive usage display for websites. `planSummary.websiteUsage.websitesOwned` and `websitePlan.maxSites` are fetched and then unused; the only place with a real usage counter is `Stores.tsx` (`storesOwned / maxStores`). Website limits are discovered only *reactively*, by catching a backend `PLAN_LIMIT_REACHED` error.
- No upgrade-modal primitive, no `<Locked>` wrapper, no `requireUpgrade()` helper.
- Public pricing CTAs are dead. `PricingDetail.tsx` "Get Started" has no `onClick`; `PricingSection.tsx` says "Join the Waitlist" / "Early bird pricing coming soon". There is no self-serve purchase path from marketing → checkout.
- Media limits are global constants (`imageMaxBytes: 10MB`, `videoMaxBytes: 100MB`, `websiteTotalBytes: 500MB`) with no plan dimension.
- `"Powered by TechieTribe"` is rendered unconditionally in `src/pages/PublicWebsite.tsx:1154` and `src/pages/TemplatePreview.tsx:243`, despite `CancellationFlow.jsx` and `PlanComparisonModal.jsx` both claiming badge removal is a paid benefit.

### Major monetization opportunities (code-supported)

| Opportunity | Why it's viable today |
|---|---|
| **Custom domains** | Full wizard exists (`DomainTab.jsx`), already gated to `website_growth`+, backend endpoints live. Highest-confidence paywall. |
| **AI credits** | `GET /ai/usage` already returns plan/used/limit/remaining/resetAt; UI already renders "(N of 3 remaining)". Needs only a credit *product*, not new plumbing. |
| **Directory visibility** | `Directory.tsx:822` already renders a `Featured` badge driven by `websitePlan === "website_agency"`, and the API returns a `score` field. Featured/priority placement is a pure backend-ranking product. |
| **Multi-site** | `maxSites` is already in the plan-summary contract and enforced backend-side via `PLAN_LIMIT_REACHED`. |
| **Team/collaborators + delegates** | Both fully implemented with role hierarchies; currently ungated. |
| **Analytics depth** | `analyticsLevel` already exists on the plan object and is currently unused by any component. |
| **Branding removal** | Single-line change at two render sites; already promised by cancellation copy. |

### Features incorrectly claimed by pricing or marketing

| Claim | Where claimed | Reality |
|---|---|---|
| "AI Image Generator" | `WhatEveryPlanGets.tsx:365-366` | **No AI image generation exists anywhere.** `docs/AI_WEBSITE_CREATION_PRD.md:32` explicitly lists it as out of scope. |
| "AI logo generation" | implied by marketing | Not implemented. `/websites/:id/logo` is a plain upload. |
| "Verified Badge" (Standard tier) | `PricingDetail.tsx:74` | No verified-badge UI, state, or API anywhere in the frontend. |
| "Priority Support" (Standard tier) | `PricingDetail.tsx:74` | No support-tier concept in code. |
| "Analytics Dashboard" as a Plus-only extra | `PricingDetail.tsx:75` | Analytics is fully built and available to *everyone* with no plan check. |
| "AI Copywriter" as a Plus-only extra | `PricingDetail.tsx:75` | AI editing/generation is quota-gated by `/ai/usage`, not tier-gated to a "Plus" plan that doesn't exist. |
| "Premium Templates" as a paid feature | `PricingDetail.tsx:69` | All 20 templates in `frontendTemplateCatalog.ts` are ungated. Names contain "Premium"/"Pro" but carry **no tier field**. |
| Plans up to **250 sites** at $9,000/yr | `PricingDetail.tsx:105` | Highest in-app tier is `website_agency` = 10 sites. No agency dashboard, no client management, no white-label, no bulk actions. |
| "Unlimited Listings" (Pro) | `PricingSection.tsx:82` | Listing is 1:1 with a website; bounded by `maxSites`. |
| "changes go live after a quick quality review" | `Pricing.tsx` FAQ | True — `useApprovalWorkflow.js` exists — but it applies to everyone, not a plan feature. |

### Security / bypass risks

1. **Editor privilege default.** `WebsiteEditor.jsx:4041` — `useWebsiteRole(websiteId) || "OWNER"`. Because the provider is unmounted, this always evaluates to `"OWNER"`. Anyone who reaches the editor route gets owner-level UI. Backend ownership middleware is the only real guard.
2. **No route-level protection on the editor.** `/dashboard/websites/:websiteId/editor` in `App.tsx:480` renders `WebsiteEditor` directly with no auth wrapper (`ProtectedRoute` is unused). Only `/dashboard/*` self-checks inside `Dashboard.tsx`.
3. **Admin bypass in the gate hook.** `useFeatureGate.js:100` grants everything to `ADMIN`/`SUPER_ADMIN` based on a client-side `user.role` string. Fine as UI convenience; must never be the enforcement point.
4. **Fail-open AI quota.** `useWebsiteAIAccess.ts` — on a failed `/ai/usage` read it sets `usage = null`, and the comment states "don't block AI on a missing/failed read". A client that blocks that request gets ungated AI UI.
5. **Every currently-gated feature is client-side only.** `PAID_PLANS` arrays in `ListingEditTab.tsx:49`, `ListingSettingsCard.tsx:25`, `DirectoryListingsDashboard.jsx:41`, and `PLAN_ALLOWS_CUSTOM_DOMAIN` in `DomainTab.jsx:40` control rendering only. The underlying endpoints (`/websites/:id/listing/*`, `/domains/:id/custom-domain`) are reachable directly.
6. **`userPlan` is read from an unverified client field.** `Dashboard.jsx:2003` passes `user?.websitePlan || "free"` — sourced from `/auth/me`, not from `/billing/plan-summary`. Two different plan sources disagree by design.

---

## B. Current frontend feature inventory

Statuses: **Fully implemented** · **Partially implemented** · **UI only** · **Placeholder** · **Missing** · **Broken/inconsistent**

### B.1 Authentication & account

| Feature key | Feature | Category | Route/component/file | Status | Current restriction | Possible subscription treatment | Notes |
|---|---|---|---|---|---|---|---|
| `auth.signup` | Registration | Auth | `src/pages/Auth.tsx`, `src/context/AuthContext.tsx:267` → `POST /auth/signup` | Fully implemented | None | Available to everyone | Multipart FormData (avatar) |
| `auth.signin` | Password login | Auth | `AuthContext.tsx:292` → `POST /auth/signin` | Fully implemented | None | Available to everyone | httpOnly cookies |
| `auth.signin_code` | Passwordless email-code login | Auth | `AuthContext.tsx:381,400` → `/auth/request-signin-code`, `/auth/signin-code` | Fully implemented | Rate-limited (`retryAfter`) | Available to everyone | |
| `auth.email_verify` | Email verification | Auth | `AuthContext.tsx:338,361` → `/auth/verify-email`, `/auth/resend-verification` | Fully implemented | Rate-limited | Available to everyone | |
| `auth.password_reset` | Password reset | Auth | `AuthContext.tsx:446,466` | Fully implemented | Rate-limited | Available to everyone | |
| `auth.google` | Google OAuth | Auth | `Auth.tsx:229,442`; `POST /auth/google/unlink` | Fully implemented | None | Available to everyone | Redirect-based |
| `auth.roles` | Platform roles | Auth | `src/constants/roles.ts` | Fully implemented | `USER`/`CONTENT_CREATOR`/`ADMIN`/`SUPER_ADMIN` | Not relevant to subscriptions | Orthogonal to plans — keep separate |
| `auth.route_guard` | Route protection | Auth | `src/components/ProtectedRoute.tsx` | **Broken/inconsistent** | **Zero consumers** | Not relevant | Dead component; `Dashboard.tsx:20` self-checks instead |
| `auth.profile` | Profile settings | Account | `Settings.jsx` → `BasicDetailsCard.jsx` | Fully implemented | None | Free-plan functionality | |
| `auth.delete_account` | Account deletion | Account | `shared/DeleteAccountCard.jsx` | Fully implemented | None | Available to everyone | Must never be paywalled |
| `auth.login_history` | Login history | Account | `shared/LoginHistoryCard.jsx` → `GET /account/login-history` | Fully implemented | None | Candidate: retention window by plan | |
| `auth.audit_log` | Audit log | Account | `shared/AuditLogCard.jsx` → `/audit/admin/logs` | Fully implemented | Admin-only | Admin-only, or Business+ for own-account audit | |
| `auth.notif_prefs` | Notification preferences | Account | `settings/NotificationPreferences.jsx` → `/notifications/preferences` | Fully implemented | None | Free | Already lists `SUBSCRIPTION_TRIAL_ENDING`, `PLAN_CHANGED`, `DORMANT_RENEWAL_WARNING` event types |
| `account.delegates` | Account delegation (grant others access to your whole account) | Team | `AccountDelegateInviteModal.jsx`, `AccountSwitcher.jsx`, `AccountInvitesPage.jsx` → `/account/delegates*`, `/account/switch-context` | Fully implemented | **`Settings.jsx:187` computes `isFreePlan` and uses it around the delegation section** | Paid-plan (Pro+), limit by seat count | `useFeatureGate` declares `delegates: website_core` but is unused |
| `website.collaborators` | Per-website collaborators (OWNER/ADMIN/EDITOR/VIEWER) | Team | `website-manage/TeamTab.jsx`, `CollaboratorModal.jsx` → `/websites/:id/collaborators*` | Fully implemented | **None** | Paid-plan, limit by seat count | `PlanComparisonModal` claims 0/2/5/15 — not enforced |
| `website.transfer` | Ownership transfer | Team | `TeamTab.jsx:135` → `/websites/:id/transfer-ownership` | Fully implemented | Owner-only (client-side) | Paid (Agency) or free | |
| `perm.context` | Website permission context | Permissions | `src/context/PermissionContext.tsx` | **Broken/inconsistent** | **Provider never mounted** | Not relevant | See §A blocker 2 |
| `perm.gate` | `<PermissionGate>` component | Permissions | `src/components/PermissionGate.tsx` | **Broken/inconsistent** | Zero consumers | Not relevant | Dead code |

### B.2 Business & website creation

| Feature key | Feature | Category | Route/component/file | Status | Current restriction | Possible subscription treatment | Notes |
|---|---|---|---|---|---|---|---|
| `site.create` | Create website | Websites | `src/pages/Templates.tsx`, `Templates/CreateWebsiteModal.tsx` → `POST /websites`, `/websites/from-template` | Fully implemented | Reactive only — catches `PLAN_LIMIT_REACHED` (`Websites.jsx:1120`) | Limited by `maxSites` | No proactive counter |
| `site.multi` | Multiple websites | Websites | `Dashboard/Websites.jsx` | Fully implemented | Backend `maxSites` | Limited: 1 / 1 / 3 / 10 (per `PlanComparisonModal`) | |
| `site.duplicate` | Duplicate website | Websites | `Websites.jsx:1470` → `POST /websites/:id/duplicate` | Fully implemented | None | Paid (Pro+) | Consumes a site slot |
| `site.delete` | Delete / recently-deleted / restore | Websites | `Websites.jsx` → `/websites/:id`, `/restore`, `/permanent` | Fully implemented | None | Free | Soft-delete + trash view |
| `site.publish` | Publish / unpublish | Publishing | `Websites.jsx:1204,1231` → `/websites/:id/publish`, `/unpublish` | Fully implemented | Approval workflow | Free | |
| `site.approval` | Draft → request approval → review | Publishing | `useApprovalWorkflow.js`, `RequestApprovalDialog.jsx`, `ApprovalStatusBanner.jsx`, `PendingApproval.jsx` → `/websites/:id/approval/*` | Fully implemented | Admin reviews | Monetizable as **priority approval** (marketing already claims it) | WebSocket-backed |
| `site.preview` | Preview | Publishing | `/template-preview/:templateId`, `/landing-preview/:templateId/:pageId?`, `WebsiteEditor/PreviewPanel.tsx` | Fully implemented | None | Never restrict | |
| `site.pages` | Multi-page management | Pages | `website-manage/PagesTab.jsx`, `Editor/DraggablePageList.tsx` → `/websites/:id/pages` | Fully implemented | None client-side | Limited by `maxPagesPerSite` | Backend enforces |
| `site.blocks` | Add/remove/reorder blocks | Editor | `Editor/DraggableBlockList.tsx`, `BlockEditor/*` → `/blocks/reorder`, `/pages/:id/blocks` | Fully implemented | None | Limited by `maxBlocksPerPage` | dnd-kit |
| `site.wizard` | AI questionnaire onboarding | Onboarding | `src/pages/AIQuestionnairePage.tsx`, `CreateWebsiteWizard.tsx`, `hooks/useAIQuestionnaire.ts` | Fully implemented | AI step gated by `/ai/usage` | Free (wizard) + limited (AI step) | |
| `site.onboarding` | Guided tour / task checklist | Onboarding | `Dashboard/tours/*`, `WelcomeTour.jsx`, `hooks/useOnboarding.js` | Fully implemented | None | Never restrict | |
| `store.create` | Create store | Stores | `src/pages/CreateStoreWizard.tsx`, `Dashboard/Stores.tsx` → `POST /stores` | Fully implemented | **Proactive**: `storesOwned / maxStores` (`Stores.tsx:571`) + `StorePlanUpgradeDialog` | Limited by `maxStores` | **Only feature with a proactive usage counter** |
| `store.products` | Product catalogue | Stores | `Dashboard/StoreProducts.tsx` → `/products` | Fully implemented | `maxProductsPerStore` (backend) | Limited | |
| `store.orders` | Orders | Stores | `Dashboard/StoreOrders.tsx` → `/orders` | Fully implemented | None | Paid | `platformFeePercent` on plan: 1.5% → 0% |
| `store.checkout` | Stripe checkout | Stores | `src/pages/CheckoutPage.tsx`, `publicPages/CheckoutPage.tsx`, `Checkout/StripeProviderWrapper.tsx` | Fully implemented | None | Never restrict (revenue path) | **Separate from subscription billing** |
| `blocks.library` | 57 block types | Editor | `Editor/blockPresets.ts`, `Editor/BlockLibrary.tsx`, `PublicWebsite/BlockRenderer.tsx` | Fully implemented | None | Selected blocks premium (see below) | Includes HERO, GALLERY, TEAM, TESTIMONIALS, FAQ, PRICING, REVIEWS, WORKING_HOURS, MAP_LOCATION, CONTACT, FORM_BUILDER, RESERVATION_FORM, NEWSLETTER, VIDEO, CUSTOM_CODE, EMBED, SOCIAL_EMBED, COUNTDOWN, BEFORE_AFTER, MARQUEE, REPEATER, TABS, STATS, PORTFOLIO_GRID, LOGO_CAROUSEL, BLOG_* (9 variants), MENU_*, ANNOUNCEMENT_BAR, STORY_PANEL, STEPS_PROCESS, COLLAGE, IMAGE_TEXT_SPLIT |
| `blocks.video` | VIDEO block | Editor | `blockPresets.ts` | Fully implemented | **None** | Pro+ (`useFeatureGate` declares `videoBlocks: website_core` — unused) | |
| `blocks.custom_code` | CUSTOM_CODE / EMBED block | Editor | `PublicWebsite/blocks/CustomCodeBlock.tsx` | Fully implemented | None | Business+ (security-sensitive) | |
| `site.blog` | Per-website blog | Content | `Dashboard/WebsiteBlogDashboard.tsx`, `WebsiteManageInsights.jsx`, `PublicWebsite/dynamic/Blog*Block.tsx` → `/websites/:id/blogs*` | Fully implemented | None | Limited by post count | 9 blog block variants; comments supported |
| `site.events` | Website events | Content | `Dashboard/WebsiteManageEvents.jsx` | Fully implemented | None | Free or limited | |
| `site.menus` | Restaurant menus | Content | `website-manage/MenusTab.jsx` → `/websites/:id/menus` | Fully implemented | None | Free | |
| `site.reviews` | Website reviews tab | Content | `website-manage/ReviewsTab.jsx` → `/reviews/*` | Fully implemented | None | Free; owner-reply is premium candidate | |

### B.3 Website editor & customization

`src/components/Dashboard/WebsiteEditor.jsx` is **13,164 lines** — the single largest file in the repo.

| Feature key | Feature | File | Status | Current restriction | Plan suggestion | UI restriction pattern |
|---|---|---|---|---|---|---|
| `ed.text` | Inline text editing | `Editor/InlineTextEditor.tsx` | Fully implemented | None | **Never restrict** | — |
| `ed.image` | Image editing/upload | `WebsiteEditor.jsx`, `POST /upload/image` | Fully implemented | 10MB/file, 500MB/site (global) | Free; storage-limited | Storage meter |
| `ed.video_upload` | Video upload | `POST /upload/video` | Fully implemented | 100MB/file (global) | Pro+ | Locked card |
| `ed.media_lib` | Media library | `website-manage/MediaTab.jsx` → `/websites/:id/media` | Fully implemented | `utils/mediaUploadLimits.js` — global, not per-plan | Storage quota per plan | Storage meter + upgrade CTA |
| `ed.typography` | Typography controls | `Editor/AppearancePanel.tsx`, `EditorStyleToolbar.tsx` | Fully implemented | None | Never restrict basics | — |
| `ed.colors` | Colors / dynamic theme | `Dashboard/ThemeManager.jsx`, `ThemeSelector.jsx`, `FrontendTemplateThemePanel.jsx`, `landingTemplates/utils/sectionStyle.ts` → `/websites/:id/themes` | Fully implemented | None | **Never restrict — preserve exactly as-is** | — |
| `ed.spacing` | Spacing / borders / shadows | `Editor/sharedSpacingControls.tsx`, `EditorSectionStyleToolbar.tsx` | Fully implemented | None | Never restrict | — |
| `ed.bg_image` | Section background images | `EditorSectionStyleToolbar.tsx` | Fully implemented | None | Free | — |
| `ed.custom_css` | Per-section custom CSS | `EditorSectionStyleToolbar.tsx:2496-2555`, parsed by `sectionStyle.ts:84` | Fully implemented | **None** | Pro+ (`useFeatureGate` declares `customCSS: website_core` — unused) | Blurred textarea + lock chip |
| `ed.custom_js` | Custom JavaScript | — | **Missing** | — | Business+ when built | — |
| `ed.header` | Navbar builder | `WebsiteEditor/NavbarBuilder.tsx` → `/websites/:id/global-components/navbar` | Fully implemented | None | Free | — |
| `ed.footer` | Footer builder | `WebsiteEditor/FooterBuilder.tsx` → `/global-components/footer` | Fully implemented | None | Free | — |
| `ed.responsive` | Desktop/tablet/mobile preview + per-breakpoint visibility | `Editor/ViewportPreviewSwitcher.jsx`, `ResponsiveEditorLayout.tsx`, `hooks/useResponsiveEditor.ts`, `useVisibility.ts` | Fully implemented | None | **Never restrict** | — |
| `ed.undo` | Undo/redo (50 levels, lz-string compressed to sessionStorage, 4MB cap) | `hooks/useHistory.ts`, `Editor/UndoRedoToolbar.tsx`, `utils/historySerializer.js` | Fully implemented | 50-deep global | Free (deeper history = Pro) | — |
| `ed.autosave` | Autosave (30s) + conflict detection | `hooks/useAutosave.ts`, `Editor/SaveStatus.tsx`, `ConflictModal.tsx`, `hooks/useConflictPrevention.ts` | Fully implemented | None | **Never restrict** | — |
| `ed.backup` | localStorage crash recovery | `hooks/useLocalStorageBackup.ts`, `Editor/RecoveryModal.tsx` | Fully implemented | None | Never restrict | — |
| `ed.collab` | Real-time collaboration (cursors, presence, locks) | `hooks/useCollaborativeEditor.ts`, `Editor/ActiveUsers.tsx`, `CursorOverlay.tsx`, `LockIndicator.tsx`, `Dashboard/SectionLockIndicator.jsx` | Fully implemented | None | Pro+ (tied to collaborator seats) | Locked panel |
| `ed.comments` | Editor comments | `hooks/useComments.ts` → `/comments/*` | Fully implemented | None | Pro+ | — |
| `ed.shortcuts` | Keyboard shortcuts | `hooks/useKeyboardShortcuts.ts`, `useShortcutManager.ts`, `Editor/KeyboardShortcutsHelp.tsx` | Fully implemented | None | Never restrict | — |
| `ed.save_template` | Save as template | `Editor/SaveTemplateModal.tsx` → `POST /templates` | Fully implemented | Content-manager role | Agency (template reuse) | — |
| `ed.version_history` | AI version history / restore | `websiteAI.ts:951` → `POST /ai/restore-version`; `VersionMeta` type | **Partially implemented** | Owner/admin | Pro+ | Only AI-turn versioning, not general site versioning |
| `ed.revert_turn` | Revert an AI turn | `websiteAI.ts:924` → `POST /ai/revert-turn` | Fully implemented | Owner/admin | Pro+ | |
| `ed.export_code` | Code / HTML export | — | **Missing** | — | Agency when built | — |
| `ed.favicon` | Custom favicon | — | **Missing** | — | Pro+ when built | `ogImage` exists; favicon does not |
| `ed.logo` | Custom logo | `POST /websites/:id/logo`, LOGO block | Fully implemented | None | Never restrict | |
| `ed.branding` | Remove "Powered by TechieTribe" | `pages/PublicWebsite.tsx:1154`, `pages/TemplatePreview.tsx:243`, `i18n/translations.ts:39` | **Broken/inconsistent** | **Unconditional** | Pro+ | `CancellationFlow.jsx:198` and `PlanComparisonModal.jsx:125` already promise this — copy ships ahead of code |
| `ed.animations` | Animations | framer-motion across templates | Fully implemented | None | Free | Not an editor-exposed control |
| `ed.mobile_editor` | Mobile editing UI | `Editor/MobileActionBar.tsx`, `MobileFAB.tsx`, `BottomSheet.tsx` | Fully implemented | None | Never restrict | |

### B.4 Templates

| Feature key | Feature | File | Status | Current restriction | Plan suggestion | Notes |
|---|---|---|---|---|---|---|
| `tpl.catalog` | 20 frontend templates | `src/templates/frontendTemplateCatalog.ts` | Fully implemented | **None — no tier field exists** | Split free/premium | See list below |
| `tpl.categories` | 12 categories | `src/constants/templateCategories.ts` | Fully implemented | None | Never restrict browsing | blog, business, creative, ecommerce, restaurant, portfolio, agency, real-estate, fitness, education, saas, landing-page |
| `tpl.gallery` | Gallery + filters | `Templates/TemplateGallery.tsx`, `TemplateFilters.tsx`, `pages/Templates.tsx` | Fully implemented | None | Never restrict | `planSummary` is read here but only forwarded to `CreateWebsiteModal` |
| `tpl.preview` | Template preview modal + full-page preview | `Templates/TemplatePreviewModal.tsx`, `pages/TemplatePreview.tsx`, `LandingPreview.tsx` | Fully implemented | None | **Never restrict** | Preview-before-buy drives conversion |
| `tpl.favorites` | Favourite templates | `hooks/useTemplateFavorites.ts` → `/templates/favorites` | Fully implemented | None | Free | |
| `tpl.my_templates` | My Templates | `src/pages/MyTemplates.tsx` | Fully implemented | None | Free | |
| `tpl.create` | Create/manage templates + approve/reject | `Dashboard/ManageTemplates.jsx` → `/templates/:id/approve`, `/reject`, `/history` | Fully implemented | Content-manager / admin | Admin-only (today); Agency later | |
| `tpl.switch` | Switch a live site's template | — | **Missing** | — | Pro+ when built | Template is copied at creation (`/websites/from-template`), not referenced |
| `tpl.registry_legacy` | `templateEngine/templateRegistry.ts` | `src/landingTemplates/templateEngine/templateRegistry.ts` | **Placeholder** | — | — | **Entire file is commented out.** Live catalog is `frontendTemplateCatalog.ts` |

**The 20 templates** (`frontendTemplateCatalog.ts`, id → category): `blog`→saas · `blog-premium`→saas · `portfolio-creative`→portfolio · `portfolio-agency`→agency · `portfolio-photo-studio`→portfolio · `store-basic`→ecommerce · `store-premium`→ecommerce · `store-performance`→ecommerce · `store-fit`→ecommerce · `store-paws`→ecommerce · `company`→saas · `company-premium`→saas · `company-executive`→saas · `company-pro`→business · `gardening`→business · `education`→education · `education-pro`→education · `restaurant`→restaurant · `plumbing`→business (+ `modern`, `minimal`, `premium` theme builders exported from `landingTemplates/index.ts`).

Note: `"Premium"`, `"Pro"`, `"Executive"` are **name strings only**. There is no `tier`, `isPremium`, `requiredPlan`, or `planCode` field on any template record, and `templateApi.ts` has no tier concept. Premium-template UI does **not** exist.

### B.5 Domains & publishing

| Feature key | Feature | File | Status | Current restriction | Plan suggestion |
|---|---|---|---|---|---|
| `dom.subdomain` | Techietribe subdomain (`{sub}.techietribe.app`) | `website-manage/DomainTab.jsx:96`, `App.tsx:305` subdomain router, `hooks/useTenantUrl.ts` | Fully implemented | None | **Free — never restrict** |
| `dom.subdomain_change` | Change subdomain (with availability check + confirm) | `DomainTab.jsx`, `api/queries/domains.ts:110` → `PATCH /domains/:id/subdomain`, `GET /domains/check-availability` | Fully implemented | None | Free (rate-limit changes) |
| `dom.slug_url` | Slug URL `/site/:slug` | `App.tsx:496`, `pages/PublicWebsite.tsx` → `GET /websites/slug/:slug` | Fully implemented | None | Free |
| `dom.custom` | Custom domain | `DomainTab.jsx:350` + 4-step wizard → `POST /domains/:id/custom-domain` | Fully implemented | **`PLAN_ALLOWS_CUSTOM_DOMAIN = ['website_growth','website_agency']` (`DomainTab.jsx:40`)** | **Business+ — strongest paywall** |
| `dom.verify` | Domain verification | `queries/domains.ts:167` → `POST /domains/:id/custom-domain/verify` | Fully implemented | Same as above | Business+ |
| `dom.dns_help` | DNS instructions (GoDaddy/Namecheap/Cloudflare/Other) | `DomainTab.jsx:44` | Fully implemented | — | Business+ |
| `dom.ssl` | SSL provisioning | `DomainTab.jsx:56` — step 4 of `DOMAIN_WIZARD_STEPS` | **UI only** | — | Business+ | Wizard step exists; no SSL status API call in the frontend |
| `dom.delete` | Remove custom domain | `queries/domains.ts:192` → `DELETE` | Fully implemented | Same | Business+ |
| `dom.purchase` | Domain purchasing | — | **Missing** | — | Future add-on |
| `dom.generate` | AI domain-name generation | — | **Missing** | — | Future |
| `dom.redirects` | Redirects | — | **Missing** | — | Business+ when built |
| `dom.seo_urls` | SEO-friendly URLs | slug-based routing throughout | Fully implemented | None | Never restrict |
| `dom.sitemap` | Sitemap toggle + robots.txt | `website-manage/SeoTab.jsx:141-142` | Fully implemented | None | Never restrict (basic SEO) |
| `dom.meta` | Meta title/description/OG image/robots meta | `SeoTab.jsx:139-144` → `PUT /websites/:id` | Fully implemented | None | Free; "Advanced SEO" tier declared in `useFeatureGate` but undefined and unused |

### B.6 Directory & discovery

| Feature key | Feature | File | Status | Current restriction | Classification |
|---|---|---|---|---|---|
| `dir.search` | Directory search | `pages/Directory.tsx`, `hooks/useDirectorySearch.ts` → `GET /directory/listings` | Fully implemented | None | **Never paywall** |
| `dir.filters` | Category / city / region / country / priceLevel filters | `useDirectorySearch.ts:243-251` | Fully implemented | None | Never paywall |
| `dir.sort` | Sort options (from `/directory/meta`) | `useDirectorySearch.ts` | Fully implemented | None | Never paywall |
| `dir.geo` | Geo/distance search + map | `hooks/useUserLocation.ts`, `Directory/DirectoryMap.tsx` (leaflet) | Fully implemented | None | Never paywall |
| `dir.autocomplete` | Autocomplete + recent searches (localStorage) | `useDirectorySearch.ts:58,94` | Fully implemented | None | Never paywall |
| `dir.cards` | Listing cards | `Directory.tsx`, `publicPages/Listings.tsx` | Fully implemented | None | Never paywall |
| `dir.profile` | Business profile page | `/business/:slug` → `publicPages/ListingCompanyDetails.tsx`; `/listings/:pid` → `ListingDetails.tsx` | Fully implemented | None | Never paywall |
| `dir.featured_badge` | "Featured" badge | `Directory.tsx:822-823` — `listing.websitePlan === "website_agency"` | **Partially implemented** | Hard-coded to one plan code | **Paid visibility feature** — generalize to a `featured` flag |
| `dir.score` | Ranking score | `data/devDirectoryListings.ts:score`, returned by API | Fully implemented (backend-driven) | None | **Priority ranking = paid visibility** |
| `dir.verified` | Verified badge | — | **Missing** | — | Paid trust feature (claimed in pricing, not built) |
| `dir.claim` | Claim listing | — | **Missing** | — | Never paywall the claim itself |
| `dir.report` | Report listing | — | **Missing** | — | Never paywall |
| `dir.favourite` | Save/favourite listing | `hooks/useFavourites.ts`, `useFavorites.ts`, `Dashboard/listings/Favourites.jsx` → `/favourites/user/favourites` | Fully implemented | Auth required | Customer feature — never paywall |
| `dir.reviews` | Reviews + rating stats + voting | `hooks/useReviews.ts` → `/reviews/listings/:id`, `/reviews/:id/vote` | Fully implemented | Auth to submit | Never paywall |
| `dir.owner_reply` | Business-owner review replies | `useReviews.ts:83` → `POST /reviews/:id/reply` | Fully implemented | **None** | **Business-owner premium candidate** |
| `dir.listing_optin` | Opt a website into the directory | `WebsiteEditor/ListingOptInStep.tsx`, `Dashboard/ListingSettingsCard.tsx` → `/websites/:id/listing` | Fully implemented | `PAID_PLANS` in `ListingSettingsCard.tsx:25` | **Do not paywall basic presence** — paywall enhancement instead |
| `dir.listing_enhance` | AI listing enhancement | `ListingSettingsCard.tsx` → `POST /websites/:id/listing/enhance` | Fully implemented | `PAID_PLANS` (paid-only) | Paid; also AI-credit-metered |
| `dir.listing_extract` | Auto-extract listing data from site | `→ POST /websites/:id/listing/extract` | Fully implemented | `PAID_PLANS` | Paid |
| `dir.completeness` | Listing completeness score + suggestions | `ListingSettingsCard.tsx:53`, `DirectoryListingsDashboard.jsx:42` (`MIN_PUBLISH_COMPLETENESS = 60`) | Fully implemented | Paid-plan gate | Basic score free; suggestions paid |
| `dir.archive` | Archive/republish listing | `→ /websites/:id/listing/archive`, `/republish` | Fully implemented | None | Free |
| `dir.contact_btns` | Contact / call / WhatsApp / directions buttons | `ListingCompanyDetails.tsx`, `PublicWebsite/blocks/*` | Fully implemented | None | **Never paywall** |
| `dir.categories` | Category management | `Dashboard/CategoryManagement.jsx`, `WebsiteCategoryManagement.jsx` → `/categories`, `/website-categories` | Fully implemented | Admin for global; user can add via `POST /website-categories` | **Additional categories = paid** |
| `dir.dummy_mode` | Dummy directory data | `Directory.tsx:9` — `VITE_USE_DUMMY_DIRECTORY` | Fully implemented (dev flag) | env-gated | Not relevant | Real API path is the default |
| `dir.admin_listings` | Admin listing moderation | `Dashboard/listings/AllListings.jsx`, `ArchivedListings.jsx`, `ModifyListing.jsx` | Fully implemented | Role-gated | Admin-only |

### B.7 AI features

| Feature key | Feature | Endpoint | File | Status | Currently limited? | Notes |
|---|---|---|---|---|---|---|
| `ai.website_gen` | AI website generation | `POST /ai/generate-website-draft` | `websiteAI.ts:681`, `AIQuestionnairePage.tsx`, `WebsiteCreation/*` | Fully implemented | **Yes** — `/ai/usage` quota; button label shows remaining | Free plan shows "Upgrade to Generate with AI" |
| `ai.content_gen` | AI content generation (session-based, SSE progress) | `POST /ai/generate-content` + `GET /ai/progress/:sessionId` (SSE) | `websiteAI.ts:637`, `WebsiteCreation/AIGenerationProgress.tsx` | Fully implemented | Yes | SSE stream via native fetch; deliberately not in React Query (`queries/ai.ts` comment) |
| `ai.edit_element` | AI edit of a single element | `POST /ai/edit-element` | `websiteAI.ts:871`, `WebsiteAI/useEditorAI.ts` | Fully implemented | Yes + `EDIT_ATTEMPT_LIMIT` (3 attempts: original + 2 retries, per PRD:342) | |
| `ai.editor_chat` | AI chat assistant in editor (scopes: target/section/page/website) | `POST /ai/editor-chat` | `websiteAI.ts:902`, `WebsiteAI/AIChatPanel.tsx`, `AskAIDialog.tsx`, `EditorAILayer.tsx` | Fully implemented | Yes | Modes: `patch` / `reply` / `session` |
| `ai.recreate` | Full-site AI regeneration | `POST /ai/recreate-site` | `websiteAI.ts:937` | Fully implemented | Yes + `DAILY_REGEN_LIMIT` | |
| `ai.revert` | Revert AI turn | `POST /ai/revert-turn` | `websiteAI.ts:924`, `Editor/RegenerateButton.tsx` | Fully implemented | — | |
| `ai.restore_version` | Restore AI version | `POST /ai/restore-version` | `websiteAI.ts:951` | Fully implemented | — | |
| `ai.record_edit` | Record applied edit (telemetry/history) | `POST /ai/record-applied-edit` | `websiteAI.ts:755` | Fully implemented | — | Generated content **is** stored (`AIGenerationSession`, per PRD:71) |
| `ai.schema` | Editable-schema discovery for AI targeting | `GET /websites/:id/editable-schema` | `websiteAI.ts:826` | Fully implemented | — | |
| `ai.usage` | Usage/quota read | `GET /ai/usage` | `queries/ai.ts:47`, `hooks/useWebsiteAIAccess.ts`, `QuestionnaireNavigation.tsx:78` | Fully implemented | — | `{ plan, used, limit, remaining, resetAt }` |
| `ai.listing_enhance` | AI listing enhancement | `POST /websites/:id/listing/enhance` | `ListingSettingsCard.tsx` | Fully implemented | Separate bucket (per PRD:334) | |
| `ai.conflict` | AI conflict dialog | — | `WebsiteAI/AIConflictDialog.tsx` | Fully implemented | — | |
| `ai.history` | Prompt/turn history | `ChatHistoryItem`, `AIHistoryEntry` types | `websiteAI.ts:213,310` | Fully implemented | — | |
| `ai.image_gen` | **AI image generation** | — | — | **Missing** | — | Explicitly out of scope per `docs/AI_WEBSITE_CREATION_PRD.md:32`. **Claimed in marketing.** |
| `ai.logo_gen` | AI logo generation | — | — | **Missing** | — | |
| `ai.seo_gen` | AI SEO generation | — | — | **Missing** | — | |
| `ai.blog_gen` | AI blog generation | — | — | **Missing** | — | Blog CRUD exists; AI authoring does not |
| `ai.template_suggest` | AI template suggestions | — | — | **Missing** | — | |
| `ai.credits_ui` | Credit balance display | — | Only the button label in `QuestionnaireNavigation.tsx:106-115` | **Partially implemented** | — | Hard-codes "of 3" / "of 10" instead of using `usage.limit` |

**AI error handling.** `normalizeWebsiteAIError` (`websiteAI.ts:387`) maps backend codes into a 24-value union, and `WebsiteAIRequestError` (line 520) carries `resetAt`, `status`, `rawCode`, `meta`. Retries and failures are handled. Concurrency is enforced client-side: only one AI request at a time (`useWebsiteAIAccess` → `AI_REQUEST_ACTIVE`). Model per PRD:303 is `openrouter/free`.

**Cost drivers** (for credit design): full-site generation ≫ site recreate > editor-chat at `website` scope > `page` scope > `section` scope > single-element edit. Regeneration and retries multiply cost, which is why `DAILY_REGEN_LIMIT` and `EDIT_ATTEMPT_LIMIT` already exist backend-side.

### B.8 Leads, forms, bookings

| Feature key | Feature | File | Status | Current restriction | Plan suggestion |
|---|---|---|---|---|---|
| `form.contact` | CONTACT block | `blockPresets.ts`, `PublicWebsite/blocks/` | Fully implemented | None | Free |
| `form.builder` | FORM_BUILDER block | `blockPresets.ts`, `components/FormGenerator.tsx`, `utils/conditionalLogic.ts`, `fieldDependencies.ts`, `validation.ts` | Fully implemented | None | Free (1 form) / Limited |
| `form.reservation` | RESERVATION_FORM block (booking) | `blockPresets.ts` | Fully implemented | None | Pro+ |
| `form.newsletter` | NEWSLETTER block | `PublicWebsite/blocks/NewsletterBlock.tsx` | Fully implemented | None | Free |
| `form.submit` | Public submission | `api/formSubmissions.ts:44` → `POST /forms/websites/:id/submissions` (unauthenticated, `withCredentials: false`) | Fully implemented | None | **Limit monthly submissions** |
| `lead.inbox` | Submission inbox | `website-manage/FormsTab.jsx` → `GET /forms/websites/:id/submissions` | Fully implemented | None | Free with retention limit |
| `lead.detail` | Submission detail | `FormsTab.jsx:280` | Fully implemented | None | Free |
| `lead.status` | Read/unread + spam flags | `FormsTab.jsx:111,138,303` → `PATCH .../submissions/:id` | Fully implemented | None | Free |
| `lead.bulk` | Bulk delete | `FormsTab.jsx:342` → `POST .../bulk-delete` | Fully implemented | None | Free |
| `lead.export` | **CSV export** | `FormsTab.jsx:400,406,542` → `GET .../submissions/export` | Fully implemented | **None** | **Pro+ — clean paywall** |
| `lead.form_attribution` | Per-form attribution (`formId`/`formName`) | `formSubmissions.ts:26-34` | Fully implemented | None | Free |
| `lead.spam` | Spam detection | `FormsTab.jsx:55` (`isSpam` filter) | Fully implemented (backend-driven) | None | Free |
| `lead.notify` | Lead email notifications | `settings/NotificationPreferences.jsx`, `/notifications/*` | Fully implemented | None | Free / Pro for instant |
| `lead.whatsapp` | WhatsApp contact | `PublicWebsite` contact blocks | Fully implemented | None | Never paywall |
| `lead.call_tracking` | Phone-call tracking | — | **Missing** | — | Business+ when built |
| `lead.crm` | CRM / assignment / automation | — | **Missing** | — | Business+/Agency when built |
| `lead.emailjs` | EmailJS (`@emailjs/browser` dep) | `package.json` | Present as dependency | — | — |

### B.9 Analytics

All analytics below hit real endpoints. **No dummy data, no placeholder charts, no static numbers** were found in `src/components/Dashboard/analytics/` or `AnalyticsTab.jsx`. (`AnalyticsTab.jsx:5` explicitly notes it "Replaces the placeholder 'Analytics Coming Soon' with real data.") Recharts is used for rendering.

| Feature key | Metric / feature | Endpoint | File | Status | Restriction |
|---|---|---|---|---|---|
| `an.site_summary` | Per-website overview: total views, unique visitors, trends vs. previous period | `GET /websites/:id/analytics/summary` | `website-manage/AnalyticsTab.jsx`, `Dashboard/WebsiteAnalytics.jsx:41`, `queries/analytics.ts:313` | Fully implemented | None |
| `an.pages` | Top pages | same | `AnalyticsTab.jsx` | Fully implemented | None |
| `an.sources` | Traffic sources | same | `AnalyticsTab.jsx` | Fully implemented | None |
| `an.geo` | Geographic breakdown | same | `AnalyticsTab.jsx` | Fully implemented | None |
| `an.visitors` | Visitor breakdown | same | `AnalyticsTab.jsx` | Fully implemented | None |
| `an.date_range` | Date-range filter (`last30days` etc.) | `?dateRange=` | `AnalyticsTab.jsx:128,152,230` | Fully implemented | None |
| `an.export` | **CSV export** | client-side | `AnalyticsTab.jsx:72,116,236` | Fully implemented | **None → Pro+** |
| `an.engagement` | Engagement | `GET /analytics/engagement` | `queries/analytics.ts:177`, `analytics/EngagementTracking.jsx` | Fully implemented | None |
| `an.realtime` | Real-time | `GET /analytics/realtime-advanced` | `queries/analytics.ts:200`, `analytics/RealTimePanel.jsx` | Fully implemented | None |
| `an.conversions` | Conversion metrics | `GET /analytics/conversions` | `queries/analytics.ts:222`, `analytics/ConversionMetrics.jsx` | Fully implemented | None |
| `an.funnel` | User-journey funnel | `GET /analytics/funnel` | `queries/analytics.ts:244`, `analytics/UserJourneyFunnel.jsx` | Fully implemented | None |
| `an.web_vitals` | Core Web Vitals | `GET /analytics/web-vitals` | `queries/analytics.ts:266`, `analytics/CoreWebVitals.jsx` | Fully implemented | None |
| `an.events` | Event timeline | `GET /analytics/events` | `queries/analytics.ts:288`, `analytics/EventTimeline.jsx` | Fully implemented | None |
| `an.dashboard` | Dashboard overview + charts | `GET /dashboard/overview`, `/dashboard/overview/charts?period=` | `Dashboard/DashboardOverview.jsx` | Fully implemented | None |
| `an.admin` | Admin platform analytics | `GET /dashboard/admin/overview` | `Dashboard.jsx` case `admin-analytics` | Fully implemented | Admin-only |
| `an.finances` | Revenue/subscriptions/transactions/MRR + export | `/admin/finances/*` | `Dashboard/Finances.jsx` (renders `sub.websitePlan`) | Fully implemented | **Super-admin only** |
| `an.referrals` | Referral analytics | `/referral/admin/analytics`, `/referral/my-code`, `/referral/rewards` | `admin/ReferralAnalytics.jsx`, `settings/ReferralDashboard.jsx` | Fully implemented | Admin / user |
| `an.perf` | Infrastructure metrics + WebSocket | `/metrics/health`, `/metrics/history`, `/metrics/alerts` | `pages/PerformanceMonitoring.jsx`, `hooks/usePerformanceWebSocket.js` | Fully implemented | Admin-only |
| `an.ga` | Google Analytics tracking | — | `utils/commons/GoogleAnalyticsTracker.tsx`, `hooks/useGoogleAnalytics.ts` | Fully implemented | Cookie-consent-gated |
| `an.vercel` | Vercel Analytics + Speed Insights | — | `package.json` | Present | — |
| `an.impressions` | Directory impressions / search appearances | — | — | **Missing** | Key missing metric for directory monetization |
| `an.click_tracking` | Call / WhatsApp / email / directions click tracking | — | — | **Missing** | Needed to sell "lead insights" |
| `an.multi_site` | Cross-site comparison reporting | — | — | **Missing** | Agency feature |
| `an.level` | `analyticsLevel` field on plan | `usePlanSummary.ts:11` | — | **Present in contract, consumed by nothing** | Ready-made tiering dimension |

### B.10 Branding & white-label

| Feature | File | Status | Notes |
|---|---|---|---|
| Techietribe branding on sites | `PublicWebsite.tsx:1154`, `TemplatePreview.tsx:243`, `i18n/translations.ts:39` | Fully implemented | **Unconditional** |
| Remove branding | — | **Missing** | Promised by `CancellationFlow.jsx:198`, `PlanComparisonModal.jsx:125` |
| Custom favicon | — | **Missing** | |
| Custom logo | `POST /websites/:id/logo`, LOGO block | Fully implemented | |
| Custom domain | `DomainTab.jsx` | Fully implemented | Gated to Growth+ |
| Custom email branding | — | **Missing** | |
| White-label dashboard | — | **Missing** | |
| Agency client management | — | **Missing** | Closest analogue: `AccountSwitcher.jsx` + delegates |
| Client-facing access | `TeamTab.jsx` VIEWER role | **Partially implemented** | Role exists; no client portal |
| Reseller functionality | — | **Missing** | |

### B.11 Multi-site & agency

| Capability | Status | Evidence |
|---|---|---|
| Multiple websites per user | Fully implemented | `Websites.jsx`, `maxSites` |
| Multiple businesses/listings | Fully implemented | 1 listing per website |
| Multiple stores | Fully implemented | `maxStores` |
| Switching between projects | Fully implemented | `Websites.jsx` list → `/dashboard/websites/:id/editor` |
| Website limits | Partially implemented | Backend-enforced; **no proactive frontend counter** |
| Workspace management | **Missing** | No workspace/org entity |
| Team access | Fully implemented | `TeamTab.jsx`, 4-role hierarchy |
| Account delegation (act-as another account) | Fully implemented | `AccountSwitcher.jsx`, `X-Account-Context` header set only after server confirms `POST /account/switch-context` |
| Client access | Partially implemented | VIEWER role only |
| Agency dashboard | **Missing** | |
| Website duplication | Fully implemented | `POST /websites/:id/duplicate` |
| Template reuse | Partially implemented | Save-as-template is content-manager-gated |
| Bulk actions | **Missing** | No bulk select on `Websites.jsx` (only on form submissions) |
| Central analytics | **Missing** | Analytics is strictly per-website |
| Central billing | Partially implemented | One subscription per user account |
| Client ownership transfer | Fully implemented | `POST /websites/:id/transfer-ownership` |
| Role permissions | **Broken** | Defined in `PermissionContext.tsx`, but provider unmounted |

**Verdict:** high website-count plans are **not technically justified today.** The frontend supports multiple sites and delegation, but has no agency dashboard, no client management, no white-label, no bulk operations, and no cross-site reporting. Public pricing advertises up to **250 sites**; the in-app ceiling is **10** (`website_agency`). Agency functionality is incomplete — a 25+/50/100/250-site plan would ship with a per-site management experience that does not scale past a few dozen sites.

### B.12 Pricing & subscription UI (existing)

| Surface | File | Status | Notes |
|---|---|---|---|
| Public pricing page `/pricing` | `pages/publicPages/Pricing.tsx` → `Hero`, `WhatEveryPlanGets`, `PricingDetail`, `FAQSection`, `Team` | **UI only** | CTAs are dead |
| Pricing cards + annual/monthly toggle | `publicComponents/Pricing/PricingDetail.tsx:119,135` | UI only | Monthly = `round(annual/12)` — an unusual and possibly unintended pricing display |
| Home pricing section | `publicComponents/Home/PricingSection.tsx` | **Placeholder** | "Join the Waitlist", "Early bird pricing coming soon" |
| Directory features teaser | `publicComponents/Home/DirectoryFeatures.tsx` | UI only | |
| In-app plan picker | `Dashboard/shared/ChangePlanCard.jsx` (725 lines) | Fully implemented | Uses `DISPLAY_PLANS` from `useBilling.ts` |
| Plan comparison modal | `Dashboard/shared/PlanComparisonModal.jsx` (378) | Fully implemented | 4 plans × 10 feature rows |
| Proration preview | `Settings/BillingPreview.jsx` (309) → `GET /account/plan-preview` | Fully implemented | Subtotal/tax/total/line items |
| Billing history | `Dashboard/shared/BillingHistoryCard.jsx` (356) → `GET /account/billing-history` | Fully implemented | Paginated |
| Invoice history | `Dashboard/shared/InvoiceHistory.jsx` (594) → `GET /invoices` | Fully implemented | |
| Payment methods | `Dashboard/shared/CardManagementDialog.jsx` (707) → Stripe `confirmCardSetup` + `/account/payment-methods` | Fully implemented | Default card, remove card |
| Cancellation flow | `Settings/CancellationFlow.jsx` (559) | Fully implemented | Reason + feedback capture, "what you lose" screen |
| Subscription banners | `Settings/SubscriptionBanners.jsx` (273) | Fully implemented | |
| Reactivate | `queries/account.ts:520` → `POST /account/reactivate-subscription` | Fully implemented | |
| Store upgrade dialog | `Dashboard/StorePlanUpgradeDialog.tsx` | Fully implemented | **Navigates to `/pricing#stores` — that anchor does not exist** |
| Website upgrade dialog | `Dashboard/Websites.jsx:4486-4567` | Fully implemented | Reactive, triggered by `PLAN_LIMIT_REACHED` |
| Promo deals | `Dashboard/shared/DealBanner.jsx`, `PromoDealManager.jsx`, `queries/promo.ts` → `/promo/active`, `/promo/admin/deals` | Fully implemented (admin) | Banner navigates to `?tab=billing&promo=CODE` — **`Settings.jsx` and `ChangePlanCard.jsx` never read the `promo` param** |
| Coupon field | — | **Missing** | Promo codes are generated but cannot be redeemed in the UI |
| Trial messaging | — | **Missing** | `SUBSCRIPTION_TRIAL_ENDING` notification type exists; no trial UI |
| Usage bars | Only `Stores.tsx:571` | Partially implemented | No website/AI/storage usage bars |
| Locked-feature states | Only `DomainTab.jsx:350` | Partially implemented | No reusable primitive |

---

## C. Current subscription-related implementation (exact paths)

### C.1 Plan names & prices — four conflicting definitions

| # | Source | Codes | Names | Prices | Where used |
|---|---|---|---|---|---|
| 1 | `src/hooks/useBilling.ts:15-34` `DISPLAY_PLANS` | `website_free`, `website_core`, `website_growth` | **STARTUP / STANDARD / BUSINESS** | **$0 / $14.99 / $29.99** monthly | `ChangePlanCard.jsx:20,421,716` — the **live plan picker** |
| 2 | `src/components/Dashboard/shared/PlanComparisonModal.jsx:35-38` | `website_free`, `website_core`, `website_growth`, `website_agency` | **Free / Core / Growth / Agency** | **$0 / $19 / $49 / $149** per month | Plan comparison modal |
| 3 | `src/hooks/useFeatureGate.js:44-49` `PLAN_DISPLAY_NAMES` | same 4 codes | **Free / Core / Growth / Agency** | — | Nothing (hook unused) |
| 4 | `src/components/publicComponents/Pricing/PricingDetail.tsx:93-114` | none (no codes) | **Pro Lite / Pro Lite 5 / Pro Lite 10 / Pro Standard 25–250 / Pro Plus 50–200** | **$36–$9,000 per year** | Public `/pricing` |

Additional drift:
- `src/components/Dashboard/Communications.jsx:94-97` — a fifth list (`Free/Core/Growth/Agency`) used for broadcast audience targeting.
- `src/components/Settings/CancellationFlow.jsx:47-77` — a sixth definition with `maxSites` 1/1/3/10 and `analyticsLevel` Basic/Standard/Advanced/Agency and `poweredByBadge` true/false/false/false.
- `src/pages/Directory.tsx:41,75` — dummy listings use **`website_pro`** and **`website_starter`**, codes that exist nowhere else.
- `src/components/Dashboard/website-manage/DomainTab.jsx:45-52` — a normalizer accepting `free|core|growth|business|agency|pro`, evidence that a second naming scheme is in circulation.
- **`website_agency` is absent from `DISPLAY_PLANS`** — a user on the Agency plan cannot see or select their own plan in `ChangePlanCard`.

### C.2 Store plans

`src/components/Dashboard/StorePlanUpgradeDialog.tsx:46-70` — `store_free` → `store_starter` (1 store, 100 products, 1.5% fee) → `store_pro` (3 stores, 10,000 products, 0% fee, priority support). Referenced at `StoreDetail.tsx:257`. **Not represented on any pricing page.**

### C.3 Billing screens

- `src/components/Dashboard/Settings.jsx` — nav section `{ id: 'billing', label: 'Billing & plans' }` (line 107); renders at line 1083.
- `src/components/Dashboard/shared/ChangePlanCard.jsx` — plan selection, upgrade, downgrade-via-cancel.
- `src/components/Settings/BillingPreview.jsx` — proration confirmation dialog.
- `src/components/Dashboard/shared/BillingHistoryCard.jsx`, `InvoiceHistory.jsx`, `CardManagementDialog.jsx`.
- `src/components/Settings/CancellationFlow.jsx`, `SubscriptionBanners.jsx`.
- `src/components/Dashboard/shared/PlanComparisonModal.jsx`.

### C.4 Upgrade flows

1. **Proactive (stores only):** `Stores.tsx:464-468` computes `canCreateStore = storesOwned < maxStores` → `StorePlanUpgradeDialog` → `navigate("/pricing#stores")` *(broken anchor)*.
2. **Reactive (websites):** `Websites.jsx:1120` catches `err.response.data.code === "PLAN_LIMIT_REACHED"` → upgrade dialog at line 4486.
3. **Reactive (stores):** `Stores.tsx:354,423` — same pattern, but note `Websites.jsx:1186` reads `err.code` (not `err.response.data.code`) for the store-creation path, an inconsistency that may make that branch never fire.
4. **Feature-level:** `DomainTab.jsx:350-364` — "Upgrade Plan" button when `!canUseCustomDomain`.
5. **Settings:** `ChangePlanCard` → `BillingPreview` → `PUT /account/plan`.
6. **Payment-method-required:** `useBilling.ts:223` reads `err.response.data.requiresPaymentMethod` and `useCancel` from the backend.

### C.5 Feature locks currently in code

| Lock | File:line | Gates |
|---|---|---|
| `PAID_PLANS` | `Dashboard/ListingEditTab.tsx:49`, `ListingSettingsCard.tsx:25` | `isPaidPlan` — listing enhancement/extract/completeness |
| `PAID_PLANS` (Set) | `Dashboard/listings/DirectoryListingsDashboard.jsx:41` | `planEligible` row flag |
| `PLAN_ALLOWS_CUSTOM_DOMAIN` | `website-manage/DomainTab.jsx:40` | Custom-domain section |
| `isFreePlan` | `Dashboard/Settings.jsx:187-201` | Delegation section, cancel-availability |
| `FEATURE_GATES` | `hooks/useFeatureGate.js:24-32` | **Nothing — zero consumers** |
| plan switch | `WebsiteCreation/QuestionnaireNavigation.tsx:97-115` | AI-generate button label/disabled |
| `websitePlan === "website_agency"` | `pages/Directory.tsx:822` | Featured badge |
| `storePlan.code === "store_pro"` | `Dashboard/StoreDetail.tsx:257` | Store feature |
| `canCreateStore` | `Dashboard/Stores.tsx:468` | Create-store button |

### C.6 Usage limits present in the frontend

- `usePlanSummary.ts:8-19` — `maxSites`, `maxPagesPerSite`, `maxBlocksPerPage`, `analyticsLevel`, `listedInDirectory`; usage: `websitesOwned`, `pagesByWebsiteId`, `blocksByPageId`. **Only `maxStores`/`storesOwned` are actually rendered.**
- `utils/mediaUploadLimits.js:3-7` — global, plan-independent.
- `hooks/useHistory.ts:58,62` — 50-deep undo, 4MB compressed cap.
- `DirectoryListingsDashboard.jsx:42` — `MIN_PUBLISH_COMPLETENESS = 60`.
- `useAutosave.ts` — 30s interval.

### C.7 Subscription states

From `useBilling.ts:163-168`: `subscriptionStatus`, `cancelledAt`, `currentPeriodEnd`. Notification event types (`settings/NotificationPreferences.jsx:79,140`): `SUBSCRIPTION_TRIAL_ENDING`, `PLAN_CHANGED`, `DORMANT_RENEWAL_WARNING`.

### C.8 API integrations

**Subscription/billing:** `GET /billing/plan-summary` · `GET/PUT /account/billing` · `PUT /account/plan` · `GET /account/plan-preview` · `GET /account/billing-history` · `POST /account/cancel-subscription` · `POST /account/reactivate-subscription` · `POST /account/setup-intent` · `GET/POST /account/payment-methods` · `PUT /account/payment-methods/:id/default` · `DELETE /account/payment-methods/:id` · `GET /invoices` · `GET /promo/active`.
**AI quota:** `GET /ai/usage`.
**Admin revenue:** `/admin/finances/{metrics,revenue,subscriptions,transactions,reports/export}`.
**Query keys:** `src/api/queryKeys.ts` — `account.{billing, paymentMethods, planSummary, planPreview, billingHistory, loginHistory, delegates, ...}`, `ai.usage()`.

---

## D. Recommended entitlement categories

### D.1 Core free functionality — never gated
Auth (all flows), account/profile/deletion, dashboard access, 1 website, 1 directory listing, publishing + subdomain, `/site/:slug` URL, template browsing **and preview**, the editor's core loop (inline text, images, colors/dynamic theme, typography, spacing, borders, shadows, buttons, header/footer/navigation, add/remove/reorder blocks), **responsive controls and mobile/tablet/desktop visibility**, autosave, undo/redo, crash recovery, keyboard shortcuts, basic SEO (meta title/description/OG/sitemap/robots), logo upload, contact block + 1 form, lead inbox, basic analytics totals, appearing in directory search with full filters and geo, contact/call/WhatsApp/directions buttons, receiving reviews, favouriting, onboarding tour.

> A free Techietribe site must look and behave like a real business site. Nothing in the above list should be degraded to manufacture upgrade pressure.

### D.2 Usage-limited functionality
Websites (`maxSites`) · pages per site (`maxPagesPerSite`) · blocks per page (`maxBlocksPerPage`) · AI generations (`/ai/usage`) · AI regenerations (`DAILY_REGEN_LIMIT`) · media storage (`websiteTotalBytes`) · form count · monthly form submissions · lead-history retention · collaborator seats · delegate seats · blog posts · stores/products · additional directory categories · analytics retention window.

### D.3 Premium functionality (Pro)
Video blocks · video upload · per-section custom CSS · **remove "Powered by TechieTribe"** · custom favicon *(build)* · website duplication · collaborators (2–5 seats) · account delegates · real-time collaboration + editor comments · reservation/booking block · form CSV export · analytics CSV export · detailed analytics (sources, geo, devices) · owner review replies · AI listing enhancement.

### D.4 Business-growth functionality
**Custom domain + verification + SSL** *(already gated to Growth)* · additional directory categories · additional locations · **featured directory placement** · **priority directory ranking** · verified badge *(build)* · promotional badges *(build)* · priority approval queue · conversion/funnel analytics · lead insights and click tracking *(build)* · advanced SEO · CUSTOM_CODE/EMBED blocks · longer analytics retention · store 0% platform fee.

### D.5 Agency functionality
**All of the below are unbuilt** and should be marked "Planned" until they exist: agency dashboard, client management, white-label dashboard, custom email branding, reseller flows, bulk actions, cross-site/central analytics, code export, template white-labelling. **Built today and reasonable to bundle as Agency:** 10 sites, ownership transfer, delegation at scale, template creation/reuse, larger seat counts.

### D.6 Admin-only functionality
Manage Insights · Manage Templates (+approve/reject) · User Management · Finances (super-admin) · Promo Deals (super-admin) · Referral Analytics (super-admin) · Performance Monitoring · Documentation management · Communications/broadcasts · Category management · listing moderation · audit logs. **These are role-based and must stay orthogonal to plans.**

### D.7 Must never be restricted
Public directory search, filters, sorting, geo search · appearing in the directory at all as a free business · business profile pages · contact/call/WhatsApp/directions buttons on a public site · customer reviews and ratings · favouriting · template previewing · autosave and crash recovery · account deletion and data export · security features (password reset, email verification) · store checkout · mobile responsiveness of published sites.

---

## E. Proposed preliminary plan matrix

Legend: **I** Included · **L** Limited · **N** Not included · **P** Planned but not implemented · **A** Admin only

| Feature | Free | Pro | Business | Agency | Limit basis |
|---|---|---|---|---|---|
| Websites | L (1) | L | L | L | `maxSites` — code today: 1/1/3/10 |
| Pages per site | L | L | L | L | `maxPagesPerSite` — 1/5/10/15 |
| Blocks per page | L | L | L | L | `maxBlocksPerPage` — 10/20/25/30 |
| Directory listing (basic presence) | I | I | I | I | never limited |
| Subdomain + `/site/:slug` | I | I | I | I | — |
| Publish / unpublish | I | I | I | I | — |
| Preview | I | I | I | I | — |
| Template gallery + preview | I | I | I | I | — |
| Free templates | I | I | I | I | — |
| Premium templates | **P** | **P** | **P** | **P** | no tier field exists yet |
| Core editing (text/image/color/type/spacing) | I | I | I | I | — |
| Dynamic theme colors | I | I | I | I | preserve as-is |
| Responsive + device visibility | I | I | I | I | — |
| Autosave / undo-redo / recovery | I | I | I | I | — |
| Video blocks + video upload | N | I | I | I | — |
| Custom CSS (section) | N | I | I | I | — |
| Custom JavaScript | P | P | P | P | not built |
| CUSTOM_CODE / EMBED blocks | N | N | I | I | — |
| Media storage | L | L | L | L | bytes; today flat 500MB |
| Website duplication | N | I | I | I | consumes a site slot |
| Save as template | N | N | I | I | today content-manager only |
| Template switching on a live site | P | P | P | P | not built |
| Version history (general) | P | P | P | P | only AI-turn versioning exists |
| AI turn revert / restore version | I | I | I | I | within AI quota |
| AI website generation | L (0) | L | L | L | `/ai/usage`; code today 0/3/10/unlimited |
| AI editor chat / element edits | L | L | L | L | same bucket |
| AI full-site regeneration | N | L | L | L | `DAILY_REGEN_LIMIT` |
| AI listing enhancement | N | I | I | I | separate bucket |
| AI image generation | P | P | P | P | **not built — remove from marketing** |
| AI logo / SEO / blog generation | P | P | P | P | not built |
| Contact form | I | I | I | I | — |
| Form builder (multiple forms) | L (1) | L | L | L | form count |
| Reservation / booking block | N | I | I | I | — |
| Newsletter block | I | I | I | I | — |
| Form submissions | L | L | L | I | monthly count |
| Lead inbox + read/spam status | I | I | I | I | — |
| Lead history retention | L | L | L | L | days |
| Form CSV export | N | I | I | I | — |
| Lead notifications | I | I | I | I | — |
| Call / WhatsApp / directions buttons | I | I | I | I | never restrict |
| Phone-call tracking | P | P | P | P | not built |
| CRM / lead assignment | P | P | P | P | not built |
| Basic analytics (views, visitors) | I | I | I | I | — |
| Detailed analytics (sources, geo, visitors, pages) | N | I | I | I | `analyticsLevel` |
| Conversion + funnel + web vitals | N | N | I | I | `analyticsLevel` |
| Real-time analytics | N | N | I | I | — |
| Analytics CSV export | N | I | I | I | — |
| Analytics retention | L | L | L | L | days |
| Multi-site / central analytics | P | P | P | P | not built |
| Directory impressions / search appearances | P | P | P | P | not tracked |
| Custom domain + verification | N | N | I | I | matches `DomainTab.jsx:40` |
| SSL status | N | N | I | I | wizard step is UI-only |
| Redirects | P | P | P | P | not built |
| Domain purchase | P | P | P | P | not built |
| Remove "Powered by TechieTribe" | N | I | I | I | **currently unconditional — must build** |
| Custom favicon | P | P | P | P | not built |
| Custom logo | I | I | I | I | — |
| White-label dashboard / email branding | P | P | P | P | not built |
| Featured directory placement | N | N | I | I | badge exists, hard-coded to `website_agency` |
| Priority directory ranking | N | N | I | I | `score` exists backend-side |
| Verified badge | P | P | P | P | **not built — claimed in pricing** |
| Additional directory categories | N | L | L | L | count |
| Additional locations | P | P | P | P | not modelled |
| Owner review replies | N | I | I | I | built, ungated |
| Listing completeness suggestions | N | I | I | I | — |
| Priority approval | N | N | I | I | workflow exists; no priority concept |
| Collaborators | N | L | L | L | seats — 0/2/5/15 |
| Account delegates | N | L | L | L | seats — 0/1/3/10 |
| Real-time collaboration + comments | N | I | I | I | — |
| Ownership transfer | I | I | I | I | — |
| Agency dashboard / client mgmt / reseller | P | P | P | P | **not built** |
| Bulk actions | P | P | P | P | not built |
| Code export | P | P | P | P | not built |
| Stores | L | L | L | L | `maxStores` (separate product) |
| Products per store | L | L | L | L | `maxProductsPerStore` |
| Store platform fee | L | L | L | L | 1.5% → 0% |
| Priority support | P | P | P | P | **no support tier in code** |
| Admin: insights/templates/users/finances/promos/referrals/perf/docs/comms | A | A | A | A | role-based, plan-independent |

---

## F. Usage-based limit candidates

| Quota | Measure from | Frontend readiness | Backend readiness |
|---|---|---|---|
| **Websites** | `planSummary.websiteUsage.websitesOwned` vs `websitePlan.maxSites` | Data fetched, **not rendered** | Enforced (`PLAN_LIMIT_REACHED`) |
| **Pages per site** | `websiteUsage.pagesByWebsiteId[id]` vs `maxPagesPerSite` | Fetched, not rendered | Assumed enforced |
| **Blocks per page** | `websiteUsage.blocksByPageId[pageId]` vs `maxBlocksPerPage` | Fetched, not rendered | Assumed enforced |
| **Directory listings** | 1 per website → derived from `websitesOwned` | Derivable | — |
| **AI text generations** | `GET /ai/usage` → `used`/`limit`/`remaining`/`resetAt` | **Ready**; only `QuestionnaireNavigation` renders it, with hard-coded "of 3"/"of 10" | Enforced |
| **AI regenerations** | `DAILY_REGEN_LIMIT` error code | Error handled | Enforced |
| **AI edit attempts** | `EDIT_ATTEMPT_LIMIT` (3/edit) | Error handled | Enforced |
| **AI images** | — | **Not built** | Not built |
| **Images / media stored** | `MediaTab.jsx:387` tracks `usedStorageBytes`; `utils/mediaUploadLimits.js` | Client-side sum, plan-independent | Needs a per-plan storage field on `websitePlan` |
| **Storage (bytes)** | same | same | same |
| **Forms** | count FORM_BUILDER/CONTACT blocks — `FormsTab.jsx:183-195` already walks pages→blocks to enumerate forms | Derivable client-side | Needs authoritative count |
| **Form submissions/month** | `FormsTab.jsx:151` — `stats.total` | Total only, not windowed | Needs `submissionsThisMonth` + `submissionLimit` |
| **Lead retention** | submission `createdAt` | Derivable | Needs retention policy |
| **Team members / collaborators** | `GET /websites/:id/collaborators` length | Derivable | Needs `maxCollaborators` on plan |
| **Delegates** | `GET /account/delegates` length | Derivable | Needs `maxDelegates` |
| **Locations** | — | Not modelled | Not modelled |
| **Blog posts** | `GET /websites/:id/blogs/stats` | Endpoint exists | Needs `maxBlogPosts` |
| **Custom domains** | `GET /websites/:id` domain fields | Boolean gate today | Needs `maxCustomDomains` |
| **Analytics retention** | `dateRange` options in `AnalyticsTab.jsx:64` | Options are static | Needs `analyticsRetentionDays` |
| **Stores / products** | `storeUsage.storesOwned`, `productsByStoreId` | **Rendered** (`Stores.tsx:571`) | Enforced |
| **Directory categories** | `POST /website-categories` | No count UI | Needs `maxCategories` |

**Recommended plan-object extension** (additive to `usePlanSummary.ts`'s `WebsitePlan`): `maxCollaborators`, `maxDelegates`, `maxBlogPosts`, `maxForms`, `maxSubmissionsPerMonth`, `maxCustomDomains`, `maxCategories`, `storageBytes`, `analyticsRetentionDays`, `aiTextGenerationsPerMonth`, `aiImageGenerationsPerMonth`, `removeBranding: boolean`, `featuredListing: boolean`, `verifiedBadge: boolean`, `prioritySupport: boolean`. Mirror in `WebsiteUsage`.

---

## G. Frontend changes eventually required (prioritized)

### 1. Critical subscription foundations
1.1 **Create `src/config/plans.ts`** as the single source of truth: plan codes, display names, prices, tier order, limits, and a `FEATURES` registry. Delete/redirect the six competing definitions (`useBilling.ts:15`, `PlanComparisonModal.jsx:35`, `useFeatureGate.js:24,38,44`, `Communications.jsx:94`, `CancellationFlow.jsx:47`, `PricingDetail.tsx:93`).
1.2 **Add `SubscriptionProvider`** wrapping the authenticated tree, backed by `usePlanSummaryQuery()` (React Query; `usePlanSummary.ts`'s bespoke `useState/useEffect` version should be retired to avoid double-fetching). Mount it in `App.tsx` inside `AuthProvider`.
1.3 **Implement the entitlement API** in `src/hooks/useEntitlements.ts`:
```
canUseFeature(featureKey): boolean
getFeatureLimit(featureKey): number | 'unlimited' | null
getCurrentUsage(featureKey): number
hasReachedLimit(featureKey): boolean
getRemainingQuota(featureKey): number | 'unlimited'
requireUpgrade(featureKey): void   // opens the upgrade modal with context
```
Rewrite `useFeatureGate.js` as a thin adapter over this (or remove it) so the existing tests keep their value.
1.4 **Mount `PermissionProvider`** in `App.tsx` and remove the `|| "OWNER"` fallback at `WebsiteEditor.jsx:4041`. Adopt `PermissionGate` at the ~9 sites that currently hand-roll role checks. This is a correctness fix independent of billing.
1.5 **Wrap `/dashboard/websites/:websiteId/editor`** (`App.tsx:480`) in the existing unused `ProtectedRoute`.
1.6 **Pick one plan source.** Stop reading `user.websitePlan` (`Dashboard.jsx:2003`); route everything through the subscription context.
1.7 **Standardize the plan-limit error contract.** Fix `Websites.jsx:1186` (`err.code` → `err.response?.data?.code`) and centralize `PLAN_LIMIT_REACHED` handling in an axios interceptor in `src/api/client.ts` so *every* mutation gets the upgrade dialog for free.

### 2. Upgrade and locked-feature UX
2.1 `<UpgradeModal featureKey plan />` — one component, opened by `requireUpgrade()`, reusing `PlanComparisonModal`'s table.
2.2 `<FeatureLock featureKey>` wrapper with three visual modes: **hide**, **disable + tooltip**, **blur + lock chip + inline CTA**. Default to blur/lock so users can see what they'd get. Model it on the existing `DomainTab.jsx:350` pattern, which is already the right shape.
2.3 `<PlanBadge>` for locked nav/menu items.
2.4 Apply to: video blocks, custom CSS, CUSTOM_CODE, form CSV export, analytics CSV export, detailed analytics panels, collaborators, delegates, custom domain (migrate the existing bespoke gate), branding removal, listing enhancement.
2.5 Never lock: inline text editing, colors/theme, responsive controls, autosave, preview.

### 3. Usage displays
3.1 `<UsageMeter featureKey />` — reuse the `Stores.tsx:571` pattern (`used / limit` + progress bar).
3.2 Add to: Websites list header (sites), editor (pages, blocks), AI entry points (generations + `resetAt`), MediaTab (storage), FormsTab (submissions this month), TeamTab (seats), Settings → Billing (a consolidated usage panel).
3.3 Fix `QuestionnaireNavigation.tsx:106-115` to render `usage.limit` rather than hard-coded `3` / `10`.
3.4 Warn at 80% and 100% of each quota.

### 4. Pricing-page alignment
4.1 Rewrite `PricingDetail.tsx` against `config/plans.ts`. Decide whether 25–250-site tiers survive; if they do, they need a real agency product behind them.
4.2 Remove or mark "coming soon": AI Image Generator, verified badge, priority support, premium templates, "Analytics Dashboard"/"AI Copywriter" as Plus-only extras.
4.3 Wire the CTAs: `PricingDetail.tsx:343` "Get Started" and `PricingSection.tsx` "Join the Waitlist" → `/auth?mode=signup&plan=<code>` → post-signup, land on Settings → Billing with the plan preselected.
4.4 Add the `#stores` anchor `StorePlanUpgradeDialog.tsx:50` navigates to, or change that destination.
4.5 Reconcile the monthly/annual display: `PricingDetail.tsx:161` shows `annual/12` as the monthly price, which removes any annual discount incentive.

### 5. Billing management
5.1 Add `website_agency` to `DISPLAY_PLANS` (`useBilling.ts:15`) — Agency users currently cannot see their plan.
5.2 Add a coupon/promo field to `ChangePlanCard` and read the `?promo=` param that `DealBanner.jsx:120` and `PlanComparisonModal.jsx:157` already produce.
5.3 Add trial UI to back the existing `SUBSCRIPTION_TRIAL_ENDING` notification.
5.4 Surface `subscriptionStatus` (past_due, unpaid) as a global banner via `SubscriptionBanners.jsx`.
5.5 Consider unifying website and store plans into one subscription, or make the two-product split explicit in the UI.

### 6. Downgrade and over-limit behavior
6.1 Define over-limit semantics per resource (e.g. sites beyond `maxSites` → read-only, not deleted) and show a clear "over your plan limit" state.
6.2 Extend `CancellationFlow.jsx`'s "what you lose" screen to enumerate concrete over-limit consequences using real usage numbers.
6.3 Re-add the branding badge on downgrade (already promised at `CancellationFlow.jsx:198`).
6.4 Grace period for custom domains on downgrade rather than immediate disconnection.

### 7. Testing
7.1 Unit-test `useEntitlements` across all plan × feature combinations.
7.2 Extend the existing `useFeatureGate.test.js` and `PlanComparisonModal.test.jsx`.
7.3 E2E (`e2e/tests/`): free-user hits a lock → upgrade modal → plan change → lock released.
7.4 A guard test asserting no plan code appears outside `config/plans.ts` (an ESLint `no-restricted-syntax` rule would work; note ESLint currently only covers `src/components/Dashboard/**` and `src/pages/Dashboard/**`).
7.5 Explicit tests that entitlement failures **fail closed** — except AI usage, whose current fail-open behavior (`useWebsiteAIAccess.ts`) is a deliberate decision to re-confirm.

---

## H. Questions for the backend audit

**Plan model**
1. What is the authoritative plan list and are prices $14.99/$29.99, $19/$49/$149, or the annual `/pricing` tiers?
2. Does `website_agency` exist as a purchasable plan? It is in the comparison modal and gate matrix but absent from `DISPLAY_PLANS`.
3. Are `website_pro` and `website_starter` (`Directory.tsx:41,75`) real codes or dead dummy data?
4. Are website plans and store plans one subscription or two?
5. Does the backend support annual billing? The frontend toggle is purely presentational.

**Enforcement**
6. Which endpoints return `PLAN_LIMIT_REACHED`, and is the shape always `{ code, message }` at `response.data`?
7. Are `maxPagesPerSite` and `maxBlocksPerPage` enforced server-side, or only advertised?
8. Are collaborators, delegates, blog posts, forms, and submissions enforced at all? No frontend limit exists for any of them.
9. Are `/websites/:id/listing/enhance|extract` and `/domains/:id/custom-domain` server-enforced? Today they are frontend-gated only and directly reachable.
10. Does `PUT /websites/:id` reject `metaTitle`/`robotsMeta` changes for plans without "Advanced SEO"?

**AI**
11. What are the real `/ai/usage` limits per plan? The UI hard-codes 3 and 10.
12. Is the AI quota monthly? What exactly does `resetAt` represent?
13. Are website AI and listing AI genuinely separate buckets (PRD:334)?
14. Is a credit model (weighted by operation cost) feasible, or is it a flat generation count?
15. What are the concrete values of `DAILY_REGEN_LIMIT` and `EDIT_ATTEMPT_LIMIT`?
16. Is AI image generation on the roadmap? Marketing already sells it.

**Usage metering**
17. Can `/billing/plan-summary` be extended with the fields in §F (collaborators, delegates, blog posts, forms, submissions, storage, analytics retention, AI counters, branding/featured/verified booleans)?
18. Is per-website storage tracked server-side, or only summed client-side in `MediaTab.jsx`?
19. Is there a monthly form-submission counter?

**Directory monetization**
20. How is the directory `score` computed, and can plan tier weight it?
21. Is there a `featured` flag, or is `Directory.tsx:822`'s `websitePlan === "website_agency"` the whole mechanism?
22. Do verified badges exist in the data model?
23. Are directory impressions / search appearances tracked? Nothing in the frontend reads them.
24. Are there per-listing category and location limits?

**Billing operations**
25. Does `PUT /account/plan` handle upgrades, downgrades, and proration, or is downgrade only via cancel (`useBilling.ts:225` reads a `useCancel` flag)?
26. Is there a trial period? `SUBSCRIPTION_TRIAL_ENDING` notifications exist.
27. Can promo codes from `/promo/active` be redeemed at checkout? No frontend redemption path exists.
28. What `subscriptionStatus` values can appear (`past_due`, `unpaid`, `incomplete`)?
29. Are Stripe webhooks wired for payment failure and dunning?
30. Is proration tax-inclusive? `PlanPreview` has `taxCents`.

**Branding & white-label**
31. Is there a `removeBranding` flag on the website or plan? The frontend renders the badge unconditionally.
32. Is favicon storage supported? Only `ogImage` is present.

**Over-limit & downgrade**
33. What happens to sites 2–10 when an Agency user downgrades to Free?
34. What happens to a custom domain on downgrade below Growth?
35. Is there a grace period, and is it exposed to the frontend?

**Analytics**
36. Is `analyticsLevel` interpreted server-side, or is it a label the frontend is expected to enforce?
37. Is analytics retention plan-dependent?
38. Are `/analytics/conversions|funnel|realtime-advanced|web-vitals` plan-gated?

**Security**
39. Is `X-Account-Context` (delegation) validated on every request, or only at `/account/switch-context`?
40. Does the backend enforce website-collaborator roles independently of the (currently non-functional) frontend `PermissionContext`?
