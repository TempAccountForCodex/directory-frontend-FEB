# Link Hub Template PRD

## 1. Purpose

Define the Link Hub (“link in bio”) template family for the website builder.
Link Hub pages are single-page profile link destinations — similar to Linktree —
that creators and businesses can open in the editor, customize fully, publish,
and share as a simple public profile URL.

This PRD complements `NEW_TEMPLATE_ARCHITECTURE_PRD.md`. Link Hub templates must
follow the new template architecture (shared chrome helpers, backend-safe
`block.content`, editable persistence, no static-only content).

## 2. Template identity

| Field | Value |
| --- | --- |
| Name | Link Hub Pro |
| Slug / key | `link-hub-pro` |
| Category | Creator / Link in Bio / Utility (`creator`) |
| Page model | **Single-page** — default Home `/` only |
| Chrome | Minimal / hidden Header; compact Footer branding |

### 2.1 Design variants

Link Hub may ship multiple **visual variants** that share the same persisted
profile/link data model (e.g. `link-hub-pro`, `link-hub-dark-pro`).

| Variant | Slug | Notes |
| --- | --- | --- |
| Link Hub Pro | `link-hub-pro` | Premium glass / gradient profile |
| Link Hub Dark Pro | `link-hub-dark-pro` | Dark mobile-first Linktree-style column (~425px), black thumbnail link cards |
| Beauty Link Hub Pro | `beauty-link-hub-pro` | Warm beauty/makeup creator mobile layout with beige pills + featured image card |

Rules:

- Each variant must still use the same backend-safe profile / `features[]` link
  model and expose editable URL / image / icon / link fields.
- Do not invent variant-only fake fields.
- Visual differences are template JSX + local assets only.
- Mobile-first variants must keep a **centered constrained column on desktop**
  (phone-width profile), not expand into a full marketing landing layout.
- **Beauty / creator image layouts:** Beauty Link Hub templates may use warm
  full-bleed background imagery with soft cream/beige overlays and pill
  buttons, but must keep the same editable/persisted Link Hub data model
  (profile, socials, featured, links, products, contact, footer).

## 3. Product goals

- Users create a polished link-in-bio page from the template gallery.
- Every visible profile and link element is editable and persisted.
- Links are dynamic: add / remove / reorder / hide via editor block data.
- External URLs open safely (`target="_blank"` + `rel="noopener noreferrer"`).
- Internal paths use the current website route resolver.
- Mobile-first layout; desktop remains centered and premium.
- Future Pro capabilities (analytics, custom domain, QR, scheduling) are
  planned as reusable fields — not hardcoded subscription gates in v1.

## 4. Editable profile fields

Persisted on the Home **profile** section (`HERO` block), unless noted:

| UI | Content path | Notes |
| --- | --- | --- |
| Avatar | `image` / `heroImage` + `imageStyle` | Local asset default |
| Display name | `heading` | Brand / name |
| Handle | `subheading` | e.g. `@studio` |
| Bio | `body` / `description` | Short intro |
| Page background | `sectionStyle` | Color / image / gradient |
| Contact CTA label | contact `ctaText` / `buttonLabel` | Opens mailto or form |
| Contact email | contact `email` | |
| Footer brand | footer `heading` / `brandName` | |
| Footer note | footer `body` | Optional “Made with …” later |

## 5. Dynamic link list behavior

Primary link lists use **FEATURES** blocks with `features[]` (aliased to
`items[]` by existing editor sync).

Each link item:

```ts
{
  title: string;          // label
  description?: string;   // supporting text (required by FEATURES sanitizer)
  link: string;           // URL or internal path (preferred key)
  image?: string;         // optional thumb
  icon?: string;          // optional icon token / emoji / label
  type?: "link" | "product" | "social" | "featured";
  isFeatured?: boolean;   // soft flag; featured section may also be separate
  isVisible?: boolean;    // default true when omitted
}
```

Rules:

- No hardcoded static link lists in JSX.
- Render order follows array order (editor reorder = persist order).
- Skip items with `isVisible === false`.
- **Featured link block is a single-card block, not a repeatable feature list.**
  It must use a dedicated editor schema (`editorBlockType: LINK_HUB_FEATURED`)
  that exposes Title, Description, URL, and Image only — hide unused Variant /
  Icon / Add-more controls. Cap persisted items at 1.
- Normal Links (`LINK_HUB_LINKS`) expose Title, Description, URL, and optional
  Thumbnail (`image`) per item (no unused Icon/Variant). Socials may keep Icon
  because icons are rendered.
