/**
 * LockIndicator — Shows lock status on blocks with role-aware UI
 *
 * For VIEWER role: Shows gray overlay with "View Only" tooltip
 * For locked blocks: Shows lock chip with holder name and role badge
 * For own lock: No indicator (you hold the lock)
 *
 * Step 7.5.3
 *
 * PERFORMANCE: Memoized with React.memo
 * SECURITY: Role is sourced from server metadata
 */

import React, { useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";

// ---------------------------------------------------------------------------
// Role badge colors
// ---------------------------------------------------------------------------

const ROLE_COLORS: Record<string, string> = {
  OWNER: "#f59e0b",
  ADMIN: "#3b82f6",
  EDITOR: "#22c55e",
  VIEWER: "#9ca3af",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LockRecord {
  userId: number;
  userName: string;
  role: string;
  blockId: number;
  acquiredAt: string;
}

interface LockIndicatorProps {
  blockId: number;
  lock: LockRecord | null;
  currentUserId: number;
  currentUserRole: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LockIndicatorInner: React.FC<LockIndicatorProps> = ({
  blockId,
  lock,
  currentUserId,
  currentUserRole,
}) => {
  const isLockedByOther = useMemo(
    () => lock !== null && lock.userId !== currentUserId,
    [lock, currentUserId],
  );

  const isViewer = currentUserRole === "VIEWER";

  // VIEWER overlay (no lock needed — always read-only)
  if (isViewer && !isLockedByOther) {
    return (
      <Tooltip title="You have view-only access" placement="top" arrow>
        <Box
          data-testid={`viewer-overlay-${blockId}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.25,
            bgcolor: "action.disabledBackground",
            borderRadius: 1,
            cursor: "default",
          }}
        >
          <VisibilityIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontWeight: 500 }}
          >
            View Only
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  // Locked by another user
  if (isLockedByOther && lock) {
    const roleColor = ROLE_COLORS[lock.role] || ROLE_COLORS.VIEWER;

    return (
      <Box
        data-testid={`lock-indicator-${blockId}`}
        aria-label={`Block locked by ${lock.userName} (${lock.role})`}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.25,
          bgcolor: "warning.light",
          borderRadius: 1,
          cursor: "default",
        }}
      >
        <LockIcon sx={{ fontSize: 12, color: "warning.dark" }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 500, color: "warning.dark" }}
        >
          {lock.userName}
        </Typography>
        {/* Role badge */}
        <Box
          data-testid={`lock-role-badge-${blockId}`}
          sx={{
            px: "4px",
            py: "1px",
            bgcolor: roleColor,
            borderRadius: "3px",
          }}
        >
          <Typography
            sx={{
              fontSize: "8px",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {lock.role}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Viewer overlay when block is locked by other AND current user is VIEWER
  if (isViewer && isLockedByOther && lock) {
    return (
      <Tooltip title="Block is locked for editing" placement="top" arrow>
        <Box
          data-testid={`viewer-overlay-${blockId}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.25,
            bgcolor: "action.disabledBackground",
            borderRadius: 1,
          }}
        >
          <VisibilityIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled">
            View Only
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return null;
};

export const LockIndicator = React.memo(LockIndicatorInner);

export default LockIndicator;
