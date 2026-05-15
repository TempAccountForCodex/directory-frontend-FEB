/**
 * useLocalStorageBackup — localStorage fallback for unsaved changes (Step 5.10)
 *
 * Saves unsaved editor data to localStorage synchronously on beforeunload,
 * detects and restores backups on editor mount, and cleans up after successful saves.
 *
 * Key format: UNSAVED_CHANGES_${websiteId}_${pageId}
 * Value: JSON { data, timestamp }
 *
 * Edge cases handled:
 * - Multiple tabs: sessionStorage flag prevents double-restore
 * - Stale data: backups older than 24h are auto-discarded
 * - Quota exceeded: catches and silently fails (data loss preferred over crash)
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BackupEntry {
  data: Record<string, unknown>;
  timestamp: number;
}

export interface UseLocalStorageBackupParams {
  /** Website ID for key scoping */
  websiteId: number | string | null;
  /** Page ID for key scoping */
  pageId: number | string | null;
  /** Current editor data to back up on beforeunload */
  currentData: Record<string, unknown>;
  /** Whether there are unsaved changes worth backing up */
  hasUnsavedChanges: boolean;
  /** Disable backup detection during initial load */
  isLoading?: boolean;
}

export interface UseLocalStorageBackupReturn {
  /** Whether a recoverable backup was found on mount */
  hasBackup: boolean;
  /** The backup entry (data + timestamp), if found */
  backupEntry: BackupEntry | null;
  /** Restore the backup (caller should apply data and mark dirty) */
  restoreBackup: () => Record<string, unknown> | null;
  /** Discard the backup */
  discardBackup: () => void;
  /** Clear backup after a successful save */
  clearBackup: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KEY_PREFIX = "UNSAVED_CHANGES";
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_RESTORE_FLAG_PREFIX = "RESTORE_CLAIMED";

// ---------------------------------------------------------------------------
// Helpers (exported for testing)
// ---------------------------------------------------------------------------

export function buildKey(
  websiteId: number | string,
  pageId: number | string,
): string {
  return `${KEY_PREFIX}_${websiteId}_${pageId}`;
}

export function buildSessionFlag(
  websiteId: number | string,
  pageId: number | string,
): string {
  return `${SESSION_RESTORE_FLAG_PREFIX}_${websiteId}_${pageId}`;
}

/**
 * Read and parse a backup entry from localStorage.
 * Returns null if missing, unparseable, or stale (>24h).
 */
export function readBackup(key: string): BackupEntry | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: BackupEntry = JSON.parse(raw);
    if (!entry || typeof entry.timestamp !== "number" || !entry.data)
      return null;

    // Discard stale backups (>24h)
    if (Date.now() - entry.timestamp > STALE_THRESHOLD_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

/**
 * Write a backup entry to localStorage. Catches quota errors silently.
 */
export function writeBackup(
  key: string,
  data: Record<string, unknown>,
): boolean {
  try {
    const entry: BackupEntry = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
    return true;
  } catch {
    // Quota exceeded or other localStorage error — fail silently
    return false;
  }
}

/**
 * Remove all stale UNSAVED_CHANGES entries from localStorage.
 */
export function cleanupStaleBackups(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const entry = JSON.parse(raw);
            if (entry && typeof entry.timestamp === "number") {
              if (Date.now() - entry.timestamp > STALE_THRESHOLD_MS) {
                keysToRemove.push(key);
              }
            }
          } catch {
            keysToRemove.push(key); // Corrupted entry
          }
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore errors during cleanup
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocalStorageBackup({
  websiteId,
  pageId,
  currentData,
  hasUnsavedChanges,
  isLoading = false,
}: UseLocalStorageBackupParams): UseLocalStorageBackupReturn {
  const [backupEntry, setBackupEntry] = useState<BackupEntry | null>(null);
  const [hasBackup, setHasBackup] = useState(false);

  // Refs for synchronous access in beforeunload
  const currentDataRef = useRef(currentData);
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  const keyRef = useRef<string | null>(null);

  // Keep refs current
  useEffect(() => {
    currentDataRef.current = currentData;
  }, [currentData]);

  useEffect(() => {
    hasUnsavedRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Compute storage key
  useEffect(() => {
    if (websiteId && pageId) {
      keyRef.current = buildKey(websiteId, pageId);
    } else {
      keyRef.current = null;
    }
  }, [websiteId, pageId]);

  // -------------------------------------------------------------------------
  // Detect backup on mount (once IDs are available and loading completes)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (isLoading || !websiteId || !pageId) return;

    const key = buildKey(websiteId, pageId);
    const sessionFlag = buildSessionFlag(websiteId, pageId);

    // Check if another tab already claimed this restore
    if (sessionStorage.getItem(sessionFlag)) {
      localStorage.removeItem(key);
      return;
    }

    const entry = readBackup(key);
    if (entry) {
      // Claim the restore for this tab
      sessionStorage.setItem(sessionFlag, "1");
      setBackupEntry(entry);
      setHasBackup(true);
    }

    // Run stale cleanup on mount
    cleanupStaleBackups();
  }, [websiteId, pageId, isLoading]);

  // -------------------------------------------------------------------------
  // beforeunload — save to localStorage synchronously
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedRef.current && keyRef.current) {
        writeBackup(keyRef.current, currentDataRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const restoreBackup = useCallback((): Record<string, unknown> | null => {
    if (!backupEntry) return null;

    const data = backupEntry.data;

    // Clear the backup from localStorage after restoring
    if (keyRef.current) {
      localStorage.removeItem(keyRef.current);
    }

    setBackupEntry(null);
    setHasBackup(false);

    return data;
  }, [backupEntry]);

  const discardBackup = useCallback(() => {
    if (keyRef.current) {
      localStorage.removeItem(keyRef.current);
    }

    // Clear session flag so future visits can detect new backups
    if (websiteId && pageId) {
      sessionStorage.removeItem(buildSessionFlag(websiteId, pageId));
    }

    setBackupEntry(null);
    setHasBackup(false);
  }, [websiteId, pageId]);

  const clearBackup = useCallback(() => {
    if (keyRef.current) {
      localStorage.removeItem(keyRef.current);
    }
  }, []);

  return {
    hasBackup,
    backupEntry,
    restoreBackup,
    discardBackup,
    clearBackup,
  };
}

export default useLocalStorageBackup;
