# New Template Architecture PRD

## 1. Purpose

Define the required architecture for adding website templates without duplicating the large custom structure of `CompanyStudioTemplate.tsx`. New templates must compose shared editor-aware primitives, use backend-safe `block.content`, and behave consistently in the editor, saved Live Preview, and public rendering.

This PRD governs implementation of new templates. Backend schema changes remain out of scope unless a genuinely new reusable content structure is reviewed and approved separately.

## 2. Goals

- Make Company template architecture reusable across every future template family and variant.
- Keep each template file focused on unique visual composition rather than editor plumbing.
- Ensure every real content and style edit has one stable persisted source of truth.
- Preserve clean section boundaries, global website chrome, local assets, and predictable editor behavior.
- Make future fixes land in shared helpers instead of being repeated across template files.

## 3. Non-goals

- Do not introduce a new template through one-off architecture or incomplete registration.
- Do not redesign existing templates.
- Do not change backend schemas or database structure in this phase.
- Do not create generic DOM-to-content guessing or frontend-only persisted fields.

## 4. Template Architecture

### 4.1 Required page composition

Every page must use this hierarchy:

```tsx
<TemplatePage>
  <SharedHeader />
  <TemplatePageBody>
    <EditableSectionShell sectionKey="hero" block={heroBlock}>
      <HeroLayout />
    </EditableSectionShell>
    <EditableSectionShell sectionKey="features" block={featuresBlock}>
      <FeatureLayout />
    </EditableSectionShell>
  </TemplatePageBody>
  <SharedFooter />
</TemplatePage>
```

- Header and Footer are website-global components reused across all pages.
- Page body blocks are page-specific.
- Each block-list section renders as an independent top-level sibling.
- A section must never be nested inside another section wrapper.
- Cards, grids, columns, and inner wrappers remain children of their owning section.

### 4.2 Template page types

A new template must explicitly declare one of these page models:

- **Single-page template:** defines one Home page containing all default
  page-specific sections. If a user creates another page later, it begins with
  shared Header/Footer and an empty or explicitly selected default body; it
  must not copy Home body sections.
- **Multi-page template:** defines Home plus one or more default pages such as
  About, Services, Blog, or Contact. Each page owns its own body sections and
  unique title, slug/path, and sort order. Page bodies are never shared unless
  the block is explicitly a global component. Live Preview from the editor
  must open the currently selected page at its resolved public path (for
  example, `/site/:siteSlug/about`), not always Home.
- **Link Hub / link-in-bio template:** single-page by default (Home `/` only).
  See `LINK_HUB_TEMPLATE_PRD.md` and Link Hub rules below.

When upgrading old templates to the new standard, preserve existing approved
visual design and assets, but refactor content/styling/navigation into
backend-safe editable persisted fields.

**Visual fidelity rule:** When upgrading an old approved template, visual
fidelity must be preserved. Refactor logic/editability only; do not change
approved design, layout, spacing, typography, image composition, or mood
unless explicitly requested.

**Strict upgrade rule:** Old template code may only be used as visual
reference/assets. It must not be reused if it produces static/style-only
editor elements. Every upgraded template must pass an editability audit after
website creation (text, images, backgrounds, buttons, and form fields must
open real persisted content paths — not “Static style / not saved”).

For both models, Header and Footer are shared/global components rendered on
every page. Editing shared chrome from any page updates every page; do not
duplicate Header/Footer inside page bodies.

### 4.3 Shared layout responsibilities

New templates must use shared components/helpers for:

- top-level section wrapper and independent section boundary metadata
- inner page-width container
- editable section shell and section selection behavior
- card/container wrapper with stable container identity
- split and grid layout shells
- `sectionStyle` and nested `containerStyles` resolution
- `hiddenElements` and `hiddenContainers`
- editable/selectable metadata
- text, image, video, button, link, icon, and media wrappers
- global Header and Footer wrappers

**Icon fields:** Templates should not expose raw icon text fields when an icon
picker is available. Icon fields must use the reusable Icon Library modal
(`FieldType.ICON` / `IconField`) and persist saved icon values in the canonical
string form (`lucide:<name>`). See `ICON_LIBRARY_PRD.md`. Legacy plain strings
(e.g. `phone`, `star`) remain supported via renderer aliases.

Template-specific JSX is allowed only where the visual layout is genuinely unique. Editor metadata, persistence wiring, hidden-state handling, and style resolution must not be reimplemented inside each template.

## 5. Required Shared Files and Components

### 5.1 Existing utilities to use

- `src/landingTemplates/utils/editableComponents.tsx`
  - `EditableSection`
  - `EditableText`
  - `EditableBox`
  - `EditableButton`
  - `EditableLink`
  - `EditableImage`
  - `renderEditableMedia`
  - `EditableContainer`
  - `EditableCard`
  - `StaticSelectableBox` only for decorative content
- `src/landingTemplates/utils/editableProps.ts`
  - editable text, image, section, and static metadata builders
- `src/landingTemplates/utils/containerStyle.ts`
  - stable container IDs and persisted container-style application
- `src/landingTemplates/utils/hiddenElements.ts`
  - hidden element/container lookup and updates
- `src/landingTemplates/utils/sectionStyle.ts`
  - section style DOM props and resolved `sx`

### 5.2 Shared abstractions required for new templates

The implementation phase should provide or reuse project-equivalent components under a shared landing-template location:

- `TemplatePage`: page-level structure and global chrome slots
- `TemplatePageBody`: ordered page-specific section list
- `EditableSectionShell`: top-level section boundary, section metadata, styles, and hidden state
- `TemplateInnerContainer`: consistent page width and horizontal spacing
- `EditableContainerShell`: stable nested `containerStyles` identity
- `EditableCardShell`: card selection, hidden state, and container styles
- `TemplateSplitLayout` and `TemplateGridLayout`: reusable responsive layout only
- `SharedTemplateHeader` and `SharedTemplateFooter`: global website Header/Footer wrappers

