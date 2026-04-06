import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
  status: "visible" | "hidden";
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
  submitComment: (data: {
    content: string;
    parentCommentId?: number;
  }) => Promise<Comment | null>;
  loading: boolean;
  error: string | null;
  requiresAuth?: boolean;
}

export interface ReactCommentResult {
  reactComment: (commentId: number, reactionType: string) => Promise<boolean>;
  loading: boolean;
}

/* ---------- useComments ---------- */
export function useComments(
  websiteId: string | number | null | undefined,
  page: number = 1,
): CommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const fetchCountRef = useRef(0);

  const fetchComments = useCallback(async () => {
    if (!websiteId) return;
    const currentFetch = ++fetchCountRef.current;
    setLoading(true);
    setError(null);
    setRequiresAuth(false);

    try {
      const response = await axios.get(
        `${API_URL}/comments/listings/${websiteId}`,
        {
          params: { page, limit: 20 },
          withCredentials: true,
        },
      );
      if (currentFetch !== fetchCountRef.current) return;
      const data = response.data;
      setComments(data.comments || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      if (currentFetch !== fetchCountRef.current) return;
      if (err.response?.status === 401) {
        setRequiresAuth(true);
      } else {
        setError(err.response?.data?.message || "Failed to load comments");
      }
    } finally {
      if (currentFetch === fetchCountRef.current) {
        setLoading(false);
      }
    }
  }, [websiteId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    pagination,
    loading,
    error,
    requiresAuth,
    refetch: fetchComments,
  };
}

/* ---------- useSubmitComment ---------- */
export function useSubmitComment(
  websiteId: string | number | null | undefined,
): SubmitCommentResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const submitComment = useCallback(
    async (data: {
      content: string;
      parentCommentId?: number;
    }): Promise<Comment | null> => {
      if (!websiteId) return null;
      setLoading(true);
      setError(null);
      setRequiresAuth(false);

      try {
        const response = await axios.post(
          `${API_URL}/comments/listings/${websiteId}`,
          data,
          { withCredentials: true },
        );
        return response.data.comment as Comment;
      } catch (err: any) {
        if (err.response?.status === 401) {
          setRequiresAuth(true);
        } else {
          setError(err.response?.data?.message || "Failed to submit comment");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [websiteId],
  );

  return { submitComment, loading, error, requiresAuth };
}

/* ---------- useReactComment ---------- */
export function useReactComment(): ReactCommentResult {
  const [loading, setLoading] = useState(false);

  const reactComment = useCallback(
    async (commentId: number, reactionType: string): Promise<boolean> => {
      setLoading(true);
      try {
        await axios.post(
          `${API_URL}/comments/${commentId}/react`,
          { reactionType },
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

  return { reactComment, loading };
}
