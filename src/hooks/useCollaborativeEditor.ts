/**
 * useCollaborativeEditor — Integrates presence, locks, and permissions
 *
 * Combines usePreviewSync with permission-aware collaborative editing:
 * - Tracks active collaborators with roles
 * - Manages block locks with permission checks
 * - Provides canEdit based on role
 * - Exposes requestEditAccess for VIEWER role
 *
 * Step 7.5.4
 *
 * PERFORMANCE: All callbacks memoized, returns stable memoized object
 * SECURITY: canEdit is UI-only — backend enforces real EDIT_CONTENT checks
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useWebSocket } from "./useWebSocket";
import { usePreview } from "../context/PreviewContext";
import type { WebSocketMessage, RoomStateMember } from "../types/websocket";
import {
  isContentUpdate,
  isCursorMove,
  isLockMessage,
  isRoomState,
} from "../types/websocket";
import type { CursorPosition, LockInfo } from "./usePreviewSync";
import { getUserColor } from "./usePreviewSync";
import type { PresenceUser } from "../components/Editor/PresenceIndicator";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 100;
const THROTTLE_MS = 100;
const MAX_CURSORS = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseCollaborativeEditorOptions {
  pageId: string;
  websiteId: number;
  currentUserId: number;
  currentUserRole: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
}

export interface UseCollaborativeEditorReturn {
  isConnected: boolean;
  connectionState: import("../types/websocket").WebSocketConnectionState;
  activeUsers: PresenceUser[];
  cursorPositions: Map<number, CursorPosition>;
  locks: Map<number, LockInfo>;
  canEdit: boolean;
  broadcastChange: (blockId: number, fieldPath: string, value: unknown) => void;
  broadcastCursor: (blockId: number, x: number, y: number) => void;
  requestEditAccess: () => void;
}

// ---------------------------------------------------------------------------
// Permission helper
// ---------------------------------------------------------------------------

function canEditContent(role: string): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCollaborativeEditor(
  options: UseCollaborativeEditorOptions,
): UseCollaborativeEditorReturn {
  const { pageId, websiteId, currentUserId, currentUserRole } = options;
  const roomId = `page:${pageId}`;

  // ---- State ----------------------------------------------------------------
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
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

  // ---- Permission -------------------------------------------------------
  const canEdit = useMemo(
    () => canEditContent(currentUserRole),
    [currentUserRole],
  );

  // ---- Message handler ------------------------------------------------------
  const onMessage = useCallback(
    (msg: WebSocketMessage) => {
      if (!mountedRef.current) return;

      // ---- CONTENT_UPDATE ---------------------------------------------------
      if (isContentUpdate(msg)) {
        if (msg.userId === currentUserId) return;
        // Client-side dedup: read from data.timestamp (server overwrites top-level timestamp)
        const msgDataTs = (msg.data as Record<string, unknown>)?.timestamp as
          | string
          | undefined;
        if (msgDataTs && sentTimestampsRef.current.has(msgDataTs)) return;

        pendingUpdateRef.current = msg;
        if (debounceTimerRef.current !== null)
          clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          const pending = pendingUpdateRef.current;
          if (!pending || !isContentUpdate(pending)) return;

          const content = pageContentRef.current;
          if (!content) return;

          const { blockId, fieldPath, value } = pending.data;
          const updatedBlocks = content.blocks.map((block) => {
            if (String(block.id) === String(blockId)) {
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

      // ---- CURSOR_MOVE / PRESENCE_UPDATE ------------------------------------
      if (isCursorMove(msg)) {
        if (msg.userId === currentUserId) return;
        const userId = msg.userId!;

        setCursorPositions((prev) => {
          const newMap = new Map(prev);
          if (prev.size >= MAX_CURSORS && !prev.has(userId)) {
            let oldestKey: number | null = null;
            let oldestTime = Infinity;
            for (const [k, v] of newMap) {
              if (v.lastSeen < oldestTime) {
                oldestTime = v.lastSeen;
                oldestKey = k;
              }
            }
            if (oldestKey !== null) newMap.delete(oldestKey);
          }
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

      // ---- LOCK_ACQUIRE / LOCK_RELEASE / LOCK_ACQUIRED / LOCK_RELEASED ------
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
              acquiredAt: Date.now(),
            });
            return newMap;
          });
        } else {
          // LOCK_RELEASE or LOCK_RELEASED — remove lock from client state
          setLocks((prev) => {
            const m = new Map(prev);
            m.delete(blockId);
            return m;
          });
        }
        return;
      }

      // ---- ROOM_STATE -------------------------------------------------------
      if (isRoomState(msg)) {
        const members = msg.data.members as Array<
          RoomStateMember & { role?: string; color?: string }
        >;
        const presenceUsers: PresenceUser[] = members.map((m) => ({
          userId: m.userId,
          userName: m.username || `User ${m.userId}`,
          userAvatar: m.avatar || null,
          role: m.role || "VIEWER",
          color: m.color || getUserColor(m.userId),
        }));
        setActiveUsers(presenceUsers);
        return;
      }

      // ---- USER_JOINED (includes role + color) --------------------------------
      if (msg.type === "USER_JOINED" && msg.userId) {
        const data = msg.data as Record<string, unknown> | undefined;
        const userName = (data?.username as string) || `User ${msg.userId}`;
        const userAvatar = (data?.avatar as string) || null;
        const role = (data?.role as string) || "VIEWER";
        const color = (data?.color as string) || getUserColor(msg.userId);

        setActiveUsers((prev) => {
          if (prev.some((u) => u.userId === msg.userId)) return prev;
          return [
            ...prev,
            { userId: msg.userId!, userName, userAvatar, role, color },
          ];
        });
        return;
      }

      // ---- USER_LEFT --------------------------------------------------------
      if (msg.type === "USER_LEFT" && msg.userId) {
        setActiveUsers((prev) => prev.filter((u) => u.userId !== msg.userId));
        setCursorPositions((prev) => {
          if (!prev.has(msg.userId!)) return prev;
          const m = new Map(prev);
          m.delete(msg.userId!);
          return m;
        });

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
        if (throttleTimerRef.current !== null)
          clearTimeout(throttleTimerRef.current);
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
        if (cursorThrottleTimerRef.current !== null)
          clearTimeout(cursorThrottleTimerRef.current);
        cursorThrottleTimerRef.current = setTimeout(() => {
          if (mountedRef.current) doSend();
          cursorThrottleTimerRef.current = null;
        }, THROTTLE_MS - elapsed);
      }
    },
    [connectionState, send],
  );

  // ---- Request edit access (VIEWER → sends notification to OWNER) ----------
  const requestEditAccess = useCallback(async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      await fetch(
        `${apiUrl}/websites/${websiteId}/collaborators/request-edit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch {
      // Non-critical — best effort
    }
  }, [websiteId]);

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
      connectionState,
      activeUsers,
      cursorPositions,
      locks,
      canEdit,
      broadcastChange,
      broadcastCursor,
      requestEditAccess,
    }),
    [
      isConnected,
      connectionState,
      activeUsers,
      cursorPositions,
      locks,
      canEdit,
      broadcastChange,
      broadcastCursor,
      requestEditAccess,
    ],
  );
}

export default useCollaborativeEditor;
