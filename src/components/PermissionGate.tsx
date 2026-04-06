/**
 * PermissionGate Component (Step 7.2.4)
 *
 * Declaratively gates UI elements based on website-level permissions.
 *
 * IMPORTANT: Frontend permissions are for UI adaptation ONLY.
 * The backend enforces real security.
 *
 * Usage:
 *   <PermissionGate action="EDIT_CONTENT">
 *     <EditButton />
 *   </PermissionGate>
 *
 *   <PermissionGate minRole="ADMIN" hide>
 *     <AdminPanel />
 *   </PermissionGate>
 *
 *   <PermissionGate action="DELETE" fallback={<UpgradePrompt />}>
 *     <DeleteButton />
 *   </PermissionGate>
 */
import React, { useMemo, type ReactNode } from "react";
import { Box, Tooltip } from "@mui/material";
import {
  usePermission,
  useHasRole,
  WEBSITE_ACTIONS,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from "../context/PermissionContext";

// ── Props ───────────────────────────────────────────────────────────────────

export interface PermissionGateProps {
  /** Required action (from WEBSITE_ACTIONS). Mutually exclusive with minRole. */
  action?: string;
  /** Minimum role (alternative to action). */
  minRole?: string;
  /** Shown when permission is denied. Takes precedence over hide. */
  fallback?: ReactNode;
  /** When true and denied: render null. When false and denied: render disabled with tooltip. */
  hide?: boolean;
  /** Content to gate */
  children: ReactNode;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Determine the minimum role required for a given action, for the tooltip message.
 */
function getRequiredRoleForAction(action: string): string {
  // Walk from lowest role upward; first role that has the action is the minimum
  const orderedRoles = ["VIEWER", "EDITOR", "ADMIN", "OWNER"];
  for (const role of orderedRoles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms && perms.has(action)) {
      return role;
    }
  }
  return "OWNER";
}

// ── Component ───────────────────────────────────────────────────────────────

const PermissionGate = React.memo(function PermissionGate({
  action,
  minRole,
  fallback,
  hide = true,
  children,
}: PermissionGateProps) {
  const actionPermitted = usePermission(action ?? "");
  const rolePermitted = useHasRole(minRole ?? "VIEWER");

  const isPermitted = action ? actionPermitted : minRole ? rolePermitted : true;

  const tooltipText = useMemo(() => {
    if (isPermitted) return "";
    if (action) {
      const requiredRole = getRequiredRoleForAction(action);
      return `You need ${requiredRole} role to perform this action`;
    }
    if (minRole) {
      return `You need ${minRole} role to perform this action`;
    }
    return "You do not have permission to perform this action";
  }, [isPermitted, action, minRole]);

  if (isPermitted) {
    return <>{children}</>;
  }

  // Denied — check fallback first
  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  // Denied, hide=true → render nothing
  if (hide) {
    return null;
  }

  // Denied, hide=false → show disabled with tooltip
  return (
    <Tooltip title={tooltipText} arrow>
      <Box
        component="span"
        sx={{
          display: "inline-block",
          pointerEvents: "none",
          opacity: 0.5,
          cursor: "not-allowed",
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
});

PermissionGate.displayName = "PermissionGate";

export default PermissionGate;

// ── usePermissionGate hook ──────────────────────────────────────────────────

/**
 * Convenience hook returning permission booleans for all common actions.
 * Each value is individually memoized based on the underlying usePermission calls.
 */
export function usePermissionGate() {
  const canView = usePermission(WEBSITE_ACTIONS.VIEW);
  const canEdit = usePermission(WEBSITE_ACTIONS.EDIT_CONTENT);
  const canDelete = usePermission(WEBSITE_ACTIONS.DELETE);
  const canManageCollaborators = usePermission(
    WEBSITE_ACTIONS.MANAGE_COLLABORATORS,
  );
  const canAccessDashboard = usePermission(WEBSITE_ACTIONS.DASHBOARD_ACCESS);
  const canViewAnalytics = usePermission(WEBSITE_ACTIONS.VIEW_ANALYTICS);
  const canManageForms = usePermission(WEBSITE_ACTIONS.MANAGE_FORMS);
  const canManageIntegrations = usePermission(
    WEBSITE_ACTIONS.MANAGE_INTEGRATIONS,
  );
  const canManageDomain = usePermission(WEBSITE_ACTIONS.MANAGE_DOMAIN);

  return useMemo(
    () => ({
      canView,
      canEdit,
      canDelete,
      canManageCollaborators,
      canAccessDashboard,
      canViewAnalytics,
      canManageForms,
      canManageIntegrations,
      canManageDomain,
    }),
    [
      canView,
      canEdit,
      canDelete,
      canManageCollaborators,
      canAccessDashboard,
      canViewAnalytics,
      canManageForms,
      canManageIntegrations,
      canManageDomain,
    ],
  );
}
