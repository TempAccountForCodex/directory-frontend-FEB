import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

/**
 * A page/menu navigation link resolved from a website's menu.
 * `target` is the raw path stored on the menu item (e.g. "/blog"); `href` is
 * that path resolved against the current site base (e.g. "/site/:slug/blog")
 * so it works both on the public site and inside the editor canvas.
 */
export interface TemplatePageNavLink {
  id: string;
  label: string;
  target: string;
  href: string;
}

// Resolve relative nav targets to the current site's base path (/site/:slug).
// Mirrors the logic in TemplateNavbarHeader so behaviour is identical across
// every template that renders page links.
const getSiteBase = (): string => {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/^(\/site\/[^/]+)/);
  return match ? match[1] : "";
};

export const resolveNavTarget = (target: string): string => {
  if (
    !target ||
    target.startsWith("#") ||
    target.startsWith("http") ||
    target.startsWith("//")
  ) {
    return target;
  }
  const siteBase = getSiteBase();
  return siteBase
    ? `${siteBase}${target.startsWith("/") ? target : `/${target}`}`
    : target;
};

const readNavTarget = (item: Record<string, unknown>): string => {
  const value = item.target ?? item.link ?? item.url ?? "";
  return typeof value === "string" ? value : "";
};

/**
 * Shared hook that returns the website menu's page links so ANY template can
 * render live page navigation (added pages appear, removed pages disappear).
 *
 * This is the reusable core behind the Company/Company-Executive header's
 * page-aware menu, extracted so every template gets the same behaviour without
 * duplicating the fetch/normalize logic. It intentionally returns only real
 * page links (internal paths other than Home) so a template's existing brand
 * logo / in-page section anchors are never duplicated.
 *
 * @param websiteId - the website whose menu to load (usually `data.websiteId`)
 * @param menuId    - optional explicit menu id/handle; defaults to the first menu
 */
export function useWebsiteMenuNavLinks(
  websiteId?: string | number | null,
  menuId?: string | number | null,
): TemplatePageNavLink[] {
  const [links, setLinks] = useState<TemplatePageNavLink[]>([]);

  useEffect(() => {
    if (!websiteId) {
      setLinks([]);
      return;
    }
    let cancelled = false;

    apiClient
      .get(`/websites/${websiteId}/menus`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        const menus = Array.isArray(raw) ? raw : [];
        const found = menuId
          ? menus.find(
              (m: any) =>
                String(m.id) === String(menuId) || m.handle === menuId,
            )
          : menus[0];
        const items: Array<Record<string, unknown>> = Array.isArray(
          found?.items,
        )
          ? found.items
          : [];

        const seen = new Set<string>();
        const pageLinks: TemplatePageNavLink[] = [];
        items.forEach((item, index) => {
          const target = readNavTarget(item);
          // Only real internal page links — skip Home ("/"), in-page anchors
          // ("#..."), and external/custom URLs so we don't duplicate the
          // template's own logo/section navigation.
          if (!target || target === "/" || !target.startsWith("/")) return;
          if (seen.has(target)) return;
          seen.add(target);
          const label =
            typeof item.label === "string" && item.label.trim()
              ? item.label
              : target.replace(/^\//, "");
          pageLinks.push({
            id: String(item.id ?? `${target}-${index}`),
            label,
            target,
            href: resolveNavTarget(target),
          });
        });

        setLinks(pageLinks);
      })
      .catch(() => {
        if (!cancelled) setLinks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [websiteId, menuId]);

  return links;
}

export default useWebsiteMenuNavLinks;
