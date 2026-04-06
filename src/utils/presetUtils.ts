/**
 * Preset Utilities (Step 7.10.3)
 *
 * Frontend utilities for collaborator preset labels, descriptions,
 * and blocked-action messaging.
 *
 * These constants mirror the backend constants/presets.js definitions.
 * Kept in sync manually — any changes to backend presets must be reflected here.
 *
 * Usage:
 *   import { PRESET_LABELS, isActionBlockedByPreset, getBlockedActionMessage } from './presetUtils';
 *
 *   const label = PRESET_LABELS[collaborator.preset];
 *   const isBlocked = isActionBlockedByPreset('CONTENT_ONLY', 'PUBLISH');
 *   const message = getBlockedActionMessage('CONTENT_ONLY', 'PUBLISH');
 */

// ── Types ────────────────────────────────────────────────────────────────────

/** Available collaborator presets */
export type CollaboratorPreset = "CONTENT_ONLY" | "REVIEWER";

/** Website actions that can be checked against presets */
export type WebsiteAction =
  | "VIEW"
  | "EDIT_CONTENT"
  | "EDIT_SETTINGS"
  | "DELETE"
  | "MANAGE_COLLABORATORS"
  | "PUBLISH"
  | "UNPUBLISH"
  | "TRANSFER_OWNERSHIP"
  | "DASHBOARD_ACCESS"
  | "VIEW_ANALYTICS"
  | "MANAGE_FORMS"
  | "MANAGE_INTEGRATIONS"
  | "MANAGE_DOMAIN";

// ── Preset Labels ─────────────────────────────────────────────────────────────

/**
 * Short display labels for preset badges and dropdowns.
 */
export const PRESET_LABELS: Record<CollaboratorPreset, string> = {
  CONTENT_ONLY: "Content Editor",
  REVIEWER: "Reviewer",
};

/**
 * Longer descriptions for tooltips and onboarding flows.
 */
export const PRESET_DESCRIPTIONS: Record<CollaboratorPreset, string> = {
  CONTENT_ONLY:
    "Can only edit content — cannot publish, change settings, manage collaborators, or access analytics.",
  REVIEWER:
    "Read-only access with analytics visibility — cannot edit content, publish, or change any settings.",
};

// ── Allowed Actions per Preset ────────────────────────────────────────────────

/**
 * Actions allowed by each preset.
 * These match backend PRESET_ALLOWED_ACTIONS exactly.
 *
 * IMPORTANT: Effective permission = base_role_allows AND preset_allows.
 * This utility is for UI hints only — actual enforcement is on the backend.
 */
const PRESET_ALLOWED_ACTIONS: Record<CollaboratorPreset, Set<WebsiteAction>> = {
  CONTENT_ONLY: new Set<WebsiteAction>([
    "VIEW",
    "EDIT_CONTENT",
    "DASHBOARD_ACCESS",
    "MANAGE_FORMS",
  ]),
  REVIEWER: new Set<WebsiteAction>([
    "VIEW",
    "DASHBOARD_ACCESS",
    "VIEW_ANALYTICS",
  ]),
};

// ── Blocked Action Messages ───────────────────────────────────────────────────

/**
 * Human-readable explanations for blocked actions.
 * Used in error toasts and inline help text.
 */
const PRESET_BLOCKED_ACTION_MESSAGES: Record<
  CollaboratorPreset,
  Partial<Record<WebsiteAction, string>>
> = {
  CONTENT_ONLY: {
    PUBLISH:
      "Your access is restricted to content editing. Publishing requires a higher permission level.",
    UNPUBLISH:
      "Your access is restricted to content editing. Unpublishing requires a higher permission level.",
    VIEW_ANALYTICS:
      "Analytics access is not included in your content editor access level.",
    EDIT_SETTINGS: "Changing site settings requires a higher permission level.",
    DELETE: "Deleting the website requires a higher permission level.",
    MANAGE_COLLABORATORS:
      "Managing collaborators requires a higher permission level.",
    TRANSFER_OWNERSHIP: "Transferring ownership requires full owner access.",
    MANAGE_INTEGRATIONS:
      "Managing integrations requires a higher permission level.",
    MANAGE_DOMAIN: "Domain management requires owner-level access.",
  },
  REVIEWER: {
    EDIT_CONTENT:
      "Your reviewer access is read-only. Editing content is not permitted.",
    PUBLISH:
      "Your reviewer access is read-only. Publishing requires a higher permission level.",
    UNPUBLISH:
      "Your reviewer access is read-only. Unpublishing requires a higher permission level.",
    MANAGE_FORMS:
      "Your reviewer access is read-only. Form management requires a higher permission level.",
    EDIT_SETTINGS:
      "Your reviewer access is read-only. Changing settings requires a higher permission level.",
    DELETE: "Deleting the website requires a higher permission level.",
    MANAGE_COLLABORATORS:
      "Managing collaborators requires a higher permission level.",
    TRANSFER_OWNERSHIP: "Transferring ownership requires full owner access.",
    MANAGE_INTEGRATIONS:
      "Managing integrations requires a higher permission level.",
    MANAGE_DOMAIN: "Domain management requires owner-level access.",
  },
};

