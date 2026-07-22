# Website Blog Feature — Implementation Plan

> **Status:** Backend BE1–BE7 complete (self-reported PASS; BE7 resolved migration +
> tenant-domain auth blockers). Frontend FE1–FE4 are partially implemented in the current
> worktree and build/test clean, but authenticated draft/pending preview still needs final
> frontend wiring. This document is the single source of truth for the per-website blog
> feature. Update the checkboxes as work lands so anyone can see what is done and what
> remains.
>
> **Verify before frontend integration testing:**
> 1. Use the same backend environment where BE7 applied migrations, regenerated Prisma
>    Client, and patched `GET /api/websites/:id`; older backend processes can still throw
>    stale-client 500s.
> 2. Run FE5/QA checks against real seed data before considering the frontend complete.
>
> **Last updated:** 2026-07-14

---

## 1. Goal

Give every user-created website its own **blog**:

1. A **Blog tab** in the website-management dashboard where the owner can create/edit
   posts, show/hide (publish/unpublish) them, and **approve posts submitted by team
   members**.
2. A **one-click "Add Blog Page"** in the website management **Pages** tab that seeds a
   page with a **Hero** section and a **Blog Feed** (cards) — composable on top of any
   template.
3. A **blog detail page** rendered at `/blog/:slug` on the website (reusing the site's
   navbar/footer), driven by the post data.
4. **Comments** on each post: any signed-in user can comment (published immediately);
   the website owner and the post's author can hide/delete any comment; a comment's own
   author can edit/delete their own comment.

---

## 2. Locked decisions

**Product**
- **Per-website blogs** — each website owns its own independent set of posts.
- **Pending → Approved review** — team members (EDITOR role) create posts in `PENDING`;
  only OWNER/ADMIN approve to publish.
- **One-click Add Blog Page** — lives in Manage → Pages, seeds Hero + Blog Feed, and
  wires detail routing. Keep this action out of `WebsiteEditor.jsx` so editor-specific
  work remains isolated.
- **Blog page is reachable** — adding the Blog page also adds or offers to add a
  navigation/menu entry so visitors can discover it.
- **Auto-rendered detail page** — the detail view is generated from post data via the
  `BLOG_ARTICLE` block; users do **not** design it block-by-block.
- **Real detail-page semantics** — invalid/unpublished `/blog/:slug` routes show an
  explicit not-found state, not the website home page; valid posts get per-post SEO.
- **Stable public URLs** — published post slugs do not silently change and break links;
  any slug-change behavior must be explicit and recorded.
- **Comments publish immediately** — no pre-moderation. Owner + post author can
  hide/delete any comment. Comment author can **edit + delete their own**.
- **Categories derived from that website's posts** — no separate category model per
  website; the feed's category chips come from the categories used by the website's
  published posts.
- **Comments are a flat list (v1)** — no nested replies (model supports threading later).

**Technical (from backend reconciliation)**
- New API surface: **`/api/websites/:websiteId/blogs*`** (the current `/api/blogs` is an
  alias to `/api/insights` and is author-scoped/global — not used for this feature).
- **Split status model** on the Blog:
  - `approvalStatus: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED`
  - `visibility: PUBLISHED | UNPUBLISHED`
  - A post is publicly visible only when `approvalStatus = APPROVED` **and**
    `visibility = PUBLISHED`.
- **UPPERCASE enums end-to-end** — update the frontend's old lowercase assumptions.
- `websiteId` added to the Blog model; **slug unique per `[websiteId, slug]`**.
- Blog/comment relations must cascade correctly: deleting a website deletes its website
  blogs and comments; deleting a blog deletes its comments.
- **Website-collaborator role checks** (OWNER/ADMIN/EDITOR/VIEWER) replace global role
  checks for these endpoints.
- **Safe public author fields only** — website-scoped public feed/detail responses expose
  display-safe author fields (for example name/avatar/bio), never email, global role, or
  internal account metadata.
- **Sanitized post content** — blog post body/excerpt/rich-text content is sanitized on
  write and rendered safely on read, not only comments.
- **Blog comments built from scratch** (the existing `Comment` model is listing-only),
  reusing its conventions: JWT/cookie auth, rate-limit 10/hr, text 5–1000 chars,
  DOMPurify sanitization.
- **Custom-domain auth parity** — signed-in commenting and authenticated previews must work
  under `/site/:slug`, subdomain, and custom-domain access modes.
