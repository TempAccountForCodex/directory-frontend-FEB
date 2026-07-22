# Handoff — Website Blog Blocks (index + detail) redesign & editability

You are taking over an in-progress feature in a **React 18 + TypeScript + Vite + MUI v5** app
(white-label website builder). Read this whole doc before touching code. Nothing here is
committed — all work lives in the **working tree** (the user commits themselves).

---

## 0. The one rule that matters most

**The user is credit/token-conscious and has repeatedly said: THINK and CONFIRM before large
changes; do NOT run `npm run build` / tests unless explicitly asked (they build manually);
do NOT commit (they commit themselves).** When a task is large or ambiguous, present a tight
plan + the 1–2 real decisions and get a go-ahead first. Be honest about limitations — don't
overclaim that something works end-to-end if you haven't verified it.

---

## 1. Mission

Take the app's polished public blog pages — `src/pages/publicPages/Blog.tsx` (the `/blog`
index) and `src/pages/publicPages/BlogDetail.tsx` (the `/blogdetail/:id` article) — and make
them available as **per-website, editor-editable blocks** so any tenant site (on any template)
can have the same blog experience, themed to the site's own primary color.

Two surfaces:
- **Blog index page** — split into 3 independent, reorderable blocks: `BLOG_HERO`,
  `BLOG_FEATURED`, `BLOG_GRID`.
- **Blog detail page** — one `BLOG_ARTICLE` block; content is CMS-driven (the actual post),
  but the **layout/styling must be editable per element** in the editor.

**Universal template compatibility is a hard requirement:** the blocks must look/behave
identically regardless of which template the site uses (self-contained inline `sx`,
`system-ui` font, same-origin `/assets` textures, theme color via prop).

---

## 2. Environment & how to test

- **Backend** is reached through a **Cloudflare quick tunnel** set in `.env` as
  `VITE_API_PROXY_TARGET` (**the URL rotates — check `.env` for the current value**; as of this
  writing `https://tool-arrangements-tells-workshops.trycloudflare.com/`). Vite dev server
  proxies `/api` to it.
- **Dev server:** `npm run dev` → http://localhost:5173. **Use `localhost`, NOT `127.0.0.1`**
  (a curl/IPv6 quirk makes `127.0.0.1` return `000`). If 5173 is taken, Vite uses 5174.
- **Test account:** `beroh33343@lohinja.com` / `Test12345@` (user id 35).
- **Test website:** id **176**, slug **`grocery-in`**. Home page id 302, Blog index page id 311.
- **Signin (curl):** `POST /api/auth/signin` (NOT `/login`) with header
  `-H "Origin: http://localhost:5173"` (backend rejects cross-origin w/o Origin). Returns
  httpOnly `token`/`ws_token` cookies.
- **Playwright** drives the editor well: `page.goto("/")`, in-page
  `fetch('/api/auth/signin', {credentials:'include'})`, then open
  `/dashboard/websites/176/editor`. The editor preview renders inside an **`about:blank`
  iframe** (React portal) — get it via `page.frames().find(f => f.url().startsWith("about:blank"))`.
  Put temp `.mjs` scripts in the **repo root** (so `playwright` resolves) and delete them after.
- **Gotcha:** clicking editor theme palettes triggers **autosave**, which mutates the backend —
  it pollutes read-only inspection. Do clean reads before clicking anything.

---

## 3. Architecture primer (what you must know)

- **Routing:** `src/App.tsx` detects subdomains. Subdomain → renders `PublicWebsite` only.
  Main domain → SPA; editor at `/dashboard/websites/:id/editor`.
- **Blocks:** each page is an ordered `Block[]` (`{ id, blockType, content, sortOrder }`).
- **Shared renderer:** `src/components/PublicWebsite/BlockRenderer.tsx` — a big `switch` on
  block type, used by BOTH the public site and the editor preview.
- **Editor:** `src/components/Dashboard/WebsiteEditor.jsx` (huge). Preview is
  `src/components/WebsiteEditor/PreviewPanel.tsx`, which renders blocks as a **React portal into
  an iframe** via `renderPageShellBlocks()` → `DynamicBlockRenderer` → `BlockRenderer`. (There's
  ALSO a srcdoc "live" preview via `src/utils/previewInjector.ts`, but it only handles
  `BLOG_FEED` as a placeholder; the editor uses the React portal for these blocks.)
