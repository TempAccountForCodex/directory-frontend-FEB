# Template Editability Checklist

Use this checklist before adding or updating any landing template.

## Core Rules

- Every visible text element must be explicitly mapped to a content field.
- Every visible media element must be explicitly mapped to a media field.
- Every visible card/container must be selectable through a shared editable wrapper.
- Fallback preview metadata is only a safety net for selection/styling, not the primary editing model.
- No plain visible `Typography`, `Button`, `img`, `video`, `a`, `li`, `Card`, `Box`, or icon wrapper should ship without editable metadata coverage.

## Required Shared Primitives

- Wrap each section with `EditableSection`.
- Use `EditableText` for headings, paragraphs, labels, and text blocks.
- Use `EditableButton` for CTA/button copy.
- Use `EditableLink` for nav items, footer links, and text links.
- Use `EditableBox` for badges, pills, stats, chips, list items, and small labels.
- Use `EditableContainer` or `EditableCard` for outer card/container selection.
- Use `EditableImage` or `renderEditableMedia` for mapped image/video fields.
- If an icon is backed by content, render it through an explicit icon field wrapper/pattern.

## Metadata Expectations

### Text/content

- `data-editable`
- `data-edit-type`
- `data-block-id`

### Media

- `data-edit-image`
- `data-block-id`
- `data-image-label`

### Sections/containers

- `data-preview-section`
- `data-preview-block-id`
- `data-preview-label`
- `data-preview-style-key`

## Selection Behavior

- Clicking text should select that exact text field.
- Clicking a button should select the button field.
- Clicking empty space inside a card should select the card/container.
- Clicking text/image/button inside a card should select the child first.
- Clicking a media node should select media.
- Double-clicking a media node should open the existing replace modal.

## Schema / Content Mapping

- Every visible element must map to a known field in the template schema/content.
- Old saved template data should be normalized/backfilled in frontend state at load time.
- Do not write changes into unknown DOM-derived fields.

## Backend-safe Persistence Rules

- Backend strips unknown nested fields during save validation.
- Persisted content must only use backend-approved schema fields.
- Fallback preview selection is styling/selectability only, not a persisted content system.
- Normalized frontend state may include temporary compatibility fields, but only backend-supported fields should be written back on save.
- Global header/footer/nav should use the existing `global_components` backend model.
- Page body blocks are per-page and should not depend on Home fallback behavior.
- Do not persist arbitrary fields such as:
  - `buttons`
  - `cards`
  - `navItems`
  - `footerLinks`
  - `__fallbackMedia`
  - `backgroundImageUrl`
  - `backgroundVideoUrl`
  - `innerBlocks`
  unless backend explicitly supports that exact path.

## Wiring and Persistence Audit

- Every element expected to update in Live Preview after `Save Changes` must map to a backend-safe persisted field.
- Editor-only canvas changes are not completion; verify the same field survives save, reload, and public/live preview rendering.
- For each editable element, audit:
  - selection type
  - field path
  - persistence status
  - save payload path
  - hydration path
  - live/public renderer read path
- Duplicated seeded block types must carry a stable `editorSection` identity.
- Nested repeater fields such as `items.N.title` and `items.N.description` must save through safe nested path updates.
- Heading, body, repeater title, repeater description, label, and button text should use isolated style buckets unless sharing is explicitly intended.
- Reusing an existing persisted field is allowed only when it belongs to the same visual content group. Do not map a second visual subsection to another subsection's `features[]`, `items[]`, `body`, or similar fields just to force save/live preview behavior.
- Any user-visible content/media without current schema support must be added to the backend follow-up list instead of being treated as complete.

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

## QA Before Merge

- Select all headings.
- Select all paragraph text.
- Select all labels/spans/small text.
- Select all buttons.
- Select all nav/footer links.
- Select all badges/pills/stats/list items.
- Select all cards via empty space.
- Select inner text/image/button inside cards.
- Select all images/videos.
- Double-click all images/videos and confirm the modal opens.
- Save/reload and verify edits persist.
- Verify public rendering is visually unchanged.
- Check the browser console in development for `Template Editability` warnings and remove fallback reliance before merge.
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
