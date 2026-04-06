/**
 * RecoveryModal — Shows recovery prompt when unsaved backup is detected (Step 5.10)
 *
 * Displays a dialog informing the user that unsaved changes from a previous session
 * were found in localStorage. User can restore or discard.
 *
 * Auto-dismisses after 30 seconds (defaults to discard).
 */

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";
import {
  InfoOutlined as InfoIcon,
  RestorePage as RestoreIcon,
  DeleteOutline as DiscardIcon,
} from "@mui/icons-material";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecoveryModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Timestamp of the backup */
  timestamp: number;
  /** Called when user clicks Restore */
  onRestore: () => void;
  /** Called when user clicks Discard or auto-dismiss fires */
  onDiscard: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTO_DISMISS_MS = 30_000;
const PROGRESS_INTERVAL_MS = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  return `${Math.floor(diffHr / 24)} day${Math.floor(diffHr / 24) === 1 ? "" : "s"} ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const RecoveryModal: React.FC<RecoveryModalProps> = memo(
  function RecoveryModal({ open, timestamp, onRestore, onDiscard }) {
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);

    const cleanup = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (dismissRef.current) {
        clearTimeout(dismissRef.current);
        dismissRef.current = null;
      }
    }, []);

    // Start auto-dismiss timer when modal opens
    useEffect(() => {
      if (!open) {
        cleanup();
        setProgress(0);
        return;
      }

      startTimeRef.current = Date.now();

      // Progress bar update
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / AUTO_DISMISS_MS) * 100, 100);
        setProgress(pct);
      }, PROGRESS_INTERVAL_MS);

      // Auto-dismiss
      dismissRef.current = setTimeout(() => {
        cleanup();
        onDiscard();
      }, AUTO_DISMISS_MS);

      return cleanup;
    }, [open, onDiscard, cleanup]);

    const handleRestore = useCallback(() => {
      cleanup();
      onRestore();
    }, [cleanup, onRestore]);

    const handleDiscard = useCallback(() => {
      cleanup();
      onDiscard();
    }, [cleanup, onDiscard]);

    return (
      <Dialog
        open={open}
        onClose={handleDiscard}
        maxWidth="sm"
        fullWidth
        aria-labelledby="recovery-modal-title"
      >
        <DialogTitle id="recovery-modal-title">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InfoIcon color="info" />
            <Typography variant="h6" component="span">
              Unsaved Changes Detected
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have unsaved changes from{" "}
            <strong>{formatTimeAgo(timestamp)}</strong>. Would you like to
            restore them?
          </Typography>

          <Typography variant="body2" color="text.secondary">
            If you don&apos;t respond within 30 seconds, changes will be
            discarded automatically.
          </Typography>

          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color="warning"
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDiscard}
            color="inherit"
            startIcon={<DiscardIcon />}
            data-testid="recovery-discard"
          >
            Discard
          </Button>
          <Button
            onClick={handleRestore}
            variant="contained"
            color="primary"
            startIcon={<RestoreIcon />}
            data-testid="recovery-restore"
          >
            Restore Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

export default RecoveryModal;