- **Dynamic data:** `src/hooks/useDynamicBlockData.ts` website-scopes datasources: `blog?...` →
  `/api/websites/:id/blogs/public`, `blog-article?identifier=slug` →
  `/api/websites/:id/blogs/public/<slug>`.
- **Blog data manager UI:** `src/components/Dashboard/WebsiteManageInsights.jsx` (owner manages
  posts). Article content is normalized to a shared "insights" model via
  `src/utils/insightsNormalizer.ts` → `normalizeInsight()` (yields `blocks[]` of type
  `section|quote|keyTakeaway|conclusion|code` + `format{readTimeMinutes,excerpt,tags}` + author).
- **Theme color:** blocks receive `primaryColor` as a prop and derive all accents from it.
- **Pages/blog tab:** `src/components/Dashboard/website-manage/PagesTab.jsx` has
  `handleAddBlogPage`, `handleDeletePage`, the pages table, and menu/navbar helpers.
- **Gotcha:** `src/components/Dashboard/Dashboard.jsx` contains non-UTF8 bytes — plain `grep`
  returns nothing; use `grep -a`.

---

## 4. THE BACKEND ENUM CONSTRAINT (critical — do not forget)

`PUT /api/websites/:id/pages/:pageId/blocks` **rejects unknown `blockType`s** with a 400.
Confirmed allowed set (from the error body):

```
HERO, FEATURES, TESTIMONIALS, CTA, CONTACT, TEXT, IMAGE, NAVBAR, FOOTER, GALLERY, COLLAGE,
PRICING, FAQ, STATS, TEAM, VIDEO, FORM_BUILDER, BLOG_FEED, BLOG_ARTICLE, PRODUCT_SHOWCASE,
DIRECTORY_LISTING, BEFORE_AFTER, ANNOUNCEMENT_BAR, LOGO_CAROUSEL, COUNTDOWN, TABS,
STEPS_PROCESS, TABLE, SOCIAL_EMBED, EMBED, MENU_DISPLAY, MAP_LOCATION, NEWSLETTER, REVIEWS,
EVENTS_LIST, PORTFOLIO_GRID, WORKING_HOURS, RESERVATION_FORM, IMAGE_TEXT_SPLIT, MARQUEE,
STORY_PANEL, DECORATIVE, SECTION
```

`BLOG_HERO`/`BLOG_FEATURED`/`BLOG_GRID` are **NOT** in it. `BLOG_ARTICLE` **IS**.

**Workaround (mirrors the existing `WEBSITE_HEADER → NAVBAR` trick):** the 3 index blocks are
persisted as **`BLOG_FEED` + `content._subType`** (`blog_hero`/`blog_featured`/`blog_grid`) and
remapped back to the real type on load/render. The backend must preserve the extra `_subType`
key in `content` — this is assumed (same assumption `WEBSITE_HEADER` relies on) and appeared to
hold, but hasn't been exhaustively verified.

Round-trip lives in:
- **Save (real type → carrier):** `sanitizeBlockForSave()` in `WebsiteEditor.jsx`
  (`BLOG_SECTION_TYPE_TO_SUBTYPE` map).
- **Load (carrier → real type):** `normalizeLoadedBlock()` in `WebsiteEditor.jsx`
  (`BLOG_SECTION_SUBTYPE_TO_TYPE` map). Applied on every load path.
- **Render (carrier → real type):** top of `BlockRenderer.tsx` component — `renderBlockType`
  resolves `_subType` before the `switch`.
- **Seeding (POSTs carrier directly):** `PagesTab.jsx handleAddBlogPage`.
- **Editor state uses the REAL type** (BLOG_HERO etc.); only at-rest in the DB is it BLOG_FEED.

