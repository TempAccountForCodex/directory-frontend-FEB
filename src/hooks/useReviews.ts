import { useCallback, useState } from "react";
import type { AxiosError } from "axios";
import {
  useListingReviews,
  useCreateReview,
  useVoteReview as useVoteReviewMutation,
  useReplyReview as useReplyReviewMutation,
} from "../api/queries/content";

/* ---------- Types ---------- */
export interface ReviewAuthor {
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface ReviewReply {
  id: number;
  content: string;
  createdAt: string;
  author: ReviewAuthor;
}

export interface Review {
  id: number;
  authorId: number;
  author: ReviewAuthor;
  rating: number;
  title: string;
  content: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote?: "helpful" | "not_helpful" | null;
  ownerReply?: ReviewReply | null;
  createdAt: string;
  status: "visible" | "hidden";
}

export interface RatingStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewPagination {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ReviewsResult {
  reviews: Review[];
  stats: RatingStats | null;
  pagination: ReviewPagination | null;
  loading: boolean;
  error: string | null;
  requiresAuth?: boolean;
  refetch: () => void;
}

export interface SubmitReviewResult {
  submitReview: (data: {
    rating: number;
    title: string;
    content: string;
  }) => Promise<Review | null>;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  requiresAuth?: boolean;
}

export interface VoteReviewResult {
  voteReview: (
    reviewId: number,
    vote: "helpful" | "not_helpful",
  ) => Promise<boolean>;
  loading: boolean;
}

export interface ReplyReviewResult {
  replyReview: (reviewId: number, content: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/* ---------- useReviews ---------- */
/**
 * Backwards-compatible wrapper around `useListingReviews` — preserves the
 * `{ reviews, stats, pagination, loading, error, requiresAuth, refetch }`
 * contract so existing consumers (ListingDetail, ReviewsTab) don't need to
 * change.
 */
export function useReviews(
  websiteId: string | number | null | undefined,
  sort: string = "recent",
  page: number = 1,
): ReviewsResult {
  const query = useListingReviews(websiteId, { sort, page, limit: 10 });
  const err = query.error as AxiosError<{ message?: string }> | null;
  const requiresAuth = err?.response?.status === 401;
  const errorMsg =
    err && !requiresAuth
      ? (err.response?.data?.message ?? "Failed to load reviews")
      : null;

  return {
    reviews: (query.data?.reviews as Review[]) ?? [],
    stats: (query.data?.stats as RatingStats | null) ?? null,
    pagination: (query.data?.pagination as ReviewPagination | null) ?? null,
    loading: query.isFetching,
    error: errorMsg,
    requiresAuth,
    refetch: () => {
      query.refetch();
    },
  };
}

/* ---------- useSubmitReview ---------- */
export function useSubmitReview(
  websiteId: string | number | null | undefined,
): SubmitReviewResult {
  const mutation = useCreateReview();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [requiresAuth, setRequiresAuth] = useState(false);

  const submitReview = useCallback(
    async (data: {
      rating: number;
      title: string;
      content: string;
    }): Promise<Review | null> => {
      if (!websiteId) return null;
      setError(null);
      setFieldErrors({});
      setRequiresAuth(false);
      try {
        const result = await mutation.mutateAsync({
          listingId: websiteId,
          payload: data,
        });
        return (result as Review) ?? null;
      } catch (err) {
        const axiosErr = err as AxiosError<{
          message?: string;
          errors?: Record<string, string>;
        }>;
        const status = axiosErr?.response?.status;
        if (status === 401) {
          setRequiresAuth(true);
        } else if (status === 400) {
          const errData = axiosErr.response?.data;
          if (errData?.errors && typeof errData.errors === "object") {
            setFieldErrors(errData.errors);
          } else {
            setError(errData?.message || "Validation error");
          }
        } else {
          setError(
            axiosErr?.response?.data?.message || "Failed to submit review",
          );
        }
        return null;
      }
    },
    [websiteId, mutation],
  );

  return {
    submitReview,
    loading: mutation.isPending,
    error,
    fieldErrors,
    requiresAuth,
  };
}

/* ---------- useVoteReview ---------- */
export function useVoteReview(): VoteReviewResult {
  const mutation = useVoteReviewMutation();

  const voteReview = useCallback(
    async (
      reviewId: number,
      vote: "helpful" | "not_helpful",
    ): Promise<boolean> => {
      try {
        await mutation.mutateAsync({ reviewId, vote });
        return true;
      } catch {
        return false;
      }
    },
    [mutation],
  );

  return { voteReview, loading: mutation.isPending };
}

/* ---------- useReplyReview ---------- */
export function useReplyReview(): ReplyReviewResult {
  const mutation = useReplyReviewMutation();
  const [error, setError] = useState<string | null>(null);

  const replyReview = useCallback(
    async (reviewId: number, content: string): Promise<boolean> => {
      setError(null);
      try {
        await mutation.mutateAsync({ reviewId, content });
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(axiosErr?.response?.data?.message || "Failed to submit reply");
        return false;
      }
    },
    [mutation],
  );

  return { replyReview, loading: mutation.isPending, error };
}
