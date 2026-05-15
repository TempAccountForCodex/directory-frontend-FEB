/**
 * CollaborativeEditorHeader — Collaborative editing UI for the website editor
 *
 * Shows:
 * - Active collaborators with role badges (PresenceIndicator)
 * - Connection status
 * - 'Manage Collaborators' button (opens CollaboratorModal)
 * - VIEWER: 'Request Edit Access' button
 *
 * Step 7.5.4
 *
 * PERFORMANCE: Memoized with React.memo
 * SECURITY: All role checks are UI hints only — backend enforces real security
 */

import React, { useCallback } from "react";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { PresenceIndicator } from "./PresenceIndicator";
import type { PresenceUser } from "./PresenceIndicator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollaborativeEditorHeaderProps {
  websiteId: number;
  currentUserId: number;
  currentUserRole: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  isConnected: boolean;
  activeUsers: PresenceUser[];
  onManageCollaborators: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function canManageCollaborators(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CollaborativeEditorHeaderInner: React.FC<
  CollaborativeEditorHeaderProps
> = ({
  websiteId,
  currentUserId,
  currentUserRole,
  isConnected,
  activeUsers,
  onManageCollaborators,
}) => {
  const handleManageCollaborators = useCallback(() => {
    onManageCollaborators();
  }, [onManageCollaborators]);

  return (
    <Box
      data-testid="collaborative-editor-header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Left: presence indicators */}
      <PresenceIndicator users={activeUsers} currentUserId={currentUserId} />

      {/* Right: actions + connection status */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Connection status */}
        <Tooltip title={isConnected ? "Connected" : "Reconnecting..."} arrow>
          <Box
            data-testid="ws-connection-status"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: isConnected ? "success.light" : "warning.light",
            }}
          >
            {isConnected ? (
              <WifiIcon sx={{ fontSize: 14, color: "success.dark" }} />
            ) : (
              <WifiOffIcon sx={{ fontSize: 14, color: "warning.dark" }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: isConnected ? "success.dark" : "warning.dark",
                fontWeight: 500,
              }}
            >
              {isConnected ? "Live" : "Reconnecting..."}
            </Typography>
          </Box>
        </Tooltip>

        {/* Manage Collaborators button (OWNER/ADMIN only) */}
        {canManageCollaborators(currentUserRole) && (
          <Button
            data-testid="manage-collaborators-btn"
            size="small"
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={handleManageCollaborators}
            sx={{ fontSize: "0.75rem" }}
          >
            Manage Collaborators
          </Button>
        )}
      </Box>
    </Box>
  );
};

export const CollaborativeEditorHeader = React.memo(
  CollaborativeEditorHeaderInner,
);

export default CollaborativeEditorHeader;
