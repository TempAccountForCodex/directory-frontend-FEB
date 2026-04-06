/**
 * useDynamicBlockData — Step 2.22
 *
 * Manages data fetching for a single dynamic block.
 * - Integrates with DynamicBlockContext for pre-fetched SSR data
 * - Uses AbortController for fetch cancellation on unmount/dep change
 * - Debounces dataSource changes via useDebouncedValue
 * - Supports configurable refreshInterval
 * - Registers block with DynamicBlockContext on mount
 */

import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { DynamicBlockContext } from "../context/DynamicBlockContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/* -------- Data-source → public API endpoint mapping -------- */

/**
 * Maps a dataSource string (e.g. "blog?page=1&limit=9") to the correct
 * public API URL. The prefix before "?" identifies the data type.
 *
 * If the dataSource doesn't match any known prefix it is returned as-is
 * (appended to API_URL), which preserves forward-compatibility for future
 * block types that provide a fully-qualified relative path.
 */
function resolveDataSourceUrl(dataSource: string): string {
  // Split into prefix and query string
  const qIndex = dataSource.indexOf("?");
  const prefix = qIndex >= 0 ? dataSource.slice(0, qIndex) : dataSource;
  const queryString = qIndex >= 0 ? dataSource.slice(qIndex) : "";

  // Special case: blog-article?identifier=<slug> → /api/blogs/public/<slug>
  if (prefix === "blog-article") {
    const params = new URLSearchParams(queryString);
    const identifier = params.get("identifier");
    if (identifier) {
      return `${API_URL}/blogs/public/${encodeURIComponent(identifier)}`;
    }
    // Fallback — no identifier provided
    return `${API_URL}/blogs/public`;
  }

  // Standard prefix → API path mappings
  const ENDPOINT_MAP: Record<string, string> = {
    blog: "/blogs/public",
    products: "/products/public",
    listing: "/directory/listings",
    review: "/reviews/listings",
    event: "/events/public",
  };

  const apiPath = ENDPOINT_MAP[prefix];
  if (apiPath) {
    return `${API_URL}${apiPath}${queryString}`;
  }

  // Unknown prefix — treat the entire dataSource as a relative path
  return `${API_URL}/${dataSource}`;
}

/* ---------------- Types ---------------- */
export interface DynamicBlockDataOptions {
  /** Whether to fetch data (default: true) */
  enabled?: boolean;
  /** Auto-refresh interval in ms. 0 = disabled (default: 0) */
  refreshInterval?: number;
  /** Pre-fetched data from SSR */
  initialData?: any;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Debounce delay for dataSource changes in ms (default: 300) */
  debounceMs?: number;
}

export interface DynamicBlockDataResult {
  data: any;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

/* ---------------- Hook ---------------- */
function useDynamicBlockData(
  blockId: number,
  blockType: string,
  dataSource: string | null,
  options: DynamicBlockDataOptions = {},
): DynamicBlockDataResult {
  const {
    enabled = true,
    refreshInterval = 0,
    initialData = null,
    onError,
    debounceMs = 300,
  } = options;

  // Access context (optional — may not be available in all render contexts)
  const context = useContext(DynamicBlockContext);

  // Debounce the dataSource to avoid rapid re-fetching
  const debouncedDataSource = useDebouncedValue(dataSource, debounceMs);

  // Whether we should actually fetch
  const shouldFetch = Boolean(debouncedDataSource) && enabled;

  // Internal state
  const [data, setData] = useState<any>(() => {
    // Prefer SSR pre-fetched data from context
    if (context && context.dynamicData.has(blockId)) {
      return context.dynamicData.get(blockId);
    }
    return initialData;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ref for abort controller to cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ref to track mount state (avoids state updates on unmounted component)
  const mountedRef = useRef(true);

  // Counter to force re-fetch on manual refresh calls
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Track mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Register with context on mount when we have a dataSource
  useEffect(() => {
    if (context && dataSource) {
      context.registerDynamicBlock(blockId, dataSource);
    }
  }, [blockId, dataSource, context]);

  // Core fetch function (stable reference via useCallback)
  const performFetch = useCallback(
    async (signal: AbortSignal) => {
      if (!debouncedDataSource || !enabled) return;

      // Check context for pre-fetched data (avoid redundant fetch)
      if (context && context.dynamicData.has(blockId)) {
        const cachedData = context.dynamicData.get(blockId);
        if (mountedRef.current) {
          setData(cachedData);
          setLoading(false);
          setError(null);
          setLastUpdated(new Date());
        }
        return;
      }

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const url = resolveDataSourceUrl(debouncedDataSource);

        const response = await fetch(url, { signal });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch block data: HTTP ${response.status}`,
          );
        }

        const json = await response.json();
        const fetchedData = json.data ?? json;

        if (mountedRef.current) {
          setData(fetchedData);
          setLoading(false);
          setLastUpdated(new Date());
        }
      } catch (err: any) {
        if (err.name === "AbortError") return; // Cancelled — ignore

        const errorMsg = err.message || "Unknown error fetching block data";
        if (mountedRef.current) {
          setError(errorMsg);
          setLoading(false);
          setData(null);
        }
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMsg));
        }
      }
    },
    [blockId, context, debouncedDataSource, enabled, onError],
  );

  // Main fetch effect — runs when debouncedDataSource or fetchTrigger changes
  useEffect(() => {
    if (!shouldFetch) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    performFetch(controller.signal);

    return () => {
      controller.abort();
    };
  }, [shouldFetch, debouncedDataSource, fetchTrigger, performFetch]);

  // RefreshInterval effect
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !shouldFetch) return;

    const intervalId = setInterval(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      performFetch(controller.signal);
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval, shouldFetch, performFetch]);

  // refresh() — forces immediate re-fetch (bypasses debounce)
  const refresh = useCallback(() => {
    if (!dataSource || !enabled) return;

    // Clear context cache if available
    if (context) {
      context.refreshBlock(blockId);
    }

    // Increment fetch trigger to force re-fetch even if debouncedDataSource hasn't changed
    setFetchTrigger((prev) => prev + 1);
  }, [blockId, dataSource, enabled, context]);

  // If disabled or no dataSource, return stable empty values
  if (!dataSource || !enabled) {
    return {
      data: initialData,
      loading: false,
      error: null,
      refresh: () => {},
      lastUpdated: null,
    };
  }

  return { data, loading, error, refresh, lastUpdated };
}

export default useDynamicBlockData;
