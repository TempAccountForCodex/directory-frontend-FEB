# Website Blog Backend Prompts

Use these prompts one at a time with the backend AI/agent. After each response, paste the
response back into the frontend/Codex thread so we can reconcile the contract and update
`docs/WEBSITE_BLOG_FEATURE_PLAN.md` before sending the next prompt.

Each prompt is intentionally self-contained because the backend AI may not remember prior
prompts or responses.

Backend response rule for every prompt:

- Keep the response short enough for Slack/chat.
- Do not paste long code blocks.
- Summarize files changed, decisions made, tests run, and blockers.
- If code was changed, include only tiny snippets when essential.
- Use `STATUS=COMPLETE` only when the requested implementation and relevant tests are
  finished.
- Use `PASS` only when verified from code or test output.
- If something is not applicable, use `NA` and explain briefly in `MISSING`.

---

## BE0 Prompt: Contract Confirmation Before Implementation

```text
This is BE0 for the website-scoped blog feature.

Goal: inspect the backend repository and confirm the exact implementation contract before any code changes. Do not modify code in this prompt.

Product context:
- Every user-created Website needs its own independent blog.
- Existing global directory blog on the main domain, projectKey=directory, must remain untouched.
- Current /api/blogs is reportedly an alias to /api/insights and is author-scoped/global. Website blogs must use /api/websites/:websiteId/blogs* instead.
- Blog status is split:
  - approvalStatus: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED
  - visibility: PUBLISHED | UNPUBLISHED
  - Public visibility requires approvalStatus=APPROVED and visibility=PUBLISHED.
- Website collaborator roles OWNER / ADMIN / EDITOR / VIEWER drive permissions.
- Comments are flat in v1, publish immediately, and can be moderated by website owner/admin or post author.

Please inspect the existing backend code and report:

1. Existing Blog/Insight models and routes
- Confirm the current Blog model fields and whether it already has status/projectKey/slug/image/author/category fields.
- Confirm whether /api/blogs aliases /api/insights or conflicts with website blog needs.
- Confirm whether existing directory blog records can remain websiteId=null.

2. Existing Website/collaborator permissions
- Identify the existing middleware/helper for website collaborator role checks.
- Confirm exact role names and where constants live.
- Confirm whether EDITOR can self-publish own APPROVED posts, or whether visibility should be OWNER/ADMIN-only.

3. Existing sanitization/rate-limit/auth conventions
- Identify existing JWT/cookie auth middleware.
- Identify DOMPurify/sanitize-html or equivalent existing sanitization utilities.
- Identify rate-limit conventions suitable for comment creation at 10/hr.
- Identify custom-domain/subdomain auth/CORS/SameSite constraints that affect authenticated previews and comments.

4. Existing notification system
- Identify how notifications are created.
- Identify how frontend refresh is triggered, if backend participates.
- Confirm recipient lookup for OWNER/ADMIN collaborators.

5. Existing tests/migration conventions
- Identify Prisma or migration setup.
- Identify test runner and focused test commands.

6. Confirm recommended backend contract
- Website-scoped comment routes preferred:
  - GET /api/websites/:websiteId/blogs/:blogId/comments?page=&limit=&includeHidden=
  - POST /api/websites/:websiteId/blogs/:blogId/comments
  - PUT /api/websites/:websiteId/comments/:commentId
  - PATCH /api/websites/:websiteId/comments/:commentId/visibility
  - DELETE /api/websites/:websiteId/comments/:commentId
- Dashboard blog routes:
  - GET /api/websites/:websiteId/blogs?status=&page=&limit=&search=&category=
  - GET /api/websites/:websiteId/blogs/stats
  - GET preview route, choose exact route
  - POST /api/websites/:websiteId/blogs
  - PUT /api/websites/:websiteId/blogs/:id
  - DELETE /api/websites/:websiteId/blogs/:id
  - PATCH approve/reject/visibility
- Public routes:
  - GET /api/websites/:websiteId/blogs/public
  - GET /api/websites/:websiteId/blogs/public/:slug
  - GET /api/websites/:websiteId/blogs/public/categories

Do not implement anything yet.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; BLOG_MODEL=<summary>; ROUTES=<summary>; PERMISSIONS=<summary>; EDITOR_PUBLISH=<owner-admin-only|editor-own-approved|unknown>; COMMENTS_ROUTE=<website-scoped|global|unknown>; AUTH_CUSTOM_DOMAIN=<pass|risk|unknown>; SANITIZE=<utility-or-missing>; RATE_LIMIT=<utility-or-missing>; NOTIFICATIONS=<summary>; TESTS=<commands-or-unknown>; MIGRATIONS=<summary>; BLOCKERS=<comma-separated blockers or NONE>
```

