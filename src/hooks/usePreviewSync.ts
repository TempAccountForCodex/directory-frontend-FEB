/**
 * usePreviewSync — WebSocket + Preview + Autosave integration hook
 *
 * Wires together useWebSocket (5.3), PreviewContext (5.1) to provide
 * real-time collaborative editing. Handles:
 * - Room join/leave lifecycle for page rooms
 * - Incoming CONTENT_UPDATE → debounced PreviewContext update
 * - Outgoing broadcast of local changes (throttled)
 * - Cursor position tracking for remote collaborators
 * - Block lock tracking (LOCK_ACQUIRE/LOCK_RELEASE)
 * - Active user list (ROOM_STATE, USER_JOINED, USER_LEFT)
 * - Stale lock auto-release after 30s
 *
 * Step 5.4.1–5.4.4
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useWebSocket } from "./useWebSocket";
import { usePreview } from "../context/PreviewContext";
import type { WebSocketMessage, RoomStateMember } from "../types/websocket";
import {
  isContentUpdate,
  isCursorMove,
  isLockMessage,
  isRoomState,
} from "../types/websocket";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 100;
const THROTTLE_MS = 100;
const MAX_CURSORS = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CursorPosition {
  blockId: number;
  x: number;
  y: number;
  username?: string;
  color?: string;
  lastSeen: number;
}

export interface LockInfo {
  userId: number;
  blockId: number;
  fieldPath?: string;
  username?: string;
  /** Role of the lock holder — sourced from server metadata (Step 7.5.3) */
  role?: string;
  acquiredAt: number;
}

