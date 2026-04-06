/**
 * ConfirmationDialog — Reusable confirmation dialog (Step 5.5.3)
 *
 * A general-purpose confirmation dialog for unsaved changes, delete confirmations,
 * destructive actions, and any confirm/cancel flows.
 *
 * Features:
 * - Three variants: warning (amber), danger (red), info (blue)
 * - Optional secondary button (e.g., "Save & Leave")
 * - Loading state with CircularProgress
 * - Theme-aware via getDashboardColors
 * - Responsive: fullScreen on mobile (xs breakpoint)
 * - Accessible: role='alertdialog', aria-labelledby, aria-describedby
 * - Touch targets >= 44px
 * - Keyboard: Enter=Confirm (auto-focus), Escape=Cancel
 */

import { useCallback, useId } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardConfirmButton from './DashboardConfirmButton';
import DashboardCancelButton from './DashboardCancelButton';

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------

const VARIANT_CONFIG = {
  warning: {
    Icon: AlertTriangle,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    darkBgColor: '#78350f',
    tone: 'primary',
  },
  danger: {
    Icon: Trash2,
    color: '#ef4444',
    bgColor: '#fee2e2',
    darkBgColor: '#7f1d1d',
    tone: 'danger',
  },
  info: {
    Icon: Info,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    darkBgColor: '#1e3a5f',
    tone: 'primary',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ConfirmationDialog = ({
  open,
  onConfirm,
  onCancel,
  onSecondary,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  secondaryLabel,
  variant = 'warning',
  loading = false,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = colors.mode === 'light';
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const titleId = `confirmation-dialog-title-${uniqueId}`;
  const messageId = `confirmation-dialog-message-${uniqueId}`;

  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG.warning;
  const { Icon, color: variantColor, bgColor, darkBgColor, tone } = variantConfig;

  const handleConfirm = useCallback(() => {
    if (!loading) {
      onConfirm();
    }
  }, [loading, onConfirm]);

  const handleCancel = useCallback(() => {
    if (!loading) {
      onCancel();
    }
  }, [loading, onCancel]);

  const handleSecondary = useCallback(() => {
    if (!loading && onSecondary) {
      onSecondary();
    }
  }, [loading, onSecondary]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={messageId}
      role="alertdialog"
      PaperProps={{
        sx: {
          bgcolor: colors.bgCard,
          borderRadius: fullScreen ? 0 : '12px',
          border: fullScreen ? 'none' : `1px solid ${colors.border}`,
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
          color: colors.text,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: isLight ? bgColor : alpha(variantColor, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={variantColor} />
        </Box>
        <Typography
          component="span"
          variant="h6"
          sx={{ fontWeight: 600, color: colors.text }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box id={messageId}>
          {typeof message === 'string' ? (
            <Typography
              variant="body1"
              sx={{ color: colors.textSecondary, lineHeight: 1.6 }}
            >
              {message}
            </Typography>
          ) : (
            message
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1,
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <DashboardCancelButton
          onClick={handleCancel}
          disabled={loading}
          sx={{ minHeight: 44, minWidth: 80 }}
        >
          {cancelLabel}
        </DashboardCancelButton>

        {onSecondary && secondaryLabel && (
          <DashboardConfirmButton
            tone="primary"
            onClick={handleSecondary}
            disabled={loading}
            sx={{ minHeight: 44, minWidth: 80 }}
          >
            {secondaryLabel}
          </DashboardConfirmButton>
        )}

        <DashboardConfirmButton
          tone={tone}
          onClick={handleConfirm}
          disabled={loading}
          autoFocus
          sx={{ minHeight: 44, minWidth: 80 }}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {confirmLabel}
        </DashboardConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