- The existing global **directory blog** (main domain `/blog`, `projectKey=directory`)
  is **left untouched**; website blogs are a parallel system.

---

## 3. Permission matrix

| Action | OWNER | ADMIN | EDITOR | VIEWER | Any signed-in user |
|---|---|---|---|---|---|
| Create post (→ PENDING) | ✅ (→ can self-approve) | ✅ | ✅ (stays PENDING) | ❌ | ❌ |
| Edit own post | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit others' post | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve / Reject | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publish / Unpublish (visibility) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete post | ✅ | ✅ | own only | ❌ | ❌ |
| Create comment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit/Delete OWN comment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hide/Delete ANY comment on a post | ✅ (website owner) | ✅ | post author only | ❌ | ❌ |

> BE0 confirmed publish/review is ADMIN+ in existing backend approval services, so
> visibility changes are OWNER/ADMIN-only for website blogs.

---

## 4. Data model & API contract

### 4.1 Blog model additions (backend)
- Add `websiteId Int?` + relation to `Website`.
- Add `visibility` enum (`PUBLISHED | UNPUBLISHED`), default `UNPUBLISHED`.
- Keep `approvalStatus` (existing `status` enum: `DRAFT | PENDING_APPROVAL | APPROVED | REJECTED`).
- Indexes: `[websiteId, status]`, `[websiteId, slug]`; unique `[websiteId, slug]`.
- Define slug generation + collision handling for `[websiteId, slug]` uniqueness (for
  example `my-post`, `my-post-2`, `my-post-3`) in create/update service code.
- Define slug lifecycle: default to preserving a published slug unless the owner/admin
  explicitly edits it; if redirects are supported, document and test them before enabling.
- Set FK `onDelete` behavior so deleting a website cascades to its website-scoped blogs.
- Define author deletion behavior for posts (retain with safe anonymous/deleted-user author
  display vs. cascade/anonymize) before migration ships.
- Existing global posts (`projectKey=directory`) keep `websiteId = null`.

### 4.2 Blog comment model (backend, new)
`id, blogId (FK), websiteId, authorId (User.id), content, status (VISIBLE | HIDDEN),
parentCommentId (nullable, unused in v1), createdAt, updatedAt`.

Set FK `onDelete` behavior so deleting a blog deletes its comments, and deleting a
website deletes comments belonging to that website.

Define author deletion behavior for comments (retain with deleted-user display vs.
cascade/anonymize) before migration ships.

### 4.3 Endpoints (backend, new unless noted)

**Dashboard (auth: website collaborator):**
- `GET  /api/websites/:websiteId/blogs?status=&page=&limit=&search=&category=` — list this website's posts (all statuses for managers).
- `GET  /api/websites/:websiteId/blogs/stats` — counts (total / published / drafts / pending).
- `GET  /api/websites/:websiteId/blogs/:id/preview` — authenticated preview for the author,
  OWNER, or ADMIN; returns draft/pending/unpublished posts for dashboard preview only.
- `POST /api/websites/:websiteId/blogs` — create (EDITOR+ → PENDING). multipart/form-data.
- `PUT  /api/websites/:websiteId/blogs/:id` — update. multipart/form-data.
- `DELETE /api/websites/:websiteId/blogs/:id`
- `PATCH /api/websites/:websiteId/blogs/:id/approve` — OWNER/ADMIN.
- `PATCH /api/websites/:websiteId/blogs/:id/reject` — OWNER/ADMIN (`{ rejectionReason }`).
- `PATCH /api/websites/:websiteId/blogs/:id/visibility` — `{ visibility }` show/hide.

**Public (no auth):**
- `GET /api/websites/:websiteId/blogs/public?page=&limit=&sortBy=&sortOrder=&search=&category=` — APPROVED + PUBLISHED only.
- `GET /api/websites/:websiteId/blogs/public/:slug` — single post.
- `GET /api/websites/:websiteId/blogs/public/categories` — category names derived from this website's published posts.

Public feed/detail responses must be website-scoped and return safe author fields only.
Related-post queries must use the same website scope.

**Comments:**
Use website-scoped comment routes to avoid ambiguity with the existing `/api/blogs` alias:
- `GET  /api/websites/:websiteId/blogs/:blogId/comments?page=&limit=&includeHidden=` —
  public excludes HIDDEN; moderators can include hidden comments.
- `POST /api/websites/:websiteId/blogs/:blogId/comments` — signed-in; `{ content }`;
  immediate publish.
