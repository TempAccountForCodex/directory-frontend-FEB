/**
 * useKeyboardShortcuts — Keyboard shortcuts for Undo/Redo (Step 9.2.3)
 *
 * Registers:
 * - Ctrl+Z / Cmd+Z  → undo
 * - Ctrl+Shift+Z / Cmd+Shift+Z → redo
 * - Ctrl+Y → redo (Windows convention)
 *
 * Behaviour:
 * - Does NOT intercept when focus is inside input / textarea / contentEditable
 * - Calls e.preventDefault() when a shortcut is handled (blocks browser undo)
 * - Fires a MUI Snackbar-compatible toast: { toastOpen, toastMessage, closeToast }
 * - Detects Mac via navigator.platform / navigator.userAgentData
 * - Cleans up event listener on unmount
 *
 * Returns { isMac, toastOpen, toastMessage, closeToast }
 */

import { useEffect, useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseKeyboardShortcutsParams {
  onUndo: () => void;
  onRedo: () => void;
  enabled: boolean;
  /** Current action description (used in toast: 'Undone: <description>') */
  undoDescription?: string;
  /** Redo description for toast (optional) */
  redoDescription?: string;
}

export interface UseKeyboardShortcutsReturn {
  /** True when running on macOS */
  isMac: boolean;
  /** Whether the toast notification is visible */
  toastOpen: boolean;
  /** The message shown in the toast */
  toastMessage: string;
  /** Call to close the toast */
  closeToast: () => void;
}

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

const detectMac = (): boolean => {
  try {
    // Modern API
    const platform = (navigator as any).userAgentData?.platform ?? "";
    if (platform) {
      return /mac/i.test(platform);
    }
  } catch {
    // Ignore — fall through to navigator.platform
  }
  return /mac/i.test(navigator.platform);
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  enabled,
  undoDescription = "",
  redoDescription = "",
}: UseKeyboardShortcutsParams): UseKeyboardShortcutsReturn {
  const isMac = detectMac();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Keep refs to callbacks to avoid stale closures in the event handler
  const onUndoRef = useRef(onUndo);
  const onRedoRef = useRef(onRedo);
  const undoDescRef = useRef(undoDescription);
  const redoDescRef = useRef(redoDescription);
  const enabledRef = useRef(enabled);

  // Sync refs when props change
  onUndoRef.current = onUndo;
  onRedoRef.current = onRedo;
  undoDescRef.current = undoDescription;
  redoDescRef.current = redoDescription;
  enabledRef.current = enabled;

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  }, []);

  const closeToast = useCallback(() => {
    setToastOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if disabled
      if (!enabledRef.current) return;

      // Skip if focus is inside an input, textarea, or contentEditable element
      const target = document.activeElement as HTMLElement | null;
      if (target) {
        const tag = target.tagName?.toUpperCase();
        const isEditable =
          target.isContentEditable === true ||
          target.getAttribute?.("contenteditable") === "true" ||
          target.getAttribute?.("contenteditable") === "";
        if (tag === "INPUT" || tag === "TEXTAREA" || isEditable) {
          return;
        }
      }

      const isZ = e.key === "z" || e.key === "Z";
      const isY = e.key === "y" || e.key === "Y";
      const modifier = e.ctrlKey || e.metaKey;

      if (!modifier) return;

      // Ctrl+Shift+Z / Cmd+Shift+Z → redo
      if (isZ && e.shiftKey) {
        e.preventDefault();
        try {
          onRedoRef.current();
        } catch {
          // Gracefully handle callback errors
        }
        const desc = redoDescRef.current;
        showToast(desc ? `Redone: ${desc}` : "Redone");
        return;
      }

      // Ctrl+Z / Cmd+Z → undo
      if (isZ && !e.shiftKey) {
        e.preventDefault();
        try {
          onUndoRef.current();
        } catch {
          // Gracefully handle callback errors
        }
        const desc = undoDescRef.current;
        showToast(desc ? `Undone: ${desc}` : "Undone");
        return;
      }

      // Ctrl+Y → redo (Windows convention — no metaKey variant)
      if (isY && e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        try {
          onRedoRef.current();
        } catch {
          // Gracefully handle callback errors
        }
        const desc = redoDescRef.current;
        showToast(desc ? `Redone: ${desc}` : "Redone");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty deps — uses refs to avoid re-registering

  return {
    isMac,
    toastOpen,
    toastMessage,
    closeToast,
  };
}
