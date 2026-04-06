/**
 * useWebSocket — Custom hook for WebSocket connection management
 *
 * Features:
 * - JWT authentication via query param
 * - Auto-reconnect with exponential backoff (1s → 2s → 4s → 8s → 16s → 30s cap)
 * - Room management: join, leave, rejoin on reconnect
 * - Heartbeat: responds to JSON ping messages with pong
 * - Safe cleanup on unmount (no setState on unmounted component)
 * - All returned functions are memoized with useCallback
 *
 * Step 5.3.3
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  WebSocketConnectionState,
  WebSocketMessage,
  UseWebSocketReturn,
  UserMetadata,
} from "../types/websocket";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Reconnect backoff delays in ms (capped at last value) */
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

/** Derive ws(s) URL from the HTTP API base URL */
function buildWsUrl(token: string, websiteId?: number | string): string {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  // Replace http(s):// with ws(s):// and strip /api suffix if present
  const base = apiUrl.replace(/^http/, "ws").replace(/\/api$/, "");
  let url = `${base}/ws?token=${encodeURIComponent(token)}`;
  if (websiteId) {
    url += `&websiteId=${encodeURIComponent(String(websiteId))}`;
  }
  return url;
}

/**
 * Reads the ws_token cookie (non-httpOnly, set during login for WebSocket auth).
 * Returns the token value or null if not found.
 */
