/**
 * BillingPreview Component
 *
 * Shows the exact prorated cost breakdown before confirming a plan upgrade.
 * Fetches proration amounts from Stripe via GET /api/account/plan-preview?plan={code}.
 *
 * Usage:
 *   <BillingPreview
 *     open={showPreview}
 *     planCode="website_growth"
 *     onConfirm={handleConfirm}
 *     onCancel={() => setShowPreview(false)}
 *   />
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

// Format cents to currency string (e.g., 4900 → "$49.00")
function formatCents(cents) {
  if (typeof cents !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Row in the cost breakdown table
 */
const PreviewRow = memo(({ label, value, bold = false, colors }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
    }}
  >
    <Typography
      sx={{
        color: alpha(colors.text, bold ? 0.9 : 0.65),
        fontSize: '0.9rem',
        fontWeight: bold ? 700 : 400,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        color: bold ? colors.primary : colors.text,
        fontSize: bold ? '1rem' : '0.9rem',
        fontWeight: bold ? 700 : 500,
      }}
    >
      {value}
    </Typography>
  </Box>
));
PreviewRow.displayName = 'PreviewRow';

/**
 * BillingPreview — Dialog showing proration cost before confirming upgrade.
 *
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {string} props.planCode - Target plan code (e.g., 'website_growth')
 * @param {string} props.planLabel - Display label for the target plan
 * @param {Function} props.onConfirm - Called when user confirms the upgrade
 * @param {Function} props.onCancel - Called when user cancels
 * @param {Function} props.getPlanPreview - Hook method to fetch preview data
 */
const BillingPreview = memo(function BillingPreview({
  open,
  planCode,
  planLabel,
  onConfirm,
  onCancel,
  getPlanPreview,
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Fetch preview data when dialog opens
  const fetchPreview = useCallback(async () => {
    if (!planCode || !open) return;

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const data = await getPlanPreview(planCode);
      setPreview(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load pricing preview. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [planCode, open, getPlanPreview]);

  useEffect(() => {
    if (open) {
      fetchPreview();
    }
  }, [open, fetchPreview]);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  }, [onConfirm]);

  return (
    <Dialog
      open={open}
      onClose={!confirming ? onCancel : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: colors.panelBg,
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          backdropFilter: 'blur(16px)',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: colors.text,
          fontWeight: 700,
          fontSize: '1.1rem',
          pb: 1,
        }}
      >
        Confirm Plan Upgrade
        {planLabel && (
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: colors.primary,
              fontSize: '0.85rem',
              fontWeight: 500,
              mt: 0.25,
            }}
          >
            Upgrading to {planLabel}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {/* Error state */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              bgcolor: isDark ? alpha('#f44336', 0.1) : undefined,
              color: isDark ? '#f77' : undefined,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <Box sx={{ py: 1 }}>
            <Skeleton variant="text" height={32} sx={{ bgcolor: alpha(colors.text, 0.08) }} />
            <Skeleton variant="text" height={32} sx={{ bgcolor: alpha(colors.text, 0.08), mt: 1 }} />
            <Skeleton variant="text" height={32} sx={{ bgcolor: alpha(colors.text, 0.08), mt: 1 }} />
            <Skeleton
              variant="rectangular"
              height={48}
              sx={{ bgcolor: alpha(colors.text, 0.08), mt: 2, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Success: cost breakdown */}
        {!loading && !error && preview && (
          <Box>
            {/* Proration explanation */}
            <Alert
              severity="info"
              sx={{
                mb: 2,
                bgcolor: isDark ? alpha(colors.primary, 0.1) : alpha(colors.primary, 0.06),
                color: isDark ? alpha('#fff', 0.85) : colors.text,
                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                '& .MuiAlert-icon': { color: colors.primary },
              }}
            >
              The amount shown is prorated — you are only charged for the remaining days in your
              current billing cycle.
            </Alert>

            {/* Cost breakdown */}
            <Box
              sx={{
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                borderRadius: 2,
                p: 2,
              }}
            >
              <PreviewRow
                label="Subtotal"
                value={formatCents(preview.subtotalCents)}
                colors={colors}
              />
              <PreviewRow
                label="Tax"
                value={formatCents(preview.taxCents)}
                colors={colors}
              />
              <Divider sx={{ my: 1, borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08) }} />
              <PreviewRow
                label="Total due today"
                value={formatCents(preview.totalCents)}
                bold
                colors={colors}
              />
            </Box>

            {/* Estimated notice */}
            {preview.estimated && (
              <Typography
                sx={{
                  color: alpha(colors.text, 0.45),
                  fontSize: '0.75rem',
                  mt: 1.5,
                  fontStyle: 'italic',
                }}
              >
                * Estimated amount — actual charge may vary based on existing subscription credits.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={confirming}
          sx={{
            color: alpha(colors.text, 0.6),
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05) },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || confirming || !!error}
          variant="contained"
          sx={{
            bgcolor: colors.primary,
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: alpha(colors.primary, 0.85) },
            '&:disabled': {
              bgcolor: alpha(colors.primary, 0.4),
              color: alpha('#fff', 0.6),
            },
          }}
        >
          {confirming ? 'Confirming...' : 'Confirm Upgrade'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BillingPreview;
