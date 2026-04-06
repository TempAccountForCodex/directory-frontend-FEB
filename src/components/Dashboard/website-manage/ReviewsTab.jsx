import { memo, useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Rating,
  Chip,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useMediaQuery,
  useTheme as useMuiTheme,
  alpha,
} from '@mui/material';
import { Star, MessageSquare, EyeOff, Trash2, Reply, Flag } from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  DashboardMetricCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTableRow,
  FilterBar,
  RowActionButtonGroup,
  ConfirmationDialog,
  MiniSideNav,
  DashboardInput,
  DashboardActionButton,
  DashboardCancelButton,
  BottomSheet,
} from '../shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ---------- Helpers ---------- */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const truncate = (str = '', max = 60) =>
  str.length > max ? str.slice(0, max) + '…' : str;

/* ---------- StatusBadge ---------- */
const StatusBadge = memo(function StatusBadge({ status }) {
  const isVisible = status === 'visible';
  return (
    <Chip
      label={isVisible ? 'Visible' : 'Hidden'}
      size="small"
      sx={{
        bgcolor: isVisible ? alpha('#22c55e', 0.12) : alpha('#ef4444', 0.12),
        color: isVisible ? '#16a34a' : '#dc2626',
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
      }}
    />
  );
});

/* ---------- InlineReplyForm ---------- */
const InlineReplyForm = memo(function InlineReplyForm({ reviewId, existingReply, onSubmit, onCancel }) {
  const [replyText, setReplyText] = useState(existingReply || '');

  const handleSubmit = useCallback(() => {
    if (!replyText.trim()) return;
    onSubmit(reviewId, replyText.trim());
  }, [reviewId, replyText, onSubmit]);

  return (
    <Box sx={{ mt: 1, pl: 2 }}>
      <DashboardInput
        multiline
        rows={2}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write owner reply..."
        size="small"
        inputSize="sm"
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <DashboardActionButton size="small" onClick={handleSubmit} disabled={!replyText.trim()}>
          Submit Reply
        </DashboardActionButton>
        <DashboardCancelButton size="small" onClick={onCancel}>
          Cancel
        </DashboardCancelButton>
      </Box>
    </Box>
  );
});

