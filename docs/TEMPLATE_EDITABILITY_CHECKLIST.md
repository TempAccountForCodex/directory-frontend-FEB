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
