/**
 * AccountInvitesPage (Step 7.15.5)
 *
 * Dashboard page at /account-invites route.
 * Displays pending account delegation invites for the current user.
 * Users can accept or decline delegation invites from account owners.
 *
 * API endpoints:
 *   GET  /api/account/account-invites/pending         — Fetch pending invites
 *   POST /api/account/delegates/invite/:token/accept   — Accept invite
 *   POST /api/account/delegates/invite/:token/decline  — Decline invite
 *
 * Performance:
 * - React.memo on all sub-components
 * - useCallback for handlers
 * - useMemo for derived data (expiry countdown, role labels)
 *
 * Accessibility:
 * - role='article' on invite cards with aria-label
 * - Descriptive aria-labels on accept/decline buttons
 * - aria-busy on loading skeleton
 * - Screen reader-announced empty state
 * - Keyboard: Tab through cards, Enter/Space for actions
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
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Check, X, Clock, UserPlus, RefreshCw, Shield } from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  PageHeader,
  DashboardActionButton,
  ConfirmationDialog,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ROLE_LABELS = {
  ACCOUNT_ADMIN: 'Account Admin',
  ACCOUNT_COLLABORATOR: 'Collaborator',
};

const ROLE_COLORS = {
  ACCOUNT_ADMIN: '#2196f3',
  ACCOUNT_COLLABORATOR: '#4caf50',
};

/**
 * Compute expiry label and color from expiresAt date.
 */
function getExpiryLabel(expiresAt) {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp - now;

  if (diffMs <= 0) return { label: 'Expired', color: '#f44336', isExpired: true };

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return { label: 'Expires today', color: '#ff9800', isExpired: false };
  if (diffDays === 1) return { label: 'Expires tomorrow', color: '#ff9800', isExpired: false };
  return { label: `Expires in ${diffDays} days`, color: '#9e9e9e', isExpired: false };
}

/**
 * Format a role string for display.
 */
function formatRole(role) {
  return ROLE_LABELS[role] || role;
}

/**
 * Single account invite card component.
 */
