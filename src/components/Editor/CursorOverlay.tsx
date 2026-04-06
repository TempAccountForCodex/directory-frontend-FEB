/**
 * CursorOverlay — Renders colored cursor indicators for remote collaborators
 *
 * Shows a small colored dot at each remote user's cursor position.
 * Cursors fade out after 5 seconds of inactivity (opacity transition).
 * Each user gets a deterministic color based on userId.
 * Step 7.5.4: Enhanced with role badge display.
 *
 * Step 5.4.3 + 7.5.4
 */

import React, { useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import type { CursorPosition } from "../../hooks/usePreviewSync";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FADE_TIMEOUT_MS = 5000;
const DOT_SIZE = 12;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CursorData extends CursorPosition {
  /** Role of the user (sourced from server metadata) — Step 7.5.4 */
  role?: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CursorOverlayProps {
  /** Cursor positions map. May include role for enhanced display. */
  cursorPositions: Map<number, CursorPosition>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CursorOverlayInner: React.FC<CursorOverlayProps> = ({
  cursorPositions,
}) => {
  const entries = useMemo(
    () => Array.from(cursorPositions.entries()),
    [cursorPositions],
  );

  const now = Date.now();

  return (
    <Box
      data-testid="cursor-overlay"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {entries.map(([userId, cursor]) => {
        const cursorData = cursor as CursorData;
        const elapsed = now - cursor.lastSeen;
        const isStale = elapsed > FADE_TIMEOUT_MS;
        const opacity = isStale ? 0 : 1;
        const displayName = cursor.username ?? `User ${userId}`;
        const roleLabel = cursorData.role ? ` (${cursorData.role})` : "";
        const tooltipTitle = `${displayName}${roleLabel}`;

        return (
          <Tooltip key={userId} title={tooltipTitle} placement="top" arrow>
            <Box
              data-testid={`cursor-${userId}`}
              aria-label={`Cursor: ${displayName}${roleLabel}`}
              sx={{
                position: "absolute",
                left: cursor.x,
                top: cursor.y,
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: "50%",
                backgroundColor: cursor.color ?? "primary.main",
                opacity,
                transition: "opacity 0.5s ease, left 0.1s ease, top 0.1s ease",
                pointerEvents: "auto",
                cursor: "default",
                boxShadow: 1,
                "&::after": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: cursor.color ?? "primary.main",
                  opacity: 0.3,
                },
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};

export const CursorOverlay = React.memo(CursorOverlayInner);

export default CursorOverlay;
