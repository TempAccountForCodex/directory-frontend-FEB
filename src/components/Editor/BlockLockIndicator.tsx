/**
 * BlockLockIndicator — Shows a yellow border and lock icon on blocks
 * being edited by another user.
 *
 * Wraps block content. When another user holds a lock on the block,
 * shows a yellow border, lock icon, and "Editing: {username}" label.
 *
 * Step 5.4.4
 */

import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import type { LockInfo } from "../../hooks/usePreviewSync";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BlockLockIndicatorProps {
  blockId: number;
  lock: LockInfo | null;
  currentUserId: number;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BlockLockIndicatorInner: React.FC<BlockLockIndicatorProps> = ({
  blockId,
  lock,
  currentUserId,
  children,
}) => {
  const isLockedByOther = useMemo(
    () => lock !== null && lock.userId !== currentUserId,
    [lock, currentUserId],
  );

  const lockedByUsername = useMemo(
    () =>
      isLockedByOther && lock ? (lock.username ?? `User ${lock.userId}`) : "",
    [isLockedByOther, lock],
  );

  if (!isLockedByOther) {
    return <>{children}</>;
  }

  return (
    <Box
      data-testid={`block-lock-wrapper-${blockId}`}
      sx={{
        position: "relative",
        border: 2,
        borderColor: "warning.main",
        borderRadius: 1,
        overflow: "visible",
      }}
    >
      <Box
        data-testid={`lock-indicator-${blockId}`}
        aria-label={`Block locked by ${lockedByUsername}`}
        sx={{
          position: "absolute",
          top: -12,
          right: 8,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: "warning.light",
          color: "warning.contrastText",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          zIndex: 1,
        }}
      >
        <LockIcon sx={{ fontSize: 14, color: "text.primary" }} />
        <Typography
          variant="caption"
          sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1 }}
        >
          Editing: {lockedByUsername}
        </Typography>
      </Box>
      <Box sx={{ opacity: 0.7, pointerEvents: "none" }}>{children}</Box>
    </Box>
  );
};

export const BlockLockIndicator = React.memo(BlockLockIndicatorInner);

export default BlockLockIndicator;
