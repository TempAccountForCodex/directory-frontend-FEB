/**
 * useUnsavedChanges — Custom hook for unsaved changes warning (Step 5.5.1 + 5.5.2)
 *
 * Handles:
 * - beforeunload listener to prevent tab close when dirty (standalone mode)
 * - React Router useBlocker to intercept client-side navigation
 * - Dialog state management for confirmation UI
 * - Save-before-leave callback integration
 * - Manual override via setUnsavedChanges
 * - Coordinates with useAutosave when skipBeforeUnload=true
 *
 * Usage (standalone):
 *   const { showDialog, confirmNavigation, cancelNavigation, saveAndNavigate } =
 *     useUnsavedChanges({ hasUnsavedChanges: isDirty, onSaveBeforeLeave: save });
 *
 * Usage (with useAutosave — pass skipBeforeUnload since useAutosave handles it):
 *   const { hasUnsavedChanges, triggerSave } = useAutosave({ ... });
 *   const unsaved = useUnsavedChanges({
 *     hasUnsavedChanges,
 *     onSaveBeforeLeave: triggerSave,
 *     skipBeforeUnload: true,  // useAutosave already handles beforeunload
 *   });
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useBlocker } from "react-router-dom";
import type { SaveStatus } from "./useAutosave";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseUnsavedChangesParams {
  /** Whether there are currently unsaved changes */
  hasUnsavedChanges: boolean;
  /** Optional callback to save data before navigating away */
  onSaveBeforeLeave?: () => Promise<void>;
  /**
   * Skip registering the beforeunload listener.
   * Set to true when used alongside useAutosave (which already handles beforeunload).
   */
  skipBeforeUnload?: boolean;
  /**
   * Current save status from useAutosave.
   * When 'saved', the hook tracks the timestamp to avoid blocking
   * navigation within 5s of a successful save.
   */
  saveStatus?: SaveStatus;
}

export interface UseUnsavedChangesReturn {
  /** Whether navigation is currently blocked */
  isBlocked: boolean;
  /** Whether the confirmation dialog should be shown */
  showDialog: boolean;
  /** Proceed with navigation (discard changes) */
  confirmNavigation: () => void;
  /** Cancel navigation (stay on page) */
  cancelNavigation: () => void;
  /** Save changes then proceed with navigation */
  saveAndNavigate: () => Promise<void>;
  /** Manual override for unsaved changes state */
  setUnsavedChanges: (value: boolean) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Don't block navigation if a save completed within this window */
const RECENTLY_SAVED_THRESHOLD_MS = 5000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUnsavedChanges({
  hasUnsavedChanges,
  onSaveBeforeLeave,
  skipBeforeUnload = false,
  saveStatus,
}: UseUnsavedChangesParams): UseUnsavedChangesReturn {
  // Manual override state
  const [manualDirty, setManualDirty] = useState<boolean | null>(null);

  // Track recently saved timestamp
  const lastSavedAtRef = useRef<number>(0);

  // Guard against double-proceed calls
  const proceedingRef = useRef(false);

  // Track save status changes
  useEffect(() => {
    if (saveStatus === "saved") {
      lastSavedAtRef.current = Date.now();
    }
  }, [saveStatus]);

  // Compute effective dirty state
  const effectiveDirty = useMemo(() => {
    if (manualDirty !== null) return manualDirty;
    return hasUnsavedChanges;
  }, [manualDirty, hasUnsavedChanges]);

  // Reset manual override when external hasUnsavedChanges changes
  useEffect(() => {
    setManualDirty(null);
  }, [hasUnsavedChanges]);

  // -------------------------------------------------------------------------
  // beforeunload listener (standalone mode only)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (skipBeforeUnload || !effectiveDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [effectiveDirty, skipBeforeUnload]);

  // -------------------------------------------------------------------------
  // React Router useBlocker
  // -------------------------------------------------------------------------
  const shouldBlock = useCallback(
    ({
      currentLocation,
      nextLocation,
    }: {
      currentLocation: any;
      nextLocation: any;
    }) => {
      // Don't block same-location navigation
      if (currentLocation.pathname === nextLocation.pathname) {
        return false;
      }

      // Don't block if recently saved (within 5s)
      if (lastSavedAtRef.current > 0) {
        const elapsed = Date.now() - lastSavedAtRef.current;
        if (elapsed < RECENTLY_SAVED_THRESHOLD_MS) {
          return false;
        }
      }

      return effectiveDirty;
    },
    [effectiveDirty],
  );

  const blocker = useBlocker(shouldBlock);

  // Reset proceeding guard when blocker state changes
  useEffect(() => {
    if (blocker.state !== "blocked") {
      proceedingRef.current = false;
    }
  }, [blocker.state]);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const isBlocked = blocker.state === "blocked";
  const showDialog = blocker.state === "blocked";

  // -------------------------------------------------------------------------
  // Navigation actions
  // -------------------------------------------------------------------------
  const confirmNavigation = useCallback(() => {
    if (blocker.state !== "blocked") return;
    if (proceedingRef.current) return;
    proceedingRef.current = true;
    blocker.proceed();
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state !== "blocked") return;
    blocker.reset();
  }, [blocker]);

  const saveAndNavigate = useCallback(async () => {
    if (onSaveBeforeLeave) {
      try {
        await onSaveBeforeLeave();
      } catch {
        // Save failed but user chose to leave — proceed anyway
      }
    }

    if (blocker.state === "blocked") {
      if (!proceedingRef.current) {
        proceedingRef.current = true;
        blocker.proceed();
      }
    }
  }, [blocker, onSaveBeforeLeave]);

  // -------------------------------------------------------------------------
  // Manual override
  // -------------------------------------------------------------------------
  const setUnsavedChanges = useCallback((value: boolean) => {
    setManualDirty(value);
  }, []);

  return {
    isBlocked,
    showDialog,
    confirmNavigation,
    cancelNavigation,
    saveAndNavigate,
    setUnsavedChanges,
  };
}

export default useUnsavedChanges;
