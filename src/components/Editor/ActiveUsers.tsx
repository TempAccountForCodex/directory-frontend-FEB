/**
 * ActiveUsers — Horizontal avatar list of all connected users in the room
 *
 * Displays colored initials circles for each room member.
 * When a user has an active lock, their avatar gets a small editing badge.
 * Shows max 8 avatars with +N overflow indicator.
 *
 * Step 5.4.4
 */

import React, { useMemo } from "react";
import { Avatar, Badge, Box, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { RoomStateMember } from "../../types/websocket";
import type { LockInfo } from "../../hooks/usePreviewSync";
import { getUserColor } from "../../hooks/usePreviewSync";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISIBLE_AVATARS = 8;
const AVATAR_SIZE = 32;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(username: string): string {
  if (!username) return "?";
  const parts = username.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActiveUsersProps {
  users: RoomStateMember[];
  locks: Map<number, LockInfo>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ActiveUsersInner: React.FC<ActiveUsersProps> = ({ users, locks }) => {
  const editingUserIds = useMemo(() => {
    const ids = new Set<number>();
    for (const lock of locks.values()) {
      ids.add(lock.userId);
    }
    return ids;
  }, [locks]);

  const visibleUsers = useMemo(
    () => users.slice(0, MAX_VISIBLE_AVATARS),
    [users],
  );

  const overflowCount = useMemo(
    () => Math.max(0, users.length - MAX_VISIBLE_AVATARS),
    [users],
  );

  return (
    <Box
      data-testid="active-users-group"
      aria-label="Active editors"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {visibleUsers.map((user) => {
        const isEditing = editingUserIds.has(user.userId);
        const color = getUserColor(user.userId);
        const initials = getInitials(user.username);

        const avatar = (
          <Tooltip
            key={user.userId}
            title={user.username || `User ${user.userId}`}
            arrow
          >
            <Avatar
              data-testid={`user-avatar-${user.userId}`}
              src={user.avatar || undefined}
              sx={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                bgcolor: color,
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "default",
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>
        );

        if (isEditing) {
          return (
            <Badge
              key={user.userId}
              data-testid={`editing-badge-${user.userId}`}
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <EditIcon
                  sx={{
                    fontSize: 12,
                    color: "success.main",
                    bgcolor: "background.paper",
                    borderRadius: "50%",
                    p: "1px",
                  }}
                />
              }
            >
              {avatar}
            </Badge>
          );
        }

        return avatar;
      })}

      {overflowCount > 0 && (
        <Tooltip title={`${overflowCount} more editors`} arrow>
          <Avatar
            data-testid="avatar-overflow"
            sx={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              bgcolor: "action.selected",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "text.secondary",
              cursor: "default",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              +{overflowCount}
            </Typography>
          </Avatar>
        </Tooltip>
      )}
    </Box>
  );
};

export const ActiveUsers = React.memo(ActiveUsersInner);

export default ActiveUsers;