// ── Utility Functions ─────────────────────────────────────────────────────────

/**
 * Check if a given action is blocked by a preset.
 *
 * This is a UI-side hint only — backend enforcement is authoritative.
 * Useful for disabling buttons, showing tooltips, and conditional rendering.
 *
 * @param preset - The collaborator's preset (or null for no restriction)
 * @param action - The action to check
 * @returns true if the preset blocks the action, false otherwise
 *
 * @example
 * isActionBlockedByPreset('CONTENT_ONLY', 'PUBLISH') // → true
 * isActionBlockedByPreset('CONTENT_ONLY', 'EDIT_CONTENT') // → false
 * isActionBlockedByPreset(null, 'PUBLISH') // → false (no preset = no restriction)
 */
export function isActionBlockedByPreset(
  preset: CollaboratorPreset | null | undefined,
  action: WebsiteAction,
): boolean {
  if (!preset) return false;

  const allowedActions = PRESET_ALLOWED_ACTIONS[preset];
  if (!allowedActions) {
    // Unknown preset — deny-by-default matches backend behavior
    return true;
  }

  return !allowedActions.has(action);
}

/**
 * Get a human-readable explanation for why an action is blocked by a preset.
 *
 * Returns a generic message if no specific message is defined.
 *
 * @param preset - The collaborator's preset
 * @param action - The blocked action
 * @returns Human-readable explanation string
 *
 * @example
 * getBlockedActionMessage('CONTENT_ONLY', 'PUBLISH')
 * // → "Your access is restricted to content editing. Publishing requires a higher permission level."
 */
export function getBlockedActionMessage(
  preset: CollaboratorPreset | null | undefined,
  action: WebsiteAction,
): string {
  if (!preset) return "";

  const presetMessages = PRESET_BLOCKED_ACTION_MESSAGES[preset];
  if (!presetMessages) {
    return `Your current access level does not allow this action.`;
  }

  return (
    presetMessages[action] ??
    `Your current access level (${PRESET_LABELS[preset] ?? preset}) does not allow this action.`
  );
}

/**
 * Get all actions blocked by a given preset.
 * Useful for rendering a complete restriction summary.
 *
 * @param preset - The collaborator's preset
 * @returns Array of blocked action names
 */
export function getBlockedActionsForPreset(
  preset: CollaboratorPreset | null | undefined,
): WebsiteAction[] {
  if (!preset) return [];

  const allowedActions = PRESET_ALLOWED_ACTIONS[preset];
  if (!allowedActions) return [];

  const allActions: WebsiteAction[] = [
    "VIEW",
    "EDIT_CONTENT",
    "EDIT_SETTINGS",
    "DELETE",
    "MANAGE_COLLABORATORS",
    "PUBLISH",
    "UNPUBLISH",
    "TRANSFER_OWNERSHIP",
    "DASHBOARD_ACCESS",
    "VIEW_ANALYTICS",
    "MANAGE_FORMS",
    "MANAGE_INTEGRATIONS",
    "MANAGE_DOMAIN",
  ];

  return allActions.filter((action) => !allowedActions.has(action));
}

/**
 * Get the preset label, or an empty string if no preset.
 * Convenience helper for displaying preset badges.
 *
 * @param preset - The collaborator's preset (or null)
 * @returns Display label or empty string
 */
export function getPresetLabel(
  preset: CollaboratorPreset | null | undefined,
): string {
  if (!preset) return "";
  return PRESET_LABELS[preset] ?? preset;
}

/**
 * Get the preset description, or an empty string if no preset.
 *
 * @param preset - The collaborator's preset (or null)
 * @returns Description string or empty string
 */
export function getPresetDescription(
  preset: CollaboratorPreset | null | undefined,
): string {
  if (!preset) return "";
  return PRESET_DESCRIPTIONS[preset] ?? "";
}

export default {
  PRESET_LABELS,
  PRESET_DESCRIPTIONS,
  isActionBlockedByPreset,
  getBlockedActionMessage,
  getBlockedActionsForPreset,
  getPresetLabel,
  getPresetDescription,
};
