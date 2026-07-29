## Template Schema Backend Follow-ups

This file tracks reusable content patterns that are visible in templates, expected to persist after `Save Changes`, but do not yet have a safe backend schema path.

### Format

- `pattern`
- `target block type`
- `required fields`
- `affected templates`
- `example visible elements`
- `why existing schema is insufficient`

## Follow-up Patterns

### 1. `socialProof`

- `target block type`: `HERO` or `FEATURES`
- `required fields`:
  - `socialProof.label`
  - `socialProof.value`
  - `socialProof.rating`
  - `socialProof.avatars[]`
  - `socialProof.avatars[].image`
  - `socialProof.avatars[].alt`
- `affected templates`:
  - `company`
  - `company-premium`
  - `company-executive`
  - `premium`
  - store templates with trust/avatar rows
- `example visible elements`:
  - avatar rows
  - star/rating row
  - `100+ happy customers`
  - trust badges adjacent to hero CTA
- `why existing schema is insufficient`:
  - current hero/features fields cover heading, subheading, CTA, and image, but not structured social-proof groups with avatar arrays and rating metadata.

### 2. `detailGroups[]`

- `target block type`: `TEXT`
- `required fields`:
  - `detailGroups[]`
  - `detailGroups[].title`
  - `detailGroups[].items[]`
- `affected templates`:
  - `company-executive`
  - any future company/about variants with grouped bullet cards
- `example visible elements`:
  - `What we build`
  - `How we work`
  - grouped bullets inside about/detail cards
- `why existing schema is insufficient`:
  - current `TEXT` shape covers `title/body/image/button` style content but not grouped mini-card collections.

### 3. `teamMembers[]`

- `target block type`: `FEATURES` or dedicated reusable team block later
- `required fields`:
  - `teamMembers[]`
  - `teamMembers[].name`
  - `teamMembers[].role`
  - `teamMembers[].bio`
  - `teamMembers[].image`
- `affected templates`:
  - `company-executive`
  - future company/team layouts
- `example visible elements`:
  - `Leadership`
  - `Operations`
  - `Executive team`
  - team/avatar labels
- `why existing schema is insufficient`:
  - current `FEATURES` supports flat `icon/title/description`; it cannot represent actual team/member content safely.

### 4. `projectCardMeta`

- `target block type`: `GALLERY` or generic `items[]`
- `required fields`:
  - `items[].title`
  - `items[].description`
  - `items[].image`
  - `items[].category`
  - `items[].client`
  - `items[].linkText`
  - `items[].linkUrl`
- `affected templates`:
  - `portfolio-agency`
  - `portfolio-creative`
  - `portfolio-photo-studio`
  - `company-premium` featured card images/text if not remapped elsewhere
- `example visible elements`:
  - featured project/client/campaign cards
  - image + title + small metadata stacks
- `why existing schema is insufficient`:
  - current safe fields often cover only generic feature text or gallery image/caption and miss richer project metadata.

### 5. `articleCardMeta`

- `target block type`: generic `items[]` / blog-oriented block
- `required fields`:
  - `items[].title`
  - `items[].description`
  - `items[].image`
  - `items[].category`
  - `items[].author`
  - `items[].publishedAt`
  - `items[].slug`
- `affected templates`:
  - `blog`
  - `blog-premium`
- `example visible elements`:
  - article cards
  - featured post meta rows
- `why existing schema is insufficient`:
  - generic text/features fields do not capture article metadata cleanly.

### 6. `productCardMeta`

- `target block type`: generic `items[]` / product-oriented block
- `required fields`:
  - `items[].title`
  - `items[].description`
  - `items[].image`
  - `items[].price`
  - `items[].badge`
  - `items[].ctaText`
  - `items[].ctaUrl`
- `affected templates`:
  - `store-basic`
  - `store-premium`
  - `store-performance`
  - `store-fit`
  - `store-paws`
  - `coffee-pro` (menu cards currently bind `FEATURES.features[].price` /
    `features[].image` / `features[].icon` as category — confirm opaque JSON
    persistence or promote `features[].price` / `features[].image` to the
    official FEATURES item schema)
- `example visible elements`:
  - product cards
  - trust/product CTA tiles
  - merchandising badges
  - cafe menu cards (name, description, image, category tag, price)
- `why existing schema is insufficient`:
  - current reusable fields do not safely represent store-specific product content.
  - cafe menu prices on `features[]` are not in the documented FEATURES contract.

### 7. `eyebrow`

