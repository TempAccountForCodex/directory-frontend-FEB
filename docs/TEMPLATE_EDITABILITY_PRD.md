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

## Future Template Authoring Rules

- Every visible text element must map to a schema-backed field.
- Every visible media element must map to a schema-backed media field.
- Every card/container must be explicitly selectable.
- If a visible element cannot be safely mapped to a persisted field, it must remain styling-only selectable.
