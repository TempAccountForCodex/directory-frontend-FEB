/**
 * BlogComments
 *
 * Nested, website-scoped blog comments for BlogArticleBlock. Supports threaded
 * replies, like/dislike reactions, edit/delete/hide permissions, and dynamic
 * styling from the website theme.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import DOMPurify from "dompurify";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  MessageCircle,
  MoreHorizontal,
  Reply,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../api/client";
import {
  blogStaticProps,
  resolveBlogCommentPalette,
} from "./blogSectionShared";

/* ===================== Types ===================== */

interface CommentAuthor {
  id?: number | string;
  displayName?: string;
  name?: string;
  avatar?: string;
  isGuest?: boolean;
  isAnonymous?: boolean;
}

type CommentStatus = "VISIBLE" | "HIDDEN";
type ReactionType = "LIKE" | "DISLIKE";

/** Owner/moderator-only identity block, present only when the backend decides
 * the caller may see who is behind a comment (never returned to the public). */
interface CommentModeration {
  commenterEmail?: string | null;
  commenterName?: string | null;
  isAnonymous?: boolean;
}

interface CommentItem {
  id: number | string;
  content: string;
  status?: CommentStatus;
  parentCommentId?: number | string | null;
  author?: CommentAuthor | null;
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canHide?: boolean;
  likeCount?: number;
  dislikeCount?: number;
  viewerReaction?: ReactionType | null;
  replies?: CommentItem[];
  /** Soft-delete tombstone: content blanked, author null, replies preserved. */
  isDeleted?: boolean;
  /** 1-based nesting depth from the backend (root = 1). */
  depth?: number;
  moderation?: CommentModeration | null;
}

type CommentIdentityMode = "AUTH_ONLY" | "GUEST_EMAIL_REQUIRED" | "GUEST_OPEN";

interface CommentSettings {
  commentsEnabled?: boolean;
  commentIdentityMode?: CommentIdentityMode;
  allowAnonymousDisplay?: boolean;
  requiresApproval?: boolean;
}

/** Guest commenter identity, persisted per-website in localStorage. */
interface GuestIdentity {
  email: string;
  name: string;
  isAnonymous: boolean;
}