Names may follow repository conventions during implementation, but responsibilities must remain centralized. Existing `CompanyStudioTemplateHeader` and `CompanyStudioTemplateFooter` should be generalized or wrapped rather than copied into a new template.

## 6. Backend-safe Data Model

`block.content` is the source of truth. New templates must map content to existing supported structured fields:

- `heading`
- `subheading`
- `body` / `description`
- `image` / `imageStyle`
- `features[]`
- `items[]`
- `stats[]`
- `testimonials[]`
- `detailGroups[]`
- `socialProof`
- `splitContentCards`
- `members[]`
- `sectionStyle`
- `containerStyles`
- `hiddenElements` / `hiddenContainers`

Rules:

1. Do not create random frontend-only content or style paths.
2. Repeated visual data must use the structured repeater owned by that section.
3. Do not reuse another visual section's array merely to force persistence.
4. Every duplicated block type must retain stable block and `editorSection` identity.
5. If a new visual structure cannot fit an existing schema without collision or semantic misuse, add a backend follow-up before implementation.
6. Decorative-only elements may use explicit static selection, but real user-facing content must be schema-backed.
7. Repeated content must render from the complete persisted array. Do not
   hardcode a visual slice that silently hides items added through the editor;
   use responsive pagination, a carousel, or another accessible overflow pattern.

### 6.1 Page and global component model

Each persisted page must contain a page ID, title, unique slug/path, sort
order, and page-specific blocks. The global website owns shared Header, shared
Footer, `themeSettings`, and `globalComponents` when available.

Website creation creates declared default pages once only. Existing pages and
their blocks must be updated by page ID; Save Changes must never recreate a
path that already exists. New-page creation must validate path uniqueness
before creation.

**Multi-page creation and routing gate (required):** A multi-page template is
not complete until every declared default page is persisted as a real page
record with its own blocks during website creation—not merely stored in a
template snapshot or rendered as a frontend fallback. The dashboard page count
and Manage Pages list must reflect those persisted records. Each Header
navigation path must match an existing persisted page path, and public routing
must resolve that path to the matching page body; changing the URL while
continuing to render Home is a release blocker. Save Changes must identify and
update pages by `pageId`, never recreate an existing path.

**Backfill and canonical-page API rule:** Templates introduced after websites
already exist must provide an idempotent backfill for missing declared default
pages. The backfill and initial template creation must use the same canonical
page creation and block replacement APIs as Dashboard Add Page/Add Blog Page;
never maintain a separate preview-only page list. The editor page dropdown
must load these persisted records and render the selected page's own blocks.

**Page-specific renderer rule:** Every declared page in a multi-page template
must have real page-specific default blocks and an explicit renderer/design
mapping in both the editor and public site. A Home-only template renderer is
insufficient: editor selection must identify the active persisted page and
render that page's own design. Generic block fallback is allowed only when it
is intentionally part of the page design, never as an accidental substitute
for a declared template page.

**Non-Home editability rule:** About, Courses, Contact, and every other
declared non-Home page have the same editability and persistence contract as
Home. A page-specific renderer must bind every user-facing heading, body,
eyebrow, image, button/link, card/repeater item, statistic, team member, and
form label to a real backend-safe `block.content` path. Static JSX is allowed
only for decorative, non-user-facing visuals. Acceptance requires editing a
non-Home text, image, and button; saving; then verifying the change in Live
Preview/public rendering and after editor refresh.

**Content-mapping / unique-field-path gate (required):** Before a new template
is considered complete it must pass a content-mapping audit:

- **Preview must equal creation defaults.** The landing-preview content and the
  content created when a website is generated from the template must come from
  the same single source of truth (the schema seeds in
  `frontendTemplateEditorSupport.ts`). Do not maintain a separate hardcoded
  preview object with different copy. If a preview screen needs its own data
  object, build it from the same schema/seed pipeline (e.g.
  `buildFrontendTemplateEditorPages` + `buildTemplatePreviewBusinessData`) so
  the two can never drift.
- **Every visible element needs a unique persisted field path.** Two different
  visible elements must never bind to the same `(blockId, field)`. A page banner
  heading and a body-section heading are different elements and must live in
  different blocks/fields — never both on `heading` of the same block. The same
  applies to `eyebrow`, `image`, `description`, `ctaText`, `buttonLabel`, etc.
- **Repeated visual items must use array indexes**, e.g. `features[0].title`,
  `items[1].heading`, `stats[2].number`, `testimonials[0].quote`,
  `members[1].role`, `detailGroups[0].items.0` — never a single reused
  top-level field for multiple cards.
- **Multiple headings in one section** must use structured/array fields, not a
  second element pointing at the same `heading`.
- **Pages must not share body content.** Home/About/Courses/Contact bodies must
  each resolve from their own page's persisted blocks. Only Header/Footer (and
  other explicitly global components) may be shared across pages.
- **A dedicated hero/banner must own its own block.** A non-Home page banner
  must not reuse the first body section's block; give it its own `banner` (or
  equivalent) block so editing the banner never mutates the body section and
  vice-versa.
- **Acceptance:** editing one text, one image, or one button/pill must update
  only that element — never an unrelated element on the same page or another
  page. Save, Live Preview, and editor refresh must all preserve the change on
  the correct field only.

**Persistence round-trip gate (required):** Every editable element on every
page must round-trip through save → reload → public rendering. A correct save
response is NOT sufficient proof — the next GET/reload must return and render
that same value.

- **Reload/public hydration must read saved blocks, never template defaults.**
  Template seed/default content may only fill fields that were never saved. It
  must never overwrite a persisted value (including an intentionally emptied
  value).