---

## BE1 Prompt: Schema and Migrations

BE0 confirmed before implementation:
- Current Prisma `Blog` has `status BlogStatus`, `projectKey` default `directory`,
  content/SEO fields, author/approval fields, and no `websiteId`.
- Current `/api/blogs` is an alias to insight routes; leave it for directory/global
  behavior and use `/api/websites/:websiteId/blogs*` for this feature.
- Use `GET /api/websites/:websiteId/blogs/:id/preview` as the authenticated preview route.
- Use website-scoped comment routes, not `/api/blogs/:blogId/comments`.
- EDITOR cannot publish/unpublish; publish/review remains OWNER/ADMIN-only.
- Custom-domain/subdomain auth for preview/comments is a known risk to verify.
- BE5 must fix or account for `approvalNotificationService` selecting `website.userId`
  while Website uses `ownerUserId`.

```text
This is BE1 for the per-website blog feature.

Goal: implement only schema/model/migration changes for website-scoped blogs and comments. Inspect the repository first. Do not implement controllers/routes/services beyond what is needed for schema validation.

Feature contract:
- Existing global directory blog must remain untouched and must keep working with websiteId=null.
- Add websiteId to Blog so each user-created Website owns independent posts.
- Add visibility enum/string with values PUBLISHED | UNPUBLISHED, default UNPUBLISHED.
- Keep or map the existing approval/status field to the moderation values:
  DRAFT | PENDING_APPROVAL | APPROVED | REJECTED.
- Slug must be unique per [websiteId, slug]. Existing global records with websiteId=null must remain compatible.
- Deleting a website must delete its website-scoped blogs and comments.
- Deleting a blog must delete its comments.
- Add a new flat BlogComment model for website blogs. Do not reuse listing-only Comment if it is listing-scoped.

Implement:

1. Blog model changes
- Add nullable websiteId and relation to Website.
- Add visibility with default UNPUBLISHED.
- Add indexes needed for dashboard and public queries:
  - [websiteId, status/approvalStatus]
  - [websiteId, slug]
  - any useful published feed indexes.
- Add uniqueness for [websiteId, slug], while preserving existing global directory blog compatibility.
- Use existing enum style if the repo already uses enums; otherwise use the repo's established string conventions.

2. BlogComment model
- Fields:
  - id
  - blogId FK
  - websiteId FK
  - authorId FK to User
  - content
  - status VISIBLE | HIDDEN, default VISIBLE
  - parentCommentId nullable, unused in v1
  - createdAt
  - updatedAt
- Add indexes for blog comment listing and moderation.
- Add cascade behavior for website/blog deletion.

3. Author deletion behavior
- Choose the safest behavior that matches existing backend conventions.
- Prefer retaining posts/comments with nullable author or safe deleted-user display if the repo supports it.
- If schema constraints make that unsafe, report the chosen alternative.

4. Migration and validation
- Create migration using repository conventions.
- Run schema generation/validation and focused migration checks if available.
- Do not implement endpoints in this prompt.

Update no frontend files.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; FILES=<comma-separated paths>; BLOG_WEBSITE_ID=PASS|FAIL; VISIBILITY=PASS|FAIL; COMMENT_MODEL=PASS|FAIL; CASCADE=PASS|FAIL; UNIQUE_SLUG=PASS|FAIL; AUTHOR_DELETE=<summary>; MIGRATION=PASS|FAIL|NOT_RUN; TESTS=PASS|FAIL|NOT_RUN; MISSING=<comma-separated missing items or NONE>
```

---

## BE2 Prompt: Dashboard Blog Services and Manager API

BE1 backend response summary:
- Schema/migration files: `backend/prisma/schema.prisma`,
  `backend/prisma/migrations/20260713030000_add_website_scoped_blogs/migration.sql`.
- `Blog.websiteId`, `visibility`, `BlogComment`, cascade behavior, and `[websiteId, slug]`
  uniqueness were reported complete.
