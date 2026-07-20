## Static Element Editability Rules

1. Static hardcoded visible elements are not allowed to ship without selectable metadata.
2. Static labels, pills, badges, chips, stars, review text, avatar groups, icons, and images must be wrapped with `EditableBox`, `EditableContainer`, `EditableImage` / `renderEditableMedia`, or an equivalent selectable primitive.
3. If a static element maps to a backend-safe schema field, it should be content-editable and style-selectable.
4. If no backend-safe schema field exists, the static element must still be styling-only selectable.
5. Fallback preview annotation remains a safety net only; directly rendered static elements in template code should preferably be explicitly wrapped.
6. Static images, avatar images, icons, and star groups must at least be selectable as styling-only elements.
7. Template authors must avoid plain static `Chip`, `Typography`, `Box`, `img`, `svg`, icon, `Button`, `Card`, `Stack`, `Avatar`, `Badge`, and pill-like UI without explicit selectable/editable metadata.
8. Static selectable children must have a unique child-level identity, not only the parent `blockId` and `sectionStyle`.
9. Static selectable children should carry `data-static-id` and a child-specific style identity so the preview can distinguish them from the parent section.
10. Static selectable children are not section selections. They must use a separate preview target kind and normal element-selection UI, not section add controls.

## Wiring and Persistence Audit

1. Selectability alone is not sufficient. Any element that should appear updated in Live Preview after `Save Changes` must be wired to a backend-safe persisted field.
2. Editor canvas draft changes may appear immediately, but Live Preview must render only saved backend-backed content after `Save Changes`.
3. Unsaved editor draft state must remain editor-only. Refreshing the editor should restore only persisted content.
4. Template elements should be classified into:
   - persisted editable: explicit schema-backed field mapping
   - static/style-only: decorative or currently unsupported by backend schema
   - backend follow-up required: user-visible content/media that must persist but lacks a safe schema field today
5. Any content or media that users are expected to edit and see in Live Preview must be mapped to an existing backend-safe schema field wherever possible, even if that requires reorganizing the template’s internal field usage.
6. Static/style-only treatment is temporary and acceptable only for decorative elements. User-visible content that should persist must be tracked in a backend follow-up list until schema support exists.
7. Replaceable images and videos must not remain preview-only long term. If an element has no existing backend-safe media field, it must be added to the backend follow-up list as required schema support.
8. Duplicated seeded block types, especially multiple `FEATURES` or `TEXT` sections inside one template, must persist a stable `editorSection` identity on save/load so saved content does not collapse into the wrong section on reload or Live Preview.
9. Inline text editing, sidebar styling, save payload generation, template hydration, and public/live preview rendering must all reference the same persisted field path for a given editable element.
10. Style buckets must be isolated by intent. A section heading, repeater item title, repeater item description, icon label, and CTA text must not share the same style object unless that sharing is explicitly intended by the template contract.
11. Any element still left as static/style-only should be clearly treated as non-persisted in editor logic and should not pretend to be a real content field.
12. Backend-safe persistence rules remain unchanged: do not invent unsupported persisted fields, do not write DOM-derived arbitrary paths, and do not change backend without an approved follow-up.
13. Reusing an existing persisted field is allowed only when it belongs to the same visual content group. Do not map a second visual subsection to another subsection's `features[]`, `items[]`, `body`, or similar fields just to force Live Preview/save behavior.

## Structured Schema Frontend Plan

1. The frontend must stop treating every DOM node as its own persisted field.
2. Each template section must render from a structured block content model.
3. Visible elements should map to reusable content groups such as:
   - `eyebrow`
   - `heading`
   - `subheading`
   - `description`
   - `body`
   - `ctaText`
   - `buttonLabel`
   - `image`
   - `imageStyle`
   - `features[]`
   - `items[]`
   - `stats[]`
   - `socialProof`
   - `detailGroups[]`
   - `teamMembers[]`
4. `EditableText`, `EditableButton`, `EditableLink`, and `EditableImage` must bind only to existing backend-safe field paths.
5. Static/fallback selection remains a temporary UX safety net for decorative elements only and must not pretend to be persisted content editing.

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