export interface UsePreviewSyncReturn {
  isConnected: boolean;
  activeUsers: RoomStateMember[];
  cursorPositions: Map<number, CursorPosition>;
  locks: Map<number, LockInfo>;
  broadcastChange: (blockId: number, fieldPath: string, value: unknown) => void;
  broadcastCursor: (blockId: number, x: number, y: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deterministic color from userId — maps to a palette of 10 colors */
const CURSOR_PALETTE = [
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#009688",
  "#4caf50",
  "#ff9800",
  "#ff5722",
  "#795548",
];

export function getUserColor(userId: number): string {
  return CURSOR_PALETTE[Math.abs(userId) % CURSOR_PALETTE.length];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePreviewSync(
  pageId: string,
  currentUserId: number,
  websiteId?: number | string,
): UsePreviewSyncReturn {
  const roomId = `page:${pageId}`;

  // ---- State ----------------------------------------------------------------
  const [activeUsers, setActiveUsers] = useState<RoomStateMember[]>([]);
  const [cursorPositions, setCursorPositions] = useState<
    Map<number, CursorPosition>
  >(() => new Map());
  const [locks, setLocks] = useState<Map<number, LockInfo>>(() => new Map());

  // ---- Refs -----------------------------------------------------------------
  const mountedRef = useRef(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingUpdateRef = useRef<WebSocketMessage | null>(null);
  const sentTimestampsRef = useRef<Set<string>>(new Set());
  const lastBroadcastRef = useRef<number>(0);
  const lastCursorBroadcastRef = useRef<number>(0);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  // ---- Preview context ------------------------------------------------------
  const { currentPageContent, updatePreviewContent } = usePreview();
  const pageContentRef = useRef(currentPageContent);
  pageContentRef.current = currentPageContent;

  // ---- Message handler ------------------------------------------------------
  const onMessage = useCallback(
    (msg: WebSocketMessage) => {
      if (!mountedRef.current) return;

      // ---- CONTENT_UPDATE ---------------------------------------------------
      if (isContentUpdate(msg)) {
        // Skip self
        if (msg.userId === currentUserId) return;

        // Client-side dedup: skip if we sent this timestamp.
        // The client stores the timestamp inside data.timestamp, but the server
        // overwrites the top-level msg.timestamp with its own clock. So we must
        // read from msg.data.timestamp (the original client-generated value).
        const msgDataTs = (msg.data as Record<string, unknown>)?.timestamp as
          | string
          | undefined;
        if (msgDataTs && sentTimestampsRef.current.has(msgDataTs)) return;

        // Debounce incoming updates
        pendingUpdateRef.current = msg;

        if (debounceTimerRef.current !== null) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          const pending = pendingUpdateRef.current;
          if (!pending || !isContentUpdate(pending)) return;

          const content = pageContentRef.current;
          if (!content) return;

          const { blockId, fieldPath, value } = pending.data;

          // Apply update to current page content
          const updatedBlocks = content.blocks.map((block) => {
            if (String(block.id) === String(blockId)) {
              // Apply fieldPath update (e.g. "content.title")
              const parts = fieldPath.split(".");
              const updatedContent = { ...block.content };
              let target: Record<string, unknown> = updatedContent;
              for (let i = 0; i < parts.length - 1; i++) {
                const key = parts[i];
                target[key] = { ...(target[key] as Record<string, unknown>) };
                target = target[key] as Record<string, unknown>;
              }
              target[parts[parts.length - 1]] = value;
              return { ...block, content: updatedContent };
            }
            return block;
          });

          updatePreviewContent({ ...content, blocks: updatedBlocks });
          pendingUpdateRef.current = null;
          debounceTimerRef.current = null;
        }, DEBOUNCE_MS);

        return;
      }

      // ---- CURSOR_MOVE ------------------------------------------------------
      if (isCursorMove(msg)) {
        if (msg.userId === currentUserId) return;
        const userId = msg.userId!;

        setCursorPositions((prev) => {
          // Performance guard: cap at MAX_CURSORS
          if (prev.size >= MAX_CURSORS && !prev.has(userId)) {
            // Remove oldest entry
            const newMap = new Map(prev);
            let oldestKey: number | null = null;
            let oldestTime = Infinity;
            for (const [k, v] of newMap) {
              if (v.lastSeen < oldestTime) {
                oldestTime = v.lastSeen;
                oldestKey = k;
              }
            }
            if (oldestKey !== null) newMap.delete(oldestKey);
            newMap.set(userId, {
              blockId: msg.data.blockId,
              x: msg.data.x,
              y: msg.data.y,
              color: getUserColor(userId),
              lastSeen: Date.now(),
            });
            return newMap;
          }

          const newMap = new Map(prev);
          newMap.set(userId, {
            blockId: msg.data.blockId,
            x: msg.data.x,
            y: msg.data.y,
            color: getUserColor(userId),
            lastSeen: Date.now(),
          });
          return newMap;
        });

        return;
      }

      // ---- LOCK_ACQUIRE / LOCK_RELEASE --------------------------------------
      if (isLockMessage(msg)) {
        const blockId = msg.data.blockId;

        if (msg.type === "LOCK_ACQUIRE" || msg.type === "LOCK_ACQUIRED") {
          const userId = msg.userId!;

          setLocks((prev) => {
            const newMap = new Map(prev);
            newMap.set(blockId, {
              userId,
              blockId,
              fieldPath: msg.data.fieldPath,
              username: msg.data.userName || msg.data.username,
              role: msg.data.role,
              acquiredAt: Date.now(),
            });
            return newMap;
          });
        } else {
          // LOCK_RELEASE / LOCK_RELEASED — remove lock from client state
          setLocks((prev) => {
            const newMap = new Map(prev);
            newMap.delete(blockId);
            return newMap;
          });
        }

        return;
      }

      // ---- ROOM_STATE -------------------------------------------------------
      if (isRoomState(msg)) {
        setActiveUsers(msg.data.members);
        return;
      }

      // ---- USER_JOINED (Step 5.8: includes name + avatar metadata) ----------
      if (msg.type === "USER_JOINED" && msg.userId) {
        const data = msg.data as Record<string, unknown> | undefined;
        const username = (data?.username as string) || `User ${msg.userId}`;
        const avatar = (data?.avatar as string) || null;
        setActiveUsers((prev) => {
          if (prev.some((u) => u.userId === msg.userId)) return prev;
          return [...prev, { userId: msg.userId!, username, avatar }];
        });
        return;
      }

      // ---- USER_LEFT --------------------------------------------------------
      if (msg.type === "USER_LEFT" && msg.userId) {
        setActiveUsers((prev) => prev.filter((u) => u.userId !== msg.userId));
        setCursorPositions((prev) => {
          if (!prev.has(msg.userId!)) return prev;
          const newMap = new Map(prev);
          newMap.delete(msg.userId!);
          return newMap;
        });

        // Clean up locks held by departed user
        setLocks((prev) => {
          let changed = false;
          const newMap = new Map(prev);
          for (const [blockId, lock] of newMap) {
            if (lock.userId === msg.userId) {
              newMap.delete(blockId);
              changed = true;
            }
          }
          return changed ? newMap : prev;
        });

        return;
      }
    },
    [currentUserId, updatePreviewContent],
  );

  // ---- WebSocket connection -------------------------------------------------
  const { connectionState, send, joinRoom, leaveRoom } = useWebSocket({
    onMessage,
    websiteId,
  });

  const isConnected = connectionState === "connected";

  // ---- Room lifecycle -------------------------------------------------------
  useEffect(() => {
    if (!pageId) return;

    joinRoom(roomId);

    return () => {
      leaveRoom(roomId);
    };
  }, [pageId, roomId, joinRoom, leaveRoom]);

  // ---- Broadcast change (throttled) -----------------------------------------
  const broadcastChange = useCallback(
    (blockId: number, fieldPath: string, value: unknown) => {
      if (connectionState !== "connected") return;

      const now = Date.now();
      const elapsed = now - lastBroadcastRef.current;
      const ts = new Date().toISOString();

      const doSend = () => {
        sentTimestampsRef.current.add(ts);
        // Limit dedup set size
        if (sentTimestampsRef.current.size > 100) {
          const iter = sentTimestampsRef.current.values();
          sentTimestampsRef.current.delete(iter.next().value as string);
        }

        send({
          type: "CONTENT_UPDATE",
          roomId: roomIdRef.current,
          data: { blockId, fieldPath, value, timestamp: ts },
        });

        lastBroadcastRef.current = Date.now();
      };

      if (elapsed >= THROTTLE_MS) {
        doSend();
      } else {
        if (throttleTimerRef.current !== null) {
          clearTimeout(throttleTimerRef.current);
        }
        throttleTimerRef.current = setTimeout(() => {
          if (mountedRef.current) doSend();
          throttleTimerRef.current = null;
        }, THROTTLE_MS - elapsed);
      }
    },
    [connectionState, send],
  );

  // ---- Broadcast cursor (throttled) -----------------------------------------
  const broadcastCursor = useCallback(
    (blockId: number, x: number, y: number) => {
      if (connectionState !== "connected") return;

      const now = Date.now();
      const elapsed = now - lastCursorBroadcastRef.current;

      const doSend = () => {
        send({
          type: "CURSOR_MOVE",
          roomId: roomIdRef.current,
          data: { blockId, x, y },
        });
        lastCursorBroadcastRef.current = Date.now();
      };

      if (elapsed >= THROTTLE_MS) {
        doSend();
      } else {
        if (cursorThrottleTimerRef.current !== null) {
          clearTimeout(cursorThrottleTimerRef.current);
        }
        cursorThrottleTimerRef.current = setTimeout(() => {
          if (mountedRef.current) doSend();
          cursorThrottleTimerRef.current = null;
        }, THROTTLE_MS - elapsed);
      }
    },
    [connectionState, send],
  );

  // ---- Cleanup on unmount ---------------------------------------------------
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current !== null)
        clearTimeout(debounceTimerRef.current);
      if (throttleTimerRef.current !== null)
        clearTimeout(throttleTimerRef.current);
      if (cursorThrottleTimerRef.current !== null)
        clearTimeout(cursorThrottleTimerRef.current);
    };
  }, []);

  // ---- Memoized return value ------------------------------------------------
  return useMemo(
    () => ({
      isConnected,
      activeUsers,
      cursorPositions,
      locks,
      broadcastChange,
      broadcastCursor,
    }),
    [
      isConnected,
      activeUsers,
      cursorPositions,
      locks,
      broadcastChange,
      broadcastCursor,
    ],
  );
}

export default usePreviewSync;