- `Blog.authorId` and `BlogComment.authorId` are nullable with `ON DELETE SET NULL`.
- Backend reported `MIGRATION=PASS` and `TESTS=PASS`, but also reported that database
  migration status check failed with a schema engine error. Verify or account for that
  before relying on a migrated database.

```text
This is BE2 for the per-website blog feature.

Goal: implement dashboard/manager APIs for website-scoped blogs. Assume BE1 schema exists; inspect the repo and reuse its conventions. Do not implement public rendering endpoints or comment endpoints in this prompt except shared helpers needed by manager APIs.

Feature contract:
- New API surface: /api/websites/:websiteId/blogs*
- Existing global directory blog and /api/blogs or /api/insights behavior must remain untouched.
- Auth is website-collaborator based, not global role based.
- Roles:
  - OWNER/ADMIN can create, edit any, approve/reject, publish/unpublish, delete any.
  - EDITOR can create posts that remain pending unless backend decides otherwise from existing permission constants.
  - EDITOR can edit own post and delete own post.
  - EDITOR cannot publish/unpublish; BE0 confirmed publish/review is ADMIN+.
  - VIEWER cannot create/edit/delete/publish.
- Status is split:
  - approvalStatus: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED
  - visibility: PUBLISHED | UNPUBLISHED
  - Public visible means APPROVED + PUBLISHED.
- UPPERCASE enum/string values must be returned end-to-end.

Implement:

1. Shared blog service/helpers
- Slugify title on create when slug is not provided.
- Resolve [websiteId, slug] collisions as my-post, my-post-2, my-post-3.
- Preserve a published slug by default on title update; only change slug if an authorized user explicitly edits slug.
- Sanitize blog body/excerpt/rich-text fields on create/update using existing backend sanitization conventions.
- Keep image upload contract compatible with existing WebsiteManageInsights.jsx imageFile multipart usage if possible.
- Return safe author fields in manager responses too where practical.

2. Dashboard endpoints
- GET /api/websites/:websiteId/blogs?status=&page=&limit=&search=&category=
  - Returns this website's posts.
  - Managers see all statuses allowed by their role.
  - Supports search/category/status pagination.
- GET /api/websites/:websiteId/blogs/stats
  - Counts total, published (APPROVED + PUBLISHED), drafts, pending, rejected, unpublished.
- POST /api/websites/:websiteId/blogs
  - multipart/form-data.
  - Website collaborators EDITOR+ can create.
  - Apply final create approval behavior from repo permissions. If not already defined, use: OWNER/ADMIN can create APPROVED or self-approve; EDITOR creates PENDING_APPROVAL.
- PUT /api/websites/:websiteId/blogs/:id
  - multipart/form-data.
  - OWNER/ADMIN can edit any; EDITOR own only.
- DELETE /api/websites/:websiteId/blogs/:id
  - OWNER/ADMIN any; EDITOR own only.
- PATCH /api/websites/:websiteId/blogs/:id/approve
  - OWNER/ADMIN only.
- PATCH /api/websites/:websiteId/blogs/:id/reject
  - OWNER/ADMIN only; accepts { rejectionReason } if supported.
- PATCH /api/websites/:websiteId/blogs/:id/visibility
  - OWNER/ADMIN only.

3. Validation/security
- Every route must verify the blog belongs to websiteId.
- No authorId global scoping.
- No email/global-role/internal metadata leakage.
- Keep global directory blog routes unchanged.

4. Tests
- Add focused backend tests for collaborator permissions, status/visibility transitions, slug collisions, stable published slugs, sanitization, and stats semantics.
- Run relevant tests.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; FILES=<comma-separated paths>; ROUTES=PASS|FAIL; PERMISSIONS=PASS|FAIL; EDITOR_PUBLISH=owner-admin-only|FAIL; SLUGS=PASS|FAIL; SANITIZE=PASS|FAIL; STATS=PASS|FAIL; IMAGE_UPLOAD=<compatible|changed|unknown>; TESTS=PASS|FAIL|NOT_RUN; MISSING=<comma-separated missing items or NONE>
```

---

## BE3 Prompt: Public Website Blog Feed, Detail, Categories, Related Posts, and Preview API

BE2 backend response summary:
- Files changed: `backend/app.js`, `backend/controllers/websiteBlogController.js`,
  `backend/routes/websiteBlogRoutes.js`, `backend/services/websiteBlogService.js`,
  `backend/tests/websiteBlogService.test.js`.
