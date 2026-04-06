/**
 * SubscriptionBanners Component
 *
 * Shows alert banners for:
 * 1. "Cancelling" — when subscription has cancel_at_period_end (amber warning)
 * 2. "Past Due" — when subscriptionStatus === 'past_due' (red error with escalating urgency)
 *
 * Usage:
 *   <SubscriptionBanners
 *     subscriptionStatus={billingDetails.subscriptionStatus}
 *     cancelledAt={billingDetails.cancelledAt}
 *     currentPeriodEnd={billingDetails.currentPeriodEnd}
 *     pastDueAt={billingDetails.pastDueAt}
 *     onReactivate={reactivateSubscription}
 *   />
 */

import React, { useMemo, useCallback, useState, memo } from 'react';
import { Box, Alert, AlertTitle, Button, Typography, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

/**
 * Calculate days remaining until a target date.
 * Returns 0 if the date has passed.
 *
 * @param {Date|string|null} targetDate
 * @returns {number}
 */
function daysUntil(targetDate) {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  const now = new Date();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since a past date.
 * Returns 0 if date is in the future or null.
 *
 * @param {Date|string|null} pastDate
 * @returns {number}
 */
function daysSince(pastDate) {
  if (!pastDate) return 0;
  const past = new Date(pastDate);
  const now = new Date();
  const diffMs = now - past;
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format a date for display (e.g., "March 31, 2026")
 * @param {Date|string|null} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return 'end of billing period';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * CancellingBanner — shown when subscription is scheduled to cancel.
 */
const CancellingBanner = memo(function CancellingBanner({
  currentPeriodEnd,
  onReactivate,
  colors,
}) {
  const [loading, setLoading] = useState(false);

  const daysLeft = useMemo(() => daysUntil(currentPeriodEnd), [currentPeriodEnd]);
  const endDate = useMemo(() => formatDate(currentPeriodEnd), [currentPeriodEnd]);

  const handleReactivate = useCallback(async () => {
    setLoading(true);
    try {
      await onReactivate();
    } finally {
      setLoading(false);
    }
  }, [onReactivate]);

  return (
    <Alert
      severity="warning"
      action={
        <Button
          size="small"
          onClick={handleReactivate}
          disabled={loading}
          sx={{
            color: '#b45309', // Amber-700 for contrast on warning background
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'none',
            border: '1px solid #b45309',
            px: 1.5,
            '&:hover': { bgcolor: alpha('#b45309', 0.1) },
          }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : 'Reactivate'}
        </Button>
      }
      sx={{
        mb: 2,
        borderRadius: 2,
        '& .MuiAlert-message': { flex: 1 },
      }}
    >
      <AlertTitle sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
        Subscription Cancelling
      </AlertTitle>
      <Typography sx={{ fontSize: '0.85rem' }}>
        Your subscription will end on <strong>{endDate}</strong>
        {daysLeft > 0 && ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining)`}. You will
        lose access to premium features after that date.
      </Typography>
    </Alert>
  );
});

/**
 * Determine dunning urgency level based on days since payment failure.
 * @param {number} daysOverdue
 * @returns {{ title: string, message: string, severity: 'warning'|'error' }}
 */
function getDunningContent(daysOverdue) {
  if (daysOverdue >= 7) {
    return {
      title: 'Last chance — update payment to avoid downgrade',
      message:
        'Your payment has been overdue for over a week. Please update your payment method now to avoid being moved to the free plan. Your content will always be preserved.',
      severity: 'error',
    };
  }
  if (daysOverdue >= 3) {
    return {
      title: 'Payment still pending — update your payment method',
      message: `Your payment has been pending for ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}. Please update your payment method to prevent any interruption to your service.`,
      severity: 'error',
    };
  }
  return {
    title: 'Payment failed — please update your card',
    message:
      'Your last payment failed. Please update your payment method to keep your plan active. Stripe will automatically retry the payment.',
    severity: 'warning',
  };
}

/**
 * PastDueBanner — shown when payment has failed and subscription is past due.
 * Displays escalating urgency based on how long the payment has been overdue.
 */
const PastDueBanner = memo(function PastDueBanner({ pastDueAt, colors, onManagePayment }) {
  const daysOverdue = useMemo(() => daysSince(pastDueAt), [pastDueAt]);
  const { title, message, severity } = useMemo(
    () => getDunningContent(daysOverdue),
    [daysOverdue]
  );

  const handleManagePayment = useCallback(() => {
    if (onManagePayment) {
      onManagePayment();
    }
  }, [onManagePayment]);

  const buttonColor = severity === 'error' ? '#b91c1c' : '#b45309';

  return (
    <Alert
      severity={severity}
      action={
        <Button
          size="small"
          onClick={handleManagePayment}
          sx={{
            color: buttonColor,
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'none',
            border: `1px solid ${buttonColor}`,
            px: 1.5,
            '&:hover': { bgcolor: alpha(buttonColor, 0.1) },
          }}
        >
          Update Payment
        </Button>
      }
      sx={{
        mb: 2,
        borderRadius: 2,
        '& .MuiAlert-message': { flex: 1 },
      }}
    >
      <AlertTitle sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
        {title}
      </AlertTitle>
      <Typography sx={{ fontSize: '0.85rem' }}>
        {message}
      </Typography>
      {daysOverdue > 0 && (
        <Typography sx={{ fontSize: '0.78rem', mt: 0.5, opacity: 0.8 }}>
          Payment failed {daysOverdue} day{daysOverdue === 1 ? '' : 's'} ago.
        </Typography>
      )}
    </Alert>
  );
});

/**
 * SubscriptionBanners — renders active banners based on subscription state.
 *
 * @param {object} props
 * @param {string|null} props.subscriptionStatus - 'active'|'past_due'|'cancelled'|'trialing'|null
 * @param {string|null} props.cancelledAt - ISO date string when cancellation was scheduled
 * @param {string|null} props.currentPeriodEnd - ISO date string of current period end
 * @param {string|null} [props.pastDueAt] - ISO date string when payment first failed (for dunning urgency)
 * @param {Function} props.onReactivate - Async function to reactivate subscription
 * @param {Function} [props.onManagePayment] - Function to open payment management
 */
const SubscriptionBanners = memo(function SubscriptionBanners({
  subscriptionStatus,
  cancelledAt,
  currentPeriodEnd,
  pastDueAt,
  onReactivate,
  onManagePayment,
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const isCancelling = useMemo(
    () => subscriptionStatus === 'cancelled' && !!cancelledAt && !!currentPeriodEnd,
    [subscriptionStatus, cancelledAt, currentPeriodEnd]
  );

  const isPastDue = useMemo(() => subscriptionStatus === 'past_due', [subscriptionStatus]);

  if (!isCancelling && !isPastDue) {
    return null;
  }

  return (
    <Box sx={{ mb: 1 }}>
      {isCancelling && (
        <CancellingBanner
          currentPeriodEnd={currentPeriodEnd}
          onReactivate={onReactivate}
          colors={colors}
        />
      )}
      {isPastDue && (
        <PastDueBanner
          pastDueAt={pastDueAt}
          colors={colors}
          onManagePayment={onManagePayment}
        />
      )}
    </Box>
  );
});

export default SubscriptionBanners;
