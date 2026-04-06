/**
 * SaveStatus — Visual indicator for autosave status (Step 5.2.3)
 *
 * States:
 * - idle: nothing shown
 * - saving: CircularProgress spinner + 'Saving...' text
 * - saved: CheckCircle icon + 'All changes saved', auto-hides after 3s
 * - error: Warning icon + 'Failed to save' + Retry button
 *
 * Accessibility: aria-live='polite' for screen reader announcements
 * Performance: React.memo prevents unnecessary re-renders
 * Theme: uses MUI sx theme tokens (no hardcoded hex values)
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Tooltip,
} from "@mui/material";
import {
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
} from "@mui/icons-material";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SaveStatusType = "idle" | "saving" | "saved" | "error";

export interface SaveStatusProps {
  status: SaveStatusType;
  onRetry?: () => void;
}

// ---------------------------------------------------------------------------
// Auto-hide delay for 'saved' state
// ---------------------------------------------------------------------------

const AUTO_HIDE_DELAY = 3000;

// ---------------------------------------------------------------------------
// SaveStatus component
// ---------------------------------------------------------------------------

const SaveStatus: React.FC<SaveStatusProps> = memo(({ status, onRetry }) => {
  // Track whether to show the saved state (it auto-hides after 3s)
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === "saved") {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, AUTO_HIDE_DELAY);
      return () => clearTimeout(timer);
    } else {
      setShowSaved(false);
    }
  }, [status]);

  const handleRetry = useCallback(() => {
    if (onRetry) onRetry();
  }, [onRetry]);

  // Determine what to render
  const isSaving = status === "saving";
  const isSaved = status === "saved" && showSaved;
  const isError = status === "error";

  // Nothing to show in idle or after saved auto-hides
  const isVisible = isSaving || isSaved || isError;

  return (
    <Box
      aria-live="polite"
      aria-atomic="true"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        minHeight: 32,
      }}
    >
      {isSaving && (
        <>
          <CloudSyncIcon
            sx={{
              fontSize: 18,
              color: "text.secondary",
            }}
          />
          <CircularProgress
            size={14}
            thickness={5}
            sx={{ color: "text.secondary" }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Saving...
          </Typography>
        </>
      )}

      {isSaved && (
        <>
          <CloudDoneIcon
            sx={{
              fontSize: 18,
              color: "success.main",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "success.main",
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            All changes saved
          </Typography>
        </>
      )}

      {isError && (
        <>
          <CloudOffIcon
            sx={{
              fontSize: 18,
              color: "error.main",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "error.main",
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Failed to save
          </Typography>
          {onRetry && (
            <Tooltip title="Retry saving your changes">
              <Button
                size="small"
                variant="text"
                onClick={handleRetry}
                aria-label="Retry saving"
                sx={{
                  minWidth: "auto",
                  p: "2px 6px",
                  fontSize: "0.7rem",
                  color: "error.main",
                  textTransform: "none",
                  lineHeight: 1,
                  "&:hover": {
                    bgcolor: "error.light",
                    color: "error.contrastText",
                  },
                }}
              >
                Retry
              </Button>
            </Tooltip>
          )}
        </>
      )}

      {/* Hidden span for idle/post-save visibility — keeps aria-live region stable */}
      {!isVisible && (
        <Box component="span" sx={{ display: "none" }} aria-hidden="true" />
      )}
    </Box>
  );
});

SaveStatus.displayName = "SaveStatus";

export default SaveStatus;
