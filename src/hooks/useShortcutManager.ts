/**
 * useShortcutManager — Registry-based keyboard shortcut manager (Step 9.6.1)
 *
 * Design:
 * - ShortcutRegistry: Map keyed by normalized key-combo string → shortcut entry
 * - Single global 'keydown' listener on window (delegation pattern)
 * - Platform normalization: Mac uses metaKey (Cmd), others use ctrlKey (Ctrl)
 * - Scope: 'global' always fires, 'editor' skips when focus is in input/textarea/contentEditable
 * - Conflict detection: console.warn when key already registered
 * - useRef for registry to avoid re-registering the keydown listener on every shortcut change
 *
 * Works ALONGSIDE existing useKeyboardShortcuts (undo/redo). Does NOT break it.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShortcutScope = "global" | "editor" | "modal";

export interface ShortcutEntry {
  /** Normalized key combo, e.g. 'ctrl+s', 'alt+ctrl+shift+s' */
  key: string;
  /** Callback fired when shortcut is triggered */
  action: (event: KeyboardEvent) => void;
  /** Human-readable description, e.g. 'Save changes' */
  description: string;
  /** Category for grouping in help panel: 'Editing' | 'Navigation' | 'Blocks' | 'UI' */
  category: string;
  /**
   * - 'global': always fires
   * - 'editor': skipped when focus is inside input/textarea/contentEditable
   * - 'modal': only when isModalOpen === true
   */
  scope: ShortcutScope;
}

export interface RegisterShortcutParams {
  key: string;
  action: (event: KeyboardEvent) => void;
  description: string;
  category: string;
  scope: ShortcutScope;
}

export interface UseShortcutManagerReturn {
  /** Register a new shortcut */
  registerShortcut: (params: RegisterShortcutParams) => void;
  /** Remove a registered shortcut by key combo */
  unregisterShortcut: (key: string) => void;
  /** Read-only snapshot of all registered shortcuts */
  shortcuts: ReadonlyMap<string, ShortcutEntry>;
  /** True when running on macOS */
  isMac: boolean;
}

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

const detectMac = (): boolean => {
  try {
    const platform =
      (navigator as Navigator & { userAgentData?: { platform: string } })
        .userAgentData?.platform ?? "";
    if (platform) {
      return /mac/i.test(platform);
    }
  } catch {
    // fall through
  }
  return /mac/i.test(navigator.platform);
};

// ---------------------------------------------------------------------------
// Key normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a key combo string to a canonical sorted form.
 * Examples:
 *   'Ctrl+S'         → 'ctrl+s'
 *   'Shift+Ctrl+S'   → 'ctrl+shift+s'
 *   'ctrl+shift+p'   → 'ctrl+shift+p'
 *   'Alt+Ctrl+Shift+K' → 'alt+ctrl+shift+k'
 *   'Escape'         → 'escape'
 *   'Delete'         → 'delete'
 */
export const normalizeKeyCombo = (key: string): string => {
  const MODIFIERS = ["alt", "ctrl", "meta", "shift"] as const;
  const parts = key
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());

  const modifiers = parts.filter((p) =>
    MODIFIERS.includes(p as (typeof MODIFIERS)[number]),
  );
  const nonModifiers = parts.filter(
    (p) => !MODIFIERS.includes(p as (typeof MODIFIERS)[number]),
  );

  // Sort modifiers alphabetically for dedup consistency
  modifiers.sort();

  return [...modifiers, ...nonModifiers].join("+");
};

/**
 * Build a key combo string from a KeyboardEvent for lookup.
 */
const eventToKeyCombo = (e: KeyboardEvent): string => {
  const modifiers: string[] = [];
  if (e.altKey) modifiers.push("alt");
  if (e.ctrlKey) modifiers.push("ctrl");
  if (e.metaKey) modifiers.push("meta");
  if (e.shiftKey) modifiers.push("shift");

  // Use the key value lower-cased; for special keys like 'Escape', 'Delete', etc.
  const key = e.key.toLowerCase();

  // Avoid double-counting pure modifier key presses
  if (["alt", "control", "meta", "shift"].includes(key)) {
    return modifiers.join("+");
  }

  modifiers.sort();
  return [...modifiers, key].join("+");
};

/**
 * Check whether the current active element is an editable field.
 * Mirrors the pattern from useKeyboardShortcuts.ts lines 108-118.
 */
const isEditableActive = (): boolean => {
  const target = document.activeElement as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName?.toUpperCase();
  const isContentEditable =
    target.isContentEditable === true ||
    target.getAttribute?.("contenteditable") === "true" ||
    target.getAttribute?.("contenteditable") === "";
  return tag === "INPUT" || tag === "TEXTAREA" || isContentEditable;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useShortcutManager(options?: {
  isModalOpen?: boolean;
}): UseShortcutManagerReturn {
  const isMac = detectMac();
  const isModalOpen = options?.isModalOpen ?? false;

  // Registry stored in a ref to avoid re-registering the listener on each render
  const registryRef = useRef<Map<string, ShortcutEntry>>(new Map());

  // State copy for consumers who need reactivity on the shortcuts Map
  const [shortcutsSnapshot, setShortcutsSnapshot] = useState<
    Map<string, ShortcutEntry>
  >(() => new Map());

  // Stable ref for isModalOpen
  const isModalOpenRef = useRef(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  // -------------------------------------------------------------------------
  // Register / unregister
  // -------------------------------------------------------------------------

  const registerShortcut = useCallback((params: RegisterShortcutParams) => {
    const normalizedKey = normalizeKeyCombo(params.key);

    if (registryRef.current.has(normalizedKey)) {
      const existing = registryRef.current.get(normalizedKey)!;
      console.warn(
        `[useShortcutManager] Shortcut conflict: "${normalizedKey}" already registered as "${existing.description}". ` +
          `New registration: "${params.description}" will overwrite.`,
      );
    }

    const entry: ShortcutEntry = {
      key: normalizedKey,
      action: params.action,
      description: params.description,
      category: params.category,
      scope: params.scope,
    };

    registryRef.current.set(normalizedKey, entry);
    // Update snapshot for consumers (new Map to trigger re-render)
    setShortcutsSnapshot(new Map(registryRef.current));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    const normalizedKey = normalizeKeyCombo(key);
    registryRef.current.delete(normalizedKey);
    setShortcutsSnapshot(new Map(registryRef.current));
  }, []);

  // -------------------------------------------------------------------------
  // Single keydown listener (registered once)
  // -------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const combo = eventToKeyCombo(e);
      if (!combo) return;

      const entry = registryRef.current.get(combo);
      if (!entry) return;

      // Scope checks
      if (entry.scope === "editor") {
        if (isEditableActive()) return;
      }

      if (entry.scope === "modal") {
        if (!isModalOpenRef.current) return;
      }

      // Handle the shortcut
      e.preventDefault();
      try {
        entry.action(e);
      } catch (err) {
        console.error("[useShortcutManager] Shortcut action threw:", err);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Single listener — uses refs to read current state

  return {
    registerShortcut,
    unregisterShortcut,
    shortcuts: shortcutsSnapshot,
    isMac,
  };
}
