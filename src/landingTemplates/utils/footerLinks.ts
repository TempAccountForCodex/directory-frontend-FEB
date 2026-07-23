/**
 * Canonical footer navigation links for template footers.
 *
 * Templates must render footer links from the Footer block's persisted `links`
 * repeater — the exact field the Footer block editor edits — so the editor
 * panel and the visible footer always match, and add/edit/remove persists.
 *
 * `normalizeFooterLinks` returns a flat `{ label, url }[]`. Precedence:
 *   1. `footer.links` (canonical editor field)
 *   2. legacy grouped `footer.columns[].links` (older seeds) — display-only, so
 *      pre-existing footers keep rendering until their links are edited.
 * An empty result renders no links, matching an empty editor.
 */

export interface FooterNavLink {
  label: string;
  url: string;
}

const toLink = (item: unknown): FooterNavLink | null => {
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;
  const label = String(rec.label ?? "").trim();
  if (!label) return null;
  const url = String(rec.url ?? rec.link ?? "").trim() || "#";
  return { label, url };
};

export const normalizeFooterLinks = (
  footer: Record<string, unknown>,
): FooterNavLink[] => {
  const links = Array.isArray(footer?.links) ? footer.links : [];
  const normalized = links
    .map(toLink)
    .filter((l): l is FooterNavLink => l !== null);
  if (normalized.length) return normalized;

  // Legacy fallback: flatten grouped columns from older footer seeds so
  // existing footers do not go blank before their links are re-edited.
  const columns = Array.isArray(footer?.columns) ? footer.columns : [];
  return columns
    .flatMap((col) => {
      const rec = col as Record<string, unknown>;
      return col && typeof col === "object" && Array.isArray(rec.links)
        ? rec.links
        : [];
    })
    .map(toLink)
    .filter((l): l is FooterNavLink => l !== null);
};

/**
 * True when the canonical `footer.links` field is the render source. Only then
 * should the template wire inline `getEditableTextProps(..., "links.<i>.label")`
 * — editing must never write to a legacy `columns` path that the editor panel
 * does not manage.
 */
export const footerHasCanonicalLinks = (
  footer: Record<string, unknown>,
): boolean =>
  Array.isArray(footer?.links) &&
  footer.links.some(
    (l) =>
      Boolean(l) &&
      typeof l === "object" &&
      String((l as Record<string, unknown>).label ?? "").trim().length > 0,
  );
