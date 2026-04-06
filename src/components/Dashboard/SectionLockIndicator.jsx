/**
 * SectionLockIndicator — Step 7.11.12
 *
 * Visual indicator showing lock status for a specific website section.
 * Renders nothing when the section is unlocked (transparent).
 *
 * Lock types & colors:
 *   EDIT_LOCK (other user) → blue lock icon
 *   EDIT_LOCK (self)       → green lock icon
 *   FREEZE_LOCK            → red lock icon with badge
 *   APPROVAL_LOCK          → yellow lock icon
 *
 * Props:
 *   websiteId  — number|string
 *   sectionId  — number|string
 *   userId     — number (current user ID)
 *   userRole   — string
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { Lock as LockIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ---------------------------------------------------------------------------
// Lock type → visual config
// ---------------------------------------------------------------------------

const LOCK_CONFIG = {
  FREEZE_LOCK: {
    color: '#ef4444', // red
    badgeColor: 'error',
    showBadge: true,
  },
  APPROVAL_LOCK: {
    color: '#f59e0b', // yellow/amber
    badgeColor: 'warning',
    showBadge: false,
  },
  EDIT_LOCK: {
    color: '#3b82f6', // blue
    badgeColor: 'info',
    showBadge: false,
  },
  SELF_LOCK: {
    color: '#22c55e', // green
    badgeColor: 'success',
    showBadge: false,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SectionLockIndicator = React.memo(function SectionLockIndicator({
  websiteId,
  sectionId,
  userId,
  userRole: _userRole,
}) {
  const [lockData, setLockData] = useState(null);
  const [fetching, setFetching] = useState(false);

  // ---- Fetch lock data -----------------------------------------------------

  const fetchLock = useCallback(async () => {
    if (!websiteId || !sectionId) return;
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `${API_URL}/websites/${websiteId}/sections/${sectionId}/lock`,
        { headers }
      );
      setLockData(res.data?.data ?? res.data ?? null);
    } catch {
      // 404 = no lock, that's fine
      setLockData(null);
    } finally {
      setFetching(false);
    }
  }, [websiteId, sectionId]);

  // ---- Initial load --------------------------------------------------------

  useEffect(() => {
    fetchLock();
  }, [fetchLock]);

  // ---- WebSocket subscription for real-time updates -----------------------

  useEffect(() => {
    const handleWsMessage = (event) => {
      let msg;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!msg?.type) return;
      if (msg.type === 'SECTION_LOCKED' || msg.type === 'SECTION_UNLOCKED') {
        const msgSectionId = msg.data?.sectionId ?? msg.sectionId;
        if (String(msgSectionId) === String(sectionId)) {
          if (msg.type === 'SECTION_UNLOCKED') {
            setLockData(null);
          } else {
            setLockData(msg.data ?? null);
          }
        }
      }
    };

    window.addEventListener('ws:message', handleWsMessage);
    return () => window.removeEventListener('ws:message', handleWsMessage);
  }, [sectionId]);

  // ---- Derived values -------------------------------------------------------

  const lockInfo = useMemo(() => {
    if (!lockData) return null;

    const lockType = lockData.lockType ?? lockData.type ?? 'EDIT_LOCK';
    const holderName = lockData.lockedBy?.name ?? lockData.lockedBy?.email ?? lockData.userName ?? 'Another user';
    const holderId = lockData.lockedBy?.id ?? lockData.userId ?? null;
    const isSelf = holderId !== null && Number(holderId) === Number(userId);
    const reason = lockData.reason ?? lockData.lockReason ?? null;

    let effectiveType = lockType;
    if (lockType === 'EDIT_LOCK' && isSelf) {
      effectiveType = 'SELF_LOCK';
    }

    let tooltipText = '';
    if (effectiveType === 'SELF_LOCK') {
      tooltipText = 'You are editing this section';
    } else if (lockType === 'FREEZE_LOCK') {
      tooltipText = `Section frozen by ${holderName}${reason ? ` — ${reason}` : ''}`;
    } else if (lockType === 'APPROVAL_LOCK') {
      tooltipText = 'Locked: pending approval review';
    } else {
      tooltipText = `Editing: ${holderName}`;
    }

    return { effectiveType, tooltipText, holderName };
  }, [lockData, userId]);

  // ---- Render ---------------------------------------------------------------

  if (fetching && !lockData) {
    return <CircularProgress size={14} sx={{ color: 'text.secondary' }} />;
  }

  if (!lockInfo) {
    return null;
  }

  const config = LOCK_CONFIG[lockInfo.effectiveType] ?? LOCK_CONFIG.EDIT_LOCK;

  const lockIcon = (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center' }}
      data-testid={`section-lock-indicator-${sectionId}`}
      data-lock-type={lockInfo.effectiveType}
    >
      {config.showBadge ? (
        <Badge color={config.badgeColor} variant="dot" overlap="circular">
          <LockIcon size={16} color={config.color} aria-hidden="true" />
        </Badge>
      ) : (
        <LockIcon size={16} color={config.color} aria-hidden="true" />
      )}
    </Box>
  );

  return (
    <Tooltip title={lockInfo.tooltipText} arrow placement="top">
      <IconButton
        size="small"
        disableRipple
        aria-label={lockInfo.tooltipText}
        sx={{ p: 0.25, cursor: 'default' }}
      >
        {lockIcon}
      </IconButton>
    </Tooltip>
  );
});

export default SectionLockIndicator;
