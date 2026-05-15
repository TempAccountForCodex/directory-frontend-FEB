/**
 * useConflictPrevention — Hook for preventing editing conflicts
 *
 * Checks lock state before allowing local edits. If another user holds
 * the lock on a block, returns canEdit=false with lockedBy info.
 * On WebSocket disconnect, sets collaborationUnavailable=true but
 * does NOT block local editing.
 *
 * Step 5.4.5
 */

import { useMemo } from "react";
import type { LockInfo } from "./usePreviewSync";
import type { WebSocketConnectionState } from "../types/websocket";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseConflictPreventionReturn {
  /** Whether this block is locked by another user */
  isLocked: boolean;
  /** Username of the user holding the lock, or null */
  lockedBy: string | null;
  /** Whether the current user can edit this block */
  canEdit: boolean;
  /** Whether collaborative features are unavailable (WebSocket disconnected) */
  collaborationUnavailable: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConflictPrevention(
  blockId: number,
  currentUserId: number,
  locks: Map<number, LockInfo>,
  connectionState: WebSocketConnectionState = "disconnected",
): UseConflictPreventionReturn {
  return useMemo(() => {
    const lock = locks.get(blockId);
    const isLockedByOther = lock !== undefined && lock.userId !== currentUserId;
    const collaborationUnavailable =
      connectionState === "disconnected" || connectionState === "error";

    return {
      isLocked: isLockedByOther,
      lockedBy: isLockedByOther
        ? (lock.username ?? `User ${lock.userId}`)
        : null,
      // Allow local editing even when disconnected — only block when another user has the lock
      canEdit: !isLockedByOther,
      collaborationUnavailable,
    };
  }, [blockId, currentUserId, locks, connectionState]);
}

export default useConflictPrevention;
