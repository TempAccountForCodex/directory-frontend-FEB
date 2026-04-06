/**
 * Step 4.6 — Preview API Hooks
 *
 * React hooks for fetching template/website preview data
 * from the Preview API endpoints (Step 4.5).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import axios, { isAxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ===================================================================
// Types
// ===================================================================

export interface TemplateScreenshots {
  desktop: string | null;
  mobile: string | null;
  thumbnail: string | null;
}

export interface TemplatePreviewDetail {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  version: string;
  previewImage: string | null;
  screenshots: TemplateScreenshots;
  pageCount?: number;
  blockCount?: number;
}

export interface PreviewGalleryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  previewImage: string | null;
  screenshots: TemplateScreenshots;
  usageCount?: number;
  pageCount?: number;
  blockCount?: number;
}

export interface PreviewGalleryResponse {
  data: PreviewGalleryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WebsitePageStatus {
  pageId: number;
  title: string;
  desktop: "cached" | "not_cached";
  mobile: "cached" | "not_cached";
}

export interface WebsitePreviewStatus {
  websiteId: number;
  name: string;
  pageCount: number;
  pages: WebsitePageStatus[];
}

// ===================================================================
// useTemplateScreenshots — Fetch screenshots for a single template
// ===================================================================

interface UseTemplateScreenshotsReturn {
  screenshots: TemplateScreenshots | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTemplateScreenshots(
  templateId: string | null,
): UseTemplateScreenshotsReturn {
  const [screenshots, setScreenshots] = useState<TemplateScreenshots | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!templateId) {
      setScreenshots(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(`${API_URL}/previews/templates/${templateId}/screenshots`)
      .then((res) => {
        if (!cancelled) {
          // Backend wraps screenshots in a data envelope: { data: { templateId, name, screenshots: {...} } }
          // Extract the inner screenshots object
          const body = res.data?.data || res.data;
          const screenshotsData = body?.screenshots || body || null;
          setScreenshots(screenshotsData);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = isAxiosError(err)
            ? (err.response?.data?.message ?? err.message)
            : "Failed to load screenshots";
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [templateId, trigger]);

  const refetch = useCallback(() => setTrigger((p) => p + 1), []);

  return { screenshots, loading, error, refetch };
}

// ===================================================================
// usePreviewGallery — Paginated gallery with preview screenshots
// ===================================================================

interface UsePreviewGalleryOptions {
  page?: number;
  limit?: number;
  category?: string;
  sort?: "popular" | "recent" | "name";
}

interface UsePreviewGalleryReturn {
  items: PreviewGalleryItem[];
  pagination: PreviewGalleryResponse["pagination"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePreviewGallery(
  options: UsePreviewGalleryOptions = {},
): UsePreviewGalleryReturn {
  const { page = 1, limit = 20, category, sort } = options;
  const [items, setItems] = useState<PreviewGalleryItem[]>([]);
  const [pagination, setPagination] = useState<
    PreviewGalleryResponse["pagination"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    // Convert page-based to offset-based for backend
    const offset = (page - 1) * limit;
    params.append("offset", String(offset));
    params.append("limit", String(limit));
    if (category) params.append("category", category);
    if (sort) params.append("sortBy", sort); // backend expects 'sortBy', not 'sort'

    axios
      .get(`${API_URL}/previews/templates?${params.toString()}`)
      .then((res) => {
        if (!cancelled) {
          const body = res.data;
          const rawItems = body?.data || [];
          // Normalize gallery items: map previews.thumbnail to previewImage for TemplateSummary compat
          setItems(
            rawItems.map((item: Record<string, unknown>) => {
              const previews = item.previews as
                | Record<string, string | null>
                | undefined;
              return {
                ...item,
                previewImage:
                  previews?.thumbnail ||
                  (item.previewImage as string | null) ||
                  null,
                screenshots: {
                  desktop: previews?.desktop || null,
                  mobile: previews?.mobile || null,
                  thumbnail: previews?.thumbnail || null,
                },
              };
            }) as PreviewGalleryItem[],
          );

          // Convert offset-based pagination to page-based for frontend consumers
          const backendPag = body?.pagination;
          if (backendPag) {
            const totalItems = backendPag.total || 0;
            const totalPages = Math.ceil(totalItems / limit);
            setPagination({
              page,
              limit,
              total: totalItems,
              totalPages,
            });
          } else {
            setPagination(null);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = isAxiosError(err)
            ? (err.response?.data?.message ?? err.message)
            : "Failed to load preview gallery";
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, category, sort, trigger]);

  const refetch = useCallback(() => setTrigger((p) => p + 1), []);

  return { items, pagination, loading, error, refetch };
}

// ===================================================================
// useWebsitePreviewStatus — Check cache/generation status
// ===================================================================

interface UseWebsitePreviewStatusReturn {
  status: WebsitePreviewStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWebsitePreviewStatus(
  websiteId: string | number | null,
  token?: string,
): UseWebsitePreviewStatusReturn {
  const [status, setStatus] = useState<WebsitePreviewStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!websiteId) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    axios
      .get(`${API_URL}/previews/websites/${websiteId}/status`, { headers })
      .then((res) => {
        if (!cancelled) setStatus(res.data?.data || res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = isAxiosError(err)
            ? (err.response?.data?.message ?? err.message)
            : "Failed to load preview status";
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [websiteId, token, trigger]);

  const refetch = useCallback(() => setTrigger((p) => p + 1), []);

  return { status, loading, error, refetch };
}

// ===================================================================
// usePreviewIframe — Manages iframe src URL with signed token auth
// Step 4.9: Acquires short-lived preview tokens for iframe auth
// ===================================================================

interface UsePreviewIframeReturn {
  src: string;
  iframeLoading: boolean;
  iframeError: boolean;
  tokenExpired: boolean;
  onLoad: () => void;
  onError: () => void;
  refresh: () => void;
}

/** Refresh token at 80% of TTL to avoid expiry mid-view */
const TOKEN_REFRESH_RATIO = 0.8;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 min fallback

