import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';

/**
 * Content React Query hooks (Phase H.content).
 *
 * Covers the directory/public-content endpoints:
 *   GET    /api/directory/listings            — public directory list
 *   GET    /api/places                        — public places list
 *   GET    /api/places/:id                    — public place detail
 *   GET    /api/places/slug/:slug             — public place by slug
 *   POST   /api/places                        — create (auth)
 *   PUT    /api/places/:id                    — update (auth)
 *   DELETE /api/places/:id                    — delete (auth)
 *   GET    /api/reviews/listings/:websiteId   — list reviews (public read, auth optional)
 *   POST   /api/reviews/listings/:websiteId   — submit review (auth)
 *   DELETE /api/reviews/:id                   — delete review (auth)
 *   POST   /api/reviews/:id/vote              — vote review (auth)
 *   POST   /api/reviews/:id/reply             — owner reply (auth)
 *   GET    /api/comments/listings/:websiteId  — list comments (public read, auth optional)
 *   POST   /api/comments/listings/:websiteId  — submit comment (auth)
 *   DELETE /api/comments/:id                  — delete comment (auth)
 *   POST   /api/comments/:id/react            — react to comment (auth)
 *   GET    /api/favourites/listings/:id/status — favourite status (auth)
 *   GET    /api/favourites/user/favourites    — user's favourites (auth)
 *   POST   /api/favourites/user/favourites/check — batch check (auth)
 *   POST   /api/favourites/listings/:id/favourite — toggle (auth)
 *
 * Public read endpoints (directory, places, reviews/comments lists) are NOT
 * gated on `useAuthMe` — they return public data. Auth-required mutations
 * (submit/delete/toggle/favourite) naturally 401 for anonymous users, which
 * the consumer hooks surface via a `requiresAuth` flag.
 */

/* --------------------------------------------------------------------- */
/* Types                                                                  */
/* --------------------------------------------------------------------- */

export type ListingsParams = Record<string, string | number | boolean | undefined>;

/* --------------------------------------------------------------------- */
/* Helpers                                                                */
/* --------------------------------------------------------------------- */

function cleanParams<T extends Record<string, unknown>>(input?: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    out[key] = value;
  }
  return out;
}

/* --------------------------------------------------------------------- */
/* Listings (directory)                                                   */
/* --------------------------------------------------------------------- */

/**
 * `GET /api/places` — public list of directory places. No auth gate; this
 * is the endpoint the ListingsContext used to fetch. Returns the full
 * envelope (`{ data: { data, pagination } }`) so consumers can destructure
 * either the places array or pagination metadata.
 */
export function useListings(params?: ListingsParams) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: queryKeys.content.listings(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/places', { params: cleaned, signal });
      return response.data?.data ?? response.data ?? { data: [], pagination: null };
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * `GET /api/places/:id` — public place detail. Used by context consumers
 * that select a single listing by id.
 */
export function useListing(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.content.listing(id ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/places/${id}`, { signal });
      return response.data?.data ?? response.data ?? null;
    },
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}

/**
 * `GET /api/places/slug/:slug` — public place lookup by slug.
 */
export function useListingBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['content', 'listingBySlug', slug ?? ''] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/places/slug/${slug}`, { signal });
      return response.data?.data ?? response.data ?? null;
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });
}

/**
 * `POST /api/places` — create a new place (auth required server-side).
 * Invalidates the full listings subtree so every live list refreshes.
 */
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await apiClient.post('/places', payload);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'listings'] as QueryKey });
    },
  });
}

/**
 * `PUT /api/places/:id` — update a place. Invalidates the listings list +
 * the updated listing's detail entry.
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: Record<string, unknown> }) => {
      const response = await apiClient.put(`/places/${id}`, payload);
      return response.data?.data ?? response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['content', 'listings'] as QueryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.listing(vars.id) });
    },
  });
}

/**
 * `DELETE /api/places/:id` — delete a place. Invalidates listings + detail.
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`/places/${id}`);
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['content', 'listings'] as QueryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.listing(id) });
    },
  });
}

/* --------------------------------------------------------------------- */
/* Reviews                                                                */
/* --------------------------------------------------------------------- */

export type ListingReviewsParams = {
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
};