- **Per-page hydration for multi-page templates.** When merging persisted
  blocks over schema seeds, each page must be hydrated from _its own_ persisted
  page's blocks. A global or Home-scoped section map must never be used to
  hydrate non-Home pages, because multi-page templates reuse section keys
  (`banner`, `intro`, `features`, `stats`, `contact`) across pages. A
  Home-scoped map drops non-Home saved content or bleeds Home content onto
  About/Courses/Contact. (Shared logic lives in
  `hydrateSeededPages`/`buildFrontendTemplateEditorPages` and is used by both
  the editor reload and `PublicWebsite`.)
- **Save updates the selected page by `pageId`.** Non-Home saves must target
  that page's record and blocks, never Home's.
- **No real content may be static/style-only.** Multi-page templates must
  render saved page-specific blocks, not hardcoded fallback content.
- **Mandatory verification before a template is considered complete:** edit a
  non-Home page element (text, image, button), Save, hard-reload the editor,
  and open the public page — the edited value must appear in all three places.

**Editable background image/video gate (required):** Any visible background
image or video on a section, banner/hero, card, or container must be wired to
persistent, editable `sectionStyle` / `outerSectionStyle` / `containerStyles`
(or a content image field) — never a hardcoded, non-replaceable asset.

- **Never render a full-bleed background as an absolutely positioned `<img>`
  that covers the section.** The editor's "Replace Background → Image" persists
  to `sectionStyle`/`outerSectionStyle.backgroundImageUrl`, which
  `TemplateSectionBoundary` applies as a CSS `backgroundImage`. An `<img>`
  overlay with `object-fit: cover` hides that CSS background, so the
  replacement saves but never shows. Render the background as a CSS
  `backgroundImage` on the section boundary instead, and layer any
  gradient/overlay as a separate absolutely positioned element above it.
- **Background resolution priority (highest → lowest):**
  1. saved `sectionStyle`/`outerSectionStyle`/`containerStyles`
     `backgroundImageUrl` (or `backgroundVideoUrl`)
  2. saved `block.content` image field (when the section intentionally uses a
     content image)
  3. theme/template default asset
- **Manual editor replacement must override the template default.** A default
  asset passed via the component `sx` must be applied _before_
  `getSectionStyleSx`, so a saved background wins. The default must never
  overwrite a saved background.
- **`TemplateSectionBoundary` merge order (required):** The shared boundary must
  apply `sx` template defaults first, then saved `sectionStyle` /
  `outerSectionStyle` via `getSectionStyleSx` last. If defaults are merged
  after saved styles, hardcoded `backgroundImage: url(defaultAsset)` in page
  JSX will visually win and "Replace Background → Image" will appear to save
  in the right panel while the canvas never updates. New templates must not
  reverse this order and must not cover the CSS background with an absolute
  `<img>`.
- **Acceptance:** select a section/card/container with a background image on
  Home AND a non-Home page, Replace Background → Image, confirm the canvas
  updates, Save, reload the editor, and open the public page — the new
  background must appear in all of them.

## 7. Section and Container Identity

- Section roots require stable block ID, section key, label, style key, and section-root metadata.
- Nested selectable surfaces require a stable container ID unique within their block, such as `hero.inner`, `features.card.0`, or `contact.form`.
- Separate visual containers must not share a `containerStyles` key.
- Empty/background clicks select the section root.
- Explicit content targets take priority over cards and containers.
- Explicit cards/containers take priority over the parent section only within their visible surface.
- Add-section controls appear only for top-level sections.

## 8. Editor Behavior Contract

Every new template must support:

- exact text, link, button, icon, image, and video selection
- explicit card and nested-container selection
- parent-section selection on empty/background clicks
- background color, image, video, animated background, and reset
- persistent `sectionStyle` and `containerStyles`
- deletion/hiding of text, image, video, button, link, div, container, card, and section
- undo/redo through the existing editor state pipeline
- `Save Changes` using the actual block content and style state
- saved Live Preview matching the editor after save
- editor refresh hydrating the same saved state

Controls must not claim persistence when they only patch the DOM. If a control is displayed, it must update a backend-safe path included in the save payload.

### 8.1 Theme and font customization contract

Every new template must support the existing theme palette and font-pack
customization system in landing preview, editor canvas, saved Live Preview, and
public rendering.

- Resolve primary/secondary colors, backgrounds, surfaces, text, borders,
  accents, buttons, and section theme styles from shared theme helpers/tokens.
- Resolve heading and body typography from `themeSettings.headingFont` and
  `themeSettings.bodyFont`, with template defaults only as fallbacks.
- Do not hardcode non-token colors or font families for customizable UI.
- A palette or font selection must update the rendered template immediately;
  it must not require an editor refresh, save, or template-specific override.
- Resolve visual styles in this order: saved `sectionStyle`/`containerStyles`,
  then theme tokens, then template defaults. A saved manual editor style must
  never be overwritten by a theme or template `sx` default.
- Acceptance requires changing a section background in the right editor and
  confirming it persists in the editor, Live Preview/public output, and after
  refresh.

## 9. Header and Footer

- Header and Footer are global website components, not page-local duplicated sections.
- Every page renders the same enabled global Header and Footer wrappers.
- Header/Footer content and styles must use their canonical global component state.
- Page body ordering, hiding, deletion, or replacement must not remove global chrome.
- Template-specific Header/Footer visuals should be implemented as variants of shared wrappers, not copied page JSX.
- Header and Footer brand text must use persisted editable fields (for example,
  `brandName` and `logoText`), with the website/business name only as the
  initial fallback; real brand text must never be static/style-only.
- Header/Footer image logos must use their schema-supported URL media field
  (for example, `logo` or `logoImage`) and editable image metadata. URL-only
  logo fields must not contain text, while text brand fields must not contain
  media.
