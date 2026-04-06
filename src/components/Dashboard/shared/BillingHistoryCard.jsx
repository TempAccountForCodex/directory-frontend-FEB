/**
 * BillingHistoryCard
 *
 * Compact vertical timeline of billing events from the user's ConsentLedger.
 * Shows action type with descriptive label, relative timestamp, and paginated "Show More".
 *
 * Usage:
 *   <BillingHistoryCard fetchBillingHistory={useBilling().fetchBillingHistory} />
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCard from './DashboardCard';

// ---------------------------------------------------------------------------
// Action type descriptors
// ---------------------------------------------------------------------------
const ACTION_CONFIG = {
  plan_upgrade: {
    label: 'Plan upgraded',
    Icon: ArrowUpCircle,
    color: '#16a34a', // green
  },
  plan_downgrade: {
    label: 'Plan downgraded',
    Icon: ArrowDownCircle,
    color: '#d97706', // amber
  },
  subscription_cancel: {
    label: 'Subscription cancelled',
    Icon: XCircle,
    color: '#dc2626', // red
  },
  subscription_reactivate: {
    label: 'Subscription reactivated',
    Icon: RefreshCw,
    color: '#16a34a', // green
  },
  payment_method_change: {
    label: 'Payment method updated',
    Icon: CreditCard,
    color: '#6366f1', // indigo
  },
  subscription_expired: {
    label: 'Subscription expired',
    Icon: Clock,
    color: '#dc2626', // red
  },
  payment_succeeded: {
    label: 'Payment successful',
    Icon: CheckCircle,
    color: '#16a34a', // green
  },
  payment_failed: {
    label: 'Payment failed',
    Icon: AlertCircle,
    color: '#dc2626', // red
  },
  admin_plan_override: {
    label: 'Admin plan override applied',
    Icon: Shield,
    color: '#6366f1', // indigo
  },
  admin_plan_override_revoked: {
    label: 'Admin override revoked',
    Icon: Shield,
    color: '#d97706', // amber
  },
  admin_credit_granted: {
    label: 'Account credit granted',
    Icon: CheckCircle,
    color: '#16a34a', // green
  },
  admin_refund: {
    label: 'Refund issued',
    Icon: ArrowDownCircle,
    color: '#6366f1', // indigo
  },
};

const DEFAULT_ACTION_CONFIG = {
  label: 'Billing event',
  Icon: Clock,
  color: '#9ca3af',
};

/**
 * Format a date as relative time (e.g., "3 days ago").
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Unknown date';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format a full date for tooltip display.
 */
function formatFullDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Single billing event entry
// ---------------------------------------------------------------------------
const BillingEventEntry = memo(function BillingEventEntry({ entry, colors, isLast }) {
  const config = ACTION_CONFIG[entry.action] || DEFAULT_ACTION_CONFIG;
  const { Icon, label, color } = config;

  const relativeTime = useMemo(() => formatRelativeTime(entry.createdAt), [entry.createdAt]);
  const fullDate = useMemo(() => formatFullDate(entry.createdAt), [entry.createdAt]);

  const planChangeText = useMemo(() => {
    if (entry.planFrom && entry.planTo && entry.planFrom !== entry.planTo) {
      return `${entry.planFrom.replace('website_', '')} → ${entry.planTo.replace('website_', '')}`;
    }
    if (entry.planFrom && entry.planFrom !== 'null') {
      return entry.planFrom.replace('website_', '');
    }
    return null;
  }, [entry.planFrom, entry.planTo]);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, pb: isLast ? 0 : 2 }}>
      {/* Icon column with vertical line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: alpha(color, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={15} color={color} />
        </Box>
        {!isLast && (
          <Box
            sx={{
              width: 1,
              flex: 1,
              bgcolor: alpha(colors.textSecondary || '#9ca3af', 0.15),
              mt: 0.5,
              minHeight: 16,
            }}
          />
        )}
      </Box>

      {/* Content column */}
      <Box sx={{ flex: 1, pt: 0.25 }}>
        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500, lineHeight: 1.3 }}>
          {label}
        </Typography>

        {planChangeText && (
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              display: 'block',
              mt: 0.25,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {planChangeText}
          </Typography>
        )}

        <Tooltip title={fullDate} placement="top" arrow>
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              display: 'inline-block',
              mt: 0.25,
              fontSize: '0.75rem',
              cursor: 'default',
              '&:hover': { color: colors.text, textDecoration: 'underline dotted' },
            }}
          >
            {relativeTime}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// BillingHistoryCard
// ---------------------------------------------------------------------------

/**
 * BillingHistoryCard — compact billing event timeline.
 *
 * @param {object} props
 * @param {Function} props.fetchBillingHistory - async (page, limit) => BillingHistoryResponse
 */
const BillingHistoryCard = memo(function BillingHistoryCard({ fetchBillingHistory }) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(
    async (pageNum, append = false) => {
      if (!fetchBillingHistory) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchBillingHistory(pageNum, 10);
        setEntries((prev) => (append ? [...prev, ...data.entries] : data.entries));
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError('Unable to load billing history.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchBillingHistory]
  );

  useEffect(() => {
    loadHistory(1, false);
  }, [loadHistory]);

  const handleShowMore = useCallback(() => {
    loadHistory(page + 1, true);
  }, [loadHistory, page]);

  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);

  return (
    <DashboardCard icon={Clock} title="Billing History">
      <Divider sx={{ mb: 2, opacity: 0.8 }} />

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading billing history...
          </Typography>
        </Box>
      ) : error ? (
        <Typography variant="body2" sx={{ color: colors.error || '#dc2626', py: 1 }}>
          {error}
        </Typography>
      ) : entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No billing events yet.
        </Typography>
      ) : (
        <Box>
          {entries.map((entry, index) => (
            <BillingEventEntry
              key={entry.id}
              entry={entry}
              colors={colors}
              isLast={index === entries.length - 1 && !hasMore}
            />
          ))}

          {hasMore && (
            <Box sx={{ mt: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={handleShowMore}
                disabled={loadingMore}
                sx={{
                  color: colors.primary || '#6366f1',
                  textTransform: 'none',
                  fontSize: '0.82rem',
                  p: 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                {loadingMore ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CircularProgress size={13} color="inherit" />
                    Loading...
                  </Box>
                ) : (
                  'Show more'
                )}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </DashboardCard>
  );
});

export default BillingHistoryCard;