- `target block type`: `HERO`, `TEXT`, `FEATURES`, `CONTACT`
- `required fields`:
  - `eyebrow`
  - `eyebrowStyle`
- `affected templates`:
  - company templates
  - premium
  - multiple shared sections across remaining groups
- `example visible elements`:
  - `OUR PROCESS`
  - `Get to know us`
  - small badge/chip text above headings
- `why existing schema is insufficient`:
  - many sections visually depend on an eyebrow/badge label, but current safe fields do not expose a consistent reusable path for it.

### 8. `backgroundMedia`

- `target block type`: `HERO`, `TEXT`, `FEATURES`, `GALLERY`
- `required fields`:
  - `backgroundImage`
  - `backgroundVideo`
  - `backgroundMediaStyle`
- `affected templates`:
  - company hero/background-heavy templates
  - premium
  - store templates
- `example visible elements`:
  - section background images
  - hero background media
- `why existing schema is insufficient`:
  - current replaceable image support covers direct `image` fields more safely than background media patterns.

### 9. `splitContentCards`

- `target block type`: `FEATURES` or dedicated reusable split-content block
- `required fields`:
  - `eyebrow`
  - `heading`
  - `subItems[]`
  - `subItems[].label`
  - `darkCard.heading`
  - `darkCard.body`
  - `darkCard.footerLabel`
  - `image`
  - `imageStyle`
- `affected templates`:
  - `company-executive`
  - `CompanyStudioTemplate`
- `example visible elements`:
  - lower split image + text subsection under the company process area
  - `Team`
  - `Strong visuals for trust and leadership.`
  - `Leadership`
  - `Operations`
  - `Built to feel sharp, premium, and easy to scan.`
  - `Executive team`
- `why existing schema is insufficient`:
  - current `FEATURES.features[]` is already consumed by the upper process cards in this section. Reusing the same array for the lower split content causes cross-section collisions, so this subsection needs its own independent persisted structure.

### 10. `containerStyles`

- `target block type`: reusable base content schema for every template block type
- `required fields`:
  - `containerStyles` object with arbitrary stable container-id keys
  - values may contain background color/image/video/type/animated preset/position/size/repeat, padding, border, radius, overlay, width, and height
- `affected templates`: all current and future template groups
- `example visible elements`: nested wrappers, cards, split panels, inner hero/about containers, and selectable divs exposing background/layout controls
- `why existing schema is insufficient`: nested containers need independent persisted styling without one backend field per DOM node. Validation must preserve arbitrary `containerStyles` keys through create, update, bulk save, reload, and public rendering.

### 11. `hiddenElements` + `hiddenContainers` (persistent delete)

- `target block type`: reusable base content schema for every template block type
- `required fields`:
  - `hiddenElements` object: a flat `Record<string, boolean>` keyed by the deleted element's field path, e.g. `{ "heading": true, "eyebrow": true, "image": true, "splitContentCards.darkCard.body": true }`
  - `hiddenContainers` object: a flat `Record<string, boolean>` keyed by a deleted container's stable id (the element's `data-static-id`), e.g. `{ "fallback-div-1__div-0": true, "splitContentCards.darkCard.__container": true }`. Used when a whole div/wrapper/card (with its children + container styles) is deleted rather than a single field.
- `affected templates`: all current and future template groups (shared delete pipeline)
- `example visible elements`: a deleted optional heading / eyebrow / subheading / body / description / CTA / button / image that must stay gone after `Save Changes` and after an editor refresh
- `why existing schema is insufficient`:
  - Deleting an optional single field must not blank the value to `""` — templates fall back to their default via `value || "Default"`, so the element would visually revert instead of disappearing.
  - Array items (`features[]`, `items[]`, `stats[]`, `detailGroups[].items[]`, `socialProof.avatars[]`, `splitContentCards.subItems[]`, ...) and top-level sections/blocks are removed structurally and need no schema change. Only optional single fields use this map.
  - Deleting a whole div/static container/wrapper cannot map to a single field either. It is recorded in `hiddenContainers` keyed by the container's stable id, and renderers hide that container (and its children/styles) entirely.
  - The frontend already writes `hiddenElements` and `hiddenContainers` into `block.content` and honours both in the editor canvas, in Live Preview, and after refresh (renderers skip any hidden field/container). **For deletion to survive `Save Changes`, backend block validation in `backend/contentTypes/registry.js` must allow the generic `hiddenElements` AND `hiddenContainers` objects on every block type.** Both are flat boolean maps, so no DB migration is required (`block.content` is JSON). If the backend strips unknown fields, these deletions will reappear after an editor refresh even though everything works before save.