interface BlogCommentsProps {
  websiteId?: string | number;
  blogId: number | string;
  editorBlockId?: string | number;
  postAuthorId?: number | string;
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

interface CommentCardProps {
  comment: CommentItem;
  depth: number;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  headingColor: string;
  bodyColor: string;
  staticProps: (
    staticId: string,
    label: string,
    type?: "container" | "text" | "media" | "icon",
  ) => Record<string, string>;
  viewerId?: number | string;
  /** Whether the current visitor may reply/react (signed in, or a guest who has
   * supplied their identity when guest commenting is enabled). */
  canInteract: boolean;
  /** Max reply nesting the backend allows (root = 1); Reply is hidden at the cap. */
  maxDepth: number;
  /** Runs the action now if the visitor can interact, else opens the identity
   * modal first and replays it — so Reply prompts for details before composing. */
  ensureIdentity: (action: () => void) => void;
  isPostAuthor: boolean;
  editingId: number | string | null;
  editText: string;
  replyText: string;
  replyingToId: number | string | null;
  expandedIds: Set<string>;
  busyCommentIds: Set<string>;
  setEditingId: (id: number | string | null) => void;
  setEditText: (value: string) => void;
  setReplyingToId: (id: number | string | null) => void;
  setReplyText: (value: string) => void;
  toggleExpanded: (id: number | string) => void;
  canEditOwn: (comment: CommentItem) => boolean;
  canModerate: (comment: CommentItem) => boolean;
  canDelete: (comment: CommentItem) => boolean;
  onSaveEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  onToggleHide: (comment: CommentItem) => void;
  onSubmitReply: (parentId: number | string) => void;
  onReact: (comment: CommentItem, type: ReactionType) => void;
}

/* ===================== Constants / helpers ===================== */

const MIN_LEN = 5;
const MAX_LEN = 1000;
const PAGE_SIZE = 10;

const MotionBox = motion(Box);

const cleanText = (t?: string): string =>
  DOMPurify.sanitize(t || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

const formatDate = (d?: string): string => {
  if (!d) return "";
  try {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
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

const authorInitials = (author?: CommentAuthor | null): string => {
  const label = authorLabel(author);
  const parts = label.split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

/* A comment is worth rendering if it has real content (not soft-deleted) or if
   any descendant does — a deleted comment is kept only as a tombstone to hold a
   still-live reply thread together, never on its own. */
const hasRenderableComment = (comment: CommentItem): boolean =>
  !comment.isDeleted ||
  (comment.replies || []).some(hasRenderableComment);

const countVisibleTree = (items: CommentItem[]): number =>
  items.reduce((count, item) => {
    const visibleSelf = item.status !== "HIDDEN" && !item.isDeleted ? 1 : 0;
    return count + visibleSelf + countVisibleTree(item.replies || []);
  }, 0);

/* Count only the replies that will actually render (skips deleted leaves). */
const countReplyTree = (comment: CommentItem): number =>
  (comment.replies || [])
    .filter(hasRenderableComment)
    .reduce((count, reply) => count + 1 + countReplyTree(reply), 0);

const isValidLength = (value: string) => {
  const len = value.trim().length;
  return len >= MIN_LEN && len <= MAX_LEN;
};

const safeStaticId = (value: number | string) =>
  String(value).replace(/[^a-zA-Z0-9_-]/g, "-");

const formatRetryAfter = (seconds?: number) => {
  if (!seconds || seconds < 1) return "Please try again later.";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `Please try again in about ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
  }
  const hours = Math.ceil(minutes / 60);
  return `Please try again in about ${hours} ${hours === 1 ? "hour" : "hours"}.`;
};

const toCommentError = (e: any, fallback: string) =>
  e?.response?.status === 429
    ? `You're commenting too fast. ${formatRetryAfter(
        e?.response?.data?.retryAfter,
      )}`
    : e?.response?.data?.error?.message ||
      e?.response?.data?.message ||
      fallback;

const isUnsupportedRoute = (e: any) =>
  e?.response?.status === 404 || e?.response?.status === 405;

/* ---- Guest identity persistence (per website, browser-local) ---- */

const GUEST_TOKEN_HEADER = "X-Comment-Guest-Token";
const guestTokenKey = (websiteId?: string | number) =>
  `blogGuestToken:${websiteId ?? "unknown"}`;
const guestIdentityKey = (websiteId?: string | number) =>
  `blogGuestIdentity:${websiteId ?? "unknown"}`;

const readGuestToken = (websiteId?: string | number): string | null => {
  try {
    return localStorage.getItem(guestTokenKey(websiteId)) || null;
  } catch {
    return null;
  }
};

const writeGuestToken = (websiteId: string | number | undefined, token: string) => {
  try {
    localStorage.setItem(guestTokenKey(websiteId), token);
  } catch {
    /* storage unavailable — token lives only for this session */
  }
};

const readGuestIdentity = (
  websiteId?: string | number,
): GuestIdentity | null => {
  try {
    const raw = localStorage.getItem(guestIdentityKey(websiteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        email: String(parsed.email || ""),
        name: String(parsed.name || ""),
        isAnonymous: Boolean(parsed.isAnonymous),
      };
    }
  } catch {
    /* ignore malformed identity */
  }
  return null;
};

const writeGuestIdentity = (
  websiteId: string | number | undefined,
  identity: GuestIdentity,
) => {
  try {
    localStorage.setItem(guestIdentityKey(websiteId), JSON.stringify(identity));
  } catch {
    /* storage unavailable — identity lives only for this session */
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

/* ===================== Small Components ===================== */

function CommentAvatar({
  comment,
  palette,
  size = 40,
  staticProps,
}: {
  comment?: CommentItem;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  size?: number;
  staticProps: CommentCardProps["staticProps"];
}) {
  return (
    <Avatar
      {...staticProps(
        `comment-avatar-${comment ? safeStaticId(comment.id) : "composer"}`,
        "Comment avatar",
        "media",
      )}
      src={comment?.author?.avatar}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        background: palette.avatarBg,
        color: palette.avatarText,
        fontWeight: 800,
        fontSize: size < 34 ? "0.72rem" : "0.86rem",
        border: `2px solid ${alpha(palette.action, 0.08)}`,
        boxShadow: `0 4px 12px ${alpha(palette.action, 0.12)}`,
      }}
    >
      {comment ? authorInitials(comment.author) : "ME"}
    </Avatar>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitting,
  palette,
  bodyColor,
  compact = false,
  autoFocus = false,
  onCancel,
  staticProps,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitting?: boolean;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  bodyColor: string;
  compact?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
  staticProps: CommentCardProps["staticProps"];
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const len = value.trim().length;
  const valid = isValidLength(value);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <Box
      {...staticProps(
        compact ? "comments-reply-composer" : "comments-composer",
        compact ? "Reply composer" : "Comment composer",
        "container",
      )}
      sx={{
        borderRadius: compact ? "14px" : "18px",
        border: `1px solid ${palette.borderStrong}`,
        backgroundColor: palette.surface,
        boxShadow: compact
          ? `0 6px 18px ${alpha(palette.action, 0.05)}`
          : "0 12px 34px rgba(18, 28, 45, 0.07)",
        overflow: "hidden",
        transition: "box-shadow 180ms ease, border-color 180ms ease",
        "&:focus-within": {
          borderColor: palette.action,
          boxShadow: `0 0 0 3px ${palette.ring}, 0 16px 36px ${alpha(palette.action, 0.12)}`,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: compact ? 1.15 : 1.5,
          alignItems: "flex-start",
          p: compact ? 1.35 : { xs: 1.5, sm: 1.8 },
          pb: compact ? 1 : 1.25,
          minHeight: compact ? 94 : 112,
        }}
      >
        <CommentAvatar
          palette={palette}
          size={compact ? 28 : 34}
          staticProps={staticProps}
        />
        <TextField
          inputRef={inputRef}
          multiline
          minRows={compact ? 2 : 2}
          maxRows={7}
          fullWidth
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputProps={{
            maxLength: MAX_LEN,
            "aria-label": compact ? "Write a reply" : "Write a comment",
          }}
          variant="standard"
          sx={{
            "& .MuiInput-root": {
              alignItems: "flex-start",
              color: bodyColor,
              fontSize: compact ? "0.89rem" : "0.97rem",
              lineHeight: 1.65,
              pt: compact ? 0.15 : 0.35,
              "&:before, &:after": { display: "none" },
            },
            "& textarea": {
              minHeight: compact ? 48 : 62,
            },
            "& textarea::placeholder": {
              color: alpha(bodyColor, 0.56),
              opacity: 1,
            },
          }}
        />
      </Box>
      <Box
        {...staticProps(
          compact
            ? "comments-reply-composer-footer"
            : "comments-composer-footer",
          compact ? "Reply composer footer" : "Comment composer footer",
          "container",
        )}
        sx={{
          px: compact ? 1.35 : { xs: 1.5, sm: 1.8 },
          py: compact ? 0.9 : 1,
          borderTop: `1px solid ${palette.border}`,
          backgroundColor: alpha(palette.action, 0.025),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.2,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <Typography
          {...staticProps(
            compact
              ? "comments-reply-composer-counter"
              : "comments-composer-counter",
            compact ? "Reply composer counter" : "Comment composer counter",
          )}
          variant="caption"
          sx={{
            color:
              len > 0 && len < MIN_LEN
                ? "#b45309"
                : len > MAX_LEN
                  ? "#dc2626"
                  : alpha(bodyColor, 0.65),
          }}
        >
          {len > 0 && len < MIN_LEN
            ? `${MIN_LEN - len} more chars needed`
            : `${len}/${MAX_LEN}`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onCancel && (
            <Button
              {...staticProps(
                compact ? "comments-reply-cancel" : "comments-cancel",
                compact ? "Reply cancel button" : "Comment cancel button",
                "icon",
              )}
              size="small"
              onClick={onCancel}
              startIcon={<X size={13} />}
              sx={{
                minHeight: 34,
                borderRadius: "10px",
                px: 1.2,
                textTransform: "none",
                fontWeight: 700,
                color: alpha(bodyColor, 0.78),
                "&:hover": { backgroundColor: palette.surfaceSoft },
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            {...staticProps(
              compact ? "comments-reply-submit" : "comments-submit",
              compact ? "Reply submit button" : "Comment submit button",
            )}
            disabled={!valid || submitting}
            onClick={onSubmit}
            startIcon={
              submitting ? undefined : compact ? (
                <Reply size={14} />
              ) : (
                <Send size={14} />
              )
            }
            sx={{
              minHeight: compact ? 36 : 40,
              borderRadius: compact ? "10px" : "12px",
              px: compact ? 1.7 : 2.15,
              textTransform: "none",
              fontWeight: 800,
              color: "#fff",
              backgroundColor: palette.action,
              boxShadow: `0 8px 18px ${alpha(palette.action, 0.18)}`,
              "&:hover": {
                backgroundColor: palette.actionHover,
                boxShadow: `0 10px 22px ${alpha(palette.action, 0.22)}`,
              },
              "&.Mui-disabled": {
                color: alpha(bodyColor, 0.44),
                backgroundColor: palette.surfaceMuted,
                boxShadow: "none",
              },
            }}
          >
            {submitting ? "Posting..." : compact ? "Reply" : "Post comment"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function ReactionButton({
  active,
  count,
  label,
  icon,
  onClick,
  palette,
  disabled,
  staticProps,
  staticId,
}: {
  active: boolean;
  count?: number;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  disabled?: boolean;
  staticProps: CommentCardProps["staticProps"];
  staticId: string;
}) {
  return (
    <Button
      {...staticProps(staticId, `${label} button`, "icon")}
      size="small"
      disabled={disabled}
      onClick={onClick}
      startIcon={icon}
      sx={{
        minHeight: 30,
        borderRadius: 999,
        px: 0.95,
        py: 0.25,
        gap: 0.25,
        textTransform: "none",
        fontSize: "0.76rem",
        fontWeight: active ? 800 : 700,
        color: active ? palette.action : palette.muted,
        border: `1px solid ${active ? alpha(palette.action, 0.14) : "transparent"}`,
        backgroundColor: active ? alpha(palette.action, 0.08) : "transparent",
        "& .MuiButton-startIcon": { mr: 0.45 },
        "&:hover": {
          borderColor: palette.border,
          backgroundColor: palette.surfaceSoft,
        },
      }}
    >
      {label} {count ?? 0}
    </Button>
  );
}

function CommentActionsMenu({
  comment,
  canEdit,
  canHide,
  canRemove,
  onEdit,
  onHide,
  onDelete,
  palette,
  staticProps,
}: {
  comment: CommentItem;
  canEdit: boolean;
  canHide: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onHide: () => void;
  onDelete: () => void;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  staticProps: CommentCardProps["staticProps"];
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const hidden = comment.status === "HIDDEN";
  const hasActions = canEdit || canHide || canRemove;
  if (!hasActions) return null;

  return (
    <>
      <Tooltip title="Comment actions">
        <IconButton
          {...staticProps(
            `comment-actions-${safeStaticId(comment.id)}`,
            "Comment actions",
            "icon",
          )}
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            color: open ? palette.action : palette.muted,
            border: `1px solid ${open ? palette.border : "transparent"}`,
            backgroundColor: open ? palette.surfaceSoft : "transparent",
            "&:hover": {
              borderColor: palette.border,
              backgroundColor: palette.surfaceSoft,
            },
          }}
        >
          <MoreHorizontal size={17} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 0.6,
            minWidth: 150,
            borderRadius: "12px",
            border: `1px solid ${palette.border}`,
            boxShadow: `0 18px 42px ${alpha(palette.action, 0.16)}, 0 3px 10px rgba(21,45,66,0.08)`,
          },
        }}
      >
        {canEdit && (
          <MenuItem
            {...staticProps(
              `comment-edit-action-${safeStaticId(comment.id)}`,
              "Comment edit action",
              "icon",
            )}
            onClick={() => {
              onEdit();
              setAnchorEl(null);
            }}
            sx={{ gap: 1.2, fontSize: "0.88rem" }}
          >
            <Edit3 size={15} /> Edit
          </MenuItem>
        )}
        {canHide && (
          <MenuItem
            {...staticProps(
              `comment-hide-action-${safeStaticId(comment.id)}`,
              "Comment hide action",
              "icon",
            )}
            onClick={() => {
              onHide();
              setAnchorEl(null);
            }}
            sx={{ gap: 1.2, fontSize: "0.88rem" }}
          >
            {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
            {hidden ? "Show" : "Hide"}
          </MenuItem>
        )}
        {canRemove && (
          <MenuItem
            {...staticProps(
              `comment-delete-action-${safeStaticId(comment.id)}`,
              "Comment delete action",
              "icon",
            )}
            onClick={() => {
              onDelete();
              setAnchorEl(null);
            }}
            sx={{ gap: 1.2, fontSize: "0.88rem", color: palette.danger }}
          >
            <Trash2 size={15} /> Delete
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

function CommentCard({
  comment,
  depth,
  palette,
  headingColor,
  bodyColor,
  staticProps,
  viewerId,
  canInteract,
  maxDepth,
  ensureIdentity,
  isPostAuthor,
  editingId,
  editText,
  replyText,
  replyingToId,
  expandedIds,
  busyCommentIds,
  setEditingId,
  setEditText,
  setReplyingToId,
  setReplyText,
  toggleExpanded,
  canEditOwn,
  canModerate,
  canDelete,
  onSaveEdit,
  onDelete,
  onToggleHide,
  onSubmitReply,
  onReact,
}: CommentCardProps) {
  const isDeleted = Boolean(comment.isDeleted);
  const hidden = comment.status === "HIDDEN";
  const editing = editingId === comment.id;
  const replying = replyingToId === comment.id;
  // Only keep replies that will actually render (drop deleted leaves). A deleted
  // comment with nothing renderable under it is removed entirely — no tombstone.
  const replies = (comment.replies || []).filter(hasRenderableComment);
  const replyCount = countReplyTree(comment);
  if (isDeleted && replies.length === 0) return null;
  const expanded = expandedIds.has(String(comment.id));
  const busy = busyCommentIds.has(String(comment.id));
  const editable = !isDeleted && canEditOwn(comment);
  const moderate = !isDeleted && canModerate(comment);
  const removable = !isDeleted && canDelete(comment);
  /* Backend depth is 1-based (root = 1); fall back to the render depth + 1. */
  const effectiveDepth = comment.depth ?? depth + 1;
  const atMaxDepth = effectiveDepth >= maxDepth;
  const canReply = canInteract && !hidden && !isDeleted && !atMaxDepth;
  const moderationEmail = comment.moderation?.commenterEmail;
  const commentStatic = safeStaticId(comment.id);

  return (
    <MotionBox
      {...staticProps(
        `comment-card-${commentStatic}`,
        "Comment card",
        "container",
      )}
      layout
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: hidden ? 0.68 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.985, height: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      sx={{
        position: "relative",
        borderRadius: depth === 0 ? "16px" : "12px",
        // Top-level comments are cards; replies are flat rows on the thread rail.
        border: depth === 0 ? `1px solid ${palette.border}` : "none",
        backgroundColor: hidden
          ? palette.surfaceMuted
          : depth === 0
            ? "#ffffff"
            : "transparent",
        boxShadow:
          hidden || depth > 0 ? "none" : "0 8px 24px rgba(18, 28, 45, 0.05)",
        overflow: "hidden",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        "&:hover":
          depth === 0
            ? { borderColor: alpha(palette.action, 0.22) }
            : undefined,
      }}
    >
      <Box
        sx={{
          p: {
            xs: depth === 0 ? 1.5 : 1.25,
            sm: depth === 0 ? 2 : 1.5,
          },
          pb: depth === 0 ? 1.45 : 1.2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: depth === 0 ? 1.35 : 1.1,
          }}
        >
          <CommentAvatar
            comment={comment}
            palette={palette}
            size={depth === 0 ? 34 : 30}
            staticProps={staticProps}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              {...staticProps(
                `comment-header-${commentStatic}`,
                "Comment header",
                "container",
              )}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    {...staticProps(
                      `comment-author-${commentStatic}`,
                      "Comment author name",
                    )}
                    sx={{
                      color: headingColor,
                      fontWeight: 800,
                      fontSize: depth === 0 ? "0.93rem" : "0.88rem",
                      lineHeight: 1.25,
                    }}
                  >
                    {isDeleted ? "[deleted]" : authorLabel(comment.author)}
                  </Typography>
                  {!isDeleted && comment.author?.isGuest && (
                    <Chip
                      {...staticProps(
                        `comment-guest-badge-${commentStatic}`,
                        "Comment guest badge",
                      )}
                      label="Guest"
                      size="small"
                      sx={{
                        height: 20,
                        borderRadius: 999,
                        fontSize: "0.66rem",
                        fontWeight: 800,
                        color: palette.muted,
                        backgroundColor: palette.surfaceMuted,
                        border: `1px solid ${palette.border}`,
                      }}
                    />
                  )}
                  {hidden && (
                    <Chip
                      {...staticProps(
                        `comment-hidden-badge-${commentStatic}`,
                        "Comment hidden badge",
                      )}
                      label="Hidden"
                      size="small"
                      sx={{
                        height: 20,
                        borderRadius: 999,
                        fontSize: "0.66rem",
                        fontWeight: 800,
                        color: palette.muted,
                        backgroundColor: palette.surfaceMuted,
                        border: `1px solid ${palette.border}`,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  {...staticProps(
                    `comment-date-${commentStatic}`,
                    "Comment date",
                  )}
                  variant="caption"
                  sx={{
                    mt: 0.2,
                    color: alpha(bodyColor, 0.56),
                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                >
                  {formatDate(comment.createdAt)}
                </Typography>
                {moderationEmail && (
                  <Typography
                    {...staticProps(
                      `comment-moderation-${commentStatic}`,
                      "Comment commenter identity (owner only)",
                    )}
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.35,
                      color: palette.action,
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {cleanText(
                      [comment.moderation?.commenterName, moderationEmail]
                        .filter(Boolean)
                        .join(" · "),
                    )}
                    {comment.moderation?.isAnonymous ? " · anonymous" : ""}
                  </Typography>
                )}
              </Box>
              <CommentActionsMenu
                comment={comment}
                canEdit={editable}
                canHide={moderate}
                canRemove={removable}
                onEdit={() => {
                  setEditingId(comment.id);
                  setEditText(comment.content);
                  setReplyingToId(null);
                }}
                onHide={() => onToggleHide(comment)}
                onDelete={() => onDelete(comment.id)}
                palette={palette}
                staticProps={staticProps}
              />
            </Box>

            <Collapse in={editing} timeout={220} unmountOnExit>
              <Box sx={{ mt: 1.2 }}>
                <TextField
                  {...staticProps(
                    `comment-edit-field-${commentStatic}`,
                    "Comment edit field",
                  )}
                  fullWidth
                  multiline
                  minRows={3}
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  inputProps={{ maxLength: MAX_LEN }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      backgroundColor: palette.surface,
                      color: bodyColor,
                      "& fieldset": { borderColor: palette.borderStrong },
                      "&.Mui-focused fieldset": { borderColor: palette.action },
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Button
                    {...staticProps(
                      `comment-edit-cancel-${commentStatic}`,
                      "Comment edit cancel button",
                      "icon",
                    )}
                    size="small"
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    startIcon={<X size={13} />}
                    sx={{ borderRadius: "10px", textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    {...staticProps(
                      `comment-edit-save-${commentStatic}`,
                      "Comment edit save button",
                      "icon",
                    )}
                    size="small"
                    disabled={!isValidLength(editText) || busy}
                    onClick={() => onSaveEdit(comment.id)}
                    startIcon={<Check size={13} />}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 800,
                      color: "#fff",
                      backgroundColor: palette.action,
                      "&:hover": { backgroundColor: palette.actionHover },
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Collapse>

            <Collapse in={!editing} timeout={220}>
              <Typography
                {...staticProps(
                  `comment-body-${commentStatic}`,
                  "Comment body",
                )}
                sx={{
                  mt: depth === 0 ? 1.15 : 1,
                  color:
                    hidden || isDeleted ? alpha(bodyColor, 0.55) : bodyColor,
                  fontStyle: hidden || isDeleted ? "italic" : "normal",
                  fontSize: depth === 0 ? "0.94rem" : "0.9rem",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {isDeleted
                  ? "This comment was deleted."
                  : hidden
                    ? "This comment is hidden from public view."
                    : cleanText(comment.content)}
              </Typography>
            </Collapse>
          </Box>
        </Box>

        {!editing && (!isDeleted || replyCount > 0) && (
          <Box
            {...staticProps(
              `comment-footer-${commentStatic}`,
              "Comment footer actions",
              "container",
            )}
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.55,
              mt: depth === 0 ? 1.3 : 1.05,
              pt: 1,
              ml: { xs: 0, sm: depth === 0 ? "48px" : "42px" },
              borderTop: `1px solid ${palette.border}`,
            }}
          >
            {!isDeleted && (
              <>
                <ReactionButton
                  active={comment.viewerReaction === "LIKE"}
                  count={comment.likeCount}
                  label="Like"
                  icon={
                    <ThumbsUp
                      size={14}
                      fill={
                        comment.viewerReaction === "LIKE"
                          ? palette.action
                          : "none"
                      }
                    />
                  }
                  onClick={() => onReact(comment, "LIKE")}
                  palette={palette}
                  disabled={!canInteract || busy}
                  staticProps={staticProps}
                  staticId={`comment-like-${commentStatic}`}
                />
                <ReactionButton
                  active={comment.viewerReaction === "DISLIKE"}
                  count={comment.dislikeCount}
                  label="Dislike"
                  icon={
                    <ThumbsDown
                      size={14}
                      fill={
                        comment.viewerReaction === "DISLIKE"
                          ? palette.action
                          : "none"
                      }
                    />
                  }
                  onClick={() => onReact(comment, "DISLIKE")}
                  palette={palette}
                  disabled={!canInteract || busy}
                  staticProps={staticProps}
                  staticId={`comment-dislike-${commentStatic}`}
                />
              </>
            )}
            {canReply && (
              <Button
                {...staticProps(
                  `comment-reply-button-${commentStatic}`,
                  "Comment reply button",
                  "icon",
                )}
                size="small"
                onClick={() => {
                  // Close instantly if already replying; otherwise make sure the
                  // guest has identified themselves before the composer appears.
                  if (replying) {
                    setReplyingToId(null);
                    setReplyText("");
                    return;
                  }
                  ensureIdentity(() => {
                    setReplyText("");
                    setReplyingToId(comment.id);
                    if (!expanded) toggleExpanded(comment.id);
                  });
                }}
                startIcon={<Reply size={14} />}
                sx={{
                  minHeight: 30,
                  borderRadius: 999,
                  px: 0.95,
                  py: 0.2,
                  textTransform: "none",
                  fontSize: "0.78rem",
                  fontWeight: replying ? 800 : 700,
                  color: replying ? palette.action : palette.muted,
                  border: `1px solid ${
                    replying ? alpha(palette.action, 0.14) : "transparent"
                  }`,
                  backgroundColor: replying
                    ? alpha(palette.action, 0.08)
                    : "transparent",
                  "&:hover": { backgroundColor: palette.surfaceSoft },
                }}
              >
                Reply{replyCount > 0 ? ` · ${replyCount}` : ""}
              </Button>
            )}
            {replyCount > 0 && (
              <Button
                {...staticProps(
                  `comment-toggle-replies-${commentStatic}`,
                  "Comment toggle replies",
                  "icon",
                )}
                size="small"
                onClick={() => toggleExpanded(comment.id)}
                endIcon={
                  expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                }
                sx={{
                  minHeight: 30,
                  ml: { xs: 0, sm: "auto" },
                  borderRadius: 999,
                  px: 1.15,
                  textTransform: "none",
                  fontSize: "0.77rem",
                  fontWeight: 800,
                  color: palette.action,
                  border: `1px solid ${alpha(palette.action, 0.1)}`,
                  backgroundColor: alpha(palette.action, 0.07),
                  "&:hover": { backgroundColor: alpha(palette.action, 0.12) },
                }}
              >
                {expanded ? "Hide" : "Show"} {replyCount}{" "}
                {replyCount === 1 ? "reply" : "replies"}
              </Button>
            )}
          </Box>
        )}
      </Box>

      <AnimatePresence initial={false}>
        {(expanded && replies.length > 0) || replying ? (
          <MotionBox
            {...staticProps(
              `comment-replies-${commentStatic}`,
              "Comment replies thread",
              "container",
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            sx={{
              px: { xs: 1.1, sm: depth === 0 ? 1.7 : 1.25 },
              pb: { xs: 1.25, sm: 1.55 },
              borderTop: `1px solid ${palette.border}`,
              backgroundColor: "transparent",
            }}
          >
            <Box
              sx={{
                position: "relative",
                ml: { xs: 0, sm: depth === 0 ? "46px" : "38px" },
                pl: depth < 5 ? { xs: 1.5, sm: 1.8 } : 0,
                pt: 1.15,
                "&::before":
                  depth < 5
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 14,
                        bottom: 8,
                        left: { xs: 5, sm: 6 },
                        width: 2,
                        borderRadius: 999,
                        backgroundColor: alpha(palette.action, 0.14),
                      }
                    : undefined,
              }}
            >
              <AnimatePresence initial={false}>
                {expanded &&
                  replies.map((reply) => (
                    <Box
                      key={reply.id}
                      sx={{
                        position: "relative",
                        mb: 1,
                      }}
                    >
                      <CommentCard
                        comment={reply}
                        depth={depth + 1}
                        palette={palette}
                        headingColor={headingColor}
                        bodyColor={bodyColor}
                        staticProps={staticProps}
                        viewerId={viewerId}
                        canInteract={canInteract}
                        maxDepth={maxDepth}
                        ensureIdentity={ensureIdentity}
                        isPostAuthor={isPostAuthor}
                        editingId={editingId}
                        editText={editText}
                        replyText={replyText}
                        replyingToId={replyingToId}
                        expandedIds={expandedIds}
                        busyCommentIds={busyCommentIds}
                        setEditingId={setEditingId}
                        setEditText={setEditText}
                        setReplyingToId={setReplyingToId}
                        setReplyText={setReplyText}
                        toggleExpanded={toggleExpanded}
                        canEditOwn={canEditOwn}
                        canModerate={canModerate}
                        canDelete={canDelete}
                        onSaveEdit={onSaveEdit}
                        onDelete={onDelete}
                        onToggleHide={onToggleHide}
                        onSubmitReply={onSubmitReply}
                        onReact={onReact}
                      />
                    </Box>
                  ))}
              </AnimatePresence>

              <Collapse in={replying} timeout={220} unmountOnExit>
                <Box sx={{ mt: replies.length ? 1 : 0.4 }}>
                  <Composer
                    value={replyText}
                    onChange={setReplyText}
                    onSubmit={() => onSubmitReply(comment.id)}
                    onCancel={() => {
                      setReplyingToId(null);
                      setReplyText("");
                    }}
                    placeholder="Write a reply..."
                    submitting={busy}
                    palette={palette}
                    bodyColor={bodyColor}
                    compact
                    autoFocus
                    staticProps={staticProps}
                  />
                </Box>
              </Collapse>
            </Box>
          </MotionBox>
        ) : null}
      </AnimatePresence>
    </MotionBox>
  );
}

/* ---- Guest identity modal: collect email + name (+ stay anonymous) the first
   time a visitor comments/replies/reacts, when the owner allows guest commenting.
   Opened on demand; the pending action replays once details are provided. ---- */
function CommentIdentityDialog({
  open,
  onClose,
  initial,
  emailRequired,
  allowAnonymous,
  palette,
  headingColor,
  bodyColor,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial: GuestIdentity | null;
  emailRequired: boolean;
  allowAnonymous: boolean;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  headingColor: string;
  bodyColor: string;
  onSubmit: (identity: GuestIdentity) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [touched, setTouched] = useState(false);

  // Re-seed the fields from the latest known identity each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setEmail(initial?.email || "");
    setName(initial?.name || "");
    setIsAnonymous(allowAnonymous ? Boolean(initial?.isAnonymous) : false);
    setTouched(false);
  }, [open, initial, allowAnonymous]);

  const nameRequired = !(isAnonymous && allowAnonymous);
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();
  const emailError =
    (emailRequired && !trimmedEmail) ||
    (Boolean(trimmedEmail) && !isValidEmail(trimmedEmail));
  const nameError = nameRequired && trimmedName.length < 2;
  const canContinue = !emailError && !nameError;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      color: bodyColor,
      fontSize: "0.92rem",
      "& fieldset": { borderColor: palette.borderStrong },
      "&.Mui-focused fieldset": { borderColor: palette.action },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: palette.action },
  };

  const submit = () => {
    setTouched(true);
    if (!canContinue) return;
    onSubmit({
      email: trimmedEmail,
      name: isAnonymous && !trimmedName ? "" : trimmedName,
      isAnonymous: allowAnonymous ? isAnonymous : false,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "18px" } }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: "11px",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              backgroundColor: palette.action,
              boxShadow: `0 8px 18px ${alpha(palette.action, 0.28)}`,
            }}
          >
            <MessageCircle size={19} />
          </Box>
          <Box>
            <Typography
              sx={{ color: headingColor, fontWeight: 850, fontSize: "1.08rem" }}
            >
              Join the conversation
            </Typography>
            <Typography
              sx={{ color: alpha(bodyColor, 0.7), fontSize: "0.8rem" }}
            >
              {emailRequired
                ? "Your email stays private — only the site owner sees it."
                : "Tell us who you are to comment."}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: "16px !important" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
          <TextField
            type="email"
            size="small"
            fullWidth
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            label={emailRequired ? "Email" : "Email (optional)"}
            placeholder="you@example.com"
            error={touched && emailError}
            helperText={
              touched && emailError
                ? emailRequired && !trimmedEmail
                  ? "Email is required to comment."
                  : "Enter a valid email address."
                : "Only the site owner can see this."
            }
            inputProps={{ maxLength: 254, "aria-label": "Your email" }}
            sx={fieldSx}
          />
          <TextField
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            label={nameRequired ? "Display name" : "Name (optional)"}
            placeholder="How your name appears"
            error={touched && nameError}
            helperText={
              touched && nameError ? "Enter at least 2 characters." : " "
            }
            inputProps={{ maxLength: 50, "aria-label": "Your display name" }}
            sx={fieldSx}
          />
          {allowAnonymous && (
            <Box
              component="label"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                aria-label="Stay anonymous"
                style={{
                  marginTop: 3,
                  width: 16,
                  height: 16,
                  accentColor: palette.action,
                  cursor: "pointer",
                }}
              />
              <Box>
                <Typography
                  sx={{
                    color: headingColor,
                    fontSize: "0.86rem",
                    fontWeight: 700,
                  }}
                >
                  Stay anonymous
                </Typography>
                <Typography
                  sx={{
                    color: alpha(bodyColor, 0.66),
                    fontSize: "0.76rem",
                    lineHeight: 1.45,
                  }}
                >
                  Your name won't be shown publicly. The site owner can still
                  see your details.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.4, pt: 0.5 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            color: palette.muted,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={touched && !canContinue}
          variant="contained"
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 800,
            px: 2.4,
            color: "#fff",
            backgroundColor: palette.action,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: palette.actionHover,
              boxShadow: "none",
            },
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---- Compact "commenting as …" bar shown above the composer once a guest has
   provided their identity, with a link to change it. ---- */
function GuestIdentityBar({
  identity,
  palette,
  bodyColor,
  onChange,
  staticProps,
}: {
  identity: GuestIdentity;
  palette: ReturnType<typeof resolveBlogCommentPalette>;
  bodyColor: string;
  onChange: () => void;
  staticProps: CommentCardProps["staticProps"];
}) {
  const label = identity.isAnonymous
    ? "Anonymous"
    : identity.name || identity.email || "Guest";
  return (
    <Box
      {...staticProps("identity-bar", "Commenting as", "container")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        mb: 1,
        px: 0.25,
      }}
    >
      <Typography
        sx={{ color: alpha(bodyColor, 0.7), fontSize: "0.8rem", fontWeight: 600 }}
      >
        Commenting as{" "}
        <Box component="span" sx={{ color: palette.action, fontWeight: 800 }}>
          {cleanText(label)}
        </Box>
      </Typography>
      <Button
        {...staticProps("identity-change", "Change commenting identity", "icon")}
        size="small"
        onClick={onChange}
        sx={{
          minHeight: 0,
          p: 0,
          textTransform: "none",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: palette.muted,
          "&:hover": { backgroundColor: "transparent", color: palette.action },
        }}
      >
        Change
      </Button>
    </Box>
  );
}

/* ===================== Main Component ===================== */

const BlogCommentsBase: React.FC<BlogCommentsProps> = ({
  websiteId,
  blogId,
  editorBlockId,
  postAuthorId,
  primaryColor = "#378C92",
  headingColor = "#252525",
  bodyColor = "#6A6F78",
}) => {
  const { user } = useAuth();
  const viewerId = user?.id;
  const staticBlockId = editorBlockId ?? blogId;
  const palette = useMemo(
    () => resolveBlogCommentPalette(primaryColor),
    [primaryColor],
  );

  const staticProps = useCallback(
    (
      staticId: string,
      label: string,
      type: "container" | "text" | "media" | "icon" = "text",
    ) =>
      blogStaticProps(
        staticBlockId,
        `comments-${staticId}`,
        label,
        type,
        `static.comments-${staticId}`,
      ),
    [staticBlockId],
  );

  const listUrl = `/websites/${websiteId}/blogs/${blogId}/comments`;
  const modUrl = useCallback(
    (id: number | string) => `/websites/${websiteId}/comments/${id}`,
    [websiteId],
  );

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CommentSettings | null>(null);
  const [maxDepth, setMaxDepth] = useState(4);
  const [identity, setIdentity] = useState<GuestIdentity | null>(() =>
    readGuestIdentity(websiteId),
  );
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false);
  /* Focus the composer right after a guest provides their details via the modal
     (but not on a fresh load with a remembered identity — that would steal focus). */
  const [composerAutoFocus, setComposerAutoFocus] = useState(false);
  /* Kept in sync with `identity` so handlers that fire right after the identity
     modal closes read the fresh value without waiting for a state flush. */
  const identityRef = useRef<GuestIdentity | null>(identity);
  /* The comment/reply/react to run once the visitor finishes the identity modal. */
  const pendingActionRef = useRef<(() => void) | null>(null);
  const guestTokenRef = useRef<string | null>(readGuestToken(websiteId));
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState<number | string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [busyCommentIds, setBusyCommentIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const submitInFlightRef = useRef(false);
  const replyInFlightRef = useRef<Set<string>>(new Set());

  const isPostAuthor =
    viewerId != null &&
    postAuthorId != null &&
    String(viewerId) === String(postAuthorId);

  /* ---- Comment settings (owner-controlled). Until the list response arrives we
     assume the safe default: sign-in required, matching pre-guest behavior. ---- */
  const identityMode: CommentIdentityMode =
    settings?.commentIdentityMode ?? "AUTH_ONLY";
  const allowAnonymousDisplay = settings?.allowAnonymousDisplay ?? true;
  const commentsOff = settings?.commentsEnabled === false;
  const guestMode =
    identityMode === "GUEST_EMAIL_REQUIRED" || identityMode === "GUEST_OPEN";
  const emailRequired = identityMode === "GUEST_EMAIL_REQUIRED";

  /* A stored guest identity is "ready" only if it satisfies the current mode. */
  const identityReady =
    !!identity && (!emailRequired || isValidEmail(identity.email));

  /* Whether this visitor may post/reply/react without any further prompt. */
  const canInteract = Boolean(user) || (guestMode && identityReady);
  /* Whether interaction is possible at all — guests qualify even before giving
     their details, because the identity modal collects them on the first action.
     Drives whether Reply/React controls are shown and enabled. */
  const canAttempt = Boolean(user) || guestMode;

  /* Attach the durable guest token (once minted) so the backend resolves guest
     authority and viewerReaction for this browser. Read from a ref to avoid
     re-creating `load` when the token is first issued mid-session. */
  const authConfig = useCallback((base?: any) => {
    const token = guestTokenRef.current;
    if (!token) return base;
    return {
      ...(base || {}),
      headers: { ...(base?.headers || {}), [GUEST_TOKEN_HEADER]: token },
    };
  }, []);

  const captureGuestToken = useCallback(
    (res: any) => {
      const token = res?.data?.guestToken;
      if (typeof token === "string" && token) {
        guestTokenRef.current = token;
        writeGuestToken(websiteId, token);
      }
    },
    [websiteId],
  );

  /* Build the create body, adding guest identity fields for anonymous/guest
     visitors. Signed-in users send only content (+ parent); the backend ignores
     any identity fields for them. */
  const buildCreateBody = useCallback(
    (content: string, parentCommentId?: number | string) => {
      const body: Record<string, unknown> = { content };
      if (parentCommentId != null) body.parentCommentId = parentCommentId;
      const current = identityRef.current;
      if (!user && current) {
        if (current.email) body.commenterEmail = current.email;
        if (current.name) body.commenterName = current.name;
        body.isAnonymous = allowAnonymousDisplay ? current.isAnonymous : false;
      }
      return body;
    },
    [user, allowAnonymousDisplay],
  );

  const saveIdentity = useCallback(
    (next: GuestIdentity) => {
      writeGuestIdentity(websiteId, next);
      identityRef.current = next;
      setIdentity(next);
    },
    [websiteId],
  );

  /* Run `action` immediately if the visitor can already interact; otherwise stash
     it and open the identity modal, replaying it once they provide their details. */
  const ensureIdentity = useCallback(
    (action: () => void) => {
      if (canInteract) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setIdentityDialogOpen(true);
    },
    [canInteract],
  );

  const handleIdentitySubmit = useCallback(
    (next: GuestIdentity) => {
      saveIdentity(next);
      setIdentityDialogOpen(false);
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      if (pending) {
        // identityRef is already updated synchronously, so the replayed action
        // (post a reply, react, …) builds its request with the new identity.
        pending();
      } else {
        // No queued action → the visitor opened the modal to start commenting;
        // reveal and focus the composer.
        setComposerAutoFocus(true);
      }
    },
    [saveIdentity],
  );

  const openIdentityDialog = useCallback(() => {
    pendingActionRef.current = null;
    setIdentityDialogOpen(true);
  }, []);

  const setCommentBusy = useCallback((id: number | string, busy: boolean) => {
    setBusyCommentIds((previous) => {
      const next = new Set(previous);
      const key = String(id);
      if (busy) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    if (!websiteId || !blogId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(
        listUrl,
        authConfig({ params: { page, limit: PAGE_SIZE, includeHidden: true } }),
      );
      const nextComments = Array.isArray(res.data?.comments)
        ? res.data.comments
        : [];
      setComments(nextComments);
      setTotal(res.data?.pagination?.total ?? nextComments.length ?? 0);
      if (res.data?.settings) setSettings(res.data.settings);
      const nextMaxDepth = res.data?.replyDepth?.maxDepth;
      if (typeof nextMaxDepth === "number" && nextMaxDepth > 0) {
        setMaxDepth(nextMaxDepth);
      }
      setExpandedIds((previous) => {
        const next = new Set(previous);
        nextComments.forEach((comment: CommentItem) => {
          if ((comment.replies || []).length > 0) next.add(String(comment.id));
        });
        return next;
      });
    } catch {
      setComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [listUrl, page, websiteId, blogId, authConfig]);

  useEffect(() => {
    load();
  }, [load]);

  const canEditOwn = useCallback(
    (comment: CommentItem): boolean =>
      comment.canEdit ??
      (viewerId != null &&
        comment.author?.id != null &&
        String(viewerId) === String(comment.author.id)),
    [viewerId],
  );

  const canModerate = useCallback(
    (comment: CommentItem): boolean => comment.canHide ?? isPostAuthor,
    [isPostAuthor],
  );

  const canDelete = useCallback(
    (comment: CommentItem): boolean =>
      comment.canDelete ?? (canEditOwn(comment) || isPostAuthor),
    [canEditOwn, isPostAuthor],
  );

  const visibleCount = useMemo(() => countVisibleTree(comments), [comments]);
  /* Top-level comments that will actually render (deleted leaves removed). */
  const renderableComments = useMemo(
    () => comments.filter(hasRenderableComment),
    [comments],
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  const toggleExpanded = useCallback((id: number | string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const postComment = async (content: string) => {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post(
        listUrl,
        buildCreateBody(content),
        authConfig(),
      );
      captureGuestToken(res);
      setCommentText("");
      setPage(1);
      await load();
    } catch (e: any) {
      setError(toCommentError(e, "Failed to post comment."));
    } finally {
      submitInFlightRef.current = false;
      setSubmitting(false);
    }
  };

  const handleSubmitComment = () => {
    const content = commentText.trim();
    if (!isValidLength(content) || submitInFlightRef.current) return;
    // Guests without saved details get the identity modal, then the comment posts.
    ensureIdentity(() => {
      void postComment(content);
    });
  };

  const postReply = async (
    parentCommentId: number | string,
    content: string,
  ) => {
    const parentKey = String(parentCommentId);
    if (replyInFlightRef.current.has(parentKey)) return;
    replyInFlightRef.current.add(parentKey);
    setCommentBusy(parentCommentId, true);
    setError(null);
    try {
      const res = await apiClient.post(
        listUrl,
        buildCreateBody(content, parentCommentId),
        authConfig(),
      );
      captureGuestToken(res);
      setReplyText("");
      setReplyingToId(null);
      setExpandedIds((previous) => {
        const next = new Set(previous);
        next.add(String(parentCommentId));
        return next;
      });
      await load();
    } catch (e: any) {
      setError(toCommentError(e, "Failed to post reply."));
    } finally {
      replyInFlightRef.current.delete(parentKey);
      setCommentBusy(parentCommentId, false);
    }
  };

  const handleSubmitReply = (parentCommentId: number | string) => {
    const content = replyText.trim();
    const parentKey = String(parentCommentId);
    if (!isValidLength(content) || replyInFlightRef.current.has(parentKey)) {
      return;
    }
    ensureIdentity(() => {
      void postReply(parentCommentId, content);
    });
  };

  const handleSaveEdit = async (id: number | string) => {
    const content = editText.trim();
    if (!isValidLength(content)) return;
    setCommentBusy(id, true);
    setError(null);
    try {
      try {
        await apiClient.put(modUrl(id), { content }, authConfig());
      } catch (e: any) {
        if (!isUnsupportedRoute(e)) throw e;
        await apiClient.patch(modUrl(id), { content }, authConfig());
      }
      setEditingId(null);
      setEditText("");
      await load();
    } catch (e: any) {
      setError(toCommentError(e, "Failed to update comment."));
    } finally {
      setCommentBusy(id, false);
    }
  };

  const handleToggleHide = async (comment: CommentItem) => {
    setCommentBusy(comment.id, true);
    setError(null);
    const hidden = comment.status !== "HIDDEN";
    try {
      try {
        await apiClient.patch(
          `${modUrl(comment.id)}/visibility`,
          { hidden },
          authConfig(),
        );
      } catch (e: any) {
        if (!isUnsupportedRoute(e)) throw e;
        await apiClient.patch(
          `${modUrl(comment.id)}/status`,
          { status: hidden ? "HIDDEN" : "VISIBLE" },
          authConfig(),
        );
      }
      await load();
    } catch (e: any) {
      setError(toCommentError(e, "Failed to update visibility."));
    } finally {
      setCommentBusy(comment.id, false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Delete this comment?")) return;
    setCommentBusy(id, true);
    setError(null);
    try {
      await apiClient.delete(modUrl(id), authConfig());
      await load();
    } catch (e: any) {
      setError(toCommentError(e, "Failed to delete comment."));
      setCommentBusy(id, false);
    }
  };

  const postReaction = async (comment: CommentItem, type: ReactionType) => {
    const nextType = comment.viewerReaction === type ? null : type;
    setCommentBusy(comment.id, true);
    setError(null);
    try {
      const res = await apiClient.post(
        `${modUrl(comment.id)}/react`,
        { type: nextType },
        authConfig(),
      );
      captureGuestToken(res);
      await load();
    } catch (e: any) {
      setError(toCommentError(e, "Failed to update reaction."));
    } finally {
      setCommentBusy(comment.id, false);
    }
  };

  const handleReact = (comment: CommentItem, type: ReactionType) => {
    if (!user && !guestMode) {
      setError("Please sign in to react to comments.");
      return;
    }
    ensureIdentity(() => {
      void postReaction(comment, type);
    });
  };

  return (
    <Box
      {...staticProps("section", "Comments section", "container")}
      component="section"
      aria-label="Comments"
      sx={{
        mt: { xs: 5, md: 8 },
        maxWidth: 1040,
        mx: "auto",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${palette.border}`,
        borderRadius: { xs: "18px", md: "24px" },
        px: { xs: 1.25, sm: 2.25, md: 3 },
        py: { xs: 2, sm: 2.6, md: 3.2 },
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 50px rgba(18, 28, 45, 0.06)",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: { xs: 20, sm: 34 },
          right: { xs: 20, sm: 34 },
          height: 3,
          borderRadius: "0 0 999px 999px",
          backgroundColor: palette.action,
          opacity: 0.6,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          {...staticProps("header", "Comments header", "container")}
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            mb: { xs: 2, md: 2.4 },
            px: { xs: 0.25, sm: 0 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.9,
                mb: 0.35,
              }}
            >
              <Box
                {...staticProps("header-icon", "Comments header icon", "icon")}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  backgroundColor: palette.action,
                  boxShadow: `0 10px 22px ${alpha(palette.action, 0.2)}`,
                }}
              >
                <MessageCircle size={19} />
              </Box>
              <Typography
                {...staticProps("title", "Comments title")}
                component="h2"
                sx={{
                  color: headingColor,
                  fontSize: { xs: "1.3rem", md: "1.55rem" },
                  fontWeight: 850,
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
                }}
              >
                Comments
              </Typography>
            </Box>
            <Typography
              {...staticProps("subtitle", "Comments subtitle")}
              sx={{
                mt: 0.55,
                color: alpha(bodyColor, 0.72),
                fontSize: { xs: "0.84rem", sm: "0.9rem" },
                lineHeight: 1.55,
              }}
            >
              Share your thoughts and join the conversation.
            </Typography>
          </Box>
          <Chip
            {...staticProps("count-badge", "Comments count badge")}
            label={`${visibleCount || total} ${
              (visibleCount || total) === 1 ? "comment" : "comments"
            }`}
            sx={{
              flexShrink: 0,
              height: 34,
              borderRadius: 999,
              color: palette.action,
              fontWeight: 800,
              fontSize: "0.78rem",
              backgroundColor: palette.surface,
              border: `1px solid ${palette.borderStrong}`,
              boxShadow: `0 6px 16px ${alpha(palette.action, 0.07)}`,
              "& .MuiChip-label": { px: 1.25 },
              "&::before": {
                content: '""',
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: palette.action,
                ml: 1.35,
                boxShadow: `0 0 0 4px ${alpha(palette.action, 0.08)}`,
              },
            }}
          />
        </Box>

