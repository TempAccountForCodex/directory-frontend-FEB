/**
 * BlogComments — FE4
 *
 * Flat comments section rendered under a blog post's detail view (BlogArticleBlock).
 * Feature plan: docs/WEBSITE_BLOG_FEATURE_PLAN.md.
 *
 * Behavior:
 * - Any signed-in user can comment; comments publish immediately (VISIBLE).
 * - Comment author can edit/delete their own comment.
 * - Website owner / post author can hide/delete any comment (backend enforces; the UI
 *   shows controls when the backend returns canEdit/canDelete/canHide flags, else infers
 *   from the viewer id vs comment author / post author).
 * - Public callers never receive HIDDEN comments; moderators receive them (includeHidden)
 *   and see them with a "Hidden" badge + unhide/delete controls.
 *
 * Client mirrors backend limits: 5–1000 chars, and surfaces the 10/hr rate-limit (429).
 * Content is sanitized on render (defence-in-depth; backend also sanitizes).
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Pagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DOMPurify from "dompurify";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../api/client";

/* ===================== Types ===================== */

interface CommentAuthor {
  id?: number | string;
  displayName?: string;
  name?: string;
  avatar?: string;
}

interface CommentItem {
  id: number | string;
  content: string;
  status?: "VISIBLE" | "HIDDEN";
  author?: CommentAuthor | null;
  createdAt?: string;
  updatedAt?: string;
  // Optional backend-provided capability flags.
  canEdit?: boolean;
  canDelete?: boolean;
  canHide?: boolean;
}

interface BlogCommentsProps {
  websiteId?: string | number;
  blogId: number | string;
  postAuthorId?: number | string;
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

/* ===================== Constants / helpers ===================== */

const MIN_LEN = 5;
const MAX_LEN = 1000;
const PAGE_SIZE = 10;

const cleanText = (t?: string): string =>
  DOMPurify.sanitize(t || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

const formatDate = (d?: string): string => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const authorLabel = (a?: CommentAuthor | null): string =>
  cleanText(a?.displayName || a?.name || "Anonymous");

/* ===================== Component ===================== */

const BlogCommentsBase: React.FC<BlogCommentsProps> = ({
  websiteId,
  blogId,
  postAuthorId,
  primaryColor = "#378C92",
  headingColor = "#252525",
  bodyColor = "#6A6F78",
}) => {
  const { user } = useAuth();
  const viewerId = user?.id;

  const listUrl = `/websites/${websiteId}/blogs/${blogId}/comments`;
  const modUrl = useCallback(
    (id: number | string) => `/websites/${websiteId}/comments/${id}`,
    [websiteId],
  );

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editText, setEditText] = useState("");

  const isPostAuthor =
    viewerId != null &&
    postAuthorId != null &&
    String(viewerId) === String(postAuthorId);

  const load = useCallback(async () => {
    if (!websiteId || !blogId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(listUrl, {
        params: { page, limit: PAGE_SIZE, includeHidden: true },
      });
      setComments(Array.isArray(res.data?.comments) ? res.data.comments : []);
      setTotal(
        res.data?.pagination?.total ?? res.data?.comments?.length ?? 0,
      );
    } catch {
      setComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [listUrl, page, websiteId, blogId]);

  useEffect(() => {
    load();
  }, [load]);

  /* --- Capability resolution (prefer backend flags, else infer) --- */
  const canEditOwn = (c: CommentItem): boolean =>
    c.canEdit ??
    (viewerId != null &&
      c.author?.id != null &&
      String(viewerId) === String(c.author.id));

  const canModerate = (c: CommentItem): boolean =>
    c.canHide ?? isPostAuthor;

  const canDelete = (c: CommentItem): boolean =>
    c.canDelete ?? (canEditOwn(c) || isPostAuthor);

  /* --- Actions --- */
  const trimmedLen = text.trim().length;
  const submitDisabled =
    submitting || trimmedLen < MIN_LEN || trimmedLen > MAX_LEN;

  const handleSubmit = async () => {
    const content = text.trim();
    if (content.length < MIN_LEN || content.length > MAX_LEN) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post(listUrl, { content });
      setText("");
      setPage(1);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.status === 429
          ? "You're commenting too fast — please try again later."
          : e?.response?.data?.message || "Failed to post comment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (id: number | string) => {
    const content = editText.trim();
    if (content.length < MIN_LEN || content.length > MAX_LEN) return;
    setError(null);
    try {
      await apiClient.put(modUrl(id), { content });
      setEditingId(null);
      setEditText("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update comment.");
    }
  };

  const handleToggleHide = async (c: CommentItem) => {
    setError(null);
    try {
      await apiClient.patch(`${modUrl(c.id)}/visibility`, {
        hidden: c.status !== "HIDDEN",
      });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update visibility.");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Delete this comment?")) return;
    setError(null);
    try {
      await apiClient.delete(modUrl(id));
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to delete comment.");
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  /* ===================== Render ===================== */

  return (
    <Box
      component="section"
      aria-label="Comments"
      sx={{ mt: 6, maxWidth: 760, mx: "auto" }}
    >
      <Divider sx={{ mb: 3 }} />
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: 700, color: headingColor, mb: 3 }}
      >
        Comments{total > 0 ? ` (${total})` : ""}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Comment composer */}
      {user ? (
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Share your thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: MAX_LEN, "aria-label": "Write a comment" }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: trimmedLen > MAX_LEN ? "error.main" : bodyColor,
              }}
            >
              {trimmedLen < MIN_LEN
                ? `Min ${MIN_LEN} characters`
                : `${trimmedLen}/${MAX_LEN}`}
            </Typography>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitDisabled}
              sx={{ bgcolor: primaryColor, "&:hover": { bgcolor: primaryColor } }}
            >
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please sign in to join the conversation.
        </Alert>
      )}

      {/* Comment list */}
      {loading && comments.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" sx={{ color: bodyColor, py: 2 }}>
          No comments yet. Be the first to share your thoughts.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {comments.map((c) => {
            const hidden = c.status === "HIDDEN";
            const editing = editingId === c.id;
            return (
              <Box
                key={c.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  opacity: hidden ? 0.6 : 1,
                }}
              >
                <Avatar
                  src={c.author?.avatar}
                  sx={{ width: 36, height: 36, bgcolor: `${primaryColor}33` }}
                >
                  {authorLabel(c.author).charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: headingColor }}
                    >
                      {authorLabel(c.author)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: bodyColor }}>
                      {formatDate(c.createdAt)}
                    </Typography>
                    {hidden && (
                      <Chip
                        label="Hidden"
                        size="small"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                      />
                    )}
                  </Box>

                  {editing ? (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        inputProps={{ maxLength: MAX_LEN }}
                      />
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSaveEdit(c.id)}
                          sx={{ bgcolor: primaryColor }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: bodyColor,
                        whiteSpace: "pre-wrap",
                        mt: 0.5,
                      }}
                    >
                      {cleanText(c.content)}
                    </Typography>
                  )}

                  {!editing && (
                    <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                      {canEditOwn(c) && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingId(c.id);
                              setEditText(c.content);
                            }}
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canModerate(c) && (
                        <Tooltip title={hidden ? "Unhide" : "Hide"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleHide(c)}
                          >
                            {hidden ? (
                              <VisibilityIcon fontSize="inherit" />
                            ) : (
                              <VisibilityOffIcon fontSize="inherit" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete(c) && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(c.id)}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

const BlogComments = React.memo(BlogCommentsBase);
BlogComments.displayName = "BlogComments";

export default BlogComments;
