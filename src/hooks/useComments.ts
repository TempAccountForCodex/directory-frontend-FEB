import { useMemo, useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import {
  useListingComments,
  useCreateComment,
  useReactComment as useReactCommentMutation,
} from '../api/queries/content';

/* ---------- Types ---------- */
export interface CommentAuthor {
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface CommentReaction {
  type: string;
  count: number;
  userReacted: boolean;
}

export interface Comment {
  id: number;
  author: CommentAuthor;
  content: string;
  reactions: CommentReaction[];
  replies?: Comment[];
  parentCommentId?: number | null;
  createdAt: string;
  status: 'visible' | 'hidden';
}

export interface CommentPagination {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CommentsResult {
  comments: Comment[];
  pagination: CommentPagination | null;
  loading: boolean;
  error: string | null;
  requiresAuth?: boolean;
  refetch: () => void;
}

export interface SubmitCommentResult {
  submitComment: (data: { content: string; parentCommentId?: number }) => Promise<Comment | null>;
  loading: boolean;
  error: string | null;
  requiresAuth?: boolean;
}

export interface ReactCommentResult {
  reactComment: (commentId: number, reactionType: string) => Promise<boolean>;
  loading: boolean;
}

/* ---------- useComments ---------- */
/**
 * Backwards-compatible wrapper over `useListingComments`. Preserves the
 * legacy `{ comments, pagination, loading, error, requiresAuth, refetch }`
 * shape so existing consumers (ListingDetail, ReviewsTab) need no change.
 */
export function useComments(
  websiteId: string | number | null | undefined,
  page: number = 1
): CommentsResult {
  const query = useListingComments(websiteId, { page, limit: 20 });
  const err = query.error as AxiosError<{ message?: string }> | null;
  const requiresAuth = err?.response?.status === 401;
  const errorMsg = err && !requiresAuth
    ? (err.response?.data?.message ?? 'Failed to load comments')
    : null;

  return {
    comments: (query.data?.comments as Comment[]) ?? [],
    pagination: (query.data?.pagination as CommentPagination | null) ?? null,
    loading: query.isFetching,
    error: errorMsg,
    requiresAuth,
    refetch: () => {
      query.refetch();
    },
  };
}

/* ---------- useSubmitComment ---------- */
export function useSubmitComment(
  websiteId: string | number | null | undefined
): SubmitCommentResult {
  const mutation = useCreateComment();
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const submitComment = useCallback(
    async (data: { content: string; parentCommentId?: number }): Promise<Comment | null> => {
      if (!websiteId) return null;
      setError(null);
      setRequiresAuth(false);
      try {
        const result = await mutation.mutateAsync({
          listingId: websiteId,
          payload: data,
        });
        return (result as Comment) ?? null;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        if (axiosErr?.response?.status === 401) {
          setRequiresAuth(true);
        } else {
          setError(axiosErr?.response?.data?.message || 'Failed to submit comment');
        }
        return null;
      }
    },
    [websiteId, mutation]
  );

  return {
    submitComment,
    loading: mutation.isPending,
    error,
    requiresAuth,
  };
}

/* ---------- useReactComment ---------- */
export function useReactComment(): ReactCommentResult {
  const mutation = useReactCommentMutation();

  const reactComment = useCallback(
    async (commentId: number, reactionType: string): Promise<boolean> => {
      try {
        await mutation.mutateAsync({ commentId, reactionType });
        return true;
      } catch {
        return false;
      }
    },
    [mutation]
  );

  return useMemo(
    () => ({ reactComment, loading: mutation.isPending }),
    [reactComment, mutation.isPending]
  );
}
