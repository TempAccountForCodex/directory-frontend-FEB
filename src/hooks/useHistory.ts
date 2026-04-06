/**
 * useHistory — Undo/Redo history manager hook (Step 9.2.1)
 *
 * Features:
 * - Generic typed state snapshots
 * - Max depth of 50 entries with FIFO eviction of oldest
 * - Deduplication via JSON.stringify comparison with previous snapshot
 * - useRef for the stack (no re-render on every push)
 * - useState triggers for canUndo/canRedo/description (re-render only when these change)
 * - Push after undo truncates the future branch (standard history tree behaviour)
 * - Graceful noop for undo/redo at stack boundaries
 * - sessionStorage persistence with LZ-string compression (Step 9.8.2/9.8.3)
 *   - Compressed with lz-string compressToUTF16
 *   - Max storage: 4MB compressed — FIFO eviction of oldest 10 if exceeded
 *   - QuotaExceededError caught → memory-only fallback + console.warn
 *
 * Returns: { canUndo, canRedo, undo, redo, push, clear, currentIndex, historyLength, lastActionDescription }
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { compressHistory, decompressHistory } from "../utils/historySerializer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HistorySnapshot<T> {
  state: T;
  description: string;
  timestamp: number;
}

export interface UseHistoryReturn<T> {
  /** True when index > 0 (there is a previous state to go back to) */
  canUndo: boolean;
  /** True when index < historyLength - 1 (there is a next state to go forward to) */
  canRedo: boolean;
  /** Go back one step — returns the restored state (or current state if at start, undefined if empty) */
  undo: () => T | undefined;
  /** Go forward one step — returns the restored state (or current state if at end, undefined if empty) */
  redo: () => T | undefined;
  /** Add a new snapshot; skipped if state is identical to current (JSON comparison) */
  push: (state: T, description: string) => void;
  /** Reset the entire history stack */
  clear: () => void;
  /** Current position in the stack (-1 when empty) */
  currentIndex: number;
  /** Total number of snapshots in the stack */
  historyLength: number;
  /** Human-readable description of the snapshot at currentIndex */
  lastActionDescription: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY_DEPTH = 50;
const SESSION_KEY = "undo_redo_history";

/** 4MB in bytes — sessionStorage limit for compressed history */
const MAX_COMPRESSED_BYTES = 4 * 1024 * 1024;

/** Number of oldest entries to evict when storage limit is exceeded */
const EVICTION_COUNT = 10;

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

/**
 * Persist the history stack + currentIndex to sessionStorage using LZ-string
 * compression. Handles:
 * - 4MB cap: if compressed size exceeds limit, evict oldest EVICTION_COUNT entries
 * - QuotaExceededError: log warning, fall through gracefully (memory-only mode)
 */
function persistToStorage<T>(stack: HistorySnapshot<T>[], index: number): void {
  try {
    const payload = { stack, index };
    let compressed = compressHistory(payload);

    if (compressed === null) {
      console.warn(
        "[useHistory] Failed to compress history for storage — memory-only mode.",
        { actionCount: stack.length },
      );
      return;
    }

    // Check 4MB cap. UTF-16 strings: each char is 2 bytes in memory, but
    // sessionStorage stores as UTF-16 — use length * 2 as byte estimate.
    const estimatedBytes = compressed.length * 2;

    if (estimatedBytes > MAX_COMPRESSED_BYTES) {
      // Evict oldest EVICTION_COUNT entries (FIFO)
      const evicted = stack.slice(EVICTION_COUNT);
      const newIndex = Math.max(0, index - EVICTION_COUNT);

      console.warn(
        "[useHistory] Compressed history exceeded 4MB cap — evicting oldest entries.",
        {
          evictedCount: EVICTION_COUNT,
          remaining: evicted.length,
          estimatedBytes,
        },
      );

      compressed = compressHistory({ stack: evicted, index: newIndex });

      if (compressed === null) {
        console.warn(
          "[useHistory] Post-eviction compression failed — memory-only mode.",
        );
        return;
      }
    }

    // Log history size and action count on each save attempt (Dev requirement)
    console.warn("[useHistory] Persisting history to sessionStorage.", {
      actionCount: stack.length,
      compressedChars: compressed.length,
    });

    sessionStorage.setItem(SESSION_KEY, compressed);
  } catch (err: unknown) {
    // QuotaExceededError or other storage error — fall back to memory-only
    const errorName = err instanceof Error ? err.name : String(err);
    console.warn(
      "[useHistory] sessionStorage.setItem failed — history may not persist across refreshes (storage full).",
      { error: errorName },
    );
  }
}

/**
 * Load history from sessionStorage on mount.
 * Returns { stack, index } or null if not found / decompression failed.
 */
