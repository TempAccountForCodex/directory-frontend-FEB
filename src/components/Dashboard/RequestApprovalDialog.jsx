/**
 * RequestApprovalDialog — Step 7.11.11
 *
 * Dialog for editors to submit a change summary and request approval.
 *
 * Props:
 *   open        — boolean
 *   onClose     — () => void
 *   websiteId   — number|string
 *   onSuccess   — () => void  (called after successful submission)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const MAX_CHANGE_SUMMARY = 2000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const RequestApprovalDialog = React.memo(function RequestApprovalDialog({
  open,
  onClose,
  websiteId,
  onSuccess,
}) {
  const [changeSummary, setChangeSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ---- Derived --------------------------------------------------------------

  const charCount = useMemo(() => changeSummary.length, [changeSummary]);
  const isOverLimit = useMemo(() => charCount > MAX_CHANGE_SUMMARY, [charCount]);
  const submitDisabled = useMemo(
    () => loading || changeSummary.trim().length === 0 || isOverLimit,
    [loading, changeSummary, isOverLimit]
  );

  const charCounterLabel = useMemo(
    () => `${charCount}/${MAX_CHANGE_SUMMARY}`,
    [charCount]
  );

  // ---- Handlers ------------------------------------------------------------

  const handleChangeSummaryChange = useCallback((e) => {
    setChangeSummary(e.target.value);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    setChangeSummary('');
    setError(null);
    onClose();
  }, [loading, onClose]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = changeSummary.trim();
    if (!trimmed) {
      setError('Change summary is required.');
      return;
    }
    if (trimmed.length > MAX_CHANGE_SUMMARY) {
      setError(`Change summary must be ${MAX_CHANGE_SUMMARY} characters or fewer.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API_URL}/websites/${websiteId}/approval/request`,
        { changeSummary: trimmed },
        { headers }
      );

      setSnackbarOpen(true);
      setChangeSummary('');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to submit approval request.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [changeSummary, websiteId, onSuccess, onClose]);

  // ---- Render ---------------------------------------------------------------

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="request-approval-dialog-title"
      >
        <DialogTitle id="request-approval-dialog-title">Request Approval</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Provide enough context for reviewers to make a decision.
          </Typography>

          <TextField
            label="Change summary"
            multiline
            minRows={4}
            fullWidth
            required
            value={changeSummary}
            onChange={handleChangeSummaryChange}
            placeholder="Describe what changed and why it needs to be published..."
            disabled={loading}
            error={isOverLimit}
            helperText={
              <Box
                component="span"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  {isOverLimit
                    ? `Exceeds maximum length by ${charCount - MAX_CHANGE_SUMMARY} characters`
                    : 'Required'}
                </span>
                <span
                  aria-label={`Character count: ${charCounterLabel}`}
                  style={{ color: isOverLimit ? 'error' : 'inherit' }}
                >
                  {charCounterLabel}
                </span>
              </Box>
            }
            inputProps={{
              'aria-label': 'Change summary',
              maxLength: MAX_CHANGE_SUMMARY + 100, // allow typing past limit to show error
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitDisabled}
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
            aria-label="Submit approval request"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Approval request submitted successfully"
      />
    </>
  );
});

export default RequestApprovalDialog;