/**
 * `GET /api/reviews/listings/:listingId` — reviews for a listing.
 *
 * Public-readable endpoint: the query is NOT gated on auth, but the
 * consumer hook (`useReviews`) surfaces a `requiresAuth` flag when the
 * backend returns 401 (some deployments gate reads).
 */
export function useListingReviews(
  listingId: string | number | null | undefined,
  params?: ListingReviewsParams
) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: [
      ...queryKeys.content.reviews(listingId ?? ''),
      cleaned,
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/reviews/listings/${listingId}`, {
        params: cleaned,
        signal,
      });
      return response.data ?? { reviews: [], stats: null, pagination: null };
    },
    enabled: !!listingId,
    staleTime: 60_000,
  });
}

/**
 * `POST /api/reviews/listings/:listingId` — submit a review (auth).
 * Invalidates the reviews subtree for the given listing.
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listingId,
      payload,
    }: {
      listingId: string | number;
      payload: { rating: number; title: string; content: string };
    }) => {
      const response = await apiClient.post(`/reviews/listings/${listingId}`, payload);
      return response.data?.review ?? response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.content.reviews(vars.listingId),
      });
    },
  });
}

/**
 * `DELETE /api/reviews/:reviewId` — delete a review (auth).
 * Caller supplies `listingId` so the mutation can scope its invalidation.
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
    }: {
      reviewId: string | number;
      listingId?: string | number;
    }) => {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    },
    onSuccess: (_data, vars) => {
      if (vars.listingId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.reviews(vars.listingId),
        });
      } else {
        // Unknown listing scope — broadly invalidate all reviews.
        queryClient.invalidateQueries({ queryKey: ['content', 'reviews'] as QueryKey });
      }
    },
  });
}

/**
 * `POST /api/reviews/:reviewId/vote` — vote helpful / not_helpful (auth).
 */
export function useVoteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      vote,
    }: {
      reviewId: string | number;
      vote: 'helpful' | 'not_helpful';
      listingId?: string | number;
    }) => {
      const response = await apiClient.post(`/reviews/${reviewId}/vote`, { vote });
      return response.data;
    },
    onSuccess: (_data, vars) => {
      if (vars.listingId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.reviews(vars.listingId),
        });
      }
    },
  });
}

/**
 * `POST /api/reviews/:reviewId/reply` — owner reply to a review (auth).
 * The backend accepts `replyText` (legacy field name).
 */
export function useReplyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      content,
    }: {
      reviewId: string | number;
      content: string;
      listingId?: string | number;
    }) => {
      const response = await apiClient.post(`/reviews/${reviewId}/reply`, {
        replyText: content,
      });
      return response.data;
    },
    onSuccess: (_data, vars) => {
      if (vars.listingId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.reviews(vars.listingId),
        });
      }
    },
  });
}

/* --------------------------------------------------------------------- */
/* Comments                                                               */
/* --------------------------------------------------------------------- */

export type ListingCommentsParams = {
  page?: number;
  limit?: number;
  status?: string;
};

/**
 * `GET /api/comments/listings/:listingId` — threaded comments for a listing.
 * Public read; the consumer hook (`useComments`) surfaces `requiresAuth` on
 * 401.
 */
export function useListingComments(
  listingId: string | number | null | undefined,
  params?: ListingCommentsParams
) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: [
      ...queryKeys.content.comments(listingId ?? ''),
      cleaned,
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/comments/listings/${listingId}`, {
        params: cleaned,
        signal,
      });
      return response.data ?? { comments: [], pagination: null };
    },
    enabled: !!listingId,
    staleTime: 60_000,
  });
}

/**
 * `POST /api/comments/listings/:listingId` — create comment (auth).
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listingId,
      payload,
    }: {
      listingId: string | number;
      payload: { content: string; parentCommentId?: number };
    }) => {
      const response = await apiClient.post(`/comments/listings/${listingId}`, payload);
      return response.data?.comment ?? response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.content.comments(vars.listingId),
      });
    },
  });
}

/**
 * `DELETE /api/comments/:commentId` — delete comment (auth).
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: string | number;
      listingId?: string | number;
    }) => {
      const response = await apiClient.delete(`/comments/${commentId}`);
      return response.data;
    },
    onSuccess: (_data, vars) => {
      if (vars.listingId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.comments(vars.listingId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['content', 'comments'] as QueryKey });
      }
    },
  });
}

/**
 * `POST /api/comments/:commentId/react` — react to a comment (auth).
 */
