/**
 * ApprovalStatusBanner — Step 7.11.10
 *
 * Sticky banner showing the current approval workflow state in the editor.
 * Polls every 30s and listens for WebSocket APPROVAL_STATE_CHANGED events.
 *
 * Props:
 *   websiteId  — number|string
 *   userRole   — 'OWNER'|'ADMIN'|'EDITOR'|'VIEWER'
 *   userId     — number (current user)
 *
 * States handled:
 *   DRAFT             → nothing rendered
 *   PENDING_APPROVAL  → info alert + optional Approve/Reject buttons for ADMIN+
 *   APPROVED          → success alert + optional Publish button for ADMIN+
 *   REJECTED          → warning alert with reason + Resubmit for original editor
 *   PUBLISHED         → nothing rendered
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Skeleton,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useApprovalWorkflow } from '../../hooks/useApprovalWorkflow';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_HIERARCHY = { OWNER: 4, ADMIN: 3, EDITOR: 2, VIEWER: 1 };

function isAdminPlus(role) {
  return (ROLE_HIERARCHY[role] ?? 0) >= 3;
}

const MAX_REJECTION_LEN = 1000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ApprovalStatusBanner = React.memo(function ApprovalStatusBanner({
  websiteId,
  userRole,
  userId,
}) {
  const { approvalState, loading, error, refreshApprovalState, reviewApproval, publishAfterApproval } =
    useApprovalWorkflow(websiteId, userRole, userId);

  // ---- Dialog state --------------------------------------------------------
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ---- Derived values -------------------------------------------------------

  const workflowState = useMemo(
    () => approvalState?.workflowState ?? approvalState?.state ?? null,
    [approvalState]
  );

  const requester = useMemo(() => approvalState?.requestedBy ?? approvalState?.requester ?? null, [approvalState]);
  const requestedAt = useMemo(() => {
    const raw = approvalState?.requestedAt ?? approvalState?.createdAt;
    if (!raw) return null;
    return new Date(raw).toLocaleString();
  }, [approvalState]);

  const rejectionReasonText = useMemo(
    () => approvalState?.rejectionReason ?? approvalState?.reason ?? null,
    [approvalState]
  );

  const isRequester = useMemo(() => {
    if (!requester || !userId) return false;
    const rid = requester?.id ?? requester;
    return Number(rid) === Number(userId);
  }, [requester, userId]);

  const canActAsAdmin = useMemo(
    () => isAdminPlus(userRole) && !isRequester,
    [userRole, isRequester]
  );

  const requesterName = useMemo(
    () => requester?.name ?? requester?.email ?? 'Someone',
    [requester]
  );

  // ---- Handlers ------------------------------------------------------------

  const handleApprove = useCallback(async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await reviewApproval({ approved: true });
    } catch (err) {
      setActionError(err?.response?.data?.message ?? err?.message ?? 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  }, [reviewApproval]);

  const handleOpenRejectDialog = useCallback(() => {
    setRejectionReason('');
    setActionError(null);
    setRejectDialogOpen(true);
  }, []);

  const handleCloseRejectDialog = useCallback(() => {
    setRejectDialogOpen(false);
  }, []);

  const handleRejectionReasonChange = useCallback((e) => {
    setRejectionReason(e.target.value);
  }, []);

  const handleConfirmReject = useCallback(async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await reviewApproval({ approved: false, rejectionReason: rejectionReason.trim() });
      setRejectDialogOpen(false);
    } catch (err) {
      setActionError(err?.response?.data?.message ?? err?.message ?? 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  }, [reviewApproval, rejectionReason]);

  const handlePublish = useCallback(async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await publishAfterApproval();
    } catch (err) {
      setActionError(err?.response?.data?.message ?? err?.message ?? 'Failed to publish');
    } finally {
      setActionLoading(false);
    }
  }, [publishAfterApproval]);

  const handleRetry = useCallback(() => {
    refreshApprovalState();
  }, [refreshApprovalState]);

  // ---- Render helpers -------------------------------------------------------

  const bannerSx = useMemo(
    () => ({
      position: 'sticky',
      top: 0,
      zIndex: 10,
      borderRadius: 1,
      mb: 1,
    }),
    []
  );

  const actionBtnSx = useMemo(() => ({ ml: 1, minWidth: 88, minHeight: 36 }), []);

  // ---- Loading state -------------------------------------------------------

  if (loading && !approvalState) {
    return (
      <Box sx={{ mb: 1 }}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  // ---- Error state ---------------------------------------------------------

  if (error && !approvalState) {
    return (
      <Alert
        severity="error"
        sx={bannerSx}
        action={
          <Button size="small" color="inherit" onClick={handleRetry}>
            Retry
          </Button>
        }
      >
        Could not load approval status. {error}
      </Alert>
    );
  }

  // ---- No banner states ----------------------------------------------------

  if (!workflowState || workflowState === 'DRAFT' || workflowState === 'PUBLISHED') {
    return null;
  }

  // ---- PENDING_APPROVAL ----------------------------------------------------

  if (workflowState === 'PENDING_APPROVAL') {
    return (
      <>
        <Alert
          severity="info"
          sx={bannerSx}
          action={
            canActAsAdmin ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  size="small"
                  color="success"
                  variant="outlined"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  sx={actionBtnSx}
                  startIcon={actionLoading ? <CircularProgress size={12} color="inherit" /> : undefined}
                  aria-label="Approve changes"
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  color="warning"
                  variant="outlined"
                  disabled={actionLoading}
                  onClick={handleOpenRejectDialog}
                  sx={actionBtnSx}
                  aria-label="Reject changes"
                >
                  Reject
                </Button>
              </Box>
            ) : undefined
          }
        >
          <Typography component="span" variant="body2">
            Changes submitted for review — waiting for approval
          </Typography>
          {requester && (
            <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip label={`By: ${requesterName}`} size="small" />
              {requestedAt && (
                <Chip label={requestedAt} size="small" variant="outlined" />
              )}
            </Box>
          )}
          {actionError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              {actionError}
            </Typography>
          )}
        </Alert>

        {/* Reject dialog */}
        <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Reject Changes</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
              Provide a reason so the editor knows what to revise.
            </Typography>
            <TextField
              label="Rejection reason"
              multiline
              minRows={3}
              fullWidth
              value={rejectionReason}
              onChange={handleRejectionReasonChange}
              inputProps={{ maxLength: MAX_REJECTION_LEN, 'aria-label': 'Rejection reason' }}
              helperText={`${rejectionReason.length}/${MAX_REJECTION_LEN}`}
            />
            {actionError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {actionError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseRejectDialog} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              disabled={actionLoading || rejectionReason.trim().length === 0}
              onClick={handleConfirmReject}
              startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              Confirm Reject
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // ---- APPROVED ------------------------------------------------------------

  if (workflowState === 'APPROVED') {
    return (
      <Alert
        severity="success"
        sx={bannerSx}
        action={
          isAdminPlus(userRole) ? (
            <Button
              size="small"
              color="success"
              variant="contained"
              disabled={actionLoading}
              onClick={handlePublish}
              sx={actionBtnSx}
              startIcon={actionLoading ? <CircularProgress size={12} color="inherit" /> : undefined}
              aria-label="Publish website"
            >
              Publish
            </Button>
          ) : undefined
        }
      >
        Changes approved — ready to publish
        {actionError && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {actionError}
          </Typography>
        )}
      </Alert>
    );
  }

  // ---- REJECTED ------------------------------------------------------------

  if (workflowState === 'REJECTED') {
    return (
      <Alert
        severity="warning"
        sx={bannerSx}
        action={
          isRequester ? (
            <Button
              size="small"
              color="warning"
              variant="outlined"
              sx={actionBtnSx}
              aria-label="Resubmit for approval"
              // Resubmit opens RequestApprovalDialog — parent handles this via state
              onClick={() => window.dispatchEvent(new CustomEvent('approval:resubmit', { detail: { websiteId } }))}
            >
              Resubmit
            </Button>
          ) : undefined
        }
      >
        <Typography component="span" variant="body2">
          Changes need revision
        </Typography>
        {(isRequester || isAdminPlus(userRole)) && rejectionReasonText && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
            Reason: {rejectionReasonText}
          </Typography>
        )}
      </Alert>
    );
  }

  return null;
});

export default ApprovalStatusBanner;
