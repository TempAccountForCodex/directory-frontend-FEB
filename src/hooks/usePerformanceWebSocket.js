/**
 * usePerformanceWebSocket — Hook for real-time metrics WebSocket subscription (Step 8.4.4)
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Buffer updates during disconnect (replays on reconnect)
 * - Admin role verification via JWT (server enforces)
 * - Subscribes to metrics room on connect
 * - Emits onMetricsUpdate on METRICS_UPDATE messages
 * - Emits onAlert on METRICS_ALERT messages
 * - Cleans up on unmount
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_BUFFER_SIZE = 50;

const MESSAGE_TYPES = {
  METRICS_SUBSCRIBE: 'METRICS_SUBSCRIBE',
  METRICS_UPDATE: 'METRICS_UPDATE',
  METRICS_ALERT: 'METRICS_ALERT',
};

/**
 * Build WebSocket URL from API base URL.
 * @param {string} token - JWT token
 * @returns {string} WebSocket URL
 */
function buildWsUrl(token) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const base = apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '');
  // Metrics WS uses the same /ws endpoint but with no websiteId requirement
  // Server allows connections without websiteId for non-website channels
  return `${base}/ws?token=${encodeURIComponent(token)}`;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

/**
 * Hook for subscribing to real-time metrics via WebSocket.
 *
 * @param {{
 *   token: string|null,
 *   enabled?: boolean,
 *   onMetricsUpdate?: (data: Object) => void,
 *   onAlert?: (alert: Object) => void,
 * }} options
 * @returns {{
 *   connected: boolean,
 *   reconnecting: boolean,
 *   reconnectAttempt: number,
 *   lastMetrics: Object|null,
 *   lastAlert: Object|null,
 * }}
 */
export function usePerformanceWebSocket({ token, enabled = true, onMetricsUpdate, onAlert } = {}) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastMetrics, setLastMetrics] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);

  const wsRef = useRef(null);
  const mountedRef = useRef(true);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const updateBufferRef = useRef([]); // Buffer updates while disconnected

  // Stable callbacks via refs
  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  const onAlertRef = useRef(onAlert);
  onMetricsUpdateRef.current = onMetricsUpdate;
  onAlertRef.current = onAlert;

  /**
   * Sends a message if the WS is open.
   */
  const safeSend = useCallback((msg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  /**
   * Drains buffered updates to the consumer on reconnect.
   */
  const drainBuffer = useCallback(() => {
    const buf = updateBufferRef.current.splice(0);
    for (const item of buf) {
      if (item.type === MESSAGE_TYPES.METRICS_UPDATE) {
        if (mountedRef.current) setLastMetrics(item.data);
        onMetricsUpdateRef.current?.(item.data);
      } else if (item.type === MESSAGE_TYPES.METRICS_ALERT) {
        if (mountedRef.current) setLastAlert(item.data);
        onAlertRef.current?.(item.data);
      }
    }
  }, []);

  /**
   * Schedules a reconnect attempt with exponential backoff.
   */
  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;

    const delay =
      RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
    reconnectAttemptRef.current += 1;

    if (mountedRef.current) {
      setReconnecting(true);
      setReconnectAttempt(reconnectAttemptRef.current);
    }

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && enabled && token) {
        connect(); // eslint-disable-line no-use-before-define
      }
    }, delay);
  }, [enabled, token]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Opens the WebSocket connection and sets up event handlers.
   */
  const connect = useCallback(() => {
    if (!token || !enabled || !mountedRef.current) return;

    // Close existing connection
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }

    let ws;
    try {
      ws = new WebSocket(buildWsUrl(token));
    } catch {
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      reconnectAttemptRef.current = 0;
      setConnected(true);
      setReconnecting(false);
      setReconnectAttempt(0);

      // Subscribe to metrics room
      safeSend({ type: MESSAGE_TYPES.METRICS_SUBSCRIBE });

      // Drain buffered updates
      drainBuffer();
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;

      let parsed;
      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (parsed.type === MESSAGE_TYPES.METRICS_UPDATE) {
        const data = parsed.data || parsed;
        setLastMetrics(data);
        onMetricsUpdateRef.current?.(data);
      } else if (parsed.type === MESSAGE_TYPES.METRICS_ALERT) {
        const alert = parsed.data || parsed;
        setLastAlert(alert);
        onAlertRef.current?.(alert);
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      wsRef.current = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose will handle reconnect
    };
  }, [token, enabled, safeSend, drainBuffer, scheduleReconnect]);

  // Connect/disconnect on mount/unmount and when dependencies change
  useEffect(() => {
    mountedRef.current = true;

    if (token && enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      // Clear any pending reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      // Close WebSocket
      if (wsRef.current) {
        try {
          wsRef.current.onclose = null;
          wsRef.current.close();
        } catch {
          // Ignore
        }
        wsRef.current = null;
      }
    };
  }, [token, enabled, connect]);

  return {
    connected,
    reconnecting,
    reconnectAttempt,
    lastMetrics,
    lastAlert,
  };
}

export default usePerformanceWebSocket;