- `PUT  /api/websites/:websiteId/comments/:commentId` — author-of-comment only;
  `{ content }`.
- `PATCH /api/websites/:websiteId/comments/:commentId/visibility` — website owner or
  post author; `{ hidden }`.
- `DELETE /api/websites/:websiteId/comments/:commentId` — comment author, website owner,
  or post author.

### 4.4 Finalized backend contract (authoritative — from BE5)

These are the exact shapes the frontend must code against.

**Routes**
- Dashboard: `GET|POST /api/websites/:websiteId/blogs` · `GET .../blogs/stats` ·
  `PUT|DELETE .../blogs/:id` · `PATCH .../blogs/:id/approve|reject|visibility`
- Preview: `GET /api/websites/:websiteId/blogs/:id/preview`
- Public: `GET .../blogs/public` · `GET .../blogs/public/:slug` · `GET .../blogs/public/categories`
- Comments: `GET|POST /api/websites/:websiteId/blogs/:blogId/comments` ·
  `PUT|PATCH|DELETE /api/websites/:websiteId/comments/:commentId`

**Enums (UPPERCASE)**
- `status`: `DRAFT | PENDING_APPROVAL | APPROVED | REJECTED`
- `visibility`: `PUBLISHED | UNPUBLISHED`
- comment `status`: `VISIBLE | HIDDEN`

**Response envelopes**
- Dashboard: `{ success, blogs, pagination }` · `{ success, stats }` · `{ success, blog }`
- Public: `{ success, blogs, pagination }` · `{ success, blog, relatedPosts }` ·
  `{ success, categories }`
- Comments: `{ success, comments, pagination, includeHidden }` · `{ success, comment }`

**Other contract facts**
- Image upload field: **`imageFile`** (multipart) — matches existing `WebsiteManageInsights.jsx`.
- Safe author payload: **`displayName`, `avatar`, `bio`, `id`** (id is for comment
  ownership checks only). No email/global-role/internal metadata.
- Publish/unpublish (`visibility`): **OWNER/ADMIN only** (`EDITOR_PUBLISH=owner-admin-only`).
- Feed/detail include a **visible comment count** (`COMMENT_COUNT=INCLUDED`).
- Hidden-comment moderation fetch: `GET .../comments?includeHidden=true` returns
  visible + hidden **only** for OWNER/ADMIN/post author; public callers never receive hidden.
- Preview responses carry a `noindex` signal for the frontend to honor.
- **`CUSTOM_DOMAIN_AUTH=risk`** — preview + commenting auth unverified on subdomain/custom
  domain (see header). Frontend must test; may need a backend cookie/CORS follow-up.

**BE0 confirmed backend facts:**
- Current Prisma `Blog` has `status BlogStatus`, `projectKey` default `directory`,
  author/approval fields, content/SEO fields, and no `websiteId`.
- Current `/api/blogs` is mounted as an alias to insight routes and should be left for
  directory/global behavior.
- Website access helpers are `requireWebsiteAccess(action)` in
  `backend/middleware/websiteAccess.js` and `WEBSITE_ACTIONS` / `ROLE_PERMISSIONS` in
  `backend/constants/permissions.js`.
- Sanitization exists in `backend/middleware/sanitize.js` plus DOMPurify helpers in
  comment/review services; rate limiting exists via `createRateLimiter` /
  `createLazyLimiter`.
- Notifications use `createNotification`, `createNotificationForMultipleUsers`, and
  preference-aware notification services; BE0 flagged an `approvalNotificationService`
  owner lookup mismatch (`website.userId` vs. `ownerUserId`) to fix during BE5.
- Custom-domain/subdomain auth for preview and comments is a backend risk until verified.

> Response shapes: mirror the examples the backend AI provided (`{ success, blogs: [...] }`,
> `{ success, comments: [...] }`). Finalize exact field names during BE2/BE3/BE4 and record
> them in §7.

---

## 5. Backend and frontend execution plan

Legend: `[ ]` not started · `[~]` in progress · `[x]` done. Put initials + PR link next
to a task when you take it.

### 5.1 Backend work  *(do first; blocks most frontend integration)*

**Step BE1 — Schema and migrations**
- [x] BE1.1 Add `websiteId` + `visibility` to Blog model; migration; unique
      `[websiteId, slug]`; keep existing global directory posts with `websiteId = null`.
- [x] BE1.2 Add BlogComment model + migration with `blogId`, `websiteId`, `authorId`,
      `content`, `status`, optional `parentCommentId`, timestamps.