- Brand edits through shared Header/Footer chrome must persist and render across
  every page, editor refresh, Live Preview, and public output.

### 9.0 Header/Footer colors must be theme-token driven (shared helper)

- All templates must use **shared, theme-aware Header/Footer color logic** — do
  not hardcode Header/Footer background/text colors inside individual templates
  when they should follow the palette.
- Header background and Header/Footer text/CTA colors must derive from the
  active theme palette so that changing the palette in landing-preview or the
  editor updates the Header consistently across **every** template, not just one.
- Use the shared resolver `buildSharedHeaderTheme(data, navbar, { defaultPrimary })`
  in `src/landingTemplates/utils/headerTheme.ts` for any template rendering the
  shared `TemplateNavbarHeader`. It centralizes the working Education Pro logic:
  the header background follows the palette's primary color, and nav/CTA text
  flips light-on-dark or dark-on-light for readability.
- Templates **may** define a transparent header default via
  `defaultBackground: "transparent"` (and `transparentText: "light" | "dark"`)
  so the Header can sit over a hero/banner. Transparent defaults must keep
  logo/nav/CTA readable on the hero, and may use a scrolled solid/readable
  variant when the page body is light.
- **Style priority (highest → lowest):**
  1. saved manual header style — `sectionStyle`/`outerSectionStyle`/
     `containerStyles` `backgroundColor` persisted from the editor
  2. theme/header style when the template uses palette-driven solid headers
     (`themeSettings.primaryColor` / `primaryColor`) — or the template's
     explicit `defaultBackground` when that opt-in is set (e.g. transparent)
  3. template default primary color (solid) when no transparent default is set
- A manual editor background override on the Header must always win over both
  transparent template defaults and theme/palette colors, and must persist
  across Save, editor refresh, Live Preview, and public output.
- **Acceptance:** change the palette on any template in landing-preview and in
  the editor — the Header background must update immediately (unless the
  template uses a transparent default and no manual bg is set); then set a
  manual Header background from the right editor and confirm it overrides the
  palette/transparent default and persists after reload/public render.
  Plumbing Pro: default Header is transparent over Home hero and inner-page
  blue banners; manual Header background still overrides.

### 9.2 Template internal links must stay inside the website

Template Header nav, Footer links, and in-section CTA buttons must resolve to
the **current website / landing-preview** page routes — never the main platform
root (e.g. `localhost:5173/about`).

Rules:

- Store relative paths in content (`/about`, `/contact`, `/services`, `/courses`).
- At render time, resolve every internal `href` with
  `resolveTemplateInternalLink` from
  `src/landingTemplates/utils/resolveTemplateLink.ts` (or an equivalent shared
  helper that wraps it). Do not put bare `/about`-style paths on buttons.
- Resolution bases (in order):
  1. Public site: `/site/:slug` + path
  2. Landing preview: `/landing-preview/:templateId` + path
  3. Optional `__siteSlug` from `templateContent` when not on those routes
- Absolute URLs, `#` anchors, `mailto:`, and `tel:` pass through unchanged **at
  render time only**. Seed/default content in the creation payload must still
  obey §9.2.1 (backend `url-or-path` validation).
- Shared Header (`TemplateNavbarHeader`) and every section CTA / Footer column
  link must use the same resolver. Header-only fixes are not enough — body
  buttons like “Read More”, “Get Started”, and “Request a Quote” must also
  resolve.
- Multi-page templates must link to real persisted page paths that exist for
  that template.
- **Acceptance:** on a created Gardening Pro / Education Pro site, hover Header
  nav and body CTAs — status URLs must show `/site/:slug/...` (or the
  landing-preview equivalent), never bare `/about` or `/contact` on the
  platform root. Verify landing-preview, editor Live Preview, and public site.

### 9.2.1 Template Link Validation Rule

All template default CTA/link fields that are included in the creation payload
must be valid backend `url-or-path` values. Do not use empty strings, placeholder
text, raw labels, or unsupported schemes. Prefer internal paths like
`/contact`, `/about`, `/services`, or `/booking`. If a link is optional and
empty values are not accepted by backend validation, omit the field instead of
sending an empty string. Before adding a new template, validate all CTA fields
in HERO, CTA, NAVBAR, FOOTER, CONTACT, SERVICES, and FEATURE blocks.

Additional rules for seed data (`frontendTemplateEditorSupport` /
`buildContent`):

- Do **not** put `tel:` or `mailto:` in default `ctaLink`, `ctaSecondaryLink`,
  `buttonLink`, `primaryCtaLink`, `secondaryCtaLink`, or similar payload fields
  unless the backend `url-or-path` format explicitly allows those schemes.
- Phone/email may still appear as display text (`ctaText`, `phone`, `email`).
  Templates may build `tel:`/`mailto:` hrefs at render time from those display
  fields when the persisted link is a normal path.
- Safe defaults: `/contact`, `/about`, `/services`, or `https://example.com`.

### 9.2.2 Required Nested Content Rule

All template default array items must include every backend-required field. For
FEATURES blocks, each `content.features[]` item must include a non-empty
`title` and `description`. AI-generated content must not replace a complete
default item with an incomplete item. When AI output omits required nested
fields, merge it over defaults and preserve required fallback values.

Also verify other common nested arrays before shipping a template:

- `features[].title` / `features[].description`
- `members[].name` / `members[].role`
- `items[].heading` / `items[].value` (when used as stats)
- `cards[].description` (when present in creation payload)

Do not send empty strings for required nested fields. Prefer a short real
sentence over omitting `description`.

### 9.3 Header menu must sync with real website pages

Multi-page templates must keep Header navigation synced with the website’s
real persisted pages (same behavior as Company Executive).

Rules:

