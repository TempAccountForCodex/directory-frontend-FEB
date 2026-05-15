/**
 * UndoRedoToolbar — Undo and Redo icon buttons for the website editor (Step 9.2.4)
 *
 * Props:
 * - canUndo / canRedo: boolean flags controlling disabled state
 * - onUndo / onRedo: click handlers
 * - undoDescription / redoDescription: action labels shown in tooltip
 * - isMac: controls whether tooltip shows Cmd or Ctrl modifier
 *
 * Design:
 * - MUI IconButton with Undo / Redo icons from @mui/icons-material
 * - Disabled state: grey, not clickable
 * - Tooltip shows: shortcut key + action description
 * - Wrapped in React.memo to avoid unnecessary re-renders
 * - useCallback for all handlers (PAT-003 compliance)
 */

import React, { memo, useCallback } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Undo as UndoIcon, Redo as RedoIcon } from "@mui/icons-material";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UndoRedoToolbarProps {
  /** Whether undo action is available */
  canUndo: boolean;
  /** Whether redo action is available */
  canRedo: boolean;
  /** Callback fired when undo button is clicked */
  onUndo: () => void;
  /** Callback fired when redo button is clicked */
  onRedo: () => void;
  /** Human-readable description of the action that will be undone */
  undoDescription: string;
  /** Human-readable description of the action that will be redone */
  redoDescription: string;
  /** True on macOS — controls whether to show Cmd or Ctrl in tooltip */
  isMac: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = memo(
  ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    undoDescription,
    redoDescription,
    isMac,
  }) => {
    const modifier = isMac ? "Cmd" : "Ctrl";

    const undoLabel = undoDescription
      ? `Undo: ${undoDescription} (${modifier}+Z)`
      : `Undo (${modifier}+Z)`;

    const redoLabel = redoDescription
      ? `Redo: ${redoDescription} (${modifier}+Shift+Z)`
      : `Redo (${modifier}+Shift+Z)`;

    const handleUndo = useCallback(() => {
      if (canUndo) {
        onUndo();
      }
    }, [canUndo, onUndo]);

    const handleRedo = useCallback(() => {
      if (canRedo) {
        onRedo();
      }
    }, [canRedo, onRedo]);

    return (
      <Box
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
        data-testid="undo-redo-toolbar"
      >
        <Tooltip title={undoLabel} arrow>
          {/* Tooltip needs a non-disabled child to show — wrap in span when disabled */}
          <span>
            <IconButton
              size="small"
              onClick={handleUndo}
              disabled={!canUndo}
              aria-label={undoLabel}
              sx={{
                color: canUndo ? "text.secondary" : "action.disabled",
                transition: "color 0.2s ease",
                "&:hover": {
                  color: canUndo ? "primary.main" : "action.disabled",
                  bgcolor: canUndo ? "action.hover" : "transparent",
                },
              }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={redoLabel} arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleRedo}
              disabled={!canRedo}
              aria-label={redoLabel}
              sx={{
                color: canRedo ? "text.secondary" : "action.disabled",
                transition: "color 0.2s ease",
                "&:hover": {
                  color: canRedo ? "primary.main" : "action.disabled",
                  bgcolor: canRedo ? "action.hover" : "transparent",
                },
              }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  },
);

UndoRedoToolbar.displayName = "UndoRedoToolbar";

export default UndoRedoToolbar;
