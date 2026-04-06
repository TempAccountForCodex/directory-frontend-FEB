import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
export function useReviews(
  websiteId: string | number | null | undefined,
  sort: string = "recent",
  page: number = 1,
): ReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [pagination, setPagination] = useState<ReviewPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const fetchCountRef = useRef(0);

  const fetchReviews = useCallback(async () => {
    if (!websiteId) return;
    const currentFetch = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    setRequiresAuth(false);

    try {
      const response = await axios.get(
        `${API_URL}/reviews/listings/${websiteId}`,
        {
          params: { sort, page, limit: 10 },
          withCredentials: true,
        },
      );
      if (currentFetch !== fetchCountRef.current) return;
      const data = response.data;
      setReviews(data.reviews || []);
      setStats(data.stats || null);
      setPagination(data.pagination || null);
    } catch (err: any) {
      if (currentFetch !== fetchCountRef.current) return;
      if (err.response?.status === 401) {
        setRequiresAuth(true);
      } else {
        setError(err.response?.data?.message || "Failed to load reviews");
      }
    } finally {
      if (currentFetch === fetchCountRef.current) {
        setLoading(false);
      }
    }
  }, [websiteId, sort, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    stats,
    pagination,
    loading,
    error,
    requiresAuth,
    refetch: fetchReviews,
  };
}

/* ---------- useSubmitReview ---------- */
export function useSubmitReview(
  websiteId: string | number | null | undefined,
): SubmitReviewResult {
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      setError(null);
      setFieldErrors({});
      setRequiresAuth(false);

      try {
        const response = await axios.post(
          `${API_URL}/reviews/listings/${websiteId}`,
          data,
          {
            withCredentials: true,
          },
        );
        return response.data.review as Review;
      } catch (err: any) {
        if (err.response?.status === 401) {
          setRequiresAuth(true);
        } else if (err.response?.status === 400) {
          const errData = err.response.data;
          if (errData.errors && typeof errData.errors === "object") {
            setFieldErrors(errData.errors);
          } else {
            setError(errData.message || "Validation error");
          }
        } else {
          setError(err.response?.data?.message || "Failed to submit review");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [websiteId],
  );

  return { submitReview, loading, error, fieldErrors, requiresAuth };
}

/* ---------- useVoteReview ---------- */
export function useVoteReview(): VoteReviewResult {
  const [loading, setLoading] = useState(false);

  const voteReview = useCallback(
    async (
      reviewId: number,
      vote: "helpful" | "not_helpful",
    ): Promise<boolean> => {
      setLoading(true);
      try {
        await axios.post(
          `${API_URL}/reviews/${reviewId}/vote`,
          { vote },
          { withCredentials: true },
        );
        return true;
      } catch {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { voteReview, loading };
}

/* ---------- useReplyReview ---------- */
export function useReplyReview(): ReplyReviewResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const replyReview = useCallback(
    async (reviewId: number, content: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await axios.post(
          `${API_URL}/reviews/${reviewId}/reply`,
          { content },
          { withCredentials: true },
        );
        return true;
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to submit reply");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { replyReview, loading, error };
}