- [x] BE1.3 Add FK `onDelete` behavior: deleting a website deletes its website blogs and
      comments; deleting a blog deletes its comments.
- [x] BE1.4 Decide and implement author-deletion behavior for posts/comments
      (retain with deleted-user display vs. anonymize/delete).

BE1 backend response:
- Files changed: `backend/prisma/schema.prisma`,
  `backend/prisma/migrations/20260713030000_add_website_scoped_blogs/migration.sql`.
- Author deletion behavior: `Blog.authorId` and `BlogComment.authorId` are nullable with
  `ON DELETE SET NULL`, so posts/comments are retained for deleted users.
- Note: backend reported `MIGRATION=PASS` and `TESTS=PASS`, but also reported a database
  migration status check failed with a schema engine error. Verify migration status before
  relying on a migrated dev/staging database.

**Step BE2 — Blog services and dashboard API**
- [x] BE2.1 Implement `/api/websites/:websiteId/blogs*` dashboard endpoints with
      website-collaborator auth.
- [x] BE2.2 Implement create/update with slug generation, `[websiteId, slug]` collision
      handling, and stable published slug behavior.
- [x] BE2.3 Implement approve/reject/visibility endpoints using OWNER/ADMIN rules and the
      BE0-confirmed owner/admin-only publish rule.
- [x] BE2.4 Implement stats with explicit counts for published (`APPROVED + PUBLISHED`),
      draft, pending, rejected, and unpublished.
- [x] BE2.5 Sanitize blog post body/excerpt/rich-text content on create/update and return
      only sanitized content to readers.

BE2 backend response:
- Files changed: `backend/app.js`, `backend/controllers/websiteBlogController.js`,
  `backend/routes/websiteBlogRoutes.js`, `backend/services/websiteBlogService.js`,
  `backend/tests/websiteBlogService.test.js`.
- Routes, permissions, owner/admin-only publish, slug handling, sanitization, stats, and
  `imageFile` multipart compatibility were reported complete.
- Tests were reported passing with `MISSING=NONE`.

**Step BE3 — Public and preview API**
- [x] BE3.1 Implement website-scoped public feed/detail/categories endpoints; return only
      `APPROVED + PUBLISHED` posts.
- [x] BE3.2 Return safe public author fields only; never expose email, global role, or
      internal account metadata.
- [x] BE3.3 Support website-scoped related-post queries.
- [x] BE3.4 Add authenticated preview endpoint for draft/pending/unpublished posts, scoped
      to author, OWNER, or ADMIN, and mark preview responses/pages `noindex`.
- [x] BE3.5 Verify JWT/cookie/CORS/SameSite behavior for preview under `/site/:slug`,
      subdomain, and custom-domain access modes. BE7 confirmed cookie `SameSite=None`,
      allowlisted credentialed CORS, and subdomain/custom-domain auth pass.

BE3 backend response:
- Files: `websiteBlogController.js`, `websiteBlogRoutes.js`, `websiteBlogService.js`,
  `websiteBlogService.test.js`.
- `PUBLIC_FEED=PASS`, `PUBLIC_DETAIL=PASS`, `CATEGORIES=PASS`, `RELATED=PASS`,
  `PREVIEW_ROUTE=GET /api/websites/:websiteId/blogs/:id/preview`, `PREVIEW_AUTH=PASS`,
  `NOINDEX=PASS`, `SAFE_AUTHOR=PASS`, `COMMENT_COUNT=INCLUDED`, `TESTS=PASS`.
- Superseded by BE7: `CUSTOM_DOMAIN_AUTH=pass`.

**Step BE4 — Comments API**
- [x] BE4.1 Prefer website-scoped comment routes:
      `/api/websites/:websiteId/blogs/:blogId/comments*` and
      `/api/websites/:websiteId/comments/:commentId*`.
- [x] BE4.2 Implement public comment listing excluding hidden comments by default.
- [x] BE4.3 Implement moderator-aware hidden-comment fetch (`includeHidden=true` or a
      separate moderation endpoint).
- [x] BE4.4 Implement create/edit/delete/visibility rules: comment author can edit/delete
      own; website owner or post author can hide/delete any comment on that post.
- [x] BE4.5 Enforce comment auth, 10/hr rate limit, 5-1000 chars, and DOMPurify
      sanitization.
- [x] BE4.6 Verify signed-in commenting under `/site/:slug`, subdomain, and custom-domain
      access modes. BE7 confirmed subdomain/custom-domain auth pass.

