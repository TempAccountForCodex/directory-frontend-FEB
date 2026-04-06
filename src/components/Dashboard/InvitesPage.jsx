/**
 * InvitesPage (Step 7.7.5)
 *
 * Dashboard page at /invites route.
 * Displays pending collaboration invites for the current user.
 * Supports accept/decline with confirmation, loading skeleton,
 * empty state, error state with retry, and expiry countdown.
 *
 * Performance:
 * - React.memo on all sub-components
 * - useCallback for handlers
 * - useMemo for derived data (expiry countdown)
 *
 * Accessibility:
 * - aria-labels on action buttons
 * - Role attribute on status chips
 * - Focus management on toast
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Skeleton,
  Button,
  alpha,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import { Check, X, Clock, Users, RefreshCw, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  PageHeader,
  DashboardActionButton,
  ConfirmationDialog,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ROLE_COLORS = {
  ADMIN: '#2196f3',
  EDITOR: '#4caf50',
  VIEWER: '#9e9e9e',
};

/**
 * Compute days-remaining string from expiresAt date.
 * Returns a human-readable string like "Expires in 5 days", "Expires today", or "Expired".
 */
function getExpiryLabel(expiresAt) {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp - now;

  if (diffMs <= 0) return { label: 'Expired', color: '#f44336' };

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return { label: 'Expires today', color: '#ff9800' };
  if (diffDays === 1) return { label: 'Expires tomorrow', color: '#ff9800' };
  return { label: `Expires in ${diffDays} days`, color: '#9e9e9e' };
}

/**
 * Single invite card component.
 */
