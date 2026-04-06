import { memo, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Alert,
  Skeleton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Users, UserPlus } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  EmptyState,
} from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardCancelButton from '../shared/DashboardCancelButton';
import DashboardConfirmButton from '../shared/DashboardConfirmButton';
import DashboardInput from '../shared/DashboardInput';
import CollaboratorModal from '../CollaboratorModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ROLE_OPTIONS = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'ADMIN', label: 'Admin' },
];

const ROLE_COLORS = {
  OWNER: 'warning',
  ADMIN: 'info',
  EDITOR: 'success',
  VIEWER: 'default',
};


const TeamTab = memo(({ website, websiteId, onSaved, currentUserRole }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Remove confirmation
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Transfer ownership
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [memberToTransfer, setMemberToTransfer] = useState(null);
  const [transferConfirmText, setTransferConfirmText] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Role change loading map
  const [roleChanging, setRoleChanging] = useState({});

  const isOwner = currentUserRole === 'OWNER';
  const canManageCollaborators = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const fetchCollaborators = useCallback(async () => {
    if (!websiteId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/websites/${websiteId}/collaborators`);
      // Backend returns raw array (no { success, data } envelope)
      setCollaborators(Array.isArray(res.data) ? res.data : res.data?.data || res.data?.collaborators || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleRoleChange = async (collab, newRole) => {
    try {
      setRoleChanging((prev) => ({ ...prev, [collab.userId]: true }));
      await axios.patch(`${API_URL}/websites/${websiteId}/collaborators/${collab.userId}`, {
        role: newRole,
      });
      setCollaborators((prev) =>
        prev.map((c) => (c.userId === collab.userId ? { ...c, role: newRole } : c))
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update role.');
    } finally {
      setRoleChanging((prev) => ({ ...prev, [collab.userId]: false }));
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      setRemoveLoading(true);
      await axios.delete(`${API_URL}/websites/${websiteId}/collaborators/${memberToRemove.userId}`);
      setCollaborators((prev) => prev.filter((c) => c.userId !== memberToRemove.userId));
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove team member.');
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!memberToTransfer) return;
    try {
      setTransferLoading(true);
      await axios.post(`${API_URL}/websites/${websiteId}/transfer-ownership`, {
        newOwnerId: memberToTransfer.userId,
      });
      setTransferDialogOpen(false);
      setMemberToTransfer(null);
      setTransferConfirmText('');
      fetchCollaborators();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to transfer ownership.');
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <DashboardGradientButton
          startIcon={<UserPlus size={16} />}
          onClick={() => setInviteModalOpen(true)}
          aria-label="Invite collaborator"
        >
          Invite Collaborator
        </DashboardGradientButton>
      </Box>

      {/* Collaborator table */}
      {collaborators.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="No collaborators yet"
          subtitle="Invite team members to collaborate on this website."
          action={
            <DashboardGradientButton
              startIcon={<UserPlus size={16} />}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite First Collaborator
            </DashboardGradientButton>
          }
        />
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto', borderRadius: 2 }}>
          <Table size="small" aria-label="Collaborators table">
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collaborators.map((collab) => (
                <TableRow key={collab.id || collab.userId} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={collab.user?.avatar}
                        alt={collab.user?.name || 'User'}
                        sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: colors.primary }}
                      >
                        {(collab.user?.name || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {collab.user?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {collab.user?.email || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {canManageCollaborators && collab.role !== 'OWNER' ? (
                      <FormControl size="small">
                        <Select
                          value={collab.role}
                          onChange={(e) => handleRoleChange(collab, e.target.value)}
                          disabled={!!roleChanging[collab.userId]}
                          aria-label={`Change role for ${collab.user?.name}`}
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={collab.role}
                        color={ROLE_COLORS[collab.role] || 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {collab.createdAt ? new Date(collab.createdAt).toLocaleDateString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      {canManageCollaborators && collab.role !== 'OWNER' && (
                        <DashboardActionButton
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => {
                            setMemberToRemove(collab);
                            setRemoveDialogOpen(true);
                          }}
                          aria-label={`Remove ${collab.user?.name}`}
                        >
                          Remove
                        </DashboardActionButton>
                      )}
                      {isOwner && collab.role !== 'OWNER' && (
                        <DashboardActionButton
                          size="small"
                          variant="text"
                          onClick={() => {
                            setMemberToTransfer(collab);
                            setTransferDialogOpen(true);
                          }}
                          aria-label={`Transfer ownership to ${collab.user?.name}`}
                        >
                          Transfer
                        </DashboardActionButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invite CollaboratorModal (reuse from Step 7.4) */}
      <CollaboratorModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        websiteId={websiteId}
        onSuccess={() => {
          setInviteModalOpen(false);
          fetchCollaborators();
        }}
      />

      {/* Remove member dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false);
          setMemberToRemove(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          Are you sure you want to remove{' '}
          <strong>{memberToRemove?.user?.name}</strong> from this website?
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setRemoveDialogOpen(false);
              setMemberToRemove(null);
            }}
          />
          <DashboardConfirmButton
            onClick={handleRemoveMember}
            color="error"
            disabled={removeLoading}
            aria-label="Confirm remove team member"
          >
            {removeLoading ? 'Removing...' : 'Remove'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>

      {/* Transfer ownership dialog */}
      <Dialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setMemberToTransfer(null);
          setTransferConfirmText('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Transfer Ownership</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will transfer full ownership of this website to{' '}
            <strong>{memberToTransfer?.user?.name}</strong>. You will lose owner privileges.
          </Alert>
          <DashboardInput
            label='Type "TRANSFER" to confirm'
            value={transferConfirmText}
            onChange={(e) => setTransferConfirmText(e.target.value)}
            fullWidth
            inputProps={{ 'aria-label': 'Type TRANSFER to confirm ownership transfer' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setTransferDialogOpen(false);
              setMemberToTransfer(null);
              setTransferConfirmText('');
            }}
          />
          <DashboardConfirmButton
            onClick={handleTransferOwnership}
            color="error"
            disabled={transferConfirmText !== 'TRANSFER' || transferLoading}
            aria-label="Confirm transfer ownership"
          >
            {transferLoading ? 'Transferring...' : 'Transfer Ownership'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

TeamTab.displayName = 'TeamTab';

export default TeamTab;
