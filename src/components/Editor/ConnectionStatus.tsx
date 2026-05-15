/**
 * ConnectionStatus — Real-time WebSocket connection status indicator
 *
 * A small, non-intrusive dot indicator for the website editor showing
 * whether the collaborative WebSocket connection is active.
 *
 * Props:
 *  - connectionState: 'connecting' | 'connected' | 'disconnected' | 'error'
 *  - connectedUsers?:  number — show collaborator count when > 1
 *  - onReconnect?:     () => void — called when user clicks the disconnected dot
 *
 * Step 5.3.5
 *
 * SECURITY: All rendered strings are static constants — no user-controlled
 * content injected into JSX, no dangerouslySetInnerHTML.
 */

import React, { useEffect, useRef, memo } from "react";
import { Box, Tooltip, Typography, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import type { WebSocketConnectionState } from "../../types/websocket";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConnectionStatusProps {
  connectionState: WebSocketConnectionState;
  connectedUsers?: number;
  onReconnect?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOT_SIZE = 8;

const STATE_COLORS: Record<WebSocketConnectionState, string> = {
  connected: "#4caf50", // green
  connecting: "#ff9800", // amber / warning
  disconnected: "#f44336", // red
  error: "#f44336", // red
};

const TOOLTIPS: Record<WebSocketConnectionState, string> = {
  connected: "Connected",
  connecting: "Reconnecting...",
  disconnected: "Disconnected — click to reconnect",
  error: "Connection error",
};

// Framer Motion pulse animation for the reconnecting/connecting state
const pulseAnimation = {
  animate: { scale: [1, 1.35, 1], opacity: [1, 0.55, 1] },
  transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" as const },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ConnectionStatus: React.FC<ConnectionStatusProps> = memo(
  ({ connectionState, connectedUsers = 0, onReconnect }) => {
    const [snackbar, setSnackbar] = React.useState<{
      open: boolean;
      message: string;
      severity: "success" | "warning";
    }>({ open: false, message: "", severity: "warning" });

    // Track previous state to detect transitions
    const prevStateRef = useRef<WebSocketConnectionState | null>(null);

    useEffect(() => {
      const prev = prevStateRef.current;
      prevStateRef.current = connectionState;

      if (prev === null) {
        // First render — no transition to announce
        return;
      }

      // Transition: connected → disconnected/error = connection lost
      if (
        prev === "connected" &&
        (connectionState === "disconnected" || connectionState === "error")
      ) {
        setSnackbar({
          open: true,
          message: "Connection lost",
          severity: "warning",
        });
        return;
      }

      // Transition: connecting/disconnected → connected = connection restored
      if (
        (prev === "connecting" ||
          prev === "disconnected" ||
          prev === "error") &&
        connectionState === "connected"
      ) {
        setSnackbar({
          open: true,
          message: "Connection restored",
          severity: "success",
        });
        return;
      }
    }, [connectionState]);

    const handleCloseSnackbar = () => {
      setSnackbar((s) => ({ ...s, open: false }));
    };

    const color = STATE_COLORS[connectionState];
    const tooltipText = TOOLTIPS[connectionState];
    const isPulsing = connectionState === "connecting";
    const isClickable =
      connectionState === "disconnected" && Boolean(onReconnect);
    const showUserCount = connectionState === "connected" && connectedUsers > 1;

    const dot = (
      <Box
        component={isPulsing ? "span" : "span"}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          cursor: isClickable ? "pointer" : "default",
          gap: 0.75,
          userSelect: "none",
        }}
        onClick={isClickable ? onReconnect : undefined}
        role={isClickable ? "button" : undefined}
        aria-label={isClickable ? "Click to reconnect" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onReconnect?.();
                }
              }
            : undefined
        }
        data-testid="connection-status-container"
      >
        {isPulsing ? (
          <motion.span
            animate={pulseAnimation.animate}
            transition={pulseAnimation.transition}
            style={{
              display: "inline-block",
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
            data-testid="connection-dot"
          />
        ) : (
          <Box
            component="span"
            data-testid="connection-dot"
            sx={{
              display: "inline-block",
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
        )}

        {showUserCount && (
          <Typography
            component="span"
            variant="caption"
            data-testid="user-count"
            sx={{ fontSize: "0.7rem", color: "text.secondary", lineHeight: 1 }}
          >
            {connectedUsers} users editing
          </Typography>
        )}
      </Box>
    );

    return (
      <>
        <Tooltip title={tooltipText} placement="bottom" arrow>
          {dot}
        </Tooltip>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          data-testid="connection-snackbar"
        >
          <Alert
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  },
);

ConnectionStatus.displayName = "ConnectionStatus";

export default ConnectionStatus;
export { ConnectionStatus };
