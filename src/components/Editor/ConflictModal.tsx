/**
 * ConflictModal — Conflict resolution dialog for concurrent edits (Step 5.2.4)
 *
 * Shows when autosave detects the server has a newer version than local.
 * User can:
 * - Keep yours: proceed saving the local version
 * - Use theirs: discard local changes, use server version
 * - View diff: see changed fields side-by-side
 *
 * Security:
 * - Diff values rendered as text nodes — NO dangerouslySetInnerHTML
 * - All user content escaped by React by default
 *
 * Accessibility:
 * - MUI Dialog provides focus trap + aria-labelledby
 * - Action buttons have aria-labels
 *
 * Performance: React.memo prevents re-renders when parent updates unrelated state
 */

import React, { useState, useCallback, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CompareArrows as CompareIcon,
} from "@mui/icons-material";

// ---------------------------------------------------------------------------
// Types (exported for use by useAutosave and tests)
// ---------------------------------------------------------------------------

export interface ConflictData {
  serverData: Record<string, unknown>;
  serverUpdatedAt: string;
  localData: Record<string, unknown>;
}

export type ConflictResolution = "keep-local" | "use-server";

export interface ConflictModalProps {
  open: boolean;
  conflictData: ConflictData;
  onResolve: (resolution: ConflictResolution) => void;
  /** Error message when server version could not be loaded */
  fetchError?: string;
}

// ---------------------------------------------------------------------------
// DiffRow — single field comparison (no dangerouslySetInnerHTML)
// ---------------------------------------------------------------------------

interface DiffRowProps {
  field: string;
  localValue: unknown;
  serverValue: unknown;
}

const DiffRow: React.FC<DiffRowProps> = ({
  field,
  localValue,
  serverValue,
}) => {
  const localStr =
    localValue === null || localValue === undefined
      ? "(empty)"
      : typeof localValue === "object"
        ? JSON.stringify(localValue, null, 2)
        : String(localValue);

  const serverStr =
    serverValue === null || serverValue === undefined
      ? "(empty)"
      : typeof serverValue === "object"
        ? JSON.stringify(serverValue, null, 2)
        : String(serverValue);

  const isDifferent = localStr !== serverStr;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
        mb: 1.5,
        p: 1,
        borderRadius: 1,
        bgcolor: isDifferent ? "action.hover" : "transparent",
        border: isDifferent ? "1px solid" : "1px solid transparent",
        borderColor: isDifferent ? "warning.light" : "transparent",
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
        >
          {field}
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            color: isDifferent ? "success.main" : "text.primary",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            m: 0,
          }}
        >
          {/* React renders as text node — NO XSS possible */}
          {localStr}
        </Typography>
      </Box>
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
        >
          {field}
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            color: isDifferent ? "error.main" : "text.primary",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            m: 0,
          }}
        >
          {/* React renders as text node — NO XSS possible */}
          {serverStr}
        </Typography>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// ConflictModal
// ---------------------------------------------------------------------------

const ConflictModal: React.FC<ConflictModalProps> = memo(
  ({ open, conflictData, onResolve, fetchError }) => {
    const [showDiff, setShowDiff] = useState(false);

    const handleKeepLocal = useCallback(() => {
      onResolve("keep-local");
    }, [onResolve]);

    const handleUseServer = useCallback(() => {
      onResolve("use-server");
    }, [onResolve]);

    const handleToggleDiff = useCallback(() => {
      setShowDiff((prev) => !prev);
    }, []);

    // Collect all field keys from both versions
    const allFields = Array.from(
      new Set([
        ...Object.keys(conflictData.localData),
        ...Object.keys(conflictData.serverData),
      ]),
    );

    const dialogTitleId = "conflict-modal-title";

    return (
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
        aria-labelledby={dialogTitleId}
        // Prevent clicking outside to dismiss — user MUST choose
        disableEscapeKeyDown
      >
        <DialogTitle
          id={dialogTitleId}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pb: 1,
          }}
        >
          <WarningIcon sx={{ color: "warning.main", fontSize: 24 }} />
          <Typography variant="h6" component="span">
            Editing Conflict
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {/* Warning message */}
          <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
            Someone else edited this content while you were working. Your
            changes haven&apos;t been saved yet. Choose how to resolve this
            conflict:
          </Typography>

          {/* Fetch error alert */}
          {fetchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fetchError}
            </Alert>
          )}

          {/* Diff panel */}
          {showDiff && (
            <Box
              sx={{
                mt: 1,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {/* Column headers */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                  p: 1.5,
                  bgcolor: "action.hover",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: "success.main", fontWeight: 700 }}
                >
                  Your version
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "error.main", fontWeight: 700 }}
                >
                  Server version
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ p: 1.5 }}>
                {allFields.map((field) => (
                  <DiffRow
                    key={field}
                    field={field}
                    localValue={conflictData.localData[field]}
                    serverValue={conflictData.serverData[field]}
                  />
                ))}
                {allFields.length === 0 && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No field differences to display.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<CompareIcon />}
            onClick={handleToggleDiff}
            aria-label={showDiff ? "Hide diff" : "View diff"}
            sx={{
              mr: "auto",
              textTransform: "none",
            }}
          >
            {showDiff ? "Hide diff" : "View diff"}
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleUseServer}
              aria-label="Use theirs — discard your changes and use the server version"
              sx={{ textTransform: "none" }}
            >
              Use theirs
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleKeepLocal}
              aria-label="Keep yours — save your version and overwrite the server version"
              sx={{ textTransform: "none" }}
            >
              Keep yours
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    );
  },
);

ConflictModal.displayName = "ConflictModal";

export default ConflictModal;