const InviteCard = React.memo(function InviteCard({
  invite,
  onAccept,
  onDecline,
  accepting,
  declining,
  colors,
}) {
  const expiryInfo = useMemo(() => getExpiryLabel(invite.expiresAt), [invite.expiresAt]);
  const isLoading = accepting || declining;

  return (
    <Paper
      elevation={0}
      data-testid="invite-card"
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bgCard,
        transition: 'box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: `0 2px 12px ${alpha(colors.primary, 0.1)}`,
        },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        {/* Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(colors.primary, 0.1),
            flexShrink: 0,
          }}
        >
          <Users size={22} color={colors.primary} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                color: colors.text,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {invite.websiteName}
            </Typography>
            <Chip
              label={invite.role}
              size="small"
              role="status"
              aria-label={`Role: ${invite.role}`}
              sx={{
                bgcolor: alpha(ROLE_COLORS[invite.role] || colors.primary, 0.15),
                color: ROLE_COLORS[invite.role] || colors.primary,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Invited by {invite.inviterName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Clock size={12} color={expiryInfo.color} />
            <Typography variant="caption" sx={{ color: expiryInfo.color }}>
              {expiryInfo.label}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <DashboardActionButton
            onClick={() => onAccept(invite)}
            disabled={isLoading}
            aria-label={`Accept invite to ${invite.websiteName}`}
            data-testid={`accept-btn-${invite.id}`}
            sx={{
              minHeight: 36,
              px: 2,
              fontSize: '0.8rem',
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {accepting ? (
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
            ) : (
              <>
                <Check size={14} style={{ marginRight: 4 }} />
                Accept
              </>
            )}
          </DashboardActionButton>

          <Button
            variant="outlined"
            size="small"
            onClick={() => onDecline(invite)}
            disabled={isLoading}
            aria-label={`Decline invite to ${invite.websiteName}`}
            data-testid={`decline-btn-${invite.id}`}
            sx={{
              minHeight: 36,
              px: 2,
              fontSize: '0.8rem',
              borderColor: '#f44336',
              color: '#f44336',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#c62828',
                bgcolor: alpha('#f44336', 0.05),
              },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {declining ? (
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
            ) : (
              <>
                <X size={14} style={{ marginRight: 4 }} />
                Decline
              </>
            )}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
});

InviteCard.displayName = 'InviteCard';

/**
 * Loading skeleton for invite cards.
 */
const InviteSkeleton = React.memo(function InviteSkeleton({ colors }) {
  return (
    <Paper
      elevation={0}
      aria-hidden="true"
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bgCard,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="rounded" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="text" width="30%" height={18} />
        </Box>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </Stack>
      </Stack>
    </Paper>
  );
});

InviteSkeleton.displayName = 'InviteSkeleton';

/**
 * Toast notification component.
 */
const Toast = React.memo(function Toast({ message, severity, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <Alert
      severity={severity}
      onClose={onClose}
      role="status"
      aria-live="polite"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        minWidth: 280,
        maxWidth: 400,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </Alert>
  );
});

Toast.displayName = 'Toast';

/**
 * InvitesPage — main component.
 */
const InvitesPage = React.memo(function InvitesPage() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-invite loading states
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null); // { message, severity }

  // Decline confirmation dialog
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [inviteToDecline, setInviteToDecline] = useState(null);
  const [decliningConfirmed, setDecliningConfirmed] = useState(false);

  // Ref for navigation timeout cleanup (prevents memory leak on unmount)
  const navTimerRef = React.useRef(null);
  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ message, severity });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users/me/invites`);
      setInvites(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleAccept = useCallback(async (invite) => {
    setAcceptingId(invite.id);
    try {
      const response = await axios.post(`${API_URL}/invites/${invite.token}/accept`);
      const websiteName = response.data?.websiteName || invite.websiteName;
      setInvites((prev) => prev.filter((inv) => inv.id !== invite.id));
      showToast(`You joined "${websiteName}"!`);
      // Navigate to website dashboard after short delay
      navTimerRef.current = setTimeout(() => {
        navigate('/websites');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept invite';
      showToast(msg, 'error');
    } finally {
      setAcceptingId(null);
    }
  }, [showToast, navigate]);

  const handleDeclineRequest = useCallback((invite) => {
    setInviteToDecline(invite);
    setDeclineDialogOpen(true);
  }, []);

  const handleDeclineConfirm = useCallback(async () => {
    if (!inviteToDecline) return;
    setDecliningConfirmed(true);
    setDecliningId(inviteToDecline.id);
    setDeclineDialogOpen(false);
    try {
      await axios.post(`${API_URL}/invites/${inviteToDecline.token}/decline`);
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteToDecline.id));
      showToast(`Invite to "${inviteToDecline.websiteName}" declined`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to decline invite';
      showToast(msg, 'error');
    } finally {
      setDecliningId(null);
      setDecliningConfirmed(false);
      setInviteToDecline(null);
    }
  }, [inviteToDecline, showToast]);

  const handleDeclineCancel = useCallback(() => {
    setDeclineDialogOpen(false);
    setInviteToDecline(null);
  }, []);

  const pendingCount = useMemo(() => invites.length, [invites]);

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="My Invites"
        subtitle={
          loading
            ? 'Loading invites...'
            : `${pendingCount} pending invite${pendingCount !== 1 ? 's' : ''}`
        }
        icon={<Mail size={22} />}
      />

      <Divider sx={{ borderColor: colors.border, mb: 3 }} />

      {/* Error State */}
      {error && !loading && (
        <Alert
          severity="error"
          data-testid="error-state"
          action={
            <Button
              size="small"
              onClick={fetchInvites}
              sx={{ color: 'inherit', textTransform: 'none' }}
              startIcon={<RefreshCw size={14} />}
              aria-label="Retry loading invites"
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          Failed to load invites
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <Stack spacing={2} data-testid="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <InviteSkeleton key={i} colors={colors} />
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {!loading && !error && invites.length === 0 && (
        <Box
          data-testid="empty-state"
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: alpha(colors.primary, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Mail size={32} color={alpha(colors.primary, 0.5)} />
          </Box>
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            No pending invites
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary }}
          >
            When someone invites you to collaborate on their website, it will appear here.
          </Typography>
        </Box>
      )}

      {/* Invite List */}
      {!loading && !error && invites.length > 0 && (
        <Stack spacing={2} data-testid="invites-list">
          {invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onAccept={handleAccept}
              onDecline={handleDeclineRequest}
              accepting={acceptingId === invite.id}
              declining={decliningId === invite.id}
              colors={colors}
            />
          ))}
        </Stack>
      )}

      {/* Decline Confirmation Dialog */}
      <ConfirmationDialog
        open={declineDialogOpen}
        onConfirm={handleDeclineConfirm}
        onCancel={handleDeclineCancel}
        title="Decline Invite"
        message={`Are you sure you want to decline the invite to "${inviteToDecline?.websiteName}"?`}
        confirmLabel="Decline"
        cancelLabel="Keep"
        variant="danger"
        loading={decliningConfirmed}
      />

      {/* Toast Notification */}
      <Toast
        message={toast?.message}
        severity={toast?.severity}
        onClose={dismissToast}
      />
    </Box>
  );
});

InvitesPage.displayName = 'InvitesPage';

export default InvitesPage;