- Do not hardcode the only Header nav list when `data.pages` is available.
  Build Header links from published website pages (`data.pages` filtered by
  `isPublished !== false`), with schema/default links as fallback only.
- **Only navigation-eligible pages** may appear in Header. Use page metadata
  (`pageType`, `isNavigationPage`, path) via `isHeaderNavigationPage` /
  `filterHeaderNavigationPages`. Dynamic/detail/system/internal pages must
  **not** auto-appear in Header navigation — including **Blog Detail**,
  article detail routes (`/blog/:slug`), and pages with types such as
  `blog-detail`, `detail`, `system`, `dynamic`, or `isNavigationPage=false`.
- Blog listing (`BLOG_INDEX` / `/blog`, title **Blog**) **may** appear in
  Header; Blog Detail must not.
- Adding a page (including **Add Blog Page**) must make that page appear in
  Header nav after create/refresh without manually editing the menu — unless
  the page is detail/system/non-navigation (above).
- Deleting a page must remove it from Header nav (Manage Pages already strips
  menu/navbar entries; Header must also stop rendering it from `data.pages`).
- Toggling page visibility off must hide the page from Header nav; toggling
  on must show it again.
- Prefer the Company Executive pattern: merge live `data.pages` into
  `sectionNavItems` passed to `TemplateNavbarHeader` (or shared equivalent).
- Menu/API links remain a supplement — when the template supplies an
  authoritative page list, unpublished/deleted pages must not reappear from
  stale menu items. Detail pages must still be filtered out of menu/API
  supplements.
- Links must still resolve through `resolveTemplateInternalLink` / Header
  `resolveTarget` to `/site/:slug/...` routes.
- **Acceptance:** on Education Pro / Gardening Pro / Company Executive, Add
  Blog Page → Blog appears in Header; Blog Detail (if present) does **not**;
  Delete Blog → Blog disappears; visibility off → hidden; visibility on →
  shown again. Verify editor, Live Preview, public site, and refresh.

### 9.4 Dynamic pages must render their own blocks (never Home fallback)

Dynamic pages (Blog index, user-added pages, or any path not declared in the
template’s default page schema) must render **that page’s own persisted
blocks** in editor, Live Preview, and public site.

Rules:

- URL slug change alone is not enough. The editor and public renderer must
  resolve the matching page record by pageId/path and load its blocks.
- Declared multi-page template bodies (Home/About/Services/Contact/etc.) may
  use the template’s full page composers. Dynamic pages must use
  `page-shell` (shared Header/Footer + page blocks), not the Home composer.
- Use `isFrontendTemplateOwnedPagePath(templateId, path)` (or equivalent)
  to decide full-template vs page-shell. Do not force `full` mode for every
  page of a multi-page template.
- If a dynamic page has 0 blocks, show an empty/default editor state for that
  page — never reuse Home sections/blocks.
- Save Changes must update the selected page by pageId.
- **Acceptance:** open Blog from Header or editor page dropdown — canvas and
  `/site/:slug/blog` show Blog blocks (or empty Blog), not Home hero/content.

**Shared overlay Header/Footer on dynamic pages:** Single-page templates with
dynamic page support must apply their shared Header/Footer design consistently
to user-added pages. If Home uses an overlay/transparent header, dynamic pages
(Blog, custom pages, and any navigation-eligible path rendered via page-shell)
must use the same shared header style unless the editor explicitly overrides
header background/styling. Do not substitute a separate solid chrome bar for
dynamic pages when Home’s approved design is an overlay.

### 9.5 Link Hub / link-in-bio templates

Link Hub templates (see `LINK_HUB_TEMPLATE_PRD.md`, e.g. `link-hub-pro`) are
single-page by default and must follow these rules:

- Default seed is Home `/` only — no platform routes like `/contact`.
- All profile fields (avatar, name, handle, bio, background) are editable and
  backend-safe via `block.content`.
- All links must be dynamic (`features[]` / `items[]`), addable, removable, and
  reorderable — never hardcoded static link lists in JSX.
- Each link item persists label, URL (`link`), optional image/icon, and optional
  `isVisible` / `isFeatured` / `type` when used.
- Links must persist and render in editor, Live Preview, public site, and refresh.
- External URLs must not be confused with internal website routes; resolve
  internal paths with the current route helper and open external links safely.
- Every visible element must be editable and backend-safe (no “Static style /
  not saved” on real content).
- Future Pro features (analytics, scheduling, custom domain, QR, pixels,
  multi-hub) should be planned as reusable fields/capabilities — do not hardcode
  pricing gates in the template.
- **NAVBAR navigationItems rule:** If a template includes a NAVBAR block,
  `navigationItems` must never be empty. Single-page / minimal / hidden-header
  templates must still seed at least one valid Home section anchor (for example
  `{ label: "Links", link: "#links" }`) or use an approved no-navbar block
  pattern. Empty `navigationItems: []` fails backend creation validation.
- **Creator visuals:** Profile/header backgrounds must be creator/link-in-bio
  appropriate (local creator assets or CSS abstract/gradient). Do not reuse
  unrelated business/template stock imagery.
- **Visual variants:** Link Hub may have multiple visual skins (e.g. glass
  premium, dark Linktree-style, warm beauty/creator image layouts). All
  variants must share the same persisted profile/link model and editable
  URL/image/icon fields.
- **Mobile-first desktop preview:** Mobile-first templates must still render
  well on desktop by using a centered constrained layout (e.g. ~425px profile
  column), while preserving editor selection/editability. Do not stretch a
  link-in-bio page into a full-width marketing landing on large screens.
- **Mobile-first editability:** Mobile-first link templates must preserve full
  editability for background, avatar, links, social icons, and featured media
  (image replace + URL fields). No visible real content may be static-only.