`BLOG_ARTICLE` needs no workaround (it's in the enum).

---

## 5. What has been built (all in the working tree)

### 5a. The 3 index blocks + shared module
- `src/components/PublicWebsite/dynamic/blogSectionShared.tsx` — shared helpers +
  `BlogInsightCard` (featured + small variants, matches `Blog.tsx` `ArticleCard`) +
  `FadeInImage` (blur-up on load) + color helpers `normalizeHex`, `hexToRgba`, `resolveAccent`
  + `BlogCardSkeleton` + tokens (`BLOG_ACCENT` fallback, `blogHeroFont`).
- `src/components/PublicWebsite/dynamic/BlogHeroBlock.tsx` — presentational dark gradient hero
  (eyebrow, stroke-accent headline word, description). Filters intentionally live in the grid,
  NOT the hero (block-split means hero can't drive a separate grid's filter state). Glow
  gradients + accent word derive from `primaryColor`. Treats legacy `accentColor === "#398c91"`
  as "unset" so old seeded heroes follow the theme.
- `src/components/PublicWebsite/dynamic/BlogFeaturedBlock.tsx` — big featured card. Owner picks
  the post by slug (`content.postSlug`); blank → latest published. Website-scoped fetch.
- `src/components/PublicWebsite/dynamic/BlogGridBlock.tsx` — small-card grid + search + category
  filter pills + pagination. All accents from `primaryColor`.
- Registered in: `BlockRenderer.tsx` (lazy cases), `src/components/Editor/blockPresets.ts`
  (`getBlockDefaultContent` + `getLocalFieldMetadata`), `src/components/Editor/BlockLibrary.tsx`
  (`FRONTEND_BLOCKS`, **UPPERCASE keys** `BLOG_HERO` etc. to match the case-sensitive switch).

### 5b. Theme color everywhere
Every hardcoded teal (`#048e84`, `#378C92`, `#1c666b`, `#00c5b8`, `#398c91`, `#208188`) was
replaced with derivations of the site `primaryColor` (`hexToRgba`/`alpha`/`resolveAccent`).

### 5c. Public color-source fix (important — was a real bug)
On the published site, template pages read theme from `__templateTheme` baked into block
content (fresh), while block-based pages (blog) read the scalar `website.primaryColor` (served
**stale** by the `/slug` endpoint — confirmed: authed `/websites/176` != public
`/websites/slug/grocery-in`). Result: home updated, blog didn't.
**Fix in `src/pages/PublicWebsite.tsx`:** added `effectivePrimaryColor =
frontendTemplateData?.primaryColor || website.primaryColor || "#378C92"` and routed all block
renderer `primaryColor` props through it (verified `frontendTemplateData.primaryColor` resolves
from `readTemplateThemeSettingsFromPages(pages)` — the fresh baked theme).

### 5d. Live-preview + save persistence fixes (`WebsiteEditor.jsx`)
- The live-edited palette lives in `templateThemeSelection` (dirty-tracked), not
  `website.primaryColor`. `updatePreviewContent` now feeds the **live** resolved color into
  `websiteMeta.primaryColor` (`livePrimaryColor = resolveTemplateThemeSelection(...)?.palette
  ?.primary || website.primaryColor`) so block pages update live.
- On save, the `website.primaryColor` PUT **and** `injectTemplateThemeSettingsIntoBlocks` now
  fire on **any dirty theme change** (previously only `selectedPage?.localOnly`), so the theme
  actually persists for already-saved pages.

### 5e. Preview debounce (`src/context/PreviewContext.tsx`)
Measured lag ≈ 600ms = the 300ms `updatePreviewContent` debounce + render. Added an
`immediate?: boolean` param to `updatePreviewContent` to bypass the debounce for discrete
changes (theme clicks). **This is currently INERT** — no caller passes `immediate=true` yet.
Either wire it (pass `immediate` for theme-triggered updates in `WebsiteEditor.jsx`'s
`updatePreviewContent` effect) or revert it.

### 5f. Design port from the updated public pages
- **Listing:** `FadeInImage` blur-up wired into both card variants in `blogSectionShared.tsx`.
- **Detail:** `src/components/PublicWebsite/dynamic/BlogArticleBlock.tsx` was **fully rewritten**
  to mirror `BlogDetail.tsx`: full-bleed dark hero (breadcrumb, category badge, read-time, big
  title, author row, tags + share buttons), two-column body with a **sticky sidebar** (scroll-spy
  TOC + Author Bio + Related Articles), styled `section/conclusion/quote/keyTakeaway/code`
  blocks, image + caption, bottom tags, footer actions (share / copy-link w/ tooltip / helpful
  vote), "You might also like" grid, fade-in-on-view. All accents from `primaryColor` (builds a
  `ui` palette from it). Preserves data fetch / SEO context (`BlogArticleSeoContext` — still
  exported, imported by `PublicWebsite.tsx`) / `BlogComments`. **Full-bleed `100vw` kept per
  user's explicit choice** (caveat: can add a horizontal scrollbar on templates whose root lacks
  `overflow-x:hidden`; one-line fix if it appears).