BE4 backend response:
- Files: `websiteBlogCommentController.js`, `websiteBlogRoutes.js`,
  `websiteBlogCommentService.js`, `websiteBlogCommentService.test.js`,
  `websiteBlogCommentRoutes.test.js`.
- `ROUTES=PASS`, `WEBSITE_SCOPE=PASS`, `PUBLIC_HIDDEN_FILTER=PASS`, `INCLUDE_HIDDEN=PASS`,
  `CREATE_AUTH=PASS`, `MODERATION=PASS`, `RATE_LIMIT=PASS`, `LENGTH=PASS`, `SANITIZE=PASS`,
  `SAFE_AUTHOR=PASS`, `TESTS=PASS`.
- Superseded by BE7: `CUSTOM_DOMAIN_AUTH=pass`.

**Step BE5 — Notifications, seed data, and backend tests**
- [x] BE5.1 Notify OWNER/ADMIN on submit-for-approval.
- [x] BE5.2 Notify author on approve/reject.
- [x] BE5.3 Notify post author on new comment; hook into existing notification refresh.
- [x] BE5.4 Add seed/test data for a website with mixed-status posts and comments.
- [x] BE5.5 Backend tests: collaborator permissions, approval/visibility filtering, safe
      author payloads, cascade deletes, slug collisions/lifecycle, rate limits, post
      sanitization, and comment moderation.

BE5 backend response:
- Files: `websiteBlogNotificationService.js`, `approvalNotificationService.js`,
  `websiteBlogService.js`, `websiteBlogCommentService.js`, `seedWebsiteBlogFixture.js`,
  plus `websiteBlogService.test.js`, `websiteBlogCommentService.test.js`,
  `websiteBlogNotificationService.test.js`, `websiteBlogRegression.test.js`.
- `NOTIFICATIONS=PASS`, `SEED=PASS`, `REGRESSION=PASS`, `DIRECTORY_BLOG=PASS`, `TESTS=PASS`.
- Fixed the BE0 owner-lookup mismatch (`website.userId` vs `ownerUserId`).
- Authoritative contract captured in §4.4 below.
- Superseded by BE7: `CUSTOM_DOMAIN_AUTH=pass`.

**Step BE7 — Migration + tenant auth unblocker**
- [x] BE7.1 Applied pending blog migrations and regenerated Prisma Client.
- [x] BE7.2 Verified website/blog/public/comment endpoints return 200 after migration.
- [x] BE7.3 Verified existing directory blog remains unaffected.
- [x] BE7.4 Fixed tenant auth via cookie `SameSite=None` and credentialed CORS allowlisting.
- [x] BE7.5 Verified public reads, subdomain auth, and custom-domain auth.

BE7 backend response:
- Root cause of `/api/websites/:id` 500: stale Prisma Client selected unknown `pageType` on
  `Page` before migration/client regeneration.
- Fix: backend reran migration deploy with DB access, applied pending migrations, then ran
  `prisma generate`.
- Verified 200s: `GET /api/websites/147`, dashboard blog list/stats, public feed/detail/
  categories, and comments.
- `DIRECTORY_BLOG=pass`, `AUTH_APPROACH=cookie-samesite-none`,
  `CORS_CREDENTIALS=allowlisted`, `SUBDOMAIN_AUTH=pass`, `CUSTOM_DOMAIN_AUTH=pass`,
  `PUBLIC_READS=pass`, `MISSING=NONE`.

BE7 follow-up backend response:
- Root cause: `GET /api/websites/:id` explicitly selected `Page.pageType` through Prisma
  Client, which could 500 on the tunnel when the generated client was stale after the
  `pageType` migration.
- Files changed: `backend/controllers/websiteController.js`,
  `backend/tests/websiteListDetail.test.js`, `backend/tests/websiteBlogRegression.test.js`.
- Verified: `WEBSITE_140=PASS`, `WEBSITE_146=PASS`, `WEBSITE_LIST=PASS`, `PAGES=PASS`,
  `BLOG_ROUTES=PASS`, `DIRECTORY_BLOG=PASS`, `TESTS=PASS`, `MISSING=NONE`.

### 5.2 Frontend work  *(backend contracts ready — see §4.4)*

**Kickoff decisions (locked):** start with **FE1** (dashboard tab) first, FE2 in parallel
if capacity allows; FE3 next; FE4 last (ship-gated on custom-domain auth). Add Blog Page
lives in Manage → Pages, best-effort adds a nav entry, reuses an existing `/blog` page when
present, and identifies the blog index via a persisted **`pageType: "BLOG_INDEX"`** flag.

