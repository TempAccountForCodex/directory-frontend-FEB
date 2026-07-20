# Template Editability PRD

## Problem Statement

The current template editing system is inconsistent because editability depends on whether a template author manually used the expected editor metadata or shared editable wrappers. The editor itself is metadata-driven, but template coverage is incomplete, so some elements are selectable while visually similar elements in other templates are not.

Fallback metadata can improve selection coverage, but it is not a safe primary persistence model. It cannot reliably decide which visible node should save into which content field. Real content editing must remain explicit and schema-driven.

## Goals

- Full selectability across all templates.
- Persisted content editing only through explicit schema-backed field mappings.
- Reusable shared editable primitives for future templates.
- Preserve current public rendering and visual design.

## Non-Goals

- No backend changes in this phase.
- No database migration in this phase.
- No unsafe DOM-to-field guessing for persisted edits.

## Current System

- Template files decide whether a visible element gets explicit editable metadata.
- The editor reads:
  - `data-editable`
  - `data-edit-type`
  - `data-block-id`
  - `data-edit-image`
  - `data-image-label`
  - `data-preview-section`
  - `data-preview-label`
  - `data-preview-block-id`
  - `data-preview-style-key`
- Key frontend files:
  - `src/landingTemplates/utils/editableProps.ts`
  - `src/landingTemplates/utils/editableComponents.tsx`
  - `src/components/WebsiteEditor/PreviewPanel.tsx`
  - `src/components/Dashboard/WebsiteEditor.jsx`
  - `src/templates/frontendTemplateEditorSupport.ts`

## Proposed Architecture

- Explicit schema/field mapping is the primary persisted editing model.
- Shared editable primitives render the correct metadata automatically.
- Fallback preview annotation remains a styling/selectability safety net only.
- Cards/containers support empty-space selection through explicit container wrappers.
- Media uses explicit media metadata and existing image/video modal flows.

## Backend-safe Persistence Rules

- Backend strips unknown nested fields during block validation.
- All persisted content must match the backend block/global-component schemas defined in `backend/contentTypes/registry.js`.
- Fallback selection is not persisted content editing.
- Old saved websites may be normalized in frontend state at load time, but only schema-supported fields should be saved back.
- Global header/footer/nav should use the existing backend `global_components` model.
- Page body blocks are stored per page and should not fall back to Home content.
- Do not persist arbitrary new fields such as:
  - `buttons`
  - `cards`
  - `navItems`
  - `footerLinks`
  - `__fallbackMedia`
  - `backgroundImageUrl`
  - `backgroundVideoUrl`
  - `innerBlocks`
  unless backend schema explicitly supports that exact field/path.

## Wiring and Persistence Audit

- Selectability alone is not enough. Any element expected to appear updated in Live Preview after `Save Changes` must be wired to a backend-safe persisted field.
- Editor canvas draft changes may appear immediately, but Live Preview must render only saved backend-backed content after `Save Changes`.
- Unsaved editor draft state remains editor-only. Refreshing the editor should restore only persisted content.
- Classify template elements into:
  - persisted editable
  - static/style-only decorative
  - backend follow-up required
- Any user-visible content or media that should persist must be mapped to an existing backend-safe field wherever possible, even if that requires reorganizing template internals.
- Static/style-only is temporary and acceptable only for decorative elements. User-visible content/media without schema support must be tracked in a backend follow-up list.
- Replaceable images and videos must not remain preview-only long term. Missing safe media fields should be recorded as required backend follow-up.
- Reusing an existing persisted field is allowed only when it belongs to the same visual content group. Do not map a second visual subsection to another subsection's `features[]`, `items[]`, `body`, or similar fields just to force Live Preview/save behavior.

## Structured Schema Frontend Plan

1. The frontend must stop treating every DOM node as an independent persisted field.
2. Each template section should render from a structured block content model.
3. Visible elements should map to reusable content groups such as `heading`, `subheading`, `description`, `body`, `ctaText`, `image`, `features[]`, `items[]`, `stats[]`, `socialProof`, `detailGroups[]`, and `teamMembers[]`.
4. Editable primitives must bind only to backend-safe field paths.
5. Static/fallback selection remains a temporary UX layer for decorative elements only.