- **Optional create-modal setup steps:** Special template categories (e.g. Link
  Hub) may insert extra optional steps in Create Website modal. Those steps
  must map only to backend-safe persisted `block.content` fields, must be
  skippable (defaults remain), and must not change the create flow for
  unrelated templates.

### 9.6 Coffee / Cafe single-page templates

Single-page restaurant/cafe templates (e.g. `coffee-pro`) must follow these
rules in addition to the general single-page contract:

- Default seed is Home `/` only — Header nav uses section anchors
  (`#home`, `#about`, `#menu`, `#testimonials`, `#faq`, `#contact`), not
  platform/root routes like `/contact`.
- When users later add real pages, Header menu sync must follow the existing
  dynamic page menu rules (§9.3).
- Menu / product sections are required and must be editable + persisted via
  backend-safe arrays (`features[]` or `items[]`) with unique per-item paths
  for title, description, image, category/tag (`icon`), and price when
  supported.
- FAQ, gallery, testimonials, feature cards, and footer content must be fully
  editable and persisted — no static-only real content.
- Reservation / contact forms must use the real Forms submission pipeline
  (§9.1).

### 9.1 Forms must be real, backend-connected inputs — never static-only

Every visual "form" in a template — footer newsletter/subscribe rows, contact
sections, request-a-quote CTAs, booking/enquiry blocks, etc. — must be a real
functioning input wired to the existing dashboard Forms submission pipeline,
not a static styled `<Box>`/`<Typography>` that only looks like an input.

Rules:

- Use `src/landingTemplates/utils/useTemplateContactForm.ts` for every
  form's state, validation, and submit handling. Do not hand-roll a separate
  submit path per template.
- Every field must be a real controlled input/textarea using
  `getFieldProps(label)` from the hook (`name`, `value`, `onChange`,
  `disabled` wired through) — never a decorative `Box` styled to look like an
  input with no `onChange`/`value`.
- The form element itself must call `handleSubmit` (via `onSubmit` on a
  `component="form"` wrapper, or `onClick` on the submit button) so
  submissions POST to `submitWebsiteFormSubmission` /
  `POST /forms/websites/:websiteId/submissions` — the same pipeline the
  dashboard Forms tab reads from.
- Pass `formIdentity` (`formId` = the source block's id, `formName` = the
  section heading) so dashboard submissions are attributable to the correct
  block/section.
- Render `status`/`errorMessage` feedback (loading / success / error) next to
  the field(s) so the user gets real confirmation, and disable the submit
  control while `status === "loading"`.
- This applies regardless of how few fields the form has — a single
  newsletter email field still requires the full real-input + real-submit
  pattern, not a shortcut static version.
- Editor preview must remain non-persisting (the hook already no-ops writes
  while `isEditorPreviewEnvironment()` is true) — do not add a second,
  template-local submit path that bypasses this guard.
- Regression check before shipping any template: every input-looking element
  must have `data-*`/`name`/`value`/`onChange` wired to real state, and
  submitting must produce a row in that website's dashboard Forms
  submissions — a static/style-only input is a shipping blocker, not a
  cosmetic issue.

#### 9.1.1 Contact form fields must be dynamic (never hardcoded inputs)

New templates **must not hardcode contact form inputs in JSX**. Contact/enquiry
forms must render dynamically from the CONTACT block's persisted `formFields[]`
— the same array the editor's "Form Fields" repeater writes — so the left Block
Editor panel and the canvas always show the same fields.

Rules:

- Derive fields with `normalizeContactFormFields(block.content.formFields,
  block.content)` from `src/api/formSubmissions.ts` (the single canonical
  source; it also supplies backend-safe defaults and legacy fallbacks). Do not
  keep a separate hardcoded label list.
- Render each field by **mapping over** the normalized array, using the shared
  `renderTemplateContactField(...)` helper
  (`src/landingTemplates/utils/renderTemplateContactField.tsx`). Pass the same
  normalized array into `useTemplateContactForm(fields, ...)` so `getFieldProps`,
  validation, and the submit payload stay in sync with what is rendered.
- Preserve the template's custom visual layout: pass the template's own
  `inputSx`, and place fields into the existing grid — full-width types
  (`textarea`, `select`, `radio`, `checkbox`) span all columns via
  `isFullWidthContactField(field)`.
- Support the backend-safe field types only: `text`, `email`, `tel`, `textarea`,
  `number`, `select`, `checkbox`, `radio`, `date`. Never invent frontend-only
  fields; the `required` flag must reflect in rendering/validation.
- The editor and canvas **must use the same field source**, and the public
  site/Live Preview must use the saved `formFields[]`, never template defaults.
- Regression check: adding/removing/editing a field in the Contact block editor
  must update the canvas immediately, persist on Save Changes, appear in Live
  Preview, and survive an editor refresh.

### 9.5 Footers must be fully content-driven (no hardcoded links/social icons)

All template footers must be driven entirely by the Footer block's persisted
content. **No hardcoded footer links or social icons are allowed** unless they
are backed by editable, persisted fields the Footer block editor manages. The
Footer block editor panel must match the visible footer, and add/edit/remove
must persist to the editor, canvas, Live Preview, and refresh.

Rules:

- Render footer navigation links from the **canonical `links` repeater**
  (`{ label, url }[]`) — the exact field the Footer block editor edits — via the
  shared `normalizeFooterLinks(footer)` helper
  (`src/landingTemplates/utils/footerLinks.ts`). Do not invent a footer-only
  `columns`/link-group structure that the editor panel does not expose.
- Seed footer links in `frontendTemplateEditorSupport.ts` as `links: [...]` (not
  `columns`), so a new site's editor panel and canvas match out of the box.
- Wire inline editing to `getEditableTextProps(blockId, "links.<i>.label", ...)`
  only when rendering the canonical `links` field (use `footerHasCanonicalLinks`)
  — never bind editing to a legacy path the panel cannot manage.