- Dashboard routes, website-collaborator permissions, owner/admin-only publish,
  slug/collision/stable-published-slug behavior, create/update sanitization, stats, and
  `imageFile` multipart compatibility were reported complete.
- Backend reported `TESTS=PASS` and `MISSING=NONE`.

```text
This is BE3 for the per-website blog feature.

Goal: implement website-scoped public blog endpoints and authenticated preview endpoint. Assume BE1/BE2 exist. Do not implement comment endpoints in this prompt.

Feature contract:
- Existing global directory blog must remain untouched.
- Public website blog endpoints return only posts with approvalStatus=APPROVED and visibility=PUBLISHED.
- All public responses are scoped by websiteId.
- Public author data must be safe only: display name, avatar, bio or equivalent. Never email, global role, auth metadata, or internal account fields.
- Related posts must be website-scoped.
- Preview is authenticated and can show draft/pending/unpublished posts only to the post author, OWNER, or ADMIN.
- Preview pages/responses should allow frontend to mark noindex and must not emit public canonical assumptions.

Implement:

1. Public feed
- GET /api/websites/:websiteId/blogs/public?page=&limit=&sortBy=&sortOrder=&search=&category=
- Return APPROVED + PUBLISHED only.
- Support pagination, category, search, sorting using repo conventions.
- Include visible comment count if cheap and safe; if not, report NOT_INCLUDED for frontend planning.

2. Public detail
- GET /api/websites/:websiteId/blogs/public/:slug
- Return one APPROVED + PUBLISHED post by [websiteId, slug].
- Return 404 for missing, unpublished, unapproved, or other-website slug.
- Return safe author fields only.
- Include SEO-relevant fields needed by frontend: title, excerpt/description, image, author display, published/updated dates, category, slug, canonical-safe path data if available.

3. Categories
- GET /api/websites/:websiteId/blogs/public/categories
- Return category names derived from this website's APPROVED + PUBLISHED posts only.

4. Related posts
- Implement website-scoped related-post query support.
- Related posts should not leak posts from other websites or global directory blog.

5. Authenticated preview
- Use exact route confirmed in BE0:
  GET /api/websites/:websiteId/blogs/:id/preview
- Allowed viewers: post author, OWNER, ADMIN.
- Return draft/pending/unpublished posts for preview.
- Include a noindex flag or equivalent metadata for frontend.
- Verify auth approach under /site/:slug, subdomain, and custom-domain constraints as far as backend can.

6. Tests
- Add focused backend tests for public filtering, website scoping, safe author payload, derived categories, related-post scoping, preview authorization, and 404 behavior.
- Run relevant tests.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; FILES=<comma-separated paths>; PUBLIC_FEED=PASS|FAIL; PUBLIC_DETAIL=PASS|FAIL; CATEGORIES=PASS|FAIL; RELATED=PASS|FAIL; PREVIEW_ROUTE=<route-or-missing>; PREVIEW_AUTH=PASS|FAIL; NOINDEX=PASS|FAIL; SAFE_AUTHOR=PASS|FAIL; COMMENT_COUNT=INCLUDED|NOT_INCLUDED|UNKNOWN; CUSTOM_DOMAIN_AUTH=<pass|risk|unknown>; TESTS=PASS|FAIL|NOT_RUN; MISSING=<comma-separated missing items or NONE>
```

---

## BE4 Prompt: Website Blog Comments API

