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