        {error && (
          <Alert
            {...staticProps("error", "Comments error", "container")}
            severity="error"
            sx={{ mb: 2.4, borderRadius: "14px" }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {commentsOff ? (
          <Alert
            {...staticProps(
              "comments-off-alert",
              "Comments disabled alert",
              "container",
            )}
            severity="info"
            sx={{
              mb: 3,
              borderRadius: "12px",
              border: `1px solid ${palette.border}`,
            }}
          >
            Comments are turned off for this article.
          </Alert>
        ) : user ? (
          <Box sx={{ mb: { xs: 2, md: 2.4 } }}>
            <Composer
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSubmitComment}
              placeholder="Share your thoughts..."
              submitting={submitting}
              palette={palette}
              bodyColor={bodyColor}
              staticProps={staticProps}
            />
          </Box>
        ) : guestMode ? (
          <Box sx={{ mb: { xs: 2, md: 2.4 } }}>
            {identityReady && identity ? (
              <>
                <GuestIdentityBar
                  identity={identity}
                  palette={palette}
                  bodyColor={bodyColor}
                  onChange={openIdentityDialog}
                  staticProps={staticProps}
                />
                <Composer
                  value={commentText}
                  onChange={setCommentText}
                  onSubmit={handleSubmitComment}
                  placeholder="Share your thoughts..."
                  submitting={submitting}
                  autoFocus={composerAutoFocus}
                  palette={palette}
                  bodyColor={bodyColor}
                  staticProps={staticProps}
                />
              </>
            ) : (
              /* Guest hasn't identified yet — clicking prompts the modal first,
                 then the composer appears. Styled to read as the comment input. */
              <Box
                {...staticProps(
                  "compose-trigger",
                  "Add a comment prompt",
                  "container",
                )}
                role="button"
                tabIndex={0}
                onClick={openIdentityDialog}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openIdentityDialog();
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.4,
                  px: { xs: 1.5, sm: 1.8 },
                  py: { xs: 1.5, sm: 1.7 },
                  borderRadius: "18px",
                  border: `1px solid ${palette.borderStrong}`,
                  backgroundColor: palette.surface,
                  cursor: "pointer",
                  transition: "border-color 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    borderColor: palette.action,
                    boxShadow: `0 0 0 3px ${palette.ring}`,
                  },
                }}
              >
                <CommentAvatar
                  palette={palette}
                  size={34}
                  staticProps={staticProps}
                />
                <Typography
                  sx={{
                    color: alpha(bodyColor, 0.6),
                    fontSize: "0.97rem",
                  }}
                >
                  Add a comment…
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            {...staticProps(
              "signin-alert",
              "Comments sign in prompt",
              "container",
            )}
            sx={{
              mb: { xs: 2, md: 2.4 },
              display: "flex",
              alignItems: "center",
              gap: 1.4,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.4, sm: 1.6 },
              borderRadius: "14px",
              border: `1px solid ${palette.border}`,
              backgroundColor: palette.surfaceSoft,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                color: palette.action,
                backgroundColor: alpha(palette.action, 0.1),
              }}
            >
              <MessageCircle size={18} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                {...staticProps("signin-title", "Comments sign in title")}
                sx={{
                  color: headingColor,
                  fontWeight: 800,
                  fontSize: "0.94rem",
                  lineHeight: 1.3,
                }}
              >
                Join the conversation
              </Typography>
              <Typography
                {...staticProps("signin-text", "Comments sign in text")}
                sx={{
                  color: alpha(bodyColor, 0.72),
                  fontSize: "0.84rem",
                  lineHeight: 1.5,
                }}
              >
                Sign in to share your thoughts and reply to others.
              </Typography>
            </Box>
          </Box>
        )}