- Two deliberate simplifications vs the source: no per-card 2s skeleton-overlay reveal (fragile
  timers); featured loading skeleton uses standard card shape.

### 5g. Option A — editable "Blog Detail" page (JUST BUILT, this is the current thread)
Goal: make the detail block's **layout stylable per element** in the editor while its **content
stays post-driven**, with the Detail page **bound to the Blog page** (auto-created/deleted, in
Pages tab but NOT navbar).
- `BlogArticleBlock.tsx`: **template mode** — `resolvedIdentifier = content.postIdentifier || ""`
  (URL params intentionally dropped: on tenant routes they carry the *website* slug/id, not the
  post's). No identifier → fetch **latest published post** as preview; if none → a structured
  `PLACEHOLDER_POST` so every element is present to style. SEO/comments skip template mode.
- `PublicWebsite.tsx`: `/blog/:slug` now renders **the saved `BLOG_DETAIL` page's `BLOG_ARTICLE`
  block** (keeps its real page/block ids so per-element overrides could resolve) with
  `postIdentifier` swapped to the visited slug — so authored styling flows to every article.
  Legacy fallback (synthetic default-styled block) preserved.
- `PagesTab.jsx`: `handleAddBlogPage` also creates a `BLOG_DETAIL` page (`path: '/blog-detail'`,
  `pageType: 'BLOG_DETAIL'`) with one `BLOG_ARTICLE` block, **no menu/navbar entry**;
  `handleDeletePage` **cascades** (deleting the Blog index also deletes the Detail page); the
  Detail row has **Delete + visibility toggle disabled** (locked). Detail-page creation is
  wrapped in try/catch (in case backend rejects `pageType: 'BLOG_DETAIL'` — public then falls
  back to default styling).
- `blockPresets.ts`: `BLOG_ARTICLE` default content `{showTableOfContents, showRelated,
  backButtonLink}` + `getLocalFieldMetadata` exposes only layout toggles (TOC / Related), not
  heading/body.

---

## 6. THE CURRENT OPEN PROBLEM (what to work on next)

The user requires: **"style/placement/sizing for each and every element — bg colors, text
colors, sizes, placement — for BOTH the blog and blog-detail pages,"** and for it to show to
visitors.

Verified state:

| Styling | Editor (WYSIWYG) | Public site (block-based pages) |
|---|---|---|
| Theme accent color | ✅ | ✅ (5c fix) |
| Container/section styles (bg, padding, width, borders, visibility via `BlockWrapper`, stored in block `content`) | ✅ | ✅ |
| **Fine per-element overrides** (select one heading → recolor/resize — the editor "Static Style"/Typography panel) | ✅ shows | ⚠️ **does NOT re-apply** |

**Why:** the per-element overrides are stored as `__editorStaticStyleOverrides` (keyed by
page+block+element via `src/templates/frontendTemplateStaticOverrides.ts`). They are applied to
the DOM only:
- in the **editor** by `PreviewPanel.tsx` (walks the iframe DOM, annotates elements
  `data-fallback-selectable`/`data-fallback-id`, applies overrides), and
- on the public site **only through the template-engine path** (`frontendTemplateData` →
  `templateContent.__editorStaticStyleOverrides` → `landingTemplates`/`TemplateEngine`).

`BlockWrapper` (`src/components/PublicWebsite/BlockWrapper.tsx`) does NOT emit stable element
ids and does NOT apply these overrides, and `PublicWebsite.tsx` only forwards them to template
data — never to block bodies. So **fine per-element styling is a pre-existing gap for ALL
block-based pages, not just blog.** This is the gap standing between "style every element in the
editor" and it reaching visitors.

**Two paths (get user's decision — they were about to choose):**
1. **Ship as-is:** Blog + Detail fully connected; theme + section/container-level styling live on
   public; full WYSIWYG in the editor. (Fine per-element overrides stay editor-only.)
2. **Close the gap (bigger, benefits ALL blocks):** make block renderers emit stable element ids
   + add a public-side applier that re-applies persisted `__editorStaticStyleOverrides` to
   matching elements on block-based pages. Cross-cutting — scope carefully, confirm first.

---

## 7. Decisions already locked (with rationale)
- **Featured post** = owner picks by slug, else latest. (Block split; no shared filter state.)
- **Hero pills** = none; filters live in the grid. (Blocks are independent/movable.)
- **Full-bleed** = keep true `100vw` on the detail hero (user chose exact-match look).
- **Detail editor preview** = latest published post, structured placeholder if none.
- **Detail page in Pages tab** = visible but locked (no delete, no visibility toggle, never in
  navbar; removed only via cascade when the Blog page is deleted).

---

## 8. Files touched (all uncommitted; user builds/commits)
- `src/components/PublicWebsite/dynamic/blogSectionShared.tsx` (new)
- `src/components/PublicWebsite/dynamic/BlogHeroBlock.tsx` (new)
- `src/components/PublicWebsite/dynamic/BlogFeaturedBlock.tsx` (new)
- `src/components/PublicWebsite/dynamic/BlogGridBlock.tsx` (new)
- `src/components/PublicWebsite/dynamic/BlogArticleBlock.tsx` (full rewrite)
- `src/components/PublicWebsite/BlockRenderer.tsx` (register + `_subType` resolver)
- `src/components/Editor/blockPresets.ts` (defaults + field metadata for the 4 blocks)
- `src/components/Editor/BlockLibrary.tsx` (`FRONTEND_BLOCKS` entries)
- `src/components/Dashboard/WebsiteEditor.jsx` (save/load `_subType` remap; live-preview +
  save-persistence theme fixes)
- `src/pages/PublicWebsite.tsx` (`effectivePrimaryColor`; render detail from saved BLOG_DETAIL
  block)
- `src/components/Dashboard/website-manage/PagesTab.jsx` (seed/cascade/lock Detail page)
- `src/context/PreviewContext.tsx` (INERT `immediate` param — wire or revert)

Sanity: `npm run type-check` was clean after each earlier milestone; the latest Option-A edits
were NOT built (per the user's instruction). Read-checked for coherence. **Run type-check first
thing if the user permits, or ask.**

---

## 9. Known unknowns / risks
- Backend acceptance of `pageType: 'BLOG_DETAIL'` (handled defensively; verify).
- Backend must preserve `content._subType` and other unknown keys (assumed; same as
  `WEBSITE_HEADER`).
- The website blog **list** endpoint (`blog?limit=1`) may return summaries without full authored
  `blocks[]`; `normalizeInsight` derives sections from `headings`/`description`, so the latest-
  post preview still renders, but may lack `quote`/`code` element types to style. A rich post or
  the placeholder covers all element types.
- **AI editability:** the AI element-edit (`src/components/WebsiteAI/`) targets an `aiEditKey`
  from the backend `/api/websites/:id/editable-schema`. Live check showed **0 `aiEditKey`s** on
  the blog blocks in the DOM (they persist as `BLOG_FEED`+`_subType`), though the generic
  fallback selection + the "Ask AI" pill DO appear. So element/section selection + styling work;
  reliable field-level AI rewrites of the custom blog fields are NOT guaranteed and likely need
  the backend schema to become `_subType`-aware.
- Editor content fields DO work: verified the `BLOG_HERO` property panel shows
  Eyebrow/Heading/Accent Word/Description/Accent Color; `BLOG_FEATURED`/`BLOG_GRID` have theirs.

---

## 10. Suggested first moves for the next AI
1. Ask the user which path for §6 (ship-as-is vs close the per-element gap). Don't start the big
   cross-cutting change without confirmation.
2. If continuing Option A: verify live in the editor (Playwright, §2) that the **Blog Detail**
   page appears in the Pages tab, opens, renders the latest post, and its elements are
   selectable/stylable; and that deleting the Blog page cascades. Then decide the `immediate`
   debounce param (wire or revert).
3. Keep the memory file updated: `~/.claude/.../memory/website-blog-feature.md` (and MEMORY.md
   index) track this feature's status.
