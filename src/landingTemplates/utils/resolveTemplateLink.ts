/**
 * Resolve a template-internal path (e.g. `/about`, `/contact`) to the current
 * website or landing-preview base so buttons never navigate to platform routes
 * like `localhost:5173/about`.
 *
 * Bases (checked in order on every call — never cached at module load):
 * 1. Public site: `/site/:slug`
 * 2. Landing preview: `/landing-preview/:templateId`
 * 3. Optional `__siteSlug` / siteSlug from template content when not on those paths
 * 4. Pass-through for absolute URLs, hashes, mailto, tel, and empty targets
 */
export const resolveTemplateInternalLink = (
  target: string | null | undefined,
  options?: { siteSlug?: string | null },
): string => {
  const raw = typeof target === "string" ? target.trim() : "";
  if (!raw) return "#";

  if (
    raw.startsWith("#") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("//") ||
    raw.startsWith("mailto:") ||
    raw.startsWith("tel:")
  ) {
    return raw;
  }

  // Already scoped to site or landing-preview — leave as-is.
  if (
    raw.startsWith("/site/") ||
    raw.startsWith("/landing-preview/") ||
    raw.startsWith("/dashboard/")
  ) {
    return raw;
  }

  const suffix = raw.startsWith("/") ? raw : `/${raw}`;
  const pathname =
    typeof window !== "undefined" ? window.location.pathname || "" : "";
  const search =
    typeof window !== "undefined" ? window.location.search || "" : "";

  const siteMatch = pathname.match(/^(\/site\/[^/]+)/);
  if (siteMatch) {
    return suffix === "/" ? siteMatch[1] : `${siteMatch[1]}${suffix}`;
  }

  const previewMatch = pathname.match(/^(\/landing-preview\/[^/]+)/);
  if (previewMatch) {
    return suffix === "/"
      ? `${previewMatch[1]}${search}`
      : `${previewMatch[1]}${suffix}${search}`;
  }

  const slug =
    typeof options?.siteSlug === "string" && options.siteSlug.trim()
      ? options.siteSlug.trim().replace(/^\/+|\/+$/g, "")
      : "";
  if (slug) {
    return suffix === "/" ? `/site/${slug}` : `/site/${slug}${suffix}`;
  }

  return suffix;
};
