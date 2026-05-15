/**
 * Step 2.5.1 — useFieldMetadata Hook
 *
 * Fetches field metadata from /api/content-types/:blockType/fields.
 * Results are cached in a useRef to prevent redundant fetches on re-render.
 *
 * Usage:
 *   const { metadata, loading, error, refetch } = useFieldMetadata('hero');
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldDefinition {
  name: string;
  type: string;
  label: string;
  order?: number;
  validation?: Record<string, unknown>;
  conditional?: Record<string, unknown>;
  ui?: Record<string, unknown>;
}

export interface FieldGroup {
  id: string;
  label: string;
  order: number;
  fields: FieldDefinition[];
}

export interface FieldMetadata {
  groups: FieldGroup[];
}

export interface UseFieldMetadataResult {
  metadata: FieldMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useFieldMetadata
 *
 * @param blockType - The content-type block identifier (e.g. "hero", "gallery")
 * @returns { metadata, loading, error, refetch }
 *   - metadata: parsed response from /api/content-types/:blockType/fields, or null
 *   - loading: true while a fetch is in-flight
 *   - error: error message string if the fetch failed, otherwise null
 *   - refetch: evicts the cache entry for blockType and re-fetches
 */
function useFieldMetadata(blockType: string): UseFieldMetadataResult {
  const [metadata, setMetadata] = useState<FieldMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cache keyed by blockType — useRef avoids triggering re-renders on cache writes
  const cacheRef = useRef<Record<string, FieldMetadata>>({});

  // Stable counter used to trigger refetches without introducing extra state deps
  const refetchCountRef = useRef<number>(0);
  const [refetchToken, setRefetchToken] = useState<number>(0);

  const fetchMetadata = useCallback(() => {
    let cancelled = false;

    // Check cache first
    if (cacheRef.current[blockType]) {
      setMetadata(cacheRef.current[blockType]);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    fetch(`/api/content-types/${encodeURIComponent(blockType)}/fields`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<FieldMetadata>;
      })
      .then((data) => {
        if (cancelled) return;
        cacheRef.current[blockType] = data;
        setMetadata(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setMetadata(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [blockType, refetchToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = fetchMetadata();
    return cleanup;
  }, [fetchMetadata]);

  /**
   * refetch — deletes the cache entry for the current blockType and re-fetches.
   * Wrapped in useCallback for stable reference across renders.
   */
  const refetch = useCallback(() => {
    delete cacheRef.current[blockType];
    refetchCountRef.current += 1;
    setRefetchToken(refetchCountRef.current);
  }, [blockType]);

  return { metadata, loading, error, refetch };
}

export default useFieldMetadata;
export { useFieldMetadata };