- URL-only data (link `url`) must stay in URL fields and label text in text
  fields; never mix them. Footer links must resolve through the website internal
  route resolver (`resolveTemplateInternalLink` / the template's `resolveLink`),
  never bare platform-root routes.
- **Social icons:** do not render hardcoded/static social icons. Until the
  editor provides full social-link editing for a template, social icons must be
  omitted from that footer rather than shown as static placeholders.
- Header/Footer remain shared/global across pages: editing the Footer from any
  page updates every page.
- Regression check: existing footer links appear in the Footer Navigation Links
  editor; editing a label/url updates the canvas; add/remove reflects on canvas;
  Save persists; Live Preview and a refresh keep the changes.

## 10. Assets

External or third-party image/video URLs are prohibited in template JSX and default content.

Each variant must use:

```text
src/landingTemplates/assets/<family>/<template-variant>/
  images/
  avatars/
  videos/
```

Assets reused by multiple template variants may use:

```text
src/landingTemplates/assets/shared/
  images/
  avatars/
  videos/
```

Rules:

- Do not create `assets` folders inside template component directories.
- Use descriptive local filenames and variant index modules where useful.
- Local defaults must remain compatible with mapped media replacement.
- Do not move a variant-specific asset into `shared` merely for convenience.
- **Asset purpose / context rule:** Template default assets must match the
  template’s purpose and visual context. Do not reuse unrelated images from
  another family/variant (e.g. travel/desert stock on a creator link-in-bio
  header). Prefer family-local assets or CSS abstract/gradient backgrounds
  when a fitting image is unavailable.
- **Mobile-first constrained layout:** Templates designed as mobile-first
  profiles (link-in-bio, etc.) must keep a centered constrained column on
  desktop preview while preserving editor selection and editability. Do not
  force full-bleed marketing layouts for these templates.

## 11. New Template Creation Workflow

1. Register the family/variant everywhere required by the registration contract and create its centralized asset directories.
2. Define pages as Shared Header + ordered page blocks + Shared Footer.
3. Define each section's block type, stable `editorSection`, and backend-safe content mapping.
4. Compose each top-level section with `EditableSectionShell` and `TemplateInnerContainer`.
5. Build repeated content using existing structured arrays and shared editable primitives.
6. Give every nested card/container a stable persisted style ID.
7. Apply hidden-state helpers to every deletable element/container.
8. Use template-specific JSX only for unique arrangement or decoration.
9. Record unsupported reusable structures in the backend follow-up document; never invent fake persisted fields.
10. For multi-page templates, define each default page's unique path and
    page-specific body blocks; for single-page templates, define Home only.
11. Complete the acceptance checklist before adding the template to the library.

### 11.1 Registration and integration contract

A template is not implemented by adding only its renderer component. Every new
template must use one stable ID/slug and be registered in every existing flow
that lists, selects, previews, creates, stores, returns, or renders templates:

- the central frontend renderer registry and shared Header/Footer chrome registry
- template catalog, gallery, category filtering, selection cards, and preview metadata
- template route/slug resolution, static preview, Live Preview, and public rendering
- website creation defaults, editor support allowlists, page schemas, hydration, and save/reload mapping
- centralized variant assets and the template thumbnail/preview asset
- backend template registries, allowed IDs, category lists, API validation, seed/default services, serializers, and persistence mappings when the backend owns those concerns

The existing canonical source of truth must be reused where one exists. Do not
introduce a second registry merely for a new template. If a legacy duplicated
catalog or list still exists, it must also be updated until that duplication is
removed in a separate refactor. Registration is complete only when the template
can be discovered, selected, created, edited, saved, reloaded, previewed, and
publicly rendered under the same stable identifier.

### 11.2 Creation payload and media URL contract

- A frontend-owned template must use the frontend template catalog/page schema as
  its creation source. Do not probe a backend template registry first when the
  template is already registered in the frontend editor source of truth.
- Creation serialization must convert bundled local media paths into absolute,
  browser-loadable URLs before sending URL-validated block fields to the API.
- This applies recursively to `heroImage`, `image`, testimonial/member photos,
  avatars, logos, posters, and background/video media fields.
- A template is not creation-ready if `POST /websites/from-template` returns
  `Frontend template not found` or if a local asset fails backend `url`
  validation. These are registration/serialization defects, not user errors.
- Schema fields with length limits must never receive base64 media or long asset
  URLs. A URL-constrained field such as `FOOTER.content.logo` must receive a
  short, valid browser-loadable asset URL; text fields must remain text-only.
- Image assets must use their supported image/media field only. For Footer
  blocks whose schema defines `logo` as a URL, use that canonical logo-media
  field and keep the brand text in website or explicit text fields.
- New templates must validate their generated creation payload against the
  backend schema before registration.
- **Creation-schema gate (required):** Before a new template is exposed in the
  gallery, audit every default page and every default block against its exact
  backend block schema. Required nested fields must be present for every array
  item—for example, `STATS.content.stats[].number`,
  `FEATURES.content.features[].title` and `.description`, and all required
  testimonial, member, and contact fields. A template is not complete while
  any default creation payload can produce a backend validation error.
- When a creation API response identifies a missing schema field, correct the
  frontend page seed/source immediately and add that field to every equivalent
  default block in the template. Do not present the validation failure as a
  user-entry issue or require users to manually repair template defaults.
- Development URLs may be origin-qualified during creation; production builds
  must resolve to the deployed frontend asset origin.

### 11.3 Visual differentiation contract

- A new variant must not be a palette swap or near-copy of an existing variant.
- Shared architecture, editor primitives, and responsive shells are expected;
  section composition, typography, media treatment, spacing rhythm, and visual
  hierarchy must be recognizably different.
- Each new variant must use its own local hero and primary editorial imagery.
  Reusing another template variant's defining images is prohibited.
- A design reference may guide art direction, but its exact composition, copy,
  branding, and imagery must not be copied.

### 11.4 Persisted editability contract

- Every real visible text, image, video, button, link, list item, card content,
  statistic, testimonial, and form label must map to an explicit backend-safe
  `block.content` path.
- Editor canvas updates alone do not satisfy editability. The same field must be
  present in `Save Changes`, hydrate after editor refresh, and render in saved
  Live Preview/public output.
- Static selection is allowed only for purely decorative shapes or grouping
  surfaces. It must never be used for user-facing copy or replaceable media.
- Template acceptance must include at least one saved text edit, media edit, card
  edit, section style edit, nested container style edit, delete/hide operation,
  refresh check, and Live Preview check.
- **Premium redesigns must preserve full editability/persistence.** Visual
  upgrades (spacing, cards, gradients, hover states, Framer Motion/CSS
  animations, wrappers) must not convert real content into static/style-only
  JSX. Animations and decorative wrappers must not break selection, Save,
  Live Preview, refresh, delete/hide, or background replacement. Keep using
  backend-safe field paths (`heading`, `subheading`, `body`/`description`,
  `eyebrow`, `image`/`imageStyle`, `features[]`, `items[]`, `stats[]`,
  `testimonials[]`, `members[]`, `detailGroups[]`, `sectionStyle`,
  `containerStyles`, `hiddenElements`/`hiddenContainers`). Do not invent
  frontend-only fake fields or reuse one field for unrelated elements.
  Manual editor styling must still override template visual defaults.

### 11.5 New-template regression checklist

Before a new template is considered available in the gallery, its author must
verify the following source contracts. These checks are mandatory because a
template card can render correctly while website creation still fails:

- Gallery IDs with a presentation prefix such as `static-` must resolve to the
  same canonical template slug used by editor support, creation defaults, the
  renderer registry, and persisted `frontendTemplateId`.
- Frontend-owned templates must be created from their frontend page schema and
  must not be sent to a backend template lookup that returns `Frontend template
not found`.
- Imported local assets must be recursively origin-qualified before they enter
  URL-validated API fields. A `heroImage must match format "url"` response means
  creation serialization is incomplete.
- Media fields must contain media, not display copy, and text fields must never
  contain media. In particular, use `heroImage`, `image`, `photo`, poster,
  video, or the schema-supported `FOOTER.content.logo` URL field for media;
  company/brand text belongs in website or explicit text fields. Optional
  invalid media values must be omitted from creation payloads rather than sent
  as arbitrary text.
- Every non-decorative element must use an exact schema-backed field path. An
  element is not complete merely because it is selectable or changes in the
  canvas.
- Saved text, media, button, repeated-card content, section styles, and nested
  container styles must be read by the same renderer in editor refresh, Live
  Preview, and public output.
- A new variant must be compared with sibling variants for section composition,
  typography, media treatment, spacing rhythm, and color system. Reusing the
  architecture is required; reproducing an existing sibling design is not.
- The variant must use its own centralized hero and primary imagery rather than
  another template's defining assets.

## 12. Authoring Rules

- Do not duplicate CompanyStudio section-shell, metadata, style, or hidden-state patterns manually.
- Do not place editor-specific save logic inside a template component.
- Avoid excessive transparent wrapper `Box`/`div` nodes.
- A wrapper should exist only for layout, semantic grouping, animation, or an independently selectable surface.
- Do not make structural wrappers selectable when the owning parent section should handle the background.
- Prefer composition over large conditional rendering functions.
- Keep content paths explicit and backend-safe.
- Keep section boundaries clean and sibling-based.

## 13. Acceptance Criteria

A new template is complete only when:

- all visible content is explicitly editable/selectable
- every real content edit is included in the save payload
- saved Live Preview matches the editor
- editor refresh preserves saved content and styles
- Header and Footer are global and present across all pages
- every top-level section is an independent sibling block
- empty section clicks select the parent section
- nested card/container selection remains independent
- background color/image/video/animated settings persist
- nested `containerStyles` persist independently
- delete/hide works for all supported element types and survives save/reload
- no unrelated visual groups share content or style paths
- no excessive or selection-stealing wrapper divs remain
- no external image/video URLs exist in JSX or defaults
- assets use the centralized family/variant structure
- no unsupported frontend-only persisted fields exist
- every unsupported reusable structure is documented as a backend follow-up
- the stable template ID is registered across all applicable frontend and backend creation, catalog, editor, preview, and rendering flows
- frontend-owned creation does not depend on an absent backend template record
- all URL-validated media fields receive absolute browser-loadable URLs in the creation payload
- the visual system is demonstrably distinct from existing variants, not only recolored
- every non-decorative element uses a persisted field that survives save, refresh, and Live Preview
- changing the theme palette visibly updates the template in landing preview,
  editor canvas, saved Live Preview, and public rendering
- changing the heading or body font pack visibly updates the template in landing
  preview, editor canvas, saved Live Preview, and public rendering
- the website can be created with every declared default page exactly once
- editor page switching, Live Preview, and public rendering show the correct
  page-specific body content
- shared Header/Footer render on every page and edits sync globally
- page-specific sections remain independent across pages
- Save Changes updates existing page IDs and never creates duplicate paths
- users can add a page to both single-page and multi-page templates without
  copying the Home body or creating a duplicate path

## 14. Definition of Done Documentation

Each new template PR must include:

- template family and variant
- page and section inventory
- block type and field-path matrix
- shared components used
- stable section/container IDs
- global Header/Footer confirmation
- local asset inventory
- backend follow-ups, if any
- manual editor/save/Live Preview acceptance results
