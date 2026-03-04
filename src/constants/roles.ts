/**
 * Centralized User Role Definitions
 *
 * Single source of truth for all role values and helpers on the frontend.
 * These match the Prisma enum Role in backend/prisma/schema.prisma.
 *
 * Import from here instead of hardcoding role strings.
 */

export const ROLES = {
  USER: "USER",
  CONTENT_CREATOR: "CONTENT_CREATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** All valid role values (for validation) */
export const ALL_ROLES: Role[] = Object.values(ROLES);

/** Roles that have admin-level access */
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/** Human-readable labels for each role */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.USER]: "User",
  [ROLES.CONTENT_CREATOR]: "Content Creator",
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUPER_ADMIN]: "Super Admin",
};

/**
 * Check if a role has admin-level access.
 * Handles case-insensitive comparison and the legacy "super admin" (with space) format.
 */
export const isAdmin = (role: string | undefined | null): boolean => {
  if (!role) return false;
  const normalized = role.toUpperCase().replace(/\s+/g, "_");
  return normalized === ROLES.ADMIN || normalized === ROLES.SUPER_ADMIN;
};

/**
 * Check if a role is super admin.
 * Handles case-insensitive comparison and the legacy "super admin" (with space) format.
 */
export const isSuperAdmin = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return role.toUpperCase().replace(/\s+/g, "_") === ROLES.SUPER_ADMIN;
};

/**
 * Check if a role matches a specific target role.
 * Handles case-insensitive comparison and legacy space format.
 */
export const hasRole = (
  role: string | undefined | null,
  target: Role,
): boolean => {
  if (!role) return false;
  return role.toUpperCase().replace(/\s+/g, "_") === target;
};

/**
 * Check if a role is admin or content creator (can manage content).
 */
export const isContentManager = (role: string | undefined | null): boolean => {
  if (!role) return false;
  const normalized = role.toUpperCase().replace(/\s+/g, "_");
  return (
    normalized === ROLES.ADMIN ||
    normalized === ROLES.SUPER_ADMIN ||
    normalized === ROLES.CONTENT_CREATOR
  );
};