export function usePreviewIframe(
  websiteId: string | number | null,
  pageId: string | number | null,
  viewport: "desktop" | "tablet" | "mobile",
): UsePreviewIframeReturn {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [debouncedViewport, setDebouncedViewport] = useState(viewport);
  const abortRef = useRef<AbortController | null>(null);

  // Acquire a preview token from the backend
  const acquireToken = useCallback(
    async (wId: string | number, pId: string | number) => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await axios.post(
          `${API_URL}/previews/websites/${wId}/pages/${pId}/token`,
          null,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return null;

        const { previewToken: token, expiresAt } = res.data?.data || {};
        if (!token) throw new Error("No token returned");

        setPreviewToken(token);
        setTokenExpired(false);
        setIframeError(false);

        // Calculate TTL for auto-refresh scheduling
        const ttlMs = expiresAt
          ? new Date(expiresAt).getTime() - Date.now()
          : DEFAULT_TTL_MS;

        return { token, ttlMs };
      } catch (err) {
        if (axios.isCancel(err)) return null;
        setIframeError(true);
        setPreviewToken(null);
        return null;
      }
    },
    [],
  );

  // Setup auto-refresh timer
  const scheduleRefresh = useCallback(
    (ttlMs: number, wId: string | number, pId: string | number) => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      const refreshMs = Math.max(ttlMs * TOKEN_REFRESH_RATIO, 10_000); // Min 10s

      refreshTimerRef.current = setInterval(async () => {
        const result = await acquireToken(wId, pId);
        if (!result) {
          setTokenExpired(true);
          if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        }
      }, refreshMs);
    },
    [acquireToken],
  );

  // Acquire token on mount and when websiteId/pageId changes
  useEffect(() => {
    if (!websiteId || !pageId) {
      setPreviewToken(null);
      setIframeLoading(true);
      return;
    }

    let cancelled = false;
    setIframeLoading(true);
    setIframeError(false);
    setTokenExpired(false);

    (async () => {
      const result = await acquireToken(websiteId, pageId);
      if (cancelled || !result) return;
      scheduleRefresh(result.ttlMs, websiteId, pageId);
    })();

    return () => {
      cancelled = true;
      if (abortRef.current) abortRef.current.abort();
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [websiteId, pageId, acquireToken, scheduleRefresh]);

  // Debounce viewport changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedViewport(viewport);
      setIframeLoading(true);
      setIframeError(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [viewport]);

  const apiViewport =
    debouncedViewport === "tablet" ? "desktop" : debouncedViewport;

  // Build iframe src with token instead of relying on bearer headers
  const src =
    websiteId && pageId && previewToken
      ? `${API_URL}/previews/websites/${websiteId}/pages/${pageId}/html?viewport=${apiViewport}&token=${encodeURIComponent(previewToken)}&_t=${cacheBuster}`
      : "";

  const onLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(false);
  }, []);

  const onError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
  }, []);

  const refresh = useCallback(async () => {
    if (!websiteId || !pageId) return;
    setIframeLoading(true);
    setIframeError(false);
    setTokenExpired(false);

    const result = await acquireToken(websiteId, pageId);
    if (result) {
      setCacheBuster(Date.now());
      scheduleRefresh(result.ttlMs, websiteId, pageId);
    }
  }, [websiteId, pageId, acquireToken, scheduleRefresh]);

  return {
    src,
    iframeLoading,
    iframeError,
    tokenExpired,
    onLoad,
    onError,
    refresh,
  };
}
