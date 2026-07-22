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
  the block is explicitly a global component.

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