**Step FE1 — Dashboard Blog tab**  *(depends on BE2 ✅ — core landed, type-check + build green)*
- [x] FE1.1 Registered a `blog` tab (Newspaper icon, Content group) in
      `WebsiteManagementDashboard.jsx` + `case "blog"` → renders `WebsiteManageInsights`.
- [x] FE1.2 `WebsiteManageInsights.jsx` refactored to be props-driven (`websiteId`,
      `websiteRole`, `website`; `useParams` fallback for the legacy route); posts/categories
      URL subtab replaced with internal state (Categories sub-view removed — see FE1.9).
- [x] FE1.3 All calls now hit `/api/websites/:websiteId/blogs*` (list/stats/create/update/
      delete); dropped `authorId`, `/my-stats`, `/publish-toggle`, global `/categories`.
- [x] FE1.4 Switched to UPPERCASE `approvalStatus` (DRAFT/PENDING_APPROVAL/APPROVED/REJECTED)
      + separate `visibility`; added a Status column + Pending stat card; status filter now
      all/published/pending/draft/rejected.
- [x] FE1.5 Show/hide switch → `PATCH .../visibility` with `{ visibility }`.
- [x] FE1.6 Approval flow: approve action + reject-with-reason dialog on PENDING rows,
      wired to `PATCH .../approve|reject`; Pending filter + stat serve as the sub-view.
- [x] FE1.7 OWNER/ADMIN-only gating on approve/reject/visibility; VIEWER blocked from the
      whole manage dashboard; EDITOR now sees Edit/Delete only on their **own** posts
      (`canManagePost` = OWNER/ADMIN or viewer id === post author id). Backend also enforces.
- [~] FE1.8 Removed the broken main-domain `/blogdetail/:slug` URL; Preview now opens the
      tenant `/blog/:slug` for live posts and toasts otherwise. **Remaining:** authenticated
      draft/pending preview page — depends on FE3 (`GET .../blogs/:id/preview`).
- [x] FE1.9 Category select now derives from the website's post categories (+ session
      quick-add); global `/api/categories` + `/api/insights/categories` usage removed.

**Step FE2 — Manage Pages Add Blog Page**  *(landed — type-check + build green)*
- [x] FE2.1 Added the blog-page action to
      `src/components/Dashboard/website-manage/PagesTab.jsx`, alongside the existing Add
      Page flow. Do not place this action in `WebsiteEditor.jsx`.
- [x] FE2.2 Duplicate handling: if a page with `pageType === "BLOG_INDEX"` or path `/blog`
      exists, the action opens the existing blog page for editing instead of creating a
      duplicate blog index.
- [x] FE2.3 Seeds `HERO` (heading "Our Blog") + `BLOG_FEED` blocks via `getBlockDefaultContent`
      (added a `BLOG_FEED` preset to `blockPresets.ts`); written with a direct
      `PUT .../pages/:id/blocks`.
- [x] FE2.4 Best-effort nav wiring: appends a `{label:"Blog", type:"page", target:path}`
      item to the site's primary menu (creates "Main Menu" if none), dedupes, and toasts.
      **Note:** plain toast, no undo — `showSaveToast` has no action slot (undo = refinement).
- [x] FE2.5 Page created with `pageType: "BLOG_INDEX"`. BE06 confirmed `pageType` is
      persisted and returned with public page/block payloads.
      If it strips the field, FE3 detail routing must fall back to path/`BLOG_FEED`-block
      detection (see FE3.1 / §7).
- [~] FE2.6 Website-aware `BLOG_FEED` editor preview — **folded into FE3** (block
      website-scoping via PublicWebsite/editor context is done there, not separately).

**Step FE3 — Public feed and detail routing**  *(depends on BE3 ✅ — landed, type-check + build green)*
- [x] FE3.1 `PublicWebsite.tsx` renders a synthetic `BLOG_ARTICLE` page for a path under the
      blog index (`/blog/:slug`); the block resolves the post via `postIdentifier` (not the
      website slug in the URL).
- [x] FE3.2 Not-found: unknown blog slugs render the synthetic page → `BlogArticleBlock`
      shows "Article not found" (no silent home-page fallback for blog-detail paths).
- [x] FE3.3 Precedence: an exact real page wins; otherwise the blog index handles
      `/blog/:slug`.
