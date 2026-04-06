/**
 * useTenantUrl -- Tenant-aware URL builder for dynamic block internal links.
 *
 * Detects delivery mode from:
 * - URL params (/s/:slug/*) -> path-based
 * - Subdomain (slug.domain.com) -> subdomain-based
 * - Custom domain -> root-relative
 *
 * Returns a buildUrl(path) function that prefixes the correct base.
 */

import { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

type DeliveryMode = "path" | "subdomain" | "custom-domain";

interface TenantUrlResult {
  /** Build a tenant-scoped internal URL */
  buildUrl: (path: string) => string;
  /** Navigate to a tenant-scoped internal URL */
  navigateTo: (path: string) => void;
  /** Current delivery mode */
  deliveryMode: DeliveryMode;
  /** Current site slug (if known) */
  siteSlug: string | null;
}

export function useTenantUrl(): TenantUrlResult {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { deliveryMode, siteSlug } = useMemo(() => {
    // 1. Path-based: /s/:slug or /site/:slug
    if (slug) {
      return { deliveryMode: "path" as DeliveryMode, siteSlug: slug };
    }

    // 2. Subdomain-based
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const reserved = [
      "www",
      "api",
      "admin",
      "app",
      "dashboard",
      "staging",
      "dev",
      "test",
      "localhost",
    ];

    if (parts.length > 1 && !reserved.includes(parts[0].toLowerCase())) {
      return {
        deliveryMode: "subdomain" as DeliveryMode,
        siteSlug: parts[0].toLowerCase(),
      };
    }

    // 3. Custom domain -- no slug prefix needed
    return { deliveryMode: "custom-domain" as DeliveryMode, siteSlug: null };
  }, [slug]);

  const buildUrl = useCallback(
    (path: string): string => {
      // Normalize path to start with /
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;

      // External URLs pass through unchanged
      if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
      }

      switch (deliveryMode) {
        case "path":
          // /s/:slug/blog/my-post
          return `/s/${siteSlug}${normalizedPath}`;
        case "subdomain":
          // Subdomain already scopes the site -- just use relative path
          return normalizedPath;
        case "custom-domain":
          // Root-relative
          return normalizedPath;
        default:
          return normalizedPath;
      }
    },
    [deliveryMode, siteSlug],
  );

  const navigateTo = useCallback(
    (path: string) => {
      const url = buildUrl(path);
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    },
    [buildUrl, navigate],
  );

  return { buildUrl, navigateTo, deliveryMode, siteSlug };
}

export default useTenantUrl;