/* ---------- Reviews Sub-tab ---------- */
const ReviewsSubTab = memo(function ReviewsSubTab({ websiteId, colors }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, averageRating: 0, hiddenCount: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [mobileActionItem, setMobileActionItem] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const fetchReviews = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reviews/listings/${websiteId}`, {
        params: { limit: 50, status: statusFilter === 'all' ? undefined : statusFilter },
        withCredentials: true,
      });
      const data = res.data;
      setReviews(data.reviews || []);
      setStats({
        total: data.stats?.totalCount || 0,
        averageRating: data.stats?.averageRating || 0,
        hiddenCount: (data.reviews || []).filter((r) => r.status === 'hidden').length,
      });
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [websiteId, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const handleToggleVisibility = useCallback(async (review) => {
    const newStatus = review.status === 'visible' ? 'hidden' : 'visible';
    try {
      // Backend route: PATCH /api/reviews/:id/status
      await axios.patch(
        `${API_URL}/reviews/${review.id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r))
      );
    } catch { /* silent */ }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      // Backend route: DELETE /api/reviews/:id
      await axios.delete(`${API_URL}/reviews/${deleteTarget.id}`, {
        withCredentials: true,
      });
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch { /* silent */ }
    setDeleteLoading(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleReplySubmit = useCallback(async (reviewId, content) => {
    try {
      // Backend expects { replyText } — not { content }
      await axios.post(
        `${API_URL}/reviews/${reviewId}/reply`,
        { replyText: content },
        { withCredentials: true }
      );
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, ownerReply: { content, createdAt: new Date().toISOString() } }
            : r
        )
      );
      setReplyingTo(null);
    } catch { /* silent */ }
  }, []);

  const getRowActions = useCallback(
    (review) => [
      {
        label: review.ownerReply ? 'Edit Reply' : 'Reply',
        icon: <Reply size={15} />,
        onClick: () => setReplyingTo(replyingTo === review.id ? null : review.id),
        color: colors.primary,
      },
      {
        label: review.status === 'visible' ? 'Hide' : 'Unhide',
        icon: <EyeOff size={15} />,
        onClick: () => handleToggleVisibility(review),
        color: colors.textSecondary,
      },
      {
        label: 'Delete',
        icon: <Trash2 size={15} />,
        onClick: () => setDeleteTarget(review),
        color: '#ef4444',
        hoverColor: '#dc2626',
      },
    ],
    [colors, replyingTo, handleToggleVisibility]
  );

  return (
    <Box>
      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <DashboardMetricCard
            title="Total Reviews"
            value={stats.total}
            icon={<Star size={18} />}
            colors={colors}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <DashboardMetricCard
            title="Average Rating"
            value={stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
            icon={<Star size={18} />}
            colors={colors}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <DashboardMetricCard
            title="Hidden"
            value={stats.hiddenCount}
            icon={<EyeOff size={18} />}
            colors={colors}
          />
        </Box>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FilterBar
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'visible', label: 'Visible' },
            { value: 'hidden', label: 'Hidden' },
          ]}
        />
      </Box>

      {/* Table */}
      <DashboardTable colors={colors}>
        <TableHead>
          <TableRow>
            <DashboardTableHeadCell colors={colors}>Author</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Rating</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Title</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Date</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Actions</DashboardTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                Loading…
              </TableCell>
            </TableRow>
          ) : filteredReviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                No reviews found
              </TableCell>
            </TableRow>
          ) : (
            filteredReviews.map((review) => (
              <>
                <DashboardTableRow key={review.id} colors={colors}>
                  <TableCell sx={{ color: colors.text }}>
                    {review.author?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, maxWidth: 200 }}>
                    {truncate(review.title || review.content, 50)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={review.status} />
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell>
                    {isMobile ? (
                      <DashboardActionButton
                        size="small"
                        variant="outlined"
                        onClick={() => setMobileActionItem(review)}
                      >
                        Actions
                      </DashboardActionButton>
                    ) : (
                      <RowActionButtonGroup actions={getRowActions(review)} colors={colors} />
                    )}
                  </TableCell>
                </DashboardTableRow>

                {/* Inline reply row */}
                {replyingTo === review.id && (
                  <TableRow key={`reply-${review.id}`}>
                    <TableCell colSpan={6} sx={{ py: 0, pb: 1 }}>
                      <InlineReplyForm
                        reviewId={review.id}
                        existingReply={review.ownerReply?.content}
                        onSubmit={handleReplySubmit}
                        onCancel={() => setReplyingTo(null)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </DashboardTable>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Mobile action BottomSheet */}
      <BottomSheet
        open={!!mobileActionItem}
        onClose={() => setMobileActionItem(null)}
        title="Review Actions"
      >
        {mobileActionItem && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            <DashboardActionButton
              fullWidth
              onClick={() => {
                setReplyingTo(mobileActionItem.id);
                setMobileActionItem(null);
              }}
            >
              {mobileActionItem.ownerReply ? 'Edit Reply' : 'Reply'}
            </DashboardActionButton>
            <DashboardActionButton
              fullWidth
              onClick={() => {
                handleToggleVisibility(mobileActionItem);
                setMobileActionItem(null);
              }}
            >
              {mobileActionItem.status === 'visible' ? 'Hide' : 'Unhide'}
            </DashboardActionButton>
            <DashboardActionButton
              fullWidth
              onClick={() => {
                setDeleteTarget(mobileActionItem);
                setMobileActionItem(null);
              }}
              sx={{ color: '#ef4444' }}
            >
              Delete
            </DashboardActionButton>
          </Box>
        )}
      </BottomSheet>
    </Box>
  );
});

/* ---------- Comments Sub-tab ---------- */
const CommentsSubTab = memo(function CommentsSubTab({ websiteId, colors }) {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [mobileActionItem, setMobileActionItem] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const fetchComments = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/comments/listings/${websiteId}`, {
        params: { limit: 50 },
        withCredentials: true,
      });
      setComments(res.data.comments || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const flatComments = comments.reduce((acc, c) => {
    acc.push(c);
    if (c.replies) acc.push(...c.replies);
    return acc;
  }, []);

  const filteredComments = flatComments.filter((c) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'hidden') return c.status === 'hidden';
    return c.status !== 'hidden';
  });

  const hiddenCount = flatComments.filter((c) => c.status === 'hidden').length;
  const totalCount = flatComments.length;

  const handleToggleVisibility = useCallback(async (comment) => {
    const newStatus = comment.status === 'visible' ? 'hidden' : 'visible';
    try {
      // Backend route: PATCH /api/comments/:id/status
      await axios.patch(
        `${API_URL}/comments/${comment.id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setComments((prev) => {
        const update = (arr) =>
          arr.map((c) => {
            if (c.id === comment.id) return { ...c, status: newStatus };
            if (c.replies) return { ...c, replies: update(c.replies) };
            return c;
          });
        return update(prev);
      });
    } catch { /* silent */ }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      // Backend route: DELETE /api/comments/:id
      await axios.delete(`${API_URL}/comments/${deleteTarget.id}`, {
        withCredentials: true,
      });
      setComments((prev) => {
        const remove = (arr) =>
          arr
            .filter((c) => c.id !== deleteTarget.id)
            .map((c) => ({ ...c, replies: c.replies ? remove(c.replies) : c.replies }));
        return remove(prev);
      });
    } catch { /* silent */ }
    setDeleteLoading(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const getRowActions = useCallback(
    (comment) => [
      {
        label: comment.status === 'visible' ? 'Hide' : 'Unhide',
        icon: <EyeOff size={15} />,
        onClick: () => handleToggleVisibility(comment),
        color: colors.textSecondary,
      },
      {
        label: 'Delete',
        icon: <Trash2 size={15} />,
        onClick: () => setDeleteTarget(comment),
        color: '#ef4444',
        hoverColor: '#dc2626',
      },
    ],
    [colors, handleToggleVisibility]
  );

  return (
    <Box>
      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <DashboardMetricCard
            title="Total Comments"
            value={totalCount}
            icon={<MessageSquare size={18} />}
            colors={colors}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 140 }}>
          <DashboardMetricCard
            title="Hidden / Flagged"
            value={hiddenCount}
            icon={<Flag size={18} />}
            colors={colors}
          />
        </Box>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FilterBar
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'visible', label: 'Visible' },
            { value: 'hidden', label: 'Hidden' },
          ]}
        />
      </Box>

      {/* Table */}
      <DashboardTable colors={colors}>
        <TableHead>
          <TableRow>
            <DashboardTableHeadCell colors={colors}>Author</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Comment</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Reactions</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Date</DashboardTableHeadCell>
            <DashboardTableHeadCell colors={colors}>Actions</DashboardTableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                Loading…
              </TableCell>
            </TableRow>
          ) : filteredComments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                No comments found
              </TableCell>
            </TableRow>
          ) : (
            filteredComments.map((comment) => (
              <DashboardTableRow key={comment.id} colors={colors}>
                <TableCell sx={{ color: colors.text }}>
                  {comment.author?.name || '—'}
                </TableCell>
                <TableCell sx={{ color: colors.textSecondary, maxWidth: 240 }}>
                  {truncate(comment.content, 60)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={comment.status} />
                </TableCell>
                <TableCell sx={{ color: colors.textSecondary }}>
                  {comment.reactions?.reduce((sum, r) => sum + (r.count || 0), 0) || 0}
                </TableCell>
                <TableCell sx={{ color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                  {formatDate(comment.createdAt)}
                </TableCell>
                <TableCell>
                  {isMobile ? (
                    <DashboardActionButton
                      size="small"
                      variant="outlined"
                      onClick={() => setMobileActionItem(comment)}
                    >
                      Actions
                    </DashboardActionButton>
                  ) : (
                    <RowActionButtonGroup actions={getRowActions(comment)} colors={colors} />
                  )}
                </TableCell>
              </DashboardTableRow>
            ))
          )}
        </TableBody>
      </DashboardTable>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Mobile BottomSheet */}
      <BottomSheet
        open={!!mobileActionItem}
        onClose={() => setMobileActionItem(null)}
        title="Comment Actions"
      >
        {mobileActionItem && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            <DashboardActionButton
              fullWidth
              onClick={() => {
                handleToggleVisibility(mobileActionItem);
                setMobileActionItem(null);
              }}
            >
              {mobileActionItem.status === 'visible' ? 'Hide' : 'Unhide'}
            </DashboardActionButton>
            <DashboardActionButton
              fullWidth
              onClick={() => {
                setDeleteTarget(mobileActionItem);
                setMobileActionItem(null);
              }}
              sx={{ color: '#ef4444' }}
            >
              Delete
            </DashboardActionButton>
          </Box>
        )}
      </BottomSheet>
    </Box>
  );
});

/* ---------- ReviewsTab (main) ---------- */
const ReviewsTab = memo(({ website, websiteId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [activeTab, setActiveTab] = useState('reviews');

  const navSections = [
    {
      title: 'Moderation',
      items: [
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'comments', label: 'Comments', icon: MessageSquare },
      ],
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: { xs: 0, lg: 3 }, flexDirection: { xs: 'column', lg: 'row' } }}>
      {/* Side nav */}
      <MiniSideNav
        sections={navSections}
        activeItem={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'reviews' ? (
          <ReviewsSubTab websiteId={websiteId} colors={colors} />
        ) : (
          <CommentsSubTab websiteId={websiteId} colors={colors} />
        )}
      </Box>
    </Box>
  );
});

ReviewsTab.displayName = 'ReviewsTab';

export default ReviewsTab;
