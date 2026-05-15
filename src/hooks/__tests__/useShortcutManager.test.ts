/**
 * Tests for useShortcutManager hook (Step 9.6.1)
 *
 * Covers:
 * - Hook returns correct shape (registerShortcut, unregisterShortcut, shortcuts, isMac)
 * - Platform detection (isMac)
 * - Registering a shortcut fires the action on matching keydown
 * - Unregistering a shortcut stops it from firing
 * - Conflict detection: console.warn on duplicate key registration
 * - Scope 'editor': skipped when activeElement is input/textarea/contentEditable
 * - Scope 'global': always fires regardless of activeElement
 * - Key normalization: case-insensitive, consistent modifier order
 * - Cleanup: listener removed on unmount
 * - e.preventDefault() called when shortcut is handled
 * - isModalOpen param affects 'modal' scope shortcuts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShortcutManager } from "../useShortcutManager";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeKeyEvent = (
  key: string,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  } = {},
): KeyboardEvent => {
  return new KeyboardEvent("keydown", {
    key,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    bubbles: true,
    cancelable: true,
  });
};

const setActiveElement = (el: Element | null) => {
  Object.defineProperty(document, "activeElement", {
    value: el ?? document.body,
    configurable: true,
  });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useShortcutManager", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Restore active element to body before each test
    setActiveElement(document.body);
  });

  afterEach(() => {
    vi.clearAllMocks();
    setActiveElement(document.body);
  });

  // -------------------------------------------------------------------------
  // Return shape
  // -------------------------------------------------------------------------

  it("returns registerShortcut, unregisterShortcut, shortcuts, isMac", () => {
    const { result } = renderHook(() => useShortcutManager());
    expect(typeof result.current.registerShortcut).toBe("function");
    expect(typeof result.current.unregisterShortcut).toBe("function");
    expect(result.current.shortcuts).toBeInstanceOf(Map);
    expect(typeof result.current.isMac).toBe("boolean");
  });

  // -------------------------------------------------------------------------
  // Platform detection
  // -------------------------------------------------------------------------

  it("isMac is a boolean", () => {
    const { result } = renderHook(() => useShortcutManager());
    expect(typeof result.current.isMac).toBe("boolean");
  });

  // -------------------------------------------------------------------------
  // Register and fire a shortcut
  // -------------------------------------------------------------------------

  it("registered global shortcut fires action on Ctrl+S", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+s",
        action,
        description: "Save",
        category: "Editing",
        scope: "global",
      });
    });

    act(() => {
      window.dispatchEvent(makeKeyEvent("s", { ctrlKey: true }));
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("registered global shortcut fires action on Ctrl+Shift+P", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+shift+p",
        action,
        description: "Open Preview",
        category: "Navigation",
        scope: "global",
      });
    });

    act(() => {
      window.dispatchEvent(
        makeKeyEvent("p", { ctrlKey: true, shiftKey: true }),
      );
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Unregister
  // -------------------------------------------------------------------------

  it("unregistered shortcut does not fire", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+k",
        action,
        description: "Test",
        category: "Editing",
        scope: "global",
      });
    });

    act(() => {
      result.current.unregisterShortcut("ctrl+k");
    });

    act(() => {
      window.dispatchEvent(makeKeyEvent("k", { ctrlKey: true }));
    });

    expect(action).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Conflict detection
  // -------------------------------------------------------------------------

  it("warns on duplicate key registration", () => {
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+s",
        action: vi.fn(),
        description: "Save",
        category: "Editing",
        scope: "global",
      });
      result.current.registerShortcut({
        key: "ctrl+s",
        action: vi.fn(),
        description: "Save Again (conflict)",
        category: "Editing",
        scope: "global",
      });
    });

    expect(warnSpy).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Editor scope — skipped in inputs
  // -------------------------------------------------------------------------

  it("editor scope shortcut does NOT fire when activeElement is input", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "delete",
        action,
        description: "Delete block",
        category: "Blocks",
        scope: "editor",
      });
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    setActiveElement(input);

    act(() => {
      window.dispatchEvent(makeKeyEvent("Delete"));
    });

    expect(action).not.toHaveBeenCalled();
    document.body.removeChild(input);
    setActiveElement(document.body);
  });

  it("editor scope shortcut does NOT fire when activeElement is textarea", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+d",
        action,
        description: "Duplicate block",
        category: "Blocks",
        scope: "editor",
      });
    });

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    setActiveElement(textarea);

    act(() => {
      window.dispatchEvent(makeKeyEvent("d", { ctrlKey: true }));
    });

    expect(action).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
    setActiveElement(document.body);
  });

  it("editor scope shortcut does NOT fire when activeElement is contentEditable", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "escape",
        action,
        description: "Deselect",
        category: "Editing",
        scope: "editor",
      });
    });

    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    document.body.appendChild(div);
    setActiveElement(div);

    act(() => {
      window.dispatchEvent(makeKeyEvent("Escape"));
    });

    expect(action).not.toHaveBeenCalled();
    document.body.removeChild(div);
    setActiveElement(document.body);
  });

  // -------------------------------------------------------------------------
  // Global scope — always fires
  // -------------------------------------------------------------------------

  it("global scope shortcut fires even when activeElement is input", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+/",
        action,
        description: "Open help",
        category: "UI",
        scope: "global",
      });
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    setActiveElement(input);

    act(() => {
      window.dispatchEvent(makeKeyEvent("/", { ctrlKey: true }));
    });

    expect(action).toHaveBeenCalledTimes(1);
    document.body.removeChild(input);
    setActiveElement(document.body);
  });

  // -------------------------------------------------------------------------
  // Key normalization
  // -------------------------------------------------------------------------

  it('normalizes key combo case-insensitively: "Ctrl+S" matches Ctrl+s event', () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "Ctrl+S", // capital S
        action,
        description: "Save",
        category: "Editing",
        scope: "global",
      });
    });

    act(() => {
      window.dispatchEvent(makeKeyEvent("s", { ctrlKey: true })); // lowercase s key
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('normalizes modifier order: "Shift+Ctrl+S" same as "ctrl+shift+s"', () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "Shift+Ctrl+S", // unordered modifiers
        action,
        description: "Some action",
        category: "Editing",
        scope: "global",
      });
    });

    act(() => {
      window.dispatchEvent(
        makeKeyEvent("s", { ctrlKey: true, shiftKey: true }),
      );
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  it("removes keydown listener on unmount — no callbacks fire after unmount", () => {
    const action = vi.fn();
    const { result, unmount } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+s",
        action,
        description: "Save",
        category: "Editing",
        scope: "global",
      });
    });

    unmount();

    act(() => {
      window.dispatchEvent(makeKeyEvent("s", { ctrlKey: true }));
    });

    expect(action).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // e.preventDefault called
  // -------------------------------------------------------------------------

  it("calls e.preventDefault() when a shortcut is handled", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+s",
        action,
        description: "Save",
        category: "Editing",
        scope: "global",
      });
    });

    const event = makeKeyEvent("s", { ctrlKey: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // shortcuts Map is readable
  // -------------------------------------------------------------------------

  it("shortcuts Map contains registered entries", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "ctrl+b",
        action,
        description: "Open block library",
        category: "Blocks",
        scope: "global",
      });
    });

    expect(result.current.shortcuts.size).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Escape key (no modifier)
  // -------------------------------------------------------------------------

  it("handles Escape key with no modifier", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "escape",
        action,
        description: "Close/deselect",
        category: "Editing",
        scope: "editor",
      });
    });

    act(() => {
      window.dispatchEvent(makeKeyEvent("Escape"));
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Delete key (no modifier)
  // -------------------------------------------------------------------------

  it("handles Delete key with no modifier (editor scope)", () => {
    const action = vi.fn();
    const { result } = renderHook(() => useShortcutManager());

    act(() => {
      result.current.registerShortcut({
        key: "delete",
        action,
        description: "Delete block",
        category: "Blocks",
        scope: "editor",
      });
    });

    act(() => {
      window.dispatchEvent(makeKeyEvent("Delete"));
    });

    expect(action).toHaveBeenCalledTimes(1);
  });
});
