import { useCallback } from "react";
import type { AxiosError } from "axios";
import {
  useFavouriteStatus,
  useUserFavourites as useUserFavouritesQuery,
  useBatchFavouriteCheck,
  useToggleFavourite as useToggleFavouriteMutation,
} from "../api/queries/content";

/* ---------- Types ---------- */
export interface FavouriteListing {
  id: number;
  websiteId: number;
  favouriteId?: number;
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

type RawFavourite = FavouriteListing & {
  createdAt?: string;
  website?: {
    id?: number;
    name?: string;
    slug?: string;
    businessName?: string;
    businessCategory?: string;
    shortDescription?: string;
    logoUrl?: string;
    businessLogo?: string;
    averageRating?: number;
    reviewCount?: number;
    favouriteCount?: number;
    status?: string;
  };
};

function normalizeFavourite(item: RawFavourite): FavouriteListing {
  if (item.website) {
    const websiteId = Number(item.website.id);
    return {
      id: websiteId,
      websiteId,
      favouriteId: item.id,
      title: item.website.businessName || item.website.name || "Untitled listing",
      description: item.website.shortDescription,
      category: item.website.businessCategory,
      image: item.website.logoUrl || item.website.businessLogo,
      averageRating: item.website.averageRating,
      reviewCount: item.website.reviewCount,
      savedAt: item.createdAt || item.savedAt || "",
    };
  }

  const websiteId = Number(item.websiteId || item.id);
  return {
    ...item,
    id: websiteId,
    websiteId,
    savedAt: item.savedAt || item.createdAt || "",
  };
}

/* ---------- useFavourite (single listing) ---------- */
/**
 * Read + toggle favourite state for a single listing. Composes the
 * `useFavouriteStatus` query and `useToggleFavourite` mutation. The
 * optimistic cache update in `useToggleFavourite` produces the same
 * instant UI feedback the legacy implementation provided.
 */
export function useFavourite(
  websiteId: string | number | null | undefined,
): FavouriteResult {
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
export function useUserFavourites(
  sort: string = "recent",
  page: number = 1,
  options: { enabled?: boolean } = {},
): UserFavouritesResult {
  const query = useUserFavouritesQuery(
    { sort, page, limit: 12 },
    { enabled: options.enabled ?? true },
  );
  const err = query.error as AxiosError<{ message?: string }> | null;
  const requiresAuth = err?.response?.status === 401;
  const errorMsg =
    err && !requiresAuth
      ? (err.response?.data?.message ?? "Failed to load favourites")
      : null;

  const data = query.data as
    | {
        favourites?: RawFavourite[];
        data?: RawFavourite[];
        pagination?: FavouritePagination;
      }
    | undefined;
  const rawFavourites = data?.favourites ?? data?.data ?? [];

  return {
    favourites: rawFavourites.map(normalizeFavourite),
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
export function useBatchFavourites(
  websiteIds: (string | number)[],
): BatchFavouritesResult {
  const query = useBatchFavouriteCheck(websiteIds);
  return {
    statusMap: query.data ?? {},
    loading: query.isFetching,
    refetch: () => {
      query.refetch();
    },
  };
}
