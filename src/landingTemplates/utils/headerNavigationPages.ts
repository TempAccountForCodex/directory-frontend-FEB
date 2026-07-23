/**
 * Decide whether a website page should appear in the shared Header nav.
 * Blog listing (BLOG_INDEX / /blog) is allowed; blog detail, article, system,
 * and other non-navigation pages are excluded.
 */

export type HeaderNavPageLike = {
  title?: string | null;
  path?: string | null;
  isHome?: boolean | null;
  isPublished?: boolean | null;
  pageType?: string | null;
  isNavigationPage?: boolean | null;
  type?: string | null;
};

const normalizeToken = (value: unknown): string =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const EXCLUDED_PAGE_TYPE_TOKENS = new Set([
  "blogdetail",
  "blogarticle",
  "blogpost",
  "article",
  "articledetail",
  "detail",
  "detailpage",
  "system",
  "internal",
  "dynamic",
  "dynamictemplate",
  "hiddendetail",
  "hidden",
]);

const EXCLUDED_PATH_TOKENS = [
  "blog-detail",
  "blogdetail",
  "article-detail",
  "post-detail",
];

/**
 * True when metadata/path/title mark this entry as a detail/system page that
 * must not appear in Header. Section anchors (empty / hash targets) are not
 * excluded by path rules alone.
 */
export const isExcludedFromHeaderNavigation = (
  page: HeaderNavPageLike | null | undefined,
): boolean => {
  if (!page || typeof page !== "object") return false;
  if (page.isNavigationPage === false) return true;

  const pageTypeToken = normalizeToken(page.pageType || page.type);
  if (pageTypeToken && EXCLUDED_PAGE_TYPE_TOKENS.has(pageTypeToken)) {
    return true;
  }

  const path = String(page.path || "")
    .trim()
    .toLowerCase();

  // Nested blog/article paths are detail routes, not top-level nav pages.
  // e.g. /blog/my-post — keep /blog itself.
  if (/^\/blog\/.+/.test(path) || /^\/articles?\/.+/.test(path)) {
    return true;
  }

  if (
    EXCLUDED_PATH_TOKENS.some(
      (token) =>
        path === `/${token}` ||
        path.includes(`/${token}`) ||
        path.includes(token),
    )
  ) {
    return true;
  }

  // Title fallback when metadata is missing (e.g. "Blog Detail").
  if (/\bblog\s*detail\b/i.test(String(page.title || ""))) return true;
  if (/\barticle\s*detail\b/i.test(String(page.title || ""))) return true;

  return false;
};

/**
 * Returns true when a persisted page is eligible for Header navigation.
 */
export const isHeaderNavigationPage = (
  page: HeaderNavPageLike | null | undefined,
): boolean => {
  if (!page || typeof page !== "object") return false;
  if (page.isPublished === false) return false;
  if (isExcludedFromHeaderNavigation(page)) return false;

  const path = String(page.path || "").trim();
  if (!path && !page.isHome) return false;

  return true;
};

/**
 * Filter a page list down to Header-eligible entries (published + navigable).
 */
export const filterHeaderNavigationPages = <T extends HeaderNavPageLike>(
  pages: T[] | null | undefined,
): T[] => (Array.isArray(pages) ? pages.filter(isHeaderNavigationPage) : []);