- [x] FE3.4 Uses the shared `pagePath` derivation, so it works across `/site/:slug/*`,
      subdomain, and custom domain. **⚠ custom-domain auth for comments/preview still
      unverified (backend risk).**
- [x] FE3.5 `BLOG_FEED`/`BLOG_ARTICLE` receive `websiteId` (BlockRenderer → block →
      `useDynamicBlockData`), which maps `blog`/`blog-article` to
      `/websites/:id/blogs/public*`. Falls back to global endpoints when unscoped.
- [x] FE3.6 Category chips use `/websites/:id/blogs/public/categories`; related posts use the
      detail response's `relatedPosts` (else a website-scoped category query).
- [x] FE3.7 Feed card clicks already build tenant-aware `/blog/:slug` via `useTenantUrl`.
- [x] FE3.8 Detail SEO confirmed: `BlogArticleBlock` pushes `seoData` → `PublicWebsite`
      renders `<title>`/description/keywords, OG `article`+published_time+author, and
      `BlogPosting` JSON-LD. Author now uses the safe `displayName`.

**Step FE4 — Comments UI**  *(depends on BE4 ✅ and FE3 — landed)*
- [x] FE4.1 New `BlogComments.tsx` under `BlogArticleBlock`: flat, newest-first, paginated
      (`GET /websites/:id/blogs/:blogId/comments`).
- [x] FE4.2 Signed-in composer (immediate publish); logged-out users see a sign-in prompt.
- [x] FE4.3 Per-comment controls: edit/delete for the comment author; hide/delete for
      moderators. **Uses backend `canEdit/canDelete/canHide` flags when present, else infers
      from viewer id vs comment author / post author** (see §7 — owner-who-isn't-post-author
      needs the flags).
- [x] FE4.4 Requests `includeHidden=true`; hidden comments render with a "Hidden" badge +
      unhide/delete (backend returns them only to moderators; public never sees them).
- [x] FE4.5 Mirrors limits: 5–1000 chars, disabled submit out of range, 429 → rate-limit
      message, DOMPurify on render.
- [x] FE4.6 Comment-count badge on feed cards — BE06 confirmed `blogs[].commentCount`
      (VISIBLE-only); wired into `BlogCard` (also now prefers `excerpt` and safe `displayName`).

**Step FE5 — Frontend tests and local validation**
- [ ] FE5.1 Unit tests: dashboard status/visibility transitions and approval gating by role.
- [ ] FE5.2 Route tests: invalid `/blog/:slug` renders not found, not homepage.
- [ ] FE5.3 SEO tests/checks: per-post title/meta/OG/JSON-LD render for website detail.
- [ ] FE5.4 Auth checks: comments and previews work under `/site/:slug`, subdomain, and
      custom domain.

### 5.3 Shared end-to-end rollout
- [ ] QA1 E2E: create → submit (EDITOR) → approve (OWNER) → publish → view on site →
      comment → moderate.
- [ ] QA2 Verify existing directory blog (`/blog` main domain, `projectKey=directory`) is
      unaffected.
- [ ] QA3 Optional SEO rollout: include published website posts in sitemap generation if
      the platform exposes per-website sitemaps.

---

## 6. Frontend file touch-points (reference)

| File | Change |
|---|---|
| `src/components/Dashboard/WebsiteManagementDashboard.jsx` | Add `blog` tab (FE1.1) |
| `src/components/Dashboard/WebsiteManageInsights.jsx` | Rewire to website-scoped API, split status, preview route, role-gated actions (FE1.3–FE1.9) |
| `src/components/Dashboard/WebsiteBlogDashboard.tsx` | Tab entry wrapper (FE1.2) |
| `src/components/Dashboard/website-manage/PagesTab.jsx` | Add-Blog-Page action + block seeding + menu insertion + blog-index flag (FE2.1–FE2.5) |
| `src/components/Dashboard/WebsiteEditor.jsx` | No Add-Blog-Page entry point; blog pages are edited here only after creation from Manage → Pages |
| `src/components/Dashboard/website-manage/MenusTab.jsx` | Reference existing menu APIs/shape for Blog menu entry (FE2.4) |
| `src/components/Editor/blockPresets.ts` | Hero + Blog Feed preset (FE2.3) |
| `src/pages/PublicWebsite.tsx` | `/blog/:slug` synthetic detail routing, explicit not-found, route-mode parity, detail SEO (FE3.1–FE3.4, FE3.8) |
| `src/components/PublicWebsite/dynamic/BlogFeedBlock.tsx` | Website-scoped fetch + derived categories (FE3.5–FE3.7) |
| `src/components/PublicWebsite/dynamic/BlogArticleBlock.tsx` | Website-scoped fetch + related posts + host comments/moderation + SEO context (FE3.5–FE3.8, FE4.1–FE4.6) |
| `src/hooks/useDynamicBlockData.ts` | Website-scoped endpoint mappings (FE3.5) |
| `src/components/BlockEditor/BlockSelector.tsx` | (No change — `BLOG_FEED`/`BLOG_ARTICLE` already registered) |