function loadFromStorage<T>(): {
  stack: HistorySnapshot<T>[];
  index: number;
} | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const restored = decompressHistory(stored) as {
      stack: HistorySnapshot<T>[];
      index: number;
    } | null;
    if (!restored || !Array.isArray(restored.stack)) return null;

    return restored;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useHistory<T>()
 *
 * Generic undo/redo history hook.
 * Uses useRef for the snapshot stack to avoid triggering re-renders on every
 * push. Exposes only derived boolean flags and description via useState so
 * consumers re-render only when those change.
 *
 * Persistence: history is compressed and saved to sessionStorage on every
 * mutation. Restored on mount. 4MB cap with FIFO eviction.
 */
export function useHistory<T>(): UseHistoryReturn<T> {
  // Stack stored in ref — avoids unnecessary re-renders on push
  const stackRef = useRef<HistorySnapshot<T>[]>([]);
  const indexRef = useRef<number>(-1);

  // Reactive state — only these trigger re-renders
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [historyLength, setHistoryLength] = useState<number>(0);
  const [lastActionDescription, setLastActionDescription] =
    useState<string>("");

  // ---------------------------------------------------------------------------
  // Restore from sessionStorage on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const saved = loadFromStorage<T>();
    if (saved && saved.stack.length > 0) {
      stackRef.current = saved.stack;
      indexRef.current = saved.index;
      // Sync reactive state from restored values
      const idx = saved.index;
      const len = saved.stack.length;
      setCanUndo(idx > 0);
      setCanRedo(idx < len - 1);
      setCurrentIndex(idx);
      setHistoryLength(len);
      setLastActionDescription(
        idx >= 0 && saved.stack[idx] ? saved.stack[idx].description : "",
      );
    }
    // Empty dependency array — run once on mount only
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Sync reactive state from current ref values.
   * Called after every mutation to the stack/index.
   */
  const syncState = useCallback(() => {
    const idx = indexRef.current;
    const len = stackRef.current.length;
    setCanUndo(idx > 0);
    setCanRedo(idx < len - 1);
    setCurrentIndex(idx);
    setHistoryLength(len);
    setLastActionDescription(
      idx >= 0 && stackRef.current[idx]
        ? stackRef.current[idx].description
        : "",
    );
  }, []);

  /**
   * push(state, description)
   * Adds a snapshot to the stack at current index + 1, truncating any
   * future branch first. Skips if state is JSON-identical to current snapshot.
   * Evicts oldest entry when stack exceeds MAX_HISTORY_DEPTH.
   */
  const push = useCallback(
    (state: T, description: string) => {
      const stack = stackRef.current;
      const idx = indexRef.current;

      // Deduplication: skip if identical to the snapshot at current index
      if (idx >= 0 && stack[idx]) {
        try {
          if (JSON.stringify(stack[idx].state) === JSON.stringify(state)) {
            return;
          }
        } catch {
          // If serialisation fails, allow the push
        }
      }

      // Truncate future branch (any snapshots after current index)
      const newStack = stack.slice(0, idx + 1);
      newStack.push({ state, description, timestamp: Date.now() });

      // Enforce max depth — evict oldest entries (FIFO)
      let newIndex = newStack.length - 1;
      if (newStack.length > MAX_HISTORY_DEPTH) {
        const overflow = newStack.length - MAX_HISTORY_DEPTH;
        newStack.splice(0, overflow);
        newIndex = newStack.length - 1;
      }

      stackRef.current = newStack;
      indexRef.current = newIndex;
      syncState();

      // Persist to sessionStorage (best-effort — errors handled internally)
      persistToStorage(newStack, newIndex);
    },
    [syncState],
  );

  /**
   * undo()
   * Moves index back by 1 and returns the state at the new index.
   * Noop (returns current state) if already at index 0.
   * Returns undefined if stack is empty.
   */
  const undo = useCallback((): T | undefined => {
    const stack = stackRef.current;
    const idx = indexRef.current;

    if (stack.length === 0) {
      return undefined;
    }
    if (idx <= 0) {
      // Already at start — return current state unchanged
      return stack[0]?.state;
    }
    const newIndex = idx - 1;
    indexRef.current = newIndex;
    syncState();

    // Persist updated index position
    persistToStorage(stack, newIndex);

    return stack[newIndex].state;
  }, [syncState]);

  /**
   * redo()
   * Moves index forward by 1 and returns the state at the new index.
   * Noop (returns current state) if already at the end.
   * Returns undefined if stack is empty.
   */
  const redo = useCallback((): T | undefined => {
    const stack = stackRef.current;
    const idx = indexRef.current;

    if (stack.length === 0) {
      return undefined;
    }
    if (idx >= stack.length - 1) {
      // Already at end — return current state unchanged
      return stack[idx]?.state;
    }
    const newIndex = idx + 1;
    indexRef.current = newIndex;
    syncState();

    // Persist updated index position
    persistToStorage(stack, newIndex);

    return stack[newIndex].state;
  }, [syncState]);

  /**
   * clear()
   * Empties the stack and resets all state.
   */
  const clear = useCallback(() => {
    stackRef.current = [];
    indexRef.current = -1;
    syncState();

    // Remove persisted history from sessionStorage
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors on clear
    }
  }, [syncState]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    push,
    clear,
    currentIndex,
    historyLength,
    lastActionDescription,
  };
}