- Products expose Title, Description, URL, Image.
- Separate sections: `socials`, `featured`, `links`, `products`.
- `description` must be non-empty for FEATURES save sanitization (seed a short
  fallback matching `title` when needed).

### 5.1 External vs internal links

- `http(s)://`, `mailto:`, `tel:` → external / protocol handlers.
- Paths starting with `/` → resolve via `resolveTemplateInternalLink`.
- Hash `#section` → in-page scroll when on Home (rare for Link Hub).
- Do not treat external URLs as website routes.

## 6. Social links behavior

`socials` FEATURES section:

- Each item: `title` (platform), `link` (profile URL), `icon` (token).
- Render as icon row under the bio.
- Same add/remove/reorder persistence as other features arrays.
- Optional mirror of `data.socialLinks` for seed only — persisted block content
  is source of truth after create.

## 7. Supported v1 sections (Home `/`)

1. **navbar** (optional chrome, required block if seeded) — Link Hub Header may
   be minimal/hidden, but if a NAVBAR block is included, `navigationItems` must
   never be empty (backend validation). Seed at least one Home section anchor
   such as `{ label: "Links", link: "#links" }` (plus Products/Contact anchors
   as needed). Do not seed Blog/Blog Detail or platform routes like `/contact`.
2. **profile** (`HERO`) — avatar, name, handle, bio, page background.
3. **socials** (`FEATURES`) — social icon links.
4. **featured** (`FEATURES`) — one elevated link/card.
5. **links** (`FEATURES`) — primary link buttons (`id="links"`).
6. **products** (`FEATURES`) — product / service link cards (`id="products"`).
7. **contact** (`CONTACT`) — email CTA + enquiry / newsletter form fields (`id="contact"`).
8. **footer** (`FOOTER`) — branding / note.

Video / embed: optional freeform `videoUrl` on featured content if present;
v1 does not require a dedicated VIDEO block type.

## 8. Editor / dashboard requirements

### 8.1 Editor (required in v1)

- Open Link Hub Pro in Website Editor like any frontend template.
- Select / edit profile text, avatar, backgrounds via existing selection model.
- Edit link labels, URLs (`features.N.link`), images, icons via editable paths.
- FEATURES block list tools (add / remove / reorder) drive link CRUD.
- Save Changes persists; Live Preview and public refresh keep edits.
- No “Static style / not saved” on real content.

### 8.2 Dedicated “Links” / Link Hub dashboard tab

**v1 decision: not required.**

Canvas + existing FEATURES editing is enough if every link field is
backend-safe and selectable. A dedicated Links panel is a **future** enhancement
that must read/write the same `features[]` content (no parallel store).

Future panel capabilities:

- add / edit / remove / reorder links
- toggle `isVisible`
- mark featured
- edit profile + socials
- later: click analytics summaries

## 9. Backend schema needs

### 9.1 v1 (frontend-safe)

Block `content` is opaque JSON today. FEATURES save spreads item fields, so
`link`, `icon`, `type`, `isFeatured`, `isVisible` persist without a schema
migration **as long as the API does not strip unknown keys**.

Required for v1 acceptance:

- Persist nested `features[]` / `items[]` objects with arbitrary string keys
  used above.
- Persist `sectionStyle` backgrounds on profile.

### 9.2 Future backend capabilities (prompt when building Pro)

Return a backend prompt when implementing:

- Per-link click analytics (`linkId`, counters, time series)
- Scheduled links (`startsAt`, `endsAt`)
- Tracking pixels / UTMs
- Custom domain binding for Link Hub sites
- QR code assets
- Multiple Link Hub pages per website
- Platform branding removal flag

Do **not** hardcode pricing / plan gates in the frontend until billing exists.

## 10. Future Pro features (field planning)

| Capability | Planned storage |
| --- | --- |
| Custom domain | website-level domain settings |
| Remove platform branding | footer `showPlatformBrand: false` |
| Advanced themes | `__templateTheme` + `sectionStyle` |
| Scheduled links | `features[n].startsAt` / `endsAt` |
| Click analytics | backend events keyed by blockId + index / linkId |
| QR customization | website / page asset URLs |
| Tracking pixels | website integrations |
| Newsletter / leads | existing CONTACT `formFields` + form submissions |
| Multiple hubs | additional pages or websites |

## 11. Navigation rules

