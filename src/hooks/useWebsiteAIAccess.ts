/**
 * useWebsiteAIAccess — derives whether the current user may use website AI and
 * surfaces the reason/quota state when they cannot.
 *
 * Per the PRD:
 *  - Website AI is owner/admin only.
 *  - AI entry points must clearly show access/quota state.
 *  - When quota is exhausted, controls disable with a clear message + reset time.
 *  - Only one website AI request may be in progress at a time.
 *
 * Website AI quota is a separate bucket from listings AI. Until the dedicated
 * website-AI quota endpoint ships (backend Phase 7), this reads the existing
 * `GET /api/ai/usage` signal and accepts a runtime `resetAt` captured from a
 * `WEBSITE_AI_QUOTA_EXHAUSTED` response.
 *
 * Usage is fetched directly via the shared axios client (not React Query) so
 * this hook can be used inside the canonical editor render tree without
 * requiring a QueryClientProvider.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useWebsiteRole } from "../context/PermissionContext";
import { apiClient } from "../api/client";

interface UsageSnapshot {
  remaining: number | "unlimited" | null;
  limit: number | "unlimited" | null;
  resetAt: string | null;
}

export interface WebsiteAIAccessState {
  /** Final gate: owner/admin AND has quota AND no in-flight request. */
  canUseAI: boolean;
  /** Role check only. */
  isOwnerAdmin: boolean;
  /** Quota bucket is empty. */
  quotaExhausted: boolean;
  remaining: number | "unlimited" | null;
  limit: number | "unlimited" | null;
  /** ISO reset time when known (from usage or a quota-exhausted response). */
  resetAt: string | null;
  /** Human-readable reason the controls are disabled, or null when enabled. */
  disabledReason: string | null;
}

export function useWebsiteAIAccess(
  websiteId?: number,
  options?: {
    activeRequest?: boolean;
    resetAt?: string | null;
    role?: string | null;
    isOwner?: boolean;
  },
): WebsiteAIAccessState {
  const contextRole = useWebsiteRole(websiteId);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const effectiveRole = (options?.role || contextRole || "").toUpperCase();
  const isOwnerAdmin =
    Boolean(options?.isOwner) ||
    effectiveRole === "OWNER" ||
    effectiveRole === "ADMIN";
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch quota for users who can actually use AI.
    if (!isOwnerAdmin || fetchedRef.current) return;
    fetchedRef.current = true;
    let cancelled = false;
    apiClient
      .get("/ai/usage")
      .then((res) => {
        if (cancelled) return;
        const body = (res?.data?.data ?? res?.data ?? {}) as Record<
          string,
          unknown
        >;
        setUsage({
          remaining:
            typeof body.remaining === "number" ||
            body.remaining === "unlimited"
              ? (body.remaining as number | "unlimited")
              : null,
          limit:
            typeof body.limit === "number" || body.limit === "unlimited"
              ? (body.limit as number | "unlimited")
              : null,
          resetAt: typeof body.resetAt === "string" ? body.resetAt : null,
        });
      })
      .catch(() => {
        // Quota signal unavailable — don't block AI on a missing/failed read.
        if (!cancelled) setUsage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOwnerAdmin]);

  return useMemo(() => {
    const remaining = usage?.remaining ?? null;
    const limit = usage?.limit ?? null;
    const quotaExhausted =
      typeof remaining === "number" && remaining <= 0;
    const resetAt = options?.resetAt ?? usage?.resetAt ?? null;

    let disabledReason: string | null = null;
    if (!isOwnerAdmin) {
      disabledReason =
        "Only the website owner or an admin can use AI on this site.";
    } else if (quotaExhausted) {
      disabledReason = `You've used all your website AI for now. Resets ${formatResetTime(resetAt)}.`;
    } else if (options?.activeRequest) {
      disabledReason = "An AI request is already in progress.";
    }

    return {
      canUseAI: disabledReason === null,
      isOwnerAdmin,
      quotaExhausted,
      remaining,
      limit,
      resetAt,
      disabledReason,
    };
  }, [isOwnerAdmin, usage, options?.activeRequest, options?.resetAt]);
}

/** Format an ISO reset time into a short human string for quota messaging. */
export function formatResetTime(resetAt?: string | null): string {
  if (!resetAt) return "soon";
  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return "soon";
  const now = Date.now();
  const diffMs = date.getTime() - now;
  if (diffMs <= 0) return "soon";
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `in ${diffMins} min`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `in ${diffHours}h`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