export function useReactComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      reactionType,
    }: {
      commentId: string | number;
      reactionType: string;
      listingId?: string | number;
    }) => {
      const response = await apiClient.post(`/comments/${commentId}/react`, {
        reactionType,
      });
      return response.data;
    },
    onSuccess: (_data, vars) => {
      if (vars.listingId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.comments(vars.listingId),
        });
      }
    },
  });
}

/* --------------------------------------------------------------------- */
/* Favourites                                                             */
/* --------------------------------------------------------------------- */

export type FavouriteStatus = {
  isFavourited: boolean;
  favouriteCount: number;
};

/**
 * `GET /api/favourites/listings/:websiteId/status` — favourite status +
 * count for the current session. Returns `{ isFavourited, favouriteCount }`.
 * Auth-gated on the backend; when anonymous, the query still fires and the
 * consumer hook surfaces `requiresAuth` on 401.
 */
export function useFavouriteStatus(websiteId: string | number | null | undefined) {
  return useQuery<FavouriteStatus>({
    queryKey: [
      ...queryKeys.content.favourites(),
      'status',
      websiteId ?? '',
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(
        `/favourites/listings/${websiteId}/status`,
        { signal }
      );
      return {
        isFavourited: response.data?.isFavourited ?? false,
        favouriteCount: response.data?.favouriteCount ?? 0,
      };
    },
    enabled: !!websiteId,
    staleTime: 60_000,
    retry: false,
  });
}

export type UserFavouritesParams = {
  sort?: string;
  page?: number;
  limit?: number;
};

/**
 * `GET /api/favourites/user/favourites` — the full list of listings the
 * current user has favourited (paginated, sortable). Auth-required.
 */
export function useUserFavourites(params?: UserFavouritesParams) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: [
      ...queryKeys.content.favourites(),
      'userList',
      cleaned,
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/favourites/user/favourites', {
        params: cleaned,
        signal,
      });
      return response.data;
    },
    staleTime: 30_000,
  });
}

/**
 * `POST /api/favourites/user/favourites/check` — batch favourite status
 * lookup (max 50 ids per call). Returns a `{ [websiteId]: boolean }` map.
 *
 * Exposed as a standard `useQuery` keyed off a stable join of the ids so
 * repeated calls with the same id set share a cache slot.
 */
export function useBatchFavouriteCheck(websiteIds: (string | number)[]) {
  const idsKey = websiteIds.join(',');
  return useQuery<Record<number | string, boolean>>({
    queryKey: [
      ...queryKeys.content.favourites(),
      'batch',
      idsKey,
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.post(
        '/favourites/user/favourites/check',
        { websiteIds },
        { signal }
      );
      return response.data?.statusMap ?? {};
    },
    enabled: websiteIds.length > 0,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * `POST /api/favourites/listings/:websiteId/favourite` — toggle favourite.
 *
 * Optimistically flips the `favouriteStatus` + `userFavourites` caches so
 * the UI updates instantly; rolls back on error and invalidates on
 * settle to re-sync with the server.
 */
export function useToggleFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ websiteId }: { websiteId: string | number }) => {
      const response = await apiClient.post(
        `/favourites/listings/${websiteId}/favourite`,
        {}
      );
      return response.data;
    },
    onMutate: async ({ websiteId }) => {
      const statusKey = [
        ...queryKeys.content.favourites(),
        'status',
        websiteId,
      ] as const;
      await queryClient.cancelQueries({ queryKey: statusKey });
      const previous = queryClient.getQueryData<FavouriteStatus>(statusKey);
      if (previous) {
        const nextFav = !previous.isFavourited;
        queryClient.setQueryData<FavouriteStatus>(statusKey, {
          isFavourited: nextFav,
          favouriteCount: nextFav
            ? previous.favouriteCount + 1
            : Math.max(0, previous.favouriteCount - 1),
        });
      }
      return { previous, statusKey };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && ctx.statusKey) {
        queryClient.setQueryData(ctx.statusKey, ctx.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.content.favourites(),
          'status',
          vars.websiteId,
        ] as QueryKey,
      });
      // User's list of favourites changed too.
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.content.favourites(), 'userList'] as QueryKey,
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.content.favourites(), 'batch'] as QueryKey,
      });
    },
  });
}
