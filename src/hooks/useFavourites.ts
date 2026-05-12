import { useCallback } from 'react';
import type { AxiosError } from 'axios';
import {
  useFavouriteStatus,
  useUserFavourites as useUserFavouritesQuery,
  useBatchFavouriteCheck,
  useToggleFavourite as useToggleFavouriteMutation,
} from '../api/queries/content';

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
/**
 * Read + toggle favourite state for a single listing. Composes the
 * `useFavouriteStatus` query and `useToggleFavourite` mutation. The
 * optimistic cache update in `useToggleFavourite` produces the same
 * instant UI feedback the legacy implementation provided.
 */
export function useFavourite(websiteId: string | number | null | undefined): FavouriteResult {
  const statusQuery = useFavouriteStatus(websiteId);
  const toggle = useToggleFavouriteMutation();
  const statusErr = statusQuery.error as AxiosError | null;
  const toggleErr = toggle.error as AxiosError | null;
  const requiresAuth =
    statusErr?.response?.status === 401 || toggleErr?.response?.status === 401;

  const toggleFavourite = useCallback(async () => {
    if (!websiteId) return;
    try {
      await toggle.mutateAsync({ websiteId });
    } catch {
      // Error state surfaced via requiresAuth / toggle.error.
    }
  }, [websiteId, toggle]);

  return {
    isFavourited: statusQuery.data?.isFavourited ?? false,
    favouriteCount: statusQuery.data?.favouriteCount ?? 0,
    toggleFavourite,
    loading: toggle.isPending,
    requiresAuth,
  };
}

/* ---------- useUserFavourites ---------- */
export function useUserFavourites(sort: string = 'recent', page: number = 1): UserFavouritesResult {
  const query = useUserFavouritesQuery({ sort, page, limit: 12 });
  const err = query.error as AxiosError<{ message?: string }> | null;
  const requiresAuth = err?.response?.status === 401;
  const errorMsg = err && !requiresAuth
    ? (err.response?.data?.message ?? 'Failed to load favourites')
    : null;

  const data = query.data as
    | {
        favourites?: FavouriteListing[];
        data?: FavouriteListing[];
        pagination?: FavouritePagination;
      }
    | undefined;

  return {
    favourites: data?.favourites ?? data?.data ?? [],
    pagination: data?.pagination ?? null,
    loading: query.isFetching,
    error: errorMsg,
    requiresAuth,
    refetch: () => {
      query.refetch();
    },
  };
}

/* ---------- useBatchFavourites ---------- */
export function useBatchFavourites(websiteIds: (string | number)[]): BatchFavouritesResult {
  const query = useBatchFavouriteCheck(websiteIds);
  return {
    statusMap: query.data ?? {},
    loading: query.isFetching,
    refetch: () => {
      query.refetch();
    },
  };
}