const AccountInviteCard = React.memo(function AccountInviteCard({
  invite,
  onAccept,
  onDecline,
  accepting,
  declining,
  colors,
}) {
  const expiryInfo = useMemo(() => getExpiryLabel(invite.expiresAt), [invite.expiresAt]);
  const isLoading = accepting || declining;
  const ownerDisplayName = invite.ownerName || invite.ownerEmail || `User #${invite.ownerUserId}`;
  const roleLabel = useMemo(() => formatRole(invite.role), [invite.role]);
  const scopesList = useMemo(
    () => (Array.isArray(invite.serviceScopes) ? invite.serviceScopes : []),
    [invite.serviceScopes]
  );

  const cardAriaLabel = expiryInfo.isExpired
    ? `Expired account delegation invite from ${ownerDisplayName}`
    : `Account delegation invite from ${ownerDisplayName} as ${roleLabel}`;

  return (
    <Paper
      elevation={0}
      role="article"
      aria-label={cardAriaLabel}
      data-testid="account-invite-card"
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${expiryInfo.isExpired ? alpha('#f44336', 0.3) : colors.border}`,
        bgcolor: colors.bgCard,
        opacity: expiryInfo.isExpired ? 0.7 : 1,
        transition: 'box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: expiryInfo.isExpired ? 'none' : `0 2px 12px ${alpha(colors.primary, 0.1)}`,
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
            bgcolor: alpha(expiryInfo.isExpired ? '#f44336' : colors.primary, 0.1),
            flexShrink: 0,
          }}
        >
          <Shield size={22} color={expiryInfo.isExpired ? '#f44336' : colors.primary} />
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
              {ownerDisplayName}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              role="status"
              aria-label={`Role: ${roleLabel}`}
              sx={{
                bgcolor: alpha(ROLE_COLORS[invite.role] || colors.primary, 0.15),
                color: ROLE_COLORS[invite.role] || colors.primary,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
            {expiryInfo.isExpired && (
              <Chip
                label="Expired"
                size="small"
                sx={{
                  bgcolor: alpha('#f44336', 0.15),
                  color: '#f44336',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            )}
          </Box>

          {invite.ownerEmail && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
              {invite.ownerEmail}
            </Typography>
          )}

          {/* Service scopes */}
          {scopesList.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {scopesList.map((scope) => (
                <Chip
                  key={scope}
                  label={scope}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    borderColor: alpha(colors.textSecondary, 0.3),
                    color: colors.textSecondary,
                  }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Clock size={12} color={expiryInfo.color} />
            <Typography variant="caption" sx={{ color: expiryInfo.color }}>
              {expiryInfo.label}
            </Typography>
          </Box>
        </Box>

        {/* Actions - only show for non-expired invites */}
        {!expiryInfo.isExpired && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
            <DashboardActionButton
              onClick={() => onAccept(invite)}
              disabled={isLoading}
              aria-label={`Accept invite from ${ownerDisplayName}`}
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
              aria-label={`Decline invite from ${ownerDisplayName}`}
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
        )}
      </Stack>
    </Paper>
  );
});

AccountInviteCard.displayName = 'AccountInviteCard';

/**
 * Loading skeleton for account invite cards.
 */
const AccountInviteSkeleton = React.memo(function AccountInviteSkeleton({ colors }) {
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

AccountInviteSkeleton.displayName = 'AccountInviteSkeleton';

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
 * AccountInvitesPage -- main component.
 *
 * Fetches pending account delegation invites and allows accept/decline.
 */
const AccountInvitesPage = React.memo(function AccountInvitesPage() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-invite loading states
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Decline confirmation dialog
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [inviteToDecline, setInviteToDecline] = useState(null);
  const [decliningConfirmed, setDecliningConfirmed] = useState(false);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ message, severity });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/account/account-invites/pending`);
      setInvites(response.data?.invites || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load account invites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleAccept = useCallback(async (invite) => {
    if (!invite.token) return;
    setAcceptingId(invite.id);
    try {
      await axios.post(`${API_URL}/account/delegates/invite/${invite.token}/accept`);
      setInvites((prev) => prev.filter((inv) => inv.id !== invite.id));
      const ownerName = invite.ownerName || invite.ownerEmail || 'the account';
      showToast(`You are now a delegate for ${ownerName}!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept invite';
      showToast(msg, 'error');
    } finally {
      setAcceptingId(null);
    }
  }, [showToast]);

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
      await axios.post(`${API_URL}/account/delegates/invite/${inviteToDecline.token}/decline`);
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteToDecline.id));
      const ownerName = inviteToDecline.ownerName || inviteToDecline.ownerEmail || 'the account';
      showToast(`Invite from ${ownerName} declined`);
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

  const pendingCount = useMemo(
    () => invites.filter((inv) => !getExpiryLabel(inv.expiresAt).isExpired).length,
    [invites]
  );

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
        title="Account Invites"
        subtitle={
          loading
            ? 'Loading invites...'
            : `${pendingCount} pending invite${pendingCount !== 1 ? 's' : ''}`
        }
        icon={<UserPlus size={22} />}
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
              aria-label="Retry loading account invites"
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          Failed to load account invites
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <Stack spacing={2} data-testid="loading-skeleton" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <AccountInviteSkeleton key={i} colors={colors} />
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {!loading && !error && invites.length === 0 && (
        <Box
          data-testid="empty-state"
          role="status"
          aria-label="No pending account invites"
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
            <UserPlus size={32} color={alpha(colors.primary, 0.5)} />
          </Box>
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            No pending account invites
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary }}
          >
            When someone invites you to manage their account, it will appear here.
          </Typography>
        </Box>
      )}

      {/* Invite List */}
      {!loading && !error && invites.length > 0 && (
        <Stack spacing={2} data-testid="account-invites-list">
          {invites.map((invite) => (
            <AccountInviteCard
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
        message={`Are you sure you want to decline the account delegation invite from "${inviteToDecline?.ownerName || inviteToDecline?.ownerEmail || 'this account'}"?`}
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

AccountInvitesPage.displayName = 'AccountInvitesPage';

export default AccountInvitesPage;