---

## 7. Open items to finalize during implementation

- [x] **Exact response field names** for all new endpoints — recorded in §4.4 (from BE5).
- [x] **Blog-index page flag** (FE2.5) — persisted **`pageType: "BLOG_INDEX"`**, read by
      `PublicWebsite.tsx` (FE3.1). **BE06 confirmed `PAGE_TYPE=persisted` and returned in the
      public payload with page blocks — no fallback needed.**
- [x] **Preview route contract** — BE0 confirmed
      `GET /api/websites/:websiteId/blogs/:id/preview` for draft/pending/unpublished posts.
- [x] **Preview/comment auth on tenant domains** — BE7 confirmed cookie `SameSite=None`,
      credentialed CORS allowlisting, and subdomain/custom-domain auth pass.
- [x] **Menu insertion behavior** — decided: **auto-add** the "Blog" nav entry with an
      undo/toast; skip if an entry to the blog index already exists.
- [x] **Duplicate `/blog` handling** — decided: **ask the user** (reuse existing vs create
      at an alternate path).
- [x] **Detail route precedence** — decided (default): an **exact real page wins**;
      otherwise the blog index handles `/blog/:slug` as synthetic detail (FE3.3).
- [x] **EDITOR self-publish** — BE0 confirmed publish/unpublish is OWNER/ADMIN-only.
- [x] **Slug lifecycle** — BE2 confirmed slug generation, collision handling, and stable
      published slug behavior.
- [x] **Comment count in feed** — BE3/BE5 confirmed `COMMENT_COUNT=INCLUDED` (visible
      count in feed/detail). FE4.6 can render it.
- [x] **Comment route shape** — BE0 confirmed `/api/blogs` conflicts with website blog
      needs; use website-scoped comment routes.
- [x] **Hidden comment moderation fetch** — BE4/BE5 confirmed
      `GET .../comments?includeHidden=true` returns visible + hidden only for
      OWNER/ADMIN/post author.
- [ ] **Migration** of any existing per-user posts to websites — assume none; confirm.
- [x] **Image uploads** — BE2 reported create/update multipart upload is compatible with
      the current `imageFile` field used by `WebsiteManageInsights.jsx`.
- [x] **Post body sanitization** — BE2 reported create/update sanitization for blog
      body/excerpt/rich-text content.
- [x] **Safe public author payload** — BE5 confirmed `displayName`, `avatar`, `bio`, `id`
      (id for comment-ownership checks only).
- [x] **Author deletion behavior** — BE1 confirmed posts/comments are retained with
      nullable author FKs and `ON DELETE SET NULL`.
- [x] **BE1 migration applied / Prisma regenerated** — BE7 confirmed migration deploy,
      `prisma generate`, endpoint 200 checks, and `MISSING=NONE`.
- [x] **Stats semantics** — BE2 reported explicit counts for published
      (`APPROVED + PUBLISHED`), drafts, pending, rejected, and unpublished.
- [x] **Notification recipients** — BE5 implemented submit→OWNER/ADMIN, approve/reject→author,
      new-comment→post author, and fixed the owner-lookup mismatch.
- [ ] **Sitemap scope** — decide whether published website blog posts are included in
      per-website sitemap generation for this release.

---

## 8. Glossary

- **approvalStatus** — moderation state: `DRAFT / PENDING_APPROVAL / APPROVED / REJECTED`.
- **visibility** — owner's show/hide switch: `PUBLISHED / UNPUBLISHED`. Public requires
  `APPROVED + PUBLISHED`.
- **Collaborator roles** — `OWNER / ADMIN / EDITOR / VIEWER` (per website, from
  `/api/websites/:id/collaborators`; see `backend/constants/permissions.js`).
- **Blog index page** — the Manage → Pages-created `/blog` page (Hero + Blog Feed) that also
  backs the `/blog/:slug` detail route.