        <CommentIdentityDialog
          open={identityDialogOpen}
          onClose={() => {
            pendingActionRef.current = null;
            setIdentityDialogOpen(false);
          }}
          initial={identity}
          emailRequired={emailRequired}
          allowAnonymous={allowAnonymousDisplay}
          palette={palette}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onSubmit={handleIdentitySubmit}
        />

        {loading && renderableComments.length === 0 ? (
          <Box
            {...staticProps("loading", "Comments loading", "container")}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4.5,
            }}
          >
            <CircularProgress size={26} sx={{ color: palette.action }} />
          </Box>
        ) : renderableComments.length === 0 ? (
          <Box
            {...staticProps("empty-state", "Comments empty state", "container")}
            sx={{
              py: 5,
              px: 2,
              textAlign: "center",
              color: alpha(bodyColor, 0.68),
              border: `1px dashed ${palette.borderStrong}`,
              borderRadius: "16px",
              backgroundColor: alpha(palette.action, 0.02),
            }}
          >
            <MessageCircle size={42} style={{ opacity: 0.22 }} />
            <Typography
              {...staticProps("empty-text", "Comments empty text")}
              sx={{ mt: 1, fontSize: "0.9rem" }}
            >
              No comments yet. Be the first to share your thoughts.
            </Typography>
          </Box>
        ) : (
          <Box
            {...staticProps("list", "Comments list", "container")}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.15, sm: 1.4 },
            }}
          >
            <AnimatePresence initial={false}>
              {renderableComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  palette={palette}
                  headingColor={headingColor}
                  bodyColor={bodyColor}
                  staticProps={staticProps}
                  viewerId={viewerId}
                  canInteract={canAttempt}
                  maxDepth={maxDepth}
                  ensureIdentity={ensureIdentity}
                  isPostAuthor={isPostAuthor}
                  editingId={editingId}
                  editText={editText}
                  replyText={replyText}
                  replyingToId={replyingToId}
                  expandedIds={expandedIds}
                  busyCommentIds={busyCommentIds}
                  setEditingId={setEditingId}
                  setEditText={setEditText}
                  setReplyingToId={setReplyingToId}
                  setReplyText={setReplyText}
                  toggleExpanded={toggleExpanded}
                  canEditOwn={canEditOwn}
                  canModerate={canModerate}
                  canDelete={canDelete}
                  onSaveEdit={handleSaveEdit}
                  onDelete={handleDelete}
                  onToggleHide={handleToggleHide}
                  onSubmitReply={handleSubmitReply}
                  onReact={handleReact}
                />
              ))}
            </AnimatePresence>
          </Box>
        )}

        {totalPages > 1 && (
          <Box
            {...staticProps("pagination", "Comments pagination", "container")}
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 3.25,
              pt: 2.2,
              borderTop: `1px solid ${palette.border}`,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, nextPage) => setPage(nextPage)}
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: palette.muted,
                  borderColor: palette.border,
                },
                "& .Mui-selected": {
                  color: "#fff",
                  backgroundColor: `${palette.action} !important`,
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const BlogComments = React.memo(BlogCommentsBase);
BlogComments.displayName = "BlogComments";

export default BlogComments;