## Template Audit Matrix

| Template Group | Templates | Primary Structured Patterns | Frontend Action |
|---|---|---|---|
| Group 1 | `restaurant`, `education`, `gardening`, `plumbing` | `hero`, `text`, `features[]`, `items[]`, `contact` | wire existing schema-backed fields now |
| Group 2A | `company`, `company-premium`, `company-executive` | `hero`, `text`, `features[]`, `contact`, company-specific `socialProof`, `detailGroups[]`, `teamMembers[]` | wire safe fields now, create backend follow-up for missing reusable company patterns |
| Group 2B | `portfolio-agency`, `portfolio-creative`, `portfolio-photo-studio`, `blog`, `blog-premium` | `hero`, `features[]`, `items[]`, `contact`, richer project/article card metadata | wire safe fields now, follow-up for project/article-specific schema |
| Group 3 | `modern`, `minimal`, `premium`, `store-basic`, `store-premium`, `store-performance`, `store-fit`, `store-paws` | shared blocks, `hero`, `features[]`, `items[]`, store/product/review/trust patterns | wire safe fields now, follow-up for richer store/product/media patterns |

## Reusable Frontend Mapping Patterns

1. Hero content: `heading`, `subheading`, `description`, `ctaText`, `primaryCtaText`, `image`.
2. Feature / service / process cards: `features[].icon`, `features[].title`, `features[].description`.
3. Generic repeaters such as reviews and gallery items: `items[]`.
4. Contact content: `heading`, `description`, `buttonLabel`, `formFields[]`.
5. Stats / counters: `stats[]`.
6. Backend follow-up reusable patterns:
   - `socialProof`
   - `detailGroups[]`
   - `teamMembers[]`
   - richer project/article/product card metadata
- Duplicated seeded block types such as multiple `FEATURES` or `TEXT` sections must persist a stable `editorSection` identity on save/load so content does not collapse into the wrong section.
- Inline editing, sidebar styling, save payload generation, template hydration, and public/live preview rendering must all reference the same persisted field path.
- Style buckets must be isolated by intent so section headings, repeater titles, repeater descriptions, labels, and CTA text do not unintentionally share one style object.

## Future Template Authoring Rules

- Every visible text element must map to a schema-backed field.
- Every visible media element must map to a schema-backed media field.
- Every card/container must be explicitly selectable.
- If a visible element cannot be safely mapped to a persisted field, it must remain styling-only selectable.
## Persistent Container Styling

- Every selectable section, card, wrapper, or nested container that exposes layout/background controls must write to persisted block content.
- Main section shells use their canonical `sectionStyle` or `outerSectionStyle` object.
- Nested containers use `content.containerStyles[stableContainerId]`; `style-only / not saved` is not an acceptable behavior for visible container controls.
- Stable container ids are template-independent metadata such as `hero.inner`, `about.card.0`, or `splitContentCards.darkCard` and must not be reused by separate visual containers in the same block.
- The shared pipeline must support background color, image, video, animated preset, position, size, repeat, padding, border, radius, overlay, and reset/removal.
- Editor canvas, save payload, Live Preview, and editor hydration must consume the same persisted style object.
- Backend validation must accept and round-trip `containerStyles` for every template block type that can expose selectable nested containers.
## Top-level section boundary rules

- Every block shown in the editor block list must render as one independent top-level sibling wrapper.
- A wrapper must carry a stable `editorSection` key, its own block id, and `data-template-section-boundary="true"` metadata.
- A visual section must not be rendered inside another block's outer wrapper or reuse its block id merely because the content is related.
- Nested cards and containers remain selectable children, but they are not top-level section boundaries and must not control adjacent blocks.
- Background, spacing, ordering, insertion controls, and `containerStyles` must resolve against the block that owns the selected boundary.
- Empty/background clicks resolve to the nearest `data-editor-section-root`; explicit content and explicit card/container targets take priority.
- Add-section controls belong only to section roots. Nested containers must never expose section insertion controls.
- Scoped cards, columns, rows, grids, and visible-surface wrappers inside a section are nested container targets. Their content area must not collapse selection back to the section root.
- Transparent wrappers that cover essentially the whole section remain structural and must not steal section-background clicks.
