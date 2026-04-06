/**
 * CollaboratorModal (Step 7.4.4 + 7.7.6)
 *
 * Modal dialog for managing website collaborators.
 * Supports: listing, adding, removing, and changing roles.
 * Step 7.7.6 adds: pending invite display, re-send for expired/declined invites.
 *
 * Props:
 *   - websiteId: number - The website to manage collaborators for
 *   - open: boolean - Whether the modal is open
 *   - onClose: () => void - Close handler
 *   - currentUserRole: string - The current user's role on this website (from parent)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import { X, UserPlus, Trash2, Users, Send, Clock } from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardSelect,
  ConfirmationDialog,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const COLLABORATOR_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'];

const ROLE_COLORS = {
  OWNER: '#d4a017',
  ADMIN: '#2196f3',
  EDITOR: '#4caf50',
  VIEWER: '#9e9e9e',
};

const ROLE_DESCRIPTIONS = {
  OWNER: 'Full control including delete and transfer',
  ADMIN: 'Manage settings, publish, and collaborators',
  EDITOR: 'Edit content and publish',
  VIEWER: 'View only',
};

const INVITE_STATUS_COLORS = {
  PENDING: '#ff9800',
  EXPIRED: '#f44336',
  DECLINED: '#9e9e9e',
};

/**
 * Single collaborator row component
 */