```text
This is BE4 for the per-website blog feature.

Goal: implement website-scoped blog comment endpoints. Assume BE1 schema exists and BE3 public detail exists. Do not implement frontend UI.

Feature contract:
- Comments are flat in v1.
- Any signed-in user can comment on an APPROVED + PUBLISHED website blog post.
- Comments publish immediately as VISIBLE.
- Public users see only VISIBLE comments.
- Website owner/admin and post author can hide/delete any comment on that post.
- Comment author can edit/delete own comment.
- Comment text length is 5-1000 chars.
- Comment creation is rate-limited to 10/hr using existing backend conventions.
- Comment content is sanitized using existing backend conventions.
- Prefer website-scoped routes to avoid ambiguity with existing /api/blogs alias.

Implement:

1. Routes
- GET /api/websites/:websiteId/blogs/:blogId/comments?page=&limit=&includeHidden=
  - Public/default excludes hidden.
  - includeHidden only works for website owner/admin or post author.
- POST /api/websites/:websiteId/blogs/:blogId/comments
  - Signed-in user only.
  - Blog must belong to websiteId and be public-visible unless a deliberate moderator-only exception is required.
- PUT /api/websites/:websiteId/comments/:commentId
  - Comment author only.
- PATCH /api/websites/:websiteId/comments/:commentId/visibility
  - Website owner/admin or post author only.
  - Accept { hidden } and map to VISIBLE/HIDDEN.
- DELETE /api/websites/:websiteId/comments/:commentId
  - Comment author, website owner/admin, or post author.

2. Security/validation
- Every operation validates websiteId.
- No hidden comments leak to public users.
- Sanitized content is stored and returned.
- Enforce 5-1000 chars.
- Enforce 10/hr rate limit on create.
- Auth should work with the platform's cookie/JWT conventions and custom domain constraints as far as backend controls.

3. Responses
- Use the repo's normal success/error shapes.
- Return enough author data for UI display and ownership checks without leaking email/global role/internal metadata.
- Include canEdit/canDelete/canHide flags if that matches existing API style; otherwise document how frontend should infer controls.

4. Tests
- Add focused tests for public listing, includeHidden moderation, create auth, rate limit, length validation, sanitization, author edit/delete, owner/admin/post-author moderation, and website scoping.
- Run relevant tests.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; FILES=<comma-separated paths>; ROUTES=PASS|FAIL; WEBSITE_SCOPE=PASS|FAIL; PUBLIC_HIDDEN_FILTER=PASS|FAIL; INCLUDE_HIDDEN=PASS|FAIL; CREATE_AUTH=PASS|FAIL; MODERATION=PASS|FAIL; RATE_LIMIT=PASS|FAIL; LENGTH=PASS|FAIL; SANITIZE=PASS|FAIL; SAFE_AUTHOR=PASS|FAIL; CUSTOM_DOMAIN_AUTH=<pass|risk|unknown>; TESTS=PASS|FAIL|NOT_RUN; MISSING=<comma-separated missing items or NONE>
```

---

## BE5 Prompt: Notifications, Seed Data, Backend Regression Tests, and Final Contract Summary

```text
This is BE5 for the per-website blog feature.

Goal: finish backend support with notifications, seed/test data, regression tests, and an authoritative contract summary for frontend implementation. Assume BE1-BE4 are implemented or partially implemented. Inspect the repo first.

Feature contract:
- Notify OWNER/ADMIN when an EDITOR submits a post for approval.
- Notify post author on approve/reject.
- Notify post author on new comment.
- Hook into existing notification system and frontend refresh conventions where backend participates.
- Existing global directory blog must remain unaffected.
- Frontend needs exact endpoint routes, response fields, enum values, auth rules, and upload field names.

Implement:

1. Notifications
- Add notification creation for submit-for-approval, approve, reject, and new comment.
- Resolve OWNER/ADMIN recipients from website collaborators.
- Fix or account for BE0 finding that approvalNotificationService appears to select
  website.userId while Website uses ownerUserId.
- Avoid notifying actor about their own action unless existing notification conventions do that.
- Include useful links/metadata for frontend routing where existing notifications support it.

2. Seed/test data
- Add or document a focused seed fixture for a website with:
  - APPROVED + PUBLISHED post
  - APPROVED + UNPUBLISHED post
  - PENDING_APPROVAL post
  - DRAFT post
  - REJECTED post if supported
  - visible comments
  - hidden comments
- Keep seed data safe and compatible with existing seed conventions.

3. Backend regression tests
- Ensure focused tests cover:
  - collaborator permissions
  - approval/visibility filtering
  - safe author payloads
  - cascade deletes
  - slug collisions/lifecycle
  - post sanitization
  - comment rate limits
  - comment moderation
  - preview authorization
  - directory blog unaffected
- Run relevant tests.

4. Final frontend contract summary
Report the final authoritative contract for:
- Dashboard list/stats/create/update/delete/approve/reject/visibility routes.
- Public feed/detail/categories routes.
- Preview route.
- Comment routes.
- Multipart image upload field name.
- Exact enum field names and values.
- Exact response field names for list/detail/stats/comments.
- Safe author payload fields.
- Permission rules, including BE0-confirmed OWNER/ADMIN-only publish behavior.
- Comment count availability.
- Hidden comment moderation fetch shape.
- Custom-domain/subdomain auth caveats.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; FILES=<comma-separated paths>; NOTIFICATIONS=PASS|FAIL|NA; SEED=PASS|FAIL|NA; REGRESSION=PASS|FAIL; DIRECTORY_BLOG=PASS|FAIL; TESTS=PASS|FAIL|NOT_RUN; DASHBOARD_ROUTES=<summary>; PUBLIC_ROUTES=<summary>; PREVIEW_ROUTE=<route-or-missing>; COMMENT_ROUTES=<summary>; IMAGE_FIELD=<field-or-unknown>; ENUMS=<summary>; RESPONSES=<summary>; SAFE_AUTHOR=<fields>; EDITOR_PUBLISH=owner-admin-only|FAIL; COMMENT_COUNT=INCLUDED|NOT_INCLUDED|UNKNOWN; HIDDEN_FETCH=<summary>; CUSTOM_DOMAIN_AUTH=<pass|risk|unknown>; MISSING=<comma-separated missing items or NONE>
```

