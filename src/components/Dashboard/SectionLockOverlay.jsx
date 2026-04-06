/**
 * SectionLockOverlay — Step 7.11.12
 *
 * Semi-transparent overlay that covers a section when it is FREEZE_LOCKED or
 * APPROVAL_LOCKED, preventing interaction. Shows lock reason in centered text.
 *
 * Props:
 *   open       — boolean (whether to show the overlay)
 *   lockType   — 'FREEZE_LOCK'|'APPROVAL_LOCK'|'EDIT_LOCK' (controls color)
 *   reason     — string|null (text shown in center of overlay)
 *   lockedBy   — string|null (name of lock holder)
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Lock as LockIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Color config per lock type
// ---------------------------------------------------------------------------

const OVERLAY_CONFIG = {
  FREEZE_LOCK: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    iconColor: '#ef4444',
    defaultReason: 'Section is frozen',
  },
  APPROVAL_LOCK: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    iconColor: '#f59e0b',
    defaultReason: 'Locked: pending approval review',
  },
  EDIT_LOCK: {
    bg: 'rgba(59, 130, 246, 0.06)',
    border: '1px solid rgba(59, 130, 246, 0.20)',
    iconColor: '#3b82f6',
    defaultReason: 'Being edited by another user',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SectionLockOverlay = React.memo(function SectionLockOverlay({
  open,
  lockType = 'FREEZE_LOCK',
  reason = null,
  lockedBy = null,
}) {
  const config = useMemo(
    () => OVERLAY_CONFIG[lockType] ?? OVERLAY_CONFIG.FREEZE_LOCK,
    [lockType]
  );

  const displayReason = useMemo(() => reason || config.defaultReason, [reason, config]);

  const displayText = useMemo(() => {
    if (lockedBy) {
      return `${displayReason} — ${lockedBy}`;
    }
    return displayReason;
  }, [displayReason, lockedBy]);

  if (!open) return null;

  return (
    <Box
      component="div"
      data-testid="section-lock-overlay"
      role="status"
      aria-label={displayText}
      aria-live="polite"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: config.bg,
        border: config.border,
        borderRadius: 1,
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        cursor: 'not-allowed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        pointerEvents: 'all',
      }}
    >
      <LockIcon size={24} color={config.iconColor} aria-hidden="true" />
      <Typography
        variant="body2"
        sx={{
          color: config.iconColor,
          textAlign: 'center',
          fontWeight: 500,
          px: 2,
          maxWidth: 280,
          userSelect: 'none',
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
});

export default SectionLockOverlay;
