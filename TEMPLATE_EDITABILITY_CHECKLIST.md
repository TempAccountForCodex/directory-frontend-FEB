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