---

## BE6 Prompt: Frontend Integration Gap-Closing (run after full frontend build)

The full website-blog **frontend** is now implemented (dashboard Blog tab, Manage → Pages
"Add Blog Page", public feed + `/blog/:slug` detail + SEO, and comments). We need you to confirm exact
contracts and close gaps discovered while wiring it up. Inspect the backend and answer every
item precisely with real example JSON. Where something is missing, say `NOT SUPPORTED` and
propose the field/endpoint.

```text
This is BE6 for the per-website blog feature — verification + gap-closing for frontend integration.

Context: the frontend now calls the website-scoped blog + comment endpoints and renders:
- Dashboard Blog tab (list/stats/create/update/delete/approve/reject/visibility).
- Manage → Pages "Add Blog Page": creates a page and seeds Hero + Blog Feed blocks, and
  tries to persist a page-level flag pageType="BLOG_INDEX".
- Public site: a Blog Feed page and a /blog/:slug detail page (rendered by resolving the
  post by slug), with SEO (title/description/OG/BlogPosting JSON-LD) and a comments section.

Please inspect the code and answer:

A. PAGE MODEL — pageType (blocks blog-detail routing robustness)
   1. Does POST /api/websites/:websiteId/pages accept and PERSIST an arbitrary field such as
      pageType (string, e.g. "BLOG_INDEX")? If it strips unknown fields, can pageType be added
      to the Page model?
   2. Is pageType returned by GET /api/websites/:websiteId/pages AND in the public website
      payload (GET /api/websites/slug/:slug and/or the per-page blocks endpoint the public
      site reads)?
   3. If pageType is NOT feasible, confirm the fallback we should rely on to identify the blog
      index page: (a) a page at path "/blog", or (b) a page containing a BLOG_FEED block —
      and confirm the public payload includes each page's blocks (with blockType) so the
      frontend can detect a BLOG_FEED block.

B. PUBLIC FEED / DETAIL — exact response fields
   4. GET /api/websites/:websiteId/blogs/public — confirm the top-level key is `blogs` (array)
      plus `pagination`. List every field on each feed item (id, slug, title, image, category,
      description/excerpt, author{...}, publishedAt, and any commentCount).
   5. GET /api/websites/:websiteId/blogs/public/:slug — confirm top-level keys `blog` and
      `relatedPosts`. List every field on `blog` (id, slug, title, image, category, description,
      headings[], author{...}, publishedAt, metaTitle, metaDescription, keywords, canonicalUrl).
   6. SAFE AUTHOR: confirm the exact author object shape on public feed items, public detail
      `blog.author`, and each related post — we expect { id, displayName, avatar, bio } and NO
      email/global-role. Confirm `id` is present on `blog.author` (the post author id is needed
      so the post author can moderate comments on their own post).
   7. GET /api/websites/:websiteId/blogs/public/categories — confirm the response is
      { categories: string[] } (or give the exact shape).
   8. Return 404 (not 200-empty) for a slug that is missing / unapproved / unpublished /
      belongs to another website — confirm.

C. COMMENTS — exact response fields + moderation signalling
   9. GET /api/websites/:websiteId/blogs/:blogId/comments — confirm top-level keys
      (`comments`, `pagination` with `total`, and any `includeHidden` echo). List every field
      on a comment: id, content, status (VISIBLE/HIDDEN), author{ id, displayName, avatar },
      createdAt, updatedAt.
   10. Does each comment include capability flags (canEdit, canDelete, canHide) computed for
       the authenticated caller? This is important: on the PUBLIC site the frontend cannot
       otherwise know whether the viewer is the WEBSITE OWNER (a non-post-author owner would
       get no moderation controls without these flags). If flags are not present, either add
       them OR return the website's owner user id (and post author id) somewhere the public
       detail/comment response can use.
   11. Confirm includeHidden=true returns VISIBLE+HIDDEN only to OWNER/ADMIN/post-author, and
       VISIBLE-only to everyone else (so the frontend can safely always request includeHidden).
   12. Confirm the comment write routes and payloads exactly:
       POST /api/websites/:websiteId/blogs/:blogId/comments { content }
       PUT /api/websites/:websiteId/comments/:commentId { content }
       PATCH /api/websites/:websiteId/comments/:commentId/visibility { hidden: true|false }
       DELETE /api/websites/:websiteId/comments/:commentId
       — and confirm the rate limit (10/hr) applies to POST only, and length is 5–1000.

D. COMMENT COUNT on feed (for feed-card badges)
   13. COMMENT_COUNT=INCLUDED was reported — give the EXACT field name and location on each
       public feed item (e.g. blogs[].commentCount) and whether it counts VISIBLE only.

E. AUTHENTICATED PREVIEW (draft/pending)
   14. GET /api/websites/:websiteId/blogs/:id/preview — confirm the response shape matches the
       public detail shape (so the same article renderer can consume it), and the exact auth
       it expects (cookie vs bearer). Confirm the noindex signal field name.

F. CUSTOM-DOMAIN / SUBDOMAIN AUTH (known risk)
   15. For a website served on a subdomain or a custom domain, do the authenticated calls
       (comment create/edit/delete/visibility, and preview) work with the platform's auth
       cookie? Describe the cookie domain / SameSite / CORS setup, and any change needed so
       first-party auth works on custom domains. If unresolved, state exactly what's required.

G. MIGRATION SANITY
   16. Confirm the BE1 migration is actually applied on dev/staging (the earlier schema-engine
       status-check error) so integration testing hits a migrated DB.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; PAGE_TYPE=<persisted|not-supported|proposed>; PAGE_BLOCKS_IN_PAYLOAD=<yes|no>; FEED_FIELDS=<list>; DETAIL_FIELDS=<list>; SAFE_AUTHOR=<fields, author.id present? yes/no>; CATEGORIES_SHAPE=<shape>; DETAIL_404=<pass|fail>; COMMENT_FIELDS=<list>; COMMENT_FLAGS=<canEdit/canDelete/canHide present? yes/no, else owner/author ids exposed?>; INCLUDE_HIDDEN=<pass|fail>; COMMENT_WRITE_ROUTES=<confirm|diff>; COMMENT_COUNT_FIELD=<path-or-missing>; PREVIEW_SHAPE=<matches-detail|diff>; PREVIEW_AUTH=<cookie|bearer>; CUSTOM_DOMAIN_AUTH=<pass|risk|fix-needed:...>; MIGRATION_APPLIED=<yes|no>; MISSING=<comma-separated or NONE>
```

