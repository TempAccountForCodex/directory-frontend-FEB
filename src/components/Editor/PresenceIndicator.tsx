/**
 * PresenceIndicator — Shows active collaborators with role badges
 *
 * Displays avatars of users currently in the editing session.
 * Each avatar includes a role badge (OWNER=gold, ADMIN=blue, EDITOR=green, VIEWER=gray).
 * Shows summary: "N editors, M viewers"
 *
 * Step 7.5.2
 *
 * PERFORMANCE: Memoized with React.memo
 * SECURITY: Role sourced from server metadata via presenceData
 */

import React, { useMemo } from "react";
import { Avatar, Badge, Box, Tooltip, Typography } from "@mui/material";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISIBLE = 5;

// Role badge colors per role hierarchy
const ROLE_BADGE_COLORS: Record<string, string> = {
  OWNER: "#f59e0b", // gold
  ADMIN: "#3b82f6", // blue
  EDITOR: "#22c55e", // green
  VIEWER: "#9ca3af", // gray
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresenceUser {
  userId: number;
  userName: string;
  userAvatar: string | null;
  role: string;
  color: string;
}

interface PresenceIndicatorProps {
  users: PresenceUser[];
  currentUserId: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function isEditorRole(role: string): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PresenceIndicatorInner: React.FC<PresenceIndicatorProps> = ({
  users,
  currentUserId,
}) => {
  const visibleUsers = useMemo(() => users.slice(0, MAX_VISIBLE), [users]);
  const overflowCount = useMemo(
    () => Math.max(0, users.length - MAX_VISIBLE),
    [users],
  );

  const summary = useMemo(() => {
    const editors = users.filter((u) => isEditorRole(u.role)).length;
    const viewers = users.filter((u) => u.role === "VIEWER").length;
    return { editors, viewers };
  }, [users]);

  if (users.length === 0) {
    return (
      <Box
        data-testid="presence-indicator"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Typography variant="caption" color="text.secondary">
          No collaborators
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      data-testid="presence-indicator"
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
    >
      {/* Avatar group */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {visibleUsers.map((user) => {
          const badgeColor = ROLE_BADGE_COLORS[user.role] || "#9ca3af";
          const initials = getInitials(user.userName);

          return (
            <Tooltip
              key={user.userId}
              title={`${user.userName} (${user.role})`}
              arrow
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    data-testid={`role-badge-${user.userId}`}
                    sx={{
                      minWidth: 28,
                      height: 14,
                      bgcolor: badgeColor,
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: "3px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {user.role}
                    </Typography>
                  </Box>
                }
              >
                <Avatar
                  data-testid={`presence-avatar-${user.userId}`}
                  src={user.userAvatar || undefined}
                  aria-label={`${user.userName} (${user.role})`}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: user.color,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    border:
                      user.userId === currentUserId ? "2px solid" : "none",
                    borderColor: "primary.main",
                    cursor: "default",
                  }}
                >
                  {initials}
                </Avatar>
              </Badge>
            </Tooltip>
          );
        })}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <Tooltip title={`${overflowCount} more collaborators`} arrow>
            <Avatar
              data-testid="presence-overflow"
              sx={{
                width: 32,
                height: 32,
                bgcolor: "action.selected",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "text.secondary",
                cursor: "default",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                +{overflowCount}
              </Typography>
            </Avatar>
          </Tooltip>
        )}
      </Box>

      {/* Summary */}
      <Typography
        data-testid="presence-summary"
        variant="caption"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {summary.editors > 0 &&
          `${summary.editors} editor${summary.editors !== 1 ? "s" : ""}`}
        {summary.editors > 0 && summary.viewers > 0 && ", "}
        {summary.viewers > 0 &&
          `${summary.viewers} viewer${summary.viewers !== 1 ? "s" : ""}`}
      </Typography>
    </Box>
  );
};

export const PresenceIndicator = React.memo(PresenceIndicatorInner);

export default PresenceIndicator;
