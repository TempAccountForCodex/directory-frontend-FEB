## Static Element Editability Rules

- Static hardcoded visible elements must not be left without selectable metadata.
- Static pills, badges, chips, stars, review text, avatar groups, icon groups, decorative images, and small labels should be explicitly wrapped when rendered in template code.
- If a static element has a backend-safe persisted field, use content-editable mapping plus style selection.
- If a static element has no backend-safe field, keep it styling-only selectable.
- Fallback preview annotation is allowed only as a safety net, not as the primary implementation for known static UI rendered directly in templates.
- Plain static `Chip`, `Typography`, `Box`, `img`, `svg`, icon, `Button`, `Card`, `Stack`, `Avatar`, `Badge`, and pill-like elements should be treated as checklist failures unless they already carry explicit selection metadata.
- Static child elements must have their own `data-static-id` or equivalent child-level identity so selection does not collapse into the parent section.
- Reusing only parent `data-preview-block-id` + `sectionStyle` is not sufficient for static child selection.
- Static child elements must select through a dedicated static target path and must not show section-only UI such as Add section controls.

## Wiring and Persistence Audit

- Every element expected to update in Live Preview after `Save Changes` must map to a backend-safe persisted field.
- Editor-only canvas changes are not completion; verify the same field survives save, reload, and public/live preview rendering.
- For each editable template element, audit:
  - current selection type
  - current field path
  - backend-safe persistence status
  - save payload path
  - template hydration path
  - live/public renderer read path
- Any duplicated seeded block type must carry a stable `editorSection` identity so persisted content maps back to the correct section after reload.
- Repeater and nested paths such as `items.N.title`, `items.N.description`, `features.N.title`, `features.N.description`, `testimonials.N.quote`, and similar fields must save through safe nested path updates, not ad hoc object mutation that can corrupt arrays.
- Heading text, body text, repeater titles, repeater descriptions, icon text, button text, and labels should use isolated style buckets unless the template intentionally shares them.
- If an element is user-visible content or media and should persist, either:
  - wire it to an existing backend-safe field now, or
  - add it to the backend follow-up list for schema support.
- Static/style-only treatment is temporary and acceptable only for decorative elements.
- Replaceable images and videos must not be left as preview-only if they are intended to persist in Live Preview after save; missing schema support should be tracked as backend follow-up.
- Do not write unsupported persisted fields, DOM-derived arbitrary field paths, or fake editable mappings that revert on refresh.
- Reusing an existing persisted field is allowed only when it belongs to the same visual content group. Do not map a second visual subsection to another subsection's `features[]`, `items[]`, `body`, or similar fields just to force save/live preview behavior.

## Structured Schema Checklist

- Audit templates by section/block and reusable content group, not by arbitrary DOM node.
- For each visible element, assign one of these outcomes:
  - wire now to an existing backend-safe field
  - backend follow-up needed for a reusable missing schema pattern
  - decorative-only static/style selection
- Use `features[]` for service, benefit, and process cards.
- Use `items[]` for gallery items, reviews, and generic repeaters.
- Do not invent separate semantic arrays such as `services[]`, `projects[]`, or `processSteps[]` in the frontend unless backend later supports them.
- Company-family reusable follow-up patterns must be tracked explicitly:
  - `socialProof`
  - `detailGroups[]`
  - `teamMembers[]`
- Blog, portfolio, and store templates should wire only current backend-safe fields now; richer metadata goes to the backend follow-up list.
- `editorSection` identity must remain stable for duplicated seeded block types.
## Persistent Container Styling

- [ ] Every selectable section/container/card has a stable independent style identity.
- [ ] Main sections use `sectionStyle`/`outerSectionStyle`; nested containers use `containerStyles[stableId]`.
- [ ] Background color, image, video, animated background, reset, padding, and borders update the exact selected node.
- [ ] Container style changes are present in the Save Changes block payload.
- [ ] Live Preview applies saved container styles.
- [ ] Refreshing the editor hydrates and retains saved container styles.
- [ ] No visible background/layout control is labeled or implemented as local-only.
- [ ] Backend schema validation preserves `containerStyles` without stripping nested keys.
## Section boundary audit

- [ ] Every block-list entry has exactly one sibling top-level DOM wrapper.
- [ ] Every top-level wrapper has a unique block id, `editorSection`, and `data-template-section-boundary="true"`.
- [ ] No top-level section is nested inside the preceding block wrapper.
- [ ] Section background and spacing changes stop at the selected block boundary.
- [ ] Nested cards/containers use child identities and do not display section insertion controls.
- [ ] Reordering the block list produces the same order in the rendered DOM.
- [ ] Clicking section background selects the section root, not an auto-annotated layout div.
- [ ] Add section appears only for section roots; Add block inherits same-block inner-block capability.
- [ ] Clicking card/column/grid empty space selects that nested container, while clicking outer section whitespace selects the section root.
