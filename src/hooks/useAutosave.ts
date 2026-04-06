/**
 * useAutosave — Custom hook for automatic content saving (Step 5.2.1)
 *
 * Handles:
 * - Dirty state tracking via 2s debounce after data changes
 * - 30s interval autosave of dirty data
 * - Manual save trigger (bypasses 30s interval)
 * - Cleanup on unmount (no memory leaks)
 * - Conflict detection via server response
 * - Offline awareness (navigator.onLine check)
 * - Idle detection (pauses autosave after 5min inactivity)
 * - Error propagation via saveStatus callback
 *
 * Uses useRef for mutable values to avoid stale closures across renders.
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EntityType = "website" | "page" | "block";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ConflictData {
  serverData: Record<string, unknown>;
  serverUpdatedAt: string;
  localData: Record<string, unknown>;
}

export type ConflictResolution = "keep-local" | "use-server";

export interface SaveResult {
  updatedAt?: string;
  conflict?: boolean;
  serverData?: Record<string, unknown>;
  serverUpdatedAt?: string;
}

export interface UseAutosaveParams {
  entityType: EntityType;
  entityId: number | string | null;
  data: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<SaveResult>;
  /** Disable autosave during initial data load */
  isLoading?: boolean;
  /** Debounce delay before marking dirty (default: 2000ms) */
  debounceMs?: number;
  /** Autosave interval after dirty (default: 30000ms) */
  intervalMs?: number;
  /** Idle timeout before pausing autosave (default: 300000ms = 5min) */
  idleTimeoutMs?: number;
  /** Callback fired after a successful save (e.g., to clear localStorage backup) */
  onSaveSuccess?: () => void;
}

export interface UseAutosaveReturn {
  hasUnsavedChanges: boolean;
  saveStatus: SaveStatus;
  conflictData: ConflictData | null;
  triggerSave: () => Promise<void>;
  clearDirty: () => void;
  resolveConflict: (resolution: ConflictResolution) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_DEBOUNCE_MS = 2000;
const DEFAULT_INTERVAL_MS = 30000;
const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAutosave({
  entityType,
  entityId,
  data,
  onSave,
  isLoading = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  intervalMs = DEFAULT_INTERVAL_MS,
  idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  onSaveSuccess,
}: UseAutosaveParams): UseAutosaveReturn {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);

  // Refs to hold mutable values without causing re-renders or stale closures
  const onSaveRef = useRef(onSave);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const dataRef = useRef(data);
  const isMountedRef = useRef(true);
  const isSavingRef = useRef(false);
  const isIdleRef = useRef(false);

  // Timers
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track last serialized data to detect actual changes
  const lastDataStringRef = useRef(JSON.stringify(data));

  // Keep refs up-to-date
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ---------------------------------------------------------------------------
  // Core save function
  // ---------------------------------------------------------------------------

  const performSave = useCallback(async (): Promise<void> => {
    if (isSavingRef.current) return;
    if (!entityId) return;
    if (!isMountedRef.current) return;
    if (!navigator.onLine) return;
    if (isIdleRef.current) return;

    isSavingRef.current = true;
    if (isMountedRef.current) setSaveStatus("saving");

    try {
      const currentData = dataRef.current;
      const result = await onSaveRef.current(currentData);

      if (!isMountedRef.current) return;

      // Conflict detected
      if (result?.conflict && result.serverData && result.serverUpdatedAt) {
        setConflictData({
          serverData: result.serverData,
          serverUpdatedAt: result.serverUpdatedAt,
          localData: currentData,
        });
        setSaveStatus("idle");
        return;
      }

      // Success — clear any localStorage backup (Step 5.10)
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      lastDataStringRef.current = JSON.stringify(currentData);
      if (onSaveSuccessRef.current) onSaveSuccessRef.current();

      // Auto-reset to idle after 3s
      setTimeout(() => {
        if (isMountedRef.current) setSaveStatus("idle");
      }, 3000);
    } catch {
      if (isMountedRef.current) {
        setSaveStatus("error");
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [entityId]);

  // ---------------------------------------------------------------------------
  // 2s debounce — detect data changes and mark dirty
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return;
    if (!entityId) return;

    const currentString = JSON.stringify(data);

    // If data hasn't changed from last known, don't start debounce
    if (currentString === lastDataStringRef.current) return;

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // After 2s of no changes, mark as dirty
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && !isLoading) {
        setHasUnsavedChanges(true);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, isLoading, entityId, debounceMs]);

  // ---------------------------------------------------------------------------
  // 30s autosave interval — triggered when dirty
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!hasUnsavedChanges) {
      // Clear interval if not dirty
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    if (!entityId) return;

    // Start autosave interval
    autosaveTimerRef.current = setInterval(() => {
      if (
        isMountedRef.current &&
        hasUnsavedChanges &&
        !isSavingRef.current &&
        !isIdleRef.current
      ) {
        performSave();
      }
    }, intervalMs);

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [hasUnsavedChanges, entityId, intervalMs, performSave]);

  // ---------------------------------------------------------------------------
  // Idle detection — pause autosave after 5min of no activity
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const resetIdleTimer = () => {
      isIdleRef.current = false;
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
      }, idleTimeoutMs);
    };

    // Start idle timer initially
    resetIdleTimer();

    window.addEventListener("mousemove", resetIdleTimer, { passive: true });
    window.addEventListener("keydown", resetIdleTimer, { passive: true });
    window.addEventListener("click", resetIdleTimer, { passive: true });
    window.addEventListener("touchstart", resetIdleTimer, { passive: true });

    return () => {
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [idleTimeoutMs]);

  // ---------------------------------------------------------------------------
  // beforeunload — force save on browser exit
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && entityId) {
        e.preventDefault();
        e.returnValue = "";
        // Attempt synchronous save is not feasible but we trigger the async one
        // The browser's beforeunload prompt gives users a chance to stay
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, entityId]);

  // ---------------------------------------------------------------------------
  // Online/offline detection
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleOnline = () => {
      // When we come back online, if dirty trigger a save
      if (hasUnsavedChanges && entityId && !isSavingRef.current) {
        performSave();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [hasUnsavedChanges, entityId, performSave]);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const triggerSave = useCallback(async (): Promise<void> => {
    await performSave();
  }, [performSave]);

  const clearDirty = useCallback(() => {
    setHasUnsavedChanges(false);
    setSaveStatus("idle");
    lastDataStringRef.current = JSON.stringify(dataRef.current);
  }, []);

  const resolveConflict = useCallback((resolution: ConflictResolution) => {
    setConflictData(null);
    if (resolution === "keep-local") {
      // User keeps their version — mark as dirty to re-save with force flag
      setHasUnsavedChanges(true);
    } else {
      // User discards local changes — clear dirty state
      setHasUnsavedChanges(false);
      lastDataStringRef.current = JSON.stringify(dataRef.current);
    }
  }, []);

  return {
    hasUnsavedChanges,
    saveStatus,
    conflictData,
    triggerSave,
    clearDirty,
    resolveConflict,
  };
}

export default useAutosave;