function getWsTokenFromCookie(): string | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)ws_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseWebSocketOptions {
  /** Allow disabling the connection without unmounting the consuming component */
  enabled?: boolean;
  /** Callback invoked for each parsed server message */
  onMessage?: (message: WebSocketMessage) => void;
  /** Website ID to include in the connection URL (required for non-admin users) */
  websiteId?: number | string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const { enabled = true, onMessage, websiteId } = options;

  // ---- State (minimal — only values that must trigger re-render) -----------
  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>("disconnected");
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);

  // ---- Refs (mutable values that must NOT trigger re-renders) --------------
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayIndexRef = useRef(0);
  const reconnectAttemptRef = useRef(0);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  // Keep stable refs to callback options to avoid stale closures in event handlers
  const onMessageRef = useRef(onMessage);
  const enabledRef = useRef(enabled);
  const websiteIdRef = useRef(websiteId);

  // Keep refs in sync with latest props each render
  onMessageRef.current = onMessage;
  enabledRef.current = enabled;
  websiteIdRef.current = websiteId;

  // ---- Helpers --------------------------------------------------------------

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ---- Core send (raw, for internal use too) --------------------------------

  const sendRaw = useCallback((data: unknown): boolean => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      wsRef.current.send(JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }, []);

  // ---- Reconnect logic ------------------------------------------------------

  // Forward declaration ref — connect will reference scheduleReconnect and vice versa
  const connectRef = useRef<() => void>(() => undefined);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current || !enabledRef.current) return;

    clearReconnectTimer();

    const delayIndex = Math.min(
      reconnectDelayIndexRef.current,
      RECONNECT_DELAYS.length - 1,
    );
    const delay = RECONNECT_DELAYS[delayIndex];
    reconnectDelayIndexRef.current = Math.min(
      reconnectDelayIndexRef.current + 1,
      RECONNECT_DELAYS.length - 1,
    );

    reconnectAttemptRef.current += 1;
    if (mountedRef.current) {
      setReconnectAttempt(reconnectAttemptRef.current);
    }

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && enabledRef.current) {
        connectRef.current();
      }
    }, delay);
  }, [clearReconnectTimer]);

  // ---- WebSocket connect ----------------------------------------------------

  const connect = useCallback(() => {
    if (!mountedRef.current || !enabledRef.current) return;

    // Strategy 1: Read token from localStorage (explicit storage by some flows)
    let token = localStorage.getItem("token");

    // Strategy 2: If not in localStorage, try the non-httpOnly ws_token cookie
    // (set during login alongside the httpOnly token cookie, specifically for WS auth)
    if (!token) {
      token = getWsTokenFromCookie();
    }

    if (!token) {
      // No token available — do not attempt connection
      if (mountedRef.current) setConnectionState("disconnected");
      return;
    }

    // Close any existing socket before opening a new one
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    if (mountedRef.current) setConnectionState("connecting");

    const url = buildWsUrl(token, websiteIdRef.current);
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      if (mountedRef.current) setConnectionState("error");
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnectionState("connected");
      // Reset backoff on successful connection
      reconnectDelayIndexRef.current = 0;
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
      clearReconnectTimer();

      // Rejoin all rooms from before the reconnect
      joinedRoomsRef.current.forEach((roomId) => {
        sendRaw({ type: "JOIN_ROOM", roomId });
      });
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;
      // 4001 = auth failed, 4002 = rate limited — do not reconnect on either
      if (event.code === 4001 || event.code === 4002) {
        setConnectionState("error");
        return;
      }
      setConnectionState("disconnected");
      if (enabledRef.current) {
        scheduleReconnect();
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setConnectionState("error");
      // onerror is always followed by onclose in browsers — reconnect there
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;

      let parsed: WebSocketMessage;
      try {
        parsed = JSON.parse(event.data as string) as WebSocketMessage;
      } catch {
        // Safely ignore unparseable messages — no eval, no unsafe parse
        return;
      }

      // Respond to JSON-level ping messages from server
      if ((parsed as { type: string }).type === "ping") {
        sendRaw({ type: "pong" });
        return;
      }

      // Step 5.8: Handle USER_METADATA handshake from server
      if (parsed.type === "USER_METADATA" && parsed.data) {
        const d = parsed.data as Record<string, unknown>;
        setUserMetadata({
          userId: d.userId as number,
          name: (d.name as string) || null,
          avatar: (d.avatar as string) || null,
        });
        return;
      }

      // Update connected users from ROOM_STATE messages
      if (parsed.type === "ROOM_STATE" && parsed.data) {
        const members = (parsed.data as { members?: unknown[] }).members;
        if (Array.isArray(members)) {
          setConnectedUsers(members.length);
        }
      }

      onMessageRef.current?.(parsed);
    };
  }, [clearReconnectTimer, scheduleReconnect, sendRaw]);

  // Keep connectRef current so scheduleReconnect can call it
  connectRef.current = connect;

  // ---- Mount / unmount effect ------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      clearReconnectTimer();

      if (wsRef.current) {
        // Null out handlers to prevent triggering reconnect on intentional close
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      joinedRoomsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- React to `enabled` changes ------------------------------------------

  useEffect(() => {
    if (!enabled) {
      // Disable: close connection, cancel reconnect
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (mountedRef.current) setConnectionState("disconnected");
    } else {
      // Re-enable: start fresh connection if not already open
      if (
        !wsRef.current ||
        wsRef.current.readyState === WebSocket.CLOSED ||
        wsRef.current.readyState === WebSocket.CLOSING
      ) {
        reconnectDelayIndexRef.current = 0;
        reconnectAttemptRef.current = 0;
        if (mountedRef.current) setReconnectAttempt(0);
        connect();
      }
    }
  }, [enabled, clearReconnectTimer, connect]);

  // ---- Public API -----------------------------------------------------------

  const send = useCallback(
    (message: Omit<WebSocketMessage, "timestamp" | "userId">): boolean => {
      return sendRaw(message);
    },
    [sendRaw],
  );

  const joinRoom = useCallback(
    (roomId: string): void => {
      joinedRoomsRef.current.add(roomId);
      sendRaw({ type: "JOIN_ROOM", roomId });
    },
    [sendRaw],
  );

  const leaveRoom = useCallback(
    (roomId: string): void => {
      joinedRoomsRef.current.delete(roomId);
      sendRaw({ type: "LEAVE_ROOM", roomId });
    },
    [sendRaw],
  );

  const leaveAllRooms = useCallback((): void => {
    joinedRoomsRef.current.forEach((roomId) => {
      sendRaw({ type: "LEAVE_ROOM", roomId });
    });
    joinedRoomsRef.current.clear();
  }, [sendRaw]);

  return {
    connectionState,
    send,
    joinRoom,
    leaveRoom,
    leaveAllRooms,
    connectedUsers,
    reconnectAttempt,
    userMetadata,
  };
}

export default useWebSocket;