- Default: single Home page only — no `/contact` or extra seeded pages.
- Header chrome may be null / minimal.
- User-added pages later use shared chrome + empty/default body (architecture PRD).
- Blog detail / system pages must not appear in any Link Hub menu (usually N/A).

## 11.1 Create Website setup flow (Link Hub)

For Link Hub templates (`link-hub-pro`, `link-hub-dark-pro`,
`beauty-link-hub-pro`), Create Website modal must insert an optional
**Link Hub Setup** step before AI Content:

1. Name & Domain  
2. Link Hub Setup (optional)  
3. AI Content  
4. Directory Listing  

Non–Link Hub templates keep the default 3-step flow.

Rules:

- Collect optional profile, main links, social links, featured/product links,
  and contact/newsletter fields before AI Content.
- User may **Skip this step** — template default seeds are used unchanged.
- Filled fields must seed the same backend-safe `block.content` paths used by
  the live templates (`heading` / `subheading` / `body` / `image` /
  `sectionStyle`, `features[]` with `title` / `link` / `image` / `icon` /
  `type` / `isVisible` / `isFeatured`, contact `email` / `buttonLabel` /
  `heading` / `description`).
- Do not invent frontend-only fake fields.
- No static/style-only seeded content — everything seeded here remains
  editable in Website Editor after create.
- Create without AI and Generate with AI must both honor skipped vs filled
  setup data.

## 12. Assets

Local only under:

```
src/landingTemplates/assets/link-hub/<variant>/
  images/
  avatars/
  videos/
```

Examples: `link-hub-pro/`, `link-hub-dark-pro/`, `beauty-link-hub-pro/`.

No third-party image URLs in seeds or JSX.

### 12.1 Visual design rule (creator / link-in-bio)

Link Hub templates must use **creator / link-in-bio appropriate visuals**.

- Do **not** reuse unrelated business, travel, desert, plumbing, restaurant, or
  other template family images as profile/header backgrounds.
- Prefer local creator assets under this variant’s asset folder (abstract
  gradients, soft brand fields, desk/workspace, soft blurred shapes, or
  phone/social/profile-style imagery).
- If no suitable local image exists, use a **CSS abstract/gradient background**
  (soft orbs / glow) instead of shipping a wrong stock image.
- Profile header may combine a local creator asset with a soft overlay wash so
  avatar/name remain readable.
- Desktop layout must read as a **premium centered link-in-bio column**, not a
  wide multi-section marketing landing page.

### 12.2 Dark / Linktree-style variants

Dark mobile-first variants (e.g. `link-hub-dark-pro`) may use:

- centered ~425px column on desktop
- dark CSS texture / vignette / gradient backgrounds (preferred when no local
  abstract asset fits)
- black rounded link cards with optional left thumbnails
- social icon row + join/contact CTA
- decorative kebab / verified badge chrome that remains hideable via existing
  container selection (no fake backend fields)

### 12.3 Beauty / creator warm image variants

Beauty/creator Link Hub templates (e.g. `beauty-link-hub-pro`) can use warm
image-based mobile layouts (beige/cream overlays, soft glass pills, featured
tutorial cards), but must use the **same editable/persisted Link Hub data
model** as other variants — no fake frontend-only fields.

## 13. Registration checklist

- `frontendTemplateCatalog.ts`
- `templateRegistry.ts` + `templateChromeRegistry.ts`
- `frontendTemplateEditorSupport.ts` (schema + hydration)
- `frontendTemplateSiteData.ts`
- `LandingPreview.tsx`
- Gallery / `Templates.tsx` card metadata
- `FrontendTemplateThemePanel.jsx` (theme-ready)
- Category list (`creator`)

## 14. Acceptance criteria

- [ ] Link Hub Pro appears in gallery under Creator / Link in Bio.
- [ ] Creating a site seeds Home `/` with profile, socials, featured, links,
      products, contact, footer — no extra default pages.
- [ ] Avatar, name, handle, bio, background editable and persisted.
- [ ] All link labels, URLs, images editable; add/remove/reorder via FEATURES.
- [ ] Featured + product sections render distinctly.
- [ ] Social icons use persisted links.
- [ ] Contact / newsletter form submits through existing form pipeline.
- [ ] External links open safely; internal paths resolve correctly.
- [ ] Editor, Live Preview, public site, and refresh stay in sync.
- [ ] No real content shows “Static style / not saved”.
- [ ] No restricted test/build/lint/dev commands required for merge of this work.