---

## BE7 Prompt: Apply the migration + fix tenant-domain auth (unblock integration testing)

```text
This is BE7 for the per-website blog feature. Two production-blocking backend issues remain.
The frontend (dashboard Blog tab, Manage → Pages Add Blog Page, public feed + /blog/:slug detail + SEO,
comments) is fully built and calls the website-scoped blog + comment endpoints. It cannot be
tested end-to-end until the two items below are fixed. Inspect the backend and fix both.

TASK 1 — Apply the blog DB migration (currently causing 500s)
Symptom: GET /api/websites/:id now returns 500 {"message":"Server error"}. Cause: the blog
feature code (Blog.websiteId relation + BlogComment table from BE1) is deployed, but the
migration that creates those columns/tables has NOT been applied — BE06 reported
MIGRATION_APPLIED=no and that `prisma migrate status` fails with a schema-engine error.
Do:
1. Reproduce and paste the actual 500 stack trace for GET /api/websites/:id (expected: a Prisma
   error such as "column Blog.websiteId does not exist" or "relation BlogComment does not exist").
2. Diagnose and fix the schema-engine error that blocks `prisma migrate status`
   (e.g. drift, a failed/partial migration, or a bad DATABASE_URL/shadow DB).
3. Apply the migration on dev/staging (`prisma migrate deploy`, or resolve + `migrate dev`).
4. Verify these return 200 after migrating (with seed data present):
   - GET /api/websites/:id
   - GET /api/websites/:id/blogs, GET /api/websites/:id/blogs/stats
   - GET /api/websites/:id/blogs/public, /public/:slug, /public/categories
   - GET /api/websites/:id/blogs/:blogId/comments
5. Confirm the existing global directory blog (projectKey=directory) is unaffected.

TASK 2 — Make signed-in auth work on tenant subdomains AND custom domains
Symptom: BE06 reported CUSTOM_DOMAIN_AUTH=fix-needed — production cookies are SameSite=Strict
and host-only, so the auth cookie is NOT sent when a tenant site is served on a subdomain or a
custom domain. That breaks every signed-in blog action off the app origin: creating a comment,
editing/hiding/deleting a comment, and the authenticated draft preview
(GET /api/websites/:id/blogs/:id/preview). The blog feature is specifically for tenant sites
served on those domains, so this must work there — not only on the app-origin /site/:slug path.
Do:
1. Choose and implement an approach (state which and why):
   (a) Cookie: set the auth cookie SameSite=None; Secure, and allow-list verified tenant
       origins (subdomains + confirmed custom domains) for CORS with credentials; OR
   (b) A same-origin API proxy served from each tenant domain; OR
   (c) A short-lived token bridge for tenant-domain auth.
2. Ensure CORS reflects only allow-listed tenant origins with Access-Control-Allow-Credentials,
   and that only VERIFIED custom domains are trusted (no open origin allow-listing).
3. Confirm these work from a tenant subdomain and a custom domain (not just app-origin):
   POST/PUT/PATCH/DELETE comment endpoints, and GET .../blogs/:id/preview.
4. Confirm public (unauthenticated) reads still work on all domains, and that the change does
   not weaken auth/CSRF on the main app.
If any part is infra rather than app code (DNS, TLS, edge/CDN), say exactly what is required.

Respond in this exact format:
STATUS=COMPLETE|PARTIAL; STACK_TRACE=<one-line cause>; SCHEMA_ENGINE_FIX=<what-was-wrong+fix>; MIGRATION_APPLIED=<yes|no>; ENDPOINTS_200=<list-or-fails>; DIRECTORY_BLOG=<pass|fail>; AUTH_APPROACH=<cookie-samesite-none|proxy|token-bridge>; CORS_CREDENTIALS=<allowlisted|open|na>; SUBDOMAIN_AUTH=<pass|fail>; CUSTOM_DOMAIN_AUTH=<pass|fail|infra-needed:...>; PUBLIC_READS=<pass|fail>; MISSING=<comma-separated or NONE>
```

