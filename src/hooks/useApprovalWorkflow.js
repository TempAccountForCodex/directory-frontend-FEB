/**
 * useApprovalWorkflow — Custom hook for approval workflow state management
 *
 * Step 7.11.13 — Governance API Hooks & Integration
 *
 * Centralizes approval workflow API calls and WebSocket subscriptions.
 * All returned functions are memoized. Polling fallback at 30s interval.
 *
 * Parameters: websiteId, userRole, userId
 *
 * Returns: {
 *   approvalState, loading, error, sectionLocks,
 *   requestApproval, reviewApproval, publishAfterApproval,
 *   emergencyPublish, revokeApproval,
 *   refreshApprovalState, isApprovalRequired
 * }
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/** States that require no further editorial action */
const TERMINAL_STATES = new Set(['PUBLISHED', 'DRAFT']);

/** Polling interval in ms */
const POLL_INTERVAL_MS = 30_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useApprovalWorkflow(websiteId, userRole, userId) {
  const [approvalState, setApprovalState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionLocks, setSectionLocks] = useState([]);

  const mountedRef = useRef(true);
  const pollTimerRef = useRef(null);

  // ---- Helpers --------------------------------------------------------------

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // ---- Fetch approval state -------------------------------------------------

  const refreshApprovalState = useCallback(async () => {
    if (!websiteId) return;

    try {
      const res = await axios.get(
        `${API_URL}/websites/${websiteId}/approval`,
        { headers: getAuthHeaders() }
      );
      if (mountedRef.current) {
        setApprovalState(res.data?.data ?? res.data ?? null);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load approval state';
        setError(msg);
      }
    }
  }, [websiteId, getAuthHeaders]);

  // ---- Fetch section locks --------------------------------------------------

  const refreshSectionLocks = useCallback(async () => {
    if (!websiteId) return;
    try {
      const res = await axios.get(
        `${API_URL}/websites/${websiteId}/sections/locks`,
        { headers: getAuthHeaders() }
      );
      if (mountedRef.current) {
        setSectionLocks(res.data?.data ?? res.data ?? []);
      }
    } catch {
      // Non-fatal: ignore lock fetch errors silently
    }
  }, [websiteId, getAuthHeaders]);

  // ---- Initial load ---------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    if (!websiteId) return;

    setLoading(true);
    Promise.all([refreshApprovalState(), refreshSectionLocks()]).finally(() => {
      if (mountedRef.current) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  // ---- Polling fallback (30s) ------------------------------------------------

  useEffect(() => {
    if (!websiteId) return;

    pollTimerRef.current = setInterval(() => {
      refreshApprovalState();
      refreshSectionLocks();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [websiteId, refreshApprovalState, refreshSectionLocks]);

  // ---- WebSocket subscription -----------------------------------------------

  useEffect(() => {
    if (!websiteId) return;

    const handleWsMessage = (event) => {
      let msg;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (!msg?.type) return;

      if (msg.type === 'APPROVAL_STATE_CHANGED') {
        // Update from payload if provided, else re-fetch
        if (msg.data?.approvalState !== undefined) {
          if (mountedRef.current) setApprovalState(msg.data.approvalState);
        } else {
          refreshApprovalState();
        }
      }

      if (msg.type === 'SECTION_LOCKED' || msg.type === 'SECTION_UNLOCKED') {
        refreshSectionLocks();
      }
    };

    // Listen on the document-level custom event channel used by useWebSocket hook
    window.addEventListener('ws:message', handleWsMessage);
    return () => {
      window.removeEventListener('ws:message', handleWsMessage);
    };
  }, [websiteId, refreshApprovalState, refreshSectionLocks]);

  // ---- API Actions -----------------------------------------------------------

  const requestApproval = useCallback(
    async (changeSummary) => {
      if (!websiteId) throw new Error('websiteId required');
      const res = await axios.post(
        `${API_URL}/websites/${websiteId}/approval/request`,
        { changeSummary: changeSummary?.trim() ?? '' },
        { headers: getAuthHeaders() }
      );
      await refreshApprovalState();
      return res.data;
    },
    [websiteId, getAuthHeaders, refreshApprovalState]
  );

  const reviewApproval = useCallback(
    async ({ approved, rejectionReason }) => {
      if (!websiteId) throw new Error('websiteId required');
      const res = await axios.post(
        `${API_URL}/websites/${websiteId}/approval/review`,
        {
          decision: approved ? 'approve' : 'reject',
          rejectionReason: rejectionReason?.trim() ?? undefined,
        },
        { headers: getAuthHeaders() }
      );
      await refreshApprovalState();
      return res.data;
    },
    [websiteId, getAuthHeaders, refreshApprovalState]
  );

  const publishAfterApproval = useCallback(async () => {
    if (!websiteId) throw new Error('websiteId required');
    const res = await axios.post(
      `${API_URL}/websites/${websiteId}/approval/publish`,
      null,
      { headers: getAuthHeaders() }
    );
    await refreshApprovalState();
    return res.data;
  }, [websiteId, getAuthHeaders, refreshApprovalState]);

  const emergencyPublish = useCallback(async (reason) => {
    if (!websiteId) throw new Error('websiteId required');
    const res = await axios.post(
      `${API_URL}/websites/${websiteId}/approval/emergency-publish`,
      { reason: reason?.trim() || 'Emergency publish initiated by owner' },
      { headers: getAuthHeaders() }
    );
    await refreshApprovalState();
    return res.data;
  }, [websiteId, getAuthHeaders, refreshApprovalState]);

  const revokeApproval = useCallback(async () => {
    if (!websiteId) throw new Error('websiteId required');
    const res = await axios.post(
      `${API_URL}/websites/${websiteId}/approval/revoke`,
      null,
      { headers: getAuthHeaders() }
    );
    await refreshApprovalState();
    return res.data;
  }, [websiteId, getAuthHeaders, refreshApprovalState]);

  // ---- Derived values -------------------------------------------------------

  const isApprovalRequired = useMemo(() => {
    if (!approvalState) return false;
    const state = approvalState?.workflowState ?? approvalState?.state;
    return !TERMINAL_STATES.has(state);
  }, [approvalState]);

  // ---- Return ---------------------------------------------------------------

  return {
    approvalState,
    loading,
    error,
    sectionLocks,
    requestApproval,
    reviewApproval,
    publishAfterApproval,
    emergencyPublish,
    revokeApproval,
    refreshApprovalState,
    isApprovalRequired,
  };
}

export default useApprovalWorkflow;
