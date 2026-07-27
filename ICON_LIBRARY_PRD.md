# Icon Library PRD

## 1. Purpose

Provide a reusable **Icon Library** picker for the website editor so users can
search, browse, select, and apply icons to any block/template icon field.

Selected icons must:

- Persist in `block.content` (same path as today’s icon fields)
- Render immediately in the editor canvas
- Survive Save Changes, Live Preview, public site, and refresh
- Work across templates (Link Hub Pro, Features, services, socials, etc.)

This replaces raw text-only icon inputs when a picker is available.

## 2. Chosen free icon library

**Primary library: Lucide React (`lucide-react`)**

| Criterion | Lucide |
| --- | --- |
| License | ISC / free commercial use |
| Already in repo | Yes (`package.json`) |
| Tree-shakable | Yes for named imports; catalog uses a curated name list |
| React-first | First-class React components |
| Style | Clean outline icons that fit MUI/dark editor UI |
| Alternatives considered | Font Awesome Free (heavier + brand split), Heroicons, Remix, Tabler |

Font Awesome Free may be added later as a secondary library for **brands** only.
v1 ships Lucide only to stay lightweight.

## 3. Modal layout

Match the attached Icon Library modal closely:

- Dark modal overlay (`#121214` / `#1a1a1b` surfaces)
- Header: “ICON LIBRARY” + close (X)
- Left sidebar categories with active state
- Top search: “Filter by name…”
- Scrollable icon grid of cards (icon glyph + truncated label)
- Selected card highlight
- Footer: primary **Insert** (bottom-right)
- Categories (v1):
  - All Icons
  - Brands (social/brand-like Lucide glyphs)
  - Regular / UI
  - Solid (alias of filled-leaning UI set — Lucide is outline; treat as UI subset)
  - Arrows
  - Business
  - Social
  - Contact
  - Services

> Note: Lucide does not mirror FA’s Regular/Solid/Brands packs. Categories are
> curated tags on Lucide icons for UX parity with the reference layout.

## 4. Editor integration

Anywhere metadata defines an icon field with `type: "ICON"`:

- `features[].icon`
- `items[].icon`
- Link Hub social icons (`LINK_HUB_SOCIALS`)
- Future buttons/stats/service cards

`FieldType.ICON` already exists in DynamicFields but previously degraded to
`TextField`. v1 registers a real **IconField** that opens Icon Library.

Generic FEATURES / Link Hub presets must use `type: "ICON"` for icon keys.

## 5. UX behavior

1. User clicks icon field preview / **Choose Icon**
2. Modal opens (search + categories)
3. User selects an icon (click card)
4. User clicks **Insert**
5. Value writes to the field’s `onChange` → correct `block.content` path
6. Canvas updates via existing live preview pipeline
7. Save Changes persists; Live Preview / public / refresh keep the value

Escape / X closes without applying unless Insert was clicked.
Double-click card may Insert immediately (optional nicety).

## 6. Canonical data format

### v1 stored format (backend-safe string)

```text
lucide:<kebab-or-canonical-name>
```

Examples: `lucide:phone`, `lucide:instagram`, `lucide:arrow-right`

**Rationale:** Existing icon fields are strings. FEATURES sanitization spreads
item objects and does not strip unknown string values. A string avoids any
backend schema change for nested objects.

### Documented object form (future)

```json
{
  "library": "lucide",
  "name": "phone",
  "label": "Phone"
}
```

Parsers accept either string or object; writers persist the string form in v1.

### Legacy compatibility

Plain values such as `phone`, `star`, `twitter`, `instagram` remain valid.
`renderSavedIcon` / parsers normalize them (treat as Lucide name or alias map).

## 7. Rendering

Shared helpers:

| Helper | Role |
| --- | --- |
| `parseIconValue(value)` | Normalize string/object → `{ library, name, label }` |
| `serializeIconValue(icon)` | → `lucide:name` |
| `renderSavedIcon(value, props?)` | React node; fallback if missing/invalid |
| `getIconLabel(value)` | Human label for field preview |

Rules:

- Never crash on invalid names
- Fallback: Lucide `CircleHelp` (or equivalent)
- Templates must not hardcode SVG blobs for picker-driven icons
- Public Features blocks may keep MUI `iconMap` for old template tokens; Lucide
  values should prefer Lucide renderer when `lucide:` prefix or known Lucide name

## 8. Restrictions

- No paid icon packs
- No loading every npm icon pack at once for public pages
- No hardcoding icon SVGs inside template JSX for library icons
- No static/style-only icon chrome — values must persist
- Do not break existing plain string icon values

## 9. Backward compatibility

| Stored value | Behavior |
| --- | --- |
| `lucide:phone` | Lucide Phone |
| `phone` / `star` / `twitter` | Alias → Lucide (or legacy MUI map where Features still use MUI) |
| Unknown | Fallback icon |
| Empty | Placeholder / hidden per template |

## 10. Acceptance criteria

- [ ] Modal opens from ICON fields in block editor
- [ ] Search filters icons by name/label
- [ ] Category filtering works
- [ ] Selection + Insert applies value
- [ ] Value persists on Save Changes
- [ ] Live Preview / public render correct icon
- [ ] Refresh keeps selected icon
- [ ] Works in Link Hub Pro socials + Features icon fields
- [ ] Old plain icon strings still render
- [ ] No backend migration required for v1 string format

## 11. Implementation plan (frontend-only)

1. Add `ICON_LIBRARY_PRD.md` (this file)
2. Add Icon Library module: catalog, parse/serialize, `renderSavedIcon`, modal
3. Add `IconField` + register `FieldType.ICON`
4. Switch FEATURES / Link Hub social icon metadata from TEXT → ICON
5. Wire Link Hub Pro social rendering through `renderSavedIcon`
6. Update `NEW_TEMPLATE_ARCHITECTURE_PRD.md` icon picker rule
7. Backend: **not required** for v1 (`lucide:name` strings)

## 12. Backend prompt (only if object format is mandated later)

If product later requires structured icon objects instead of strings, ask backend
to allow nested `content.features[].icon` objects (`library`, `name`, `label`)
without stripping unknown keys. v1 does **not** need this.
