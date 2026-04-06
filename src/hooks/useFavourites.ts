import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/* ---------- Types ---------- */
export interface FavouriteListing {
  id: number;
  websiteId: number;
  title: string;
  description?: string;
  category?: string;
  image?: string;
  averageRating?: number;
  reviewCount?: number;
  savedAt: string;
}

export interface FavouritePagination {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FavouriteResult {
  isFavourited: boolean;
  favouriteCount: number;
  toggleFavourite: () => Promise<void>;
  loading: boolean;
  requiresAuth?: boolean;
}

export interface UserFavouritesResult {
  favourites: FavouriteListing[];
  pagination: FavouritePagination | null;
  loading: boolean;
  error: string | null;
  requiresAuth?: boolean;
  refetch: () => void;
}

export interface BatchFavouritesResult {
  statusMap: Record<number | string, boolean>;
  loading: boolean;
  refetch: () => void;
}

/* ---------- useFavourite (single listing) ---------- */
export function useFavourite(
  websiteId: string | number | null | undefined,
): FavouriteResult {
  const [isFavourited, setIsFavourited] = useState(false);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Fetch initial state
  useEffect(() => {
    if (!websiteId) return;
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/favourites/listings/${websiteId}/status`,
          { withCredentials: true },
        );
        if (!cancelled) {
          setIsFavourited(response.data.isFavourited ?? false);
          setFavouriteCount(response.data.favouriteCount ?? 0);
        }
      } catch (err: any) {
        if (!cancelled && err.response?.status === 401) {
          setRequiresAuth(true);
        }
      }
    };

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const toggleFavourite = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    setRequiresAuth(false);

    // Optimistic update
    const previousState = isFavourited;
    const previousCount = favouriteCount;
    setIsFavourited(!previousState);
    setFavouriteCount(
      previousState ? Math.max(0, previousCount - 1) : previousCount + 1,
    );

    try {
      await axios.post(
        `${API_URL}/favourites/listings/${websiteId}/favourite`,
        {},
        { withCredentials: true },
      );
    } catch (err: any) {
      // Revert on error
      setIsFavourited(previousState);
      setFavouriteCount(previousCount);
      if (err.response?.status === 401) {
        setRequiresAuth(true);
      }
    } finally {
      setLoading(false);
    }
  }, [websiteId, isFavourited, favouriteCount]);

  return {
    isFavourited,
    favouriteCount,
    toggleFavourite,
    loading,
    requiresAuth,
  };
}

/* ---------- useUserFavourites ---------- */
export function useUserFavourites(
  sort: string = "recent",
  page: number = 1,
): UserFavouritesResult {
  const [favourites, setFavourites] = useState<FavouriteListing[]>([]);
  const [pagination, setPagination] = useState<FavouritePagination | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const fetchCountRef = useRef(0);

  const fetchFavourites = useCallback(async () => {
    const currentFetch = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    setRequiresAuth(false);

    try {
      const response = await axios.get(
        `${API_URL}/favourites/user/favourites`,
        {
          params: { sort, page, limit: 12 },
          withCredentials: true,
        },
      );
      if (currentFetch !== fetchCountRef.current) return;
      const data = response.data;
      setFavourites(data.favourites || data.data || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      if (currentFetch !== fetchCountRef.current) return;
      if (err.response?.status === 401) {
        setRequiresAuth(true);
      } else {
        setError(err.response?.data?.message || "Failed to load favourites");
      }
    } finally {
      if (currentFetch === fetchCountRef.current) {
        setLoading(false);
      }
    }
  }, [sort, page]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  return {
    favourites,
    pagination,
    loading,
    error,
    requiresAuth,
    refetch: fetchFavourites,
  };
}

/* ---------- useBatchFavourites ---------- */
export function useBatchFavourites(
  websiteIds: (string | number)[],
): BatchFavouritesResult {
  const [statusMap, setStatusMap] = useState<Record<number | string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const idsKey = websiteIds.join(",");

  const fetchBatch = useCallback(async () => {
    if (!websiteIds.length) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/favourites/user/favourites/check`,
        { websiteIds },
        { withCredentials: true },
      );
      setStatusMap(response.data.statusMap || {});
    } catch {
      // On error (including 401), return empty map — cards will show unfavourited
      setStatusMap({});
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  return { statusMap, loading, refetch: fetchBatch };
}