BE7 response summary:
- `STATUS=COMPLETE`.
- Root cause: stale Prisma Client selected unknown `pageType` on `Page`; DB was unreachable
  from the sandbox/normal command path and Prisma Client was stale.
- Fix: reran migration deploy with DB access, applied pending migrations, then ran
  `prisma generate`.
- `MIGRATION_APPLIED=yes`.
- Verified 200s: `GET /api/websites/147`, dashboard blog list/stats, public feed/detail/
  categories, and comments.
- `DIRECTORY_BLOG=pass`, `AUTH_APPROACH=cookie-samesite-none`,
  `CORS_CREDENTIALS=allowlisted`, `SUBDOMAIN_AUTH=pass`, `CUSTOM_DOMAIN_AUTH=pass`,
  `PUBLIC_READS=pass`, `MISSING=NONE`.

BE7 follow-up response summary:
- `STATUS=COMPLETE`.
- Root cause: `GET /api/websites/:id` explicitly selected `Page.pageType` through Prisma
  Client, which could 500 on the tunnel when the generated client was stale after the
  `pageType` migration.
- Files: `backend/controllers/websiteController.js`,
  `backend/tests/websiteListDetail.test.js`, `backend/tests/websiteBlogRegression.test.js`.
- Verified: `WEBSITE_140=PASS`, `WEBSITE_146=PASS`, `WEBSITE_LIST=PASS`, `PAGES=PASS`,
  `BLOG_ROUTES=PASS`, `DIRECTORY_BLOG=PASS`, `TESTS=PASS`, `MISSING=NONE`.