const CollaboratorRow = React.memo(function CollaboratorRow({
  collaborator,
  isOwner,
  onRemove,
  onRoleChange,
  colors,
}) {
  const user = collaborator.user;
  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: alpha(colors.primary, 0.04),
        },
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(ROLE_COLORS[collaborator.role] || colors.primary, 0.2),
          color: ROLE_COLORS[collaborator.role] || colors.primary,
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {initials}
      </Avatar>

      {/* Name & Email */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.text,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user?.name || 'Unknown User'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: colors.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {user?.email || ''}
        </Typography>
      </Box>

      {/* Role Badge/Select */}
      {collaborator.role === 'OWNER' ? (
        <Chip
          label="OWNER"
          size="small"
          sx={{
            bgcolor: alpha(ROLE_COLORS.OWNER, 0.15),
            color: ROLE_COLORS.OWNER,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      ) : isOwner ? (
        <DashboardSelect
          value={collaborator.role}
          onChange={(e) => onRoleChange(collaborator.userId, e.target.value)}
          size="small"
          sx={{ minWidth: 110 }}
          native
        >
          {COLLABORATOR_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </DashboardSelect>
      ) : (
        <Chip
          label={collaborator.role}
          size="small"
          sx={{
            bgcolor: alpha(ROLE_COLORS[collaborator.role] || colors.primary, 0.15),
            color: ROLE_COLORS[collaborator.role] || colors.primary,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      )}

      {/* Remove Button (only for OWNER managing non-OWNER collaborators) */}
      {isOwner && collaborator.role !== 'OWNER' && (
        <Tooltip title="Remove collaborator" arrow>
          <IconButton
            size="small"
            onClick={() => onRemove(collaborator)}
            sx={{
              color: '#f44336',
              minWidth: 44,
              minHeight: 44,
              '&:hover': { bgcolor: alpha('#f44336', 0.1) },
            }}
            aria-label={`Remove ${user?.name || 'collaborator'}`}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

/**
 * Pending invite row component (for expired/declined invites with Re-send)
 */
const PendingInviteRow = React.memo(function PendingInviteRow({
  invite,
  onResend,
  resending,
  colors,
}) {
  const statusColor = INVITE_STATUS_COLORS[invite.status] || colors.textSecondary;
  const isActionable = invite.status === 'EXPIRED' || invite.status === 'DECLINED';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 1,
        borderRadius: 1,
        bgcolor: alpha(statusColor, 0.04),
        border: `1px dashed ${alpha(statusColor, 0.2)}`,
        mb: 0.5,
      }}
    >
      {/* Clock icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(statusColor, 0.1),
          flexShrink: 0,
        }}
      >
        <Clock size={18} color={statusColor} />
      </Box>

      {/* Email & status */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.text,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {invite.email}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={invite.status}
            size="small"
            sx={{
              bgcolor: alpha(statusColor, 0.15),
              color: statusColor,
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 18,
            }}
          />
          <Chip
            label={invite.role}
            size="small"
            sx={{
              bgcolor: alpha(ROLE_COLORS[invite.role] || colors.primary, 0.15),
              color: ROLE_COLORS[invite.role] || colors.primary,
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 18,
            }}
          />
        </Box>
      </Box>

      {/* Re-send Button (only for EXPIRED/DECLINED) */}
      {isActionable && (
        <Tooltip title="Re-send invite" arrow>
          <span>
            <IconButton
              size="small"
              onClick={() => onResend(invite)}
              disabled={resending}
              data-testid={`resend-invite-${invite.id}`}
              aria-label={`Re-send invite to ${invite.email}`}
              sx={{
                color: colors.primary,
                minWidth: 44,
                minHeight: 44,
                '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
                '&:disabled': { opacity: 0.5 },
              }}
            >
              {resending ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <Send size={16} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
});

/**
 * CollaboratorModal component
 */
const CollaboratorModal = React.memo(function CollaboratorModal({
  websiteId,
  open,
  onClose,
  currentUserRole = 'VIEWER',
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pending invites (expired/declined) state
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  // Add collaborator form
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Remove confirmation
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const isOwner = useMemo(
    () => currentUserRole === 'OWNER',
    [currentUserRole]
  );
  const canManageCollaborators = useMemo(
    () => currentUserRole === 'OWNER' || currentUserRole === 'ADMIN',
    [currentUserRole]
  );

  const fetchCollaborators = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/websites/${websiteId}/collaborators`);
      setCollaborators(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  const fetchPendingInvites = useCallback(async () => {
    if (!websiteId || !canManageCollaborators) return;
    setLoadingInvites(true);
    try {
      const response = await axios.get(`${API_URL}/invites/website/${websiteId}`);
      // Only show expired/declined invites in the modal (pending ones are active)
      const staleInvites = (response.data || []).filter(
        (inv) => inv.status === 'EXPIRED' || inv.status === 'DECLINED'
      );
      setPendingInvites(staleInvites);
    } catch {
      // Non-fatal: don't block the modal if invites fail to load
      setPendingInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  }, [websiteId, canManageCollaborators]);

  useEffect(() => {
    if (open && websiteId) {
      fetchCollaborators();
      fetchPendingInvites();
      // Reset form state when opening
      setEmail('');
      setRole('EDITOR');
      setAddError(null);
      setSuccessMessage(null);
    }
  }, [open, websiteId, fetchCollaborators, fetchPendingInvites]);

  const handleAddCollaborator = useCallback(async () => {
    if (!email.trim()) {
      setAddError('Email is required');
      return;
    }
    setAdding(true);
    setAddError(null);
    setSuccessMessage(null);
    try {
      await axios.post(`${API_URL}/websites/${websiteId}/collaborators/invite`, {
        email: email.trim(),
        role,
      });
      setEmail('');
      setRole('EDITOR');
      setSuccessMessage('Invite sent successfully');
      await Promise.all([fetchCollaborators(), fetchPendingInvites()]);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setAdding(false);
    }
  }, [websiteId, email, role, fetchCollaborators, fetchPendingInvites]);

  const handleRemoveCollaborator = useCallback(async () => {
    if (!collaboratorToRemove) return;
    setRemoving(true);
    try {
      await axios.delete(
        `${API_URL}/websites/${websiteId}/collaborators/${collaboratorToRemove.userId}`
      );
      setRemoveDialogOpen(false);
      setCollaboratorToRemove(null);
      setSuccessMessage('Collaborator removed');
      await fetchCollaborators();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
      setRemoveDialogOpen(false);
    } finally {
      setRemoving(false);
    }
  }, [websiteId, collaboratorToRemove, fetchCollaborators]);

  const handleRoleChange = useCallback(
    async (userId, newRole) => {
      try {
        setError(null);
        await axios.patch(`${API_URL}/websites/${websiteId}/collaborators/${userId}`, {
          role: newRole,
        });
        setSuccessMessage('Role updated');
        await fetchCollaborators();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update role');
      }
    },
    [websiteId, fetchCollaborators]
  );

  const handleResendInvite = useCallback(async (invite) => {
    setResendingId(invite.id);
    setAddError(null);
    setSuccessMessage(null);
    try {
      await axios.post(`${API_URL}/websites/${websiteId}/collaborators/invite`, {
        email: invite.email,
        role: invite.role,
      });
      setSuccessMessage(`Invite re-sent to ${invite.email}`);
      await fetchPendingInvites();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to re-send invite');
    } finally {
      setResendingId(null);
    }
  }, [websiteId, fetchPendingInvites]);

  const openRemoveDialog = useCallback((collaborator) => {
    setCollaboratorToRemove(collaborator);
    setRemoveDialogOpen(true);
  }, []);

  const hasPendingInvites = pendingInvites.length > 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Users size={20} />
              <Typography variant="h6" fontWeight={700}>
                Manage Collaborators
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} aria-label="Close">
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {/* Error / Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {/* Add Collaborator Form — show for OWNER and ADMIN */}
          {canManageCollaborators && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 600, mb: 1.5 }}
              >
                Invite Collaborator
              </Typography>

              {addError && (
                <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setAddError(null)}>
                  {addError}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <DashboardInput
                  label="Email address"
                  labelPlacement="floating"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={adding}
                  type="email"
                  containerSx={{ flex: 1 }}
                  placeholder="user@example.com"
                />

                <DashboardSelect
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={adding}
                  native
                  sx={{ minWidth: 110, mt: '4px' }}
                >
                  {COLLABORATOR_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </DashboardSelect>

                <DashboardActionButton
                  onClick={handleAddCollaborator}
                  disabled={adding || !email.trim()}
                  data-testid="add-collaborator-btn"
                  sx={{ minHeight: 44, mt: '4px', minWidth: 44, px: 2 }}
                >
                  {adding ? (
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                  ) : (
                    <UserPlus size={18} />
                  )}
                </DashboardActionButton>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {ROLE_DESCRIPTIONS[role]}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ borderColor: colors.border, mb: 2 }} />

          {/* Collaborator List */}
          <Typography
            variant="subtitle2"
            sx={{ color: colors.text, fontWeight: 600, mb: 1.5 }}
          >
            Team Members ({collaborators.length})
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} sx={{ color: colors.primary }} />
            </Box>
          ) : collaborators.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Users size={40} color={alpha(colors.textSecondary, 0.3)} />
              <Typography
                variant="body2"
                sx={{ color: colors.textSecondary, mt: 1 }}
              >
                No collaborators yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {collaborators.map((collab) => (
                <CollaboratorRow
                  key={collab.userId || collab.id}
                  collaborator={collab}
                  isOwner={canManageCollaborators}
                  onRemove={openRemoveDialog}
                  onRoleChange={handleRoleChange}
                  colors={colors}
                />
              ))}
            </Box>
          )}

          {/* Pending Invites Section (expired/declined) — for OWNER and ADMIN */}
          {canManageCollaborators && (hasPendingInvites || loadingInvites) && (
            <>
              <Divider sx={{ borderColor: colors.border, my: 2 }} />
              <Typography
                variant="subtitle2"
                sx={{ color: colors.textSecondary, fontWeight: 600, mb: 1.5 }}
              >
                Pending Invites (expired/declined)
              </Typography>

              {loadingInvites ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={20} sx={{ color: colors.primary }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {pendingInvites.map((invite) => (
                    <PendingInviteRow
                      key={invite.id}
                      invite={invite}
                      onResend={handleResendInvite}
                      resending={resendingId === invite.id}
                      colors={colors}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <ConfirmationDialog
        open={removeDialogOpen}
        onConfirm={handleRemoveCollaborator}
        onCancel={() => {
          setRemoveDialogOpen(false);
          setCollaboratorToRemove(null);
        }}
        title="Remove Collaborator"
        message={`Are you sure you want to remove ${collaboratorToRemove?.user?.name || collaboratorToRemove?.user?.email || 'this collaborator'} from this website?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={removing}
      />
    </>
  );
});

CollaboratorModal.displayName = 'CollaboratorModal';

export default CollaboratorModal;
