/**
 * Permission Context (Step 7.2.3)
 *
 * Provides website-level permission checks for UI adaptation.
 *
 * IMPORTANT: Frontend permissions are for UI adaptation ONLY.
 * The backend enforces real security via permissionService + ownership middleware.
 *
 * Exports:
 *  - PermissionProvider — wraps children and provides permission context
 *  - usePermission(action) — returns boolean for action on current website
 *  - useHasRole(minRole) — returns boolean for role hierarchy check
 *  - useWebsiteRole(websiteId?) — returns role string or null
 *  - usePermissionContext() — returns full context (low-level)
 */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// ── Permission Constants (mirrors backend/constants/permissions.js) ─────────

export const WEBSITE_ACTIONS = {
  VIEW: "VIEW",
  EDIT_CONTENT: "EDIT_CONTENT",
  EDIT_SETTINGS: "EDIT_SETTINGS",
  DELETE: "DELETE",
  MANAGE_COLLABORATORS: "MANAGE_COLLABORATORS",
  PUBLISH: "PUBLISH",
  UNPUBLISH: "UNPUBLISH",
  TRANSFER_OWNERSHIP: "TRANSFER_OWNERSHIP",
  DASHBOARD_ACCESS: "DASHBOARD_ACCESS",
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  MANAGE_FORMS: "MANAGE_FORMS",
  MANAGE_INTEGRATIONS: "MANAGE_INTEGRATIONS",
  MANAGE_DOMAIN: "MANAGE_DOMAIN",
} as const;

export type WebsiteAction =
  (typeof WEBSITE_ACTIONS)[keyof typeof WEBSITE_ACTIONS];

export const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  OWNER: new Set(Object.values(WEBSITE_ACTIONS)),
  ADMIN: new Set([
    WEBSITE_ACTIONS.VIEW,
    WEBSITE_ACTIONS.EDIT_CONTENT,
    WEBSITE_ACTIONS.EDIT_SETTINGS,
    WEBSITE_ACTIONS.DELETE,
    WEBSITE_ACTIONS.MANAGE_COLLABORATORS,
    WEBSITE_ACTIONS.PUBLISH,
    WEBSITE_ACTIONS.UNPUBLISH,
    WEBSITE_ACTIONS.DASHBOARD_ACCESS,
    WEBSITE_ACTIONS.VIEW_ANALYTICS,
    WEBSITE_ACTIONS.MANAGE_FORMS,
    WEBSITE_ACTIONS.MANAGE_INTEGRATIONS,
  ]),
  EDITOR: new Set([
    WEBSITE_ACTIONS.VIEW,
    WEBSITE_ACTIONS.EDIT_CONTENT,
    WEBSITE_ACTIONS.PUBLISH,
    WEBSITE_ACTIONS.DASHBOARD_ACCESS,
    WEBSITE_ACTIONS.VIEW_ANALYTICS,
    WEBSITE_ACTIONS.MANAGE_FORMS,
  ]),
  VIEWER: new Set([WEBSITE_ACTIONS.VIEW]),
};

// ── Types ───────────────────────────────────────────────────────────────────

/** Map of websiteId to the user's role on that website */
export type WebsitePermissions = Record<number, string>;

export interface PermissionContextType {
  /** Map of websiteId → role string */
  websitePermissions: WebsitePermissions;
  /** Currently active website ID */
  currentWebsiteId: number | null;
  /** Set the active website for permission checks */
  setCurrentWebsite: (websiteId: number | null) => void;
  /** Whether the initial role fetch is in progress */
  loading: boolean;
  /** Error message from the initial fetch, or null */
  error: string | null;
  /** Re-fetch permissions from backend */
  refetch: () => void;
}

// ── Context ─────────────────────────────────────────────────────────────────

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ── Provider ────────────────────────────────────────────────────────────────

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user } = useAuth();

  const [websitePermissions, setWebsitePermissions] =
    useState<WebsitePermissions>({});
  const [currentWebsiteId, setCurrentWebsiteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setWebsitePermissions({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/websites`, {
        withCredentials: true,
      });

      const websites = response.data?.data || [];
      const permissions: WebsitePermissions = {};

      for (const website of websites) {
        // If the API response includes a role field, use it; otherwise default to VIEWER
        // (safest fallback — backend enforces real permissions)
        permissions[website.id] = website.role?.toUpperCase() || "VIEWER";
      }

      setWebsitePermissions(permissions);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch website permissions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const setCurrentWebsite = useCallback((websiteId: number | null) => {
    setCurrentWebsiteId(websiteId);
  }, []);

  const value = useMemo<PermissionContextType>(
    () => ({
      websitePermissions,
      currentWebsiteId,
      setCurrentWebsite,
      loading,
      error,
      refetch: fetchPermissions,
    }),
    [
      websitePermissions,
      currentWebsiteId,
      setCurrentWebsite,
      loading,
      error,
      fetchPermissions,
    ],
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// ── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Low-level hook — returns the full permission context.
 * Throws if used outside PermissionProvider.
 */
export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      "usePermissionContext must be used within a PermissionProvider",
    );
  }
  return context;
}

/**
 * Check whether the current user can perform `action` on the current website.
 *
 * @param action - One of WEBSITE_ACTIONS values
 * @returns boolean
 */
export function usePermission(action: string): boolean {
  const context = useContext(PermissionContext);

  return useMemo(() => {
    if (!context) return false;
    const { currentWebsiteId, websitePermissions } = context;
    if (currentWebsiteId === null) return false;
    const role = websitePermissions[currentWebsiteId];
    if (!role) return false;
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    return perms.has(action);
  }, [context, action]);
}

/**
 * Check whether the current user has at least `minRole` on the current website.
 *
 * @param minRole - Minimum required role (OWNER, ADMIN, EDITOR, VIEWER)
 * @returns boolean
 */
export function useHasRole(minRole: string): boolean {
  const context = useContext(PermissionContext);

  return useMemo(() => {
    if (!context) return false;
    const { currentWebsiteId, websitePermissions } = context;
    if (currentWebsiteId === null) return false;
    const role = websitePermissions[currentWebsiteId];
    if (!role) return false;
    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? Infinity;
    return userLevel >= requiredLevel;
  }, [context, minRole]);
}

/**
 * Get the user's role on a specific website (or current website if none provided).
 *
 * @param websiteId - Optional websiteId; defaults to currentWebsiteId
 * @returns role string or null
 */
export function useWebsiteRole(websiteId?: number): string | null {
  const context = useContext(PermissionContext);

  return useMemo(() => {
    if (!context) return null;
    const id = websiteId ?? context.currentWebsiteId;
    if (id === null || id === undefined) return null;
    return context.websitePermissions[id] ?? null;
  }, [context, websiteId]);
}
