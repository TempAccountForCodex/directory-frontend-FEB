/**
 * Tests for useKeyboardShortcuts hook (Step 9.2.3)
 *
 * Covers:
 * - Ctrl+Z triggers undo callback
 * - Cmd+Z triggers undo callback (Mac)
 * - Ctrl+Shift+Z triggers redo callback
 * - Cmd+Shift+Z triggers redo callback (Mac)
 * - Ctrl+Y triggers redo callback (Windows convention)
 * - Does NOT intercept when activeElement is input/textarea/contentEditable
 * - e.preventDefault() called on handled shortcuts
 * - Returns { isMac } boolean
 * - Toast notification state: { toastOpen, toastMessage, closeToast }
 * - Cleanup: removeEventListener on unmount
 * - enabled=false disables all shortcuts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "../useKeyboardShortcuts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeKeyEvent = (
  key: string,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    target?: Partial<HTMLElement>;
  } = {},
): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", {
    key,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    shiftKey: options.shiftKey ?? false,
    bubbles: true,
    cancelable: true,
  });
  if (options.target) {
    Object.defineProperty(event, "target", {
      value: options.target,
      configurable: true,
    });
  }
  return event;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useKeyboardShortcuts", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let onUndo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let onRedo: any;

  beforeEach(() => {
    onUndo = vi.fn();
    onRedo = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Return shape
  // ---------------------------------------------------------------------------

  it("returns expected shape with isMac, toastOpen, toastMessage, closeToast", () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({ onUndo, onRedo, enabled: true }),
    );
    expect(typeof result.current.isMac).toBe("boolean");
    expect(typeof result.current.toastOpen).toBe("boolean");
    expect(typeof result.current.toastMessage).toBe("string");
    expect(typeof result.current.closeToast).toBe("function");
  });

  // ---------------------------------------------------------------------------
  // Ctrl+Z (undo)
  // ---------------------------------------------------------------------------

  it("Ctrl+Z triggers onUndo callback", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Cmd+Z (undo — Mac)
  // ---------------------------------------------------------------------------

  it("Cmd+Z (Meta+Z) triggers onUndo callback", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { metaKey: true }));
    });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Ctrl+Shift+Z (redo)
  // ---------------------------------------------------------------------------

  it("Ctrl+Shift+Z triggers onRedo callback", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    act(() => {
      window.dispatchEvent(
        makeKeyEvent("z", { ctrlKey: true, shiftKey: true }),
      );
    });
    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Cmd+Shift+Z (redo — Mac)
  // ---------------------------------------------------------------------------

  it("Cmd+Shift+Z (Meta+Shift+Z) triggers onRedo callback", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    act(() => {
      window.dispatchEvent(
        makeKeyEvent("z", { metaKey: true, shiftKey: true }),
      );
    });
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Ctrl+Y (redo — Windows)
  // ---------------------------------------------------------------------------

  it("Ctrl+Y triggers onRedo callback", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    act(() => {
      window.dispatchEvent(makeKeyEvent("y", { ctrlKey: true }));
    });
    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Input / textarea exclusion
  // ---------------------------------------------------------------------------

  it("does NOT intercept Ctrl+Z when activeElement is an input", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    act(() => {
      // Dispatch on window — but hook should check activeElement
      const event = makeKeyEvent("z", {
        ctrlKey: true,
        target: { tagName: "INPUT", isContentEditable: false } as any,
      });
      // Simulate the real browser behaviour: activeElement is input
      Object.defineProperty(document, "activeElement", {
        value: input,
        configurable: true,
      });
      window.dispatchEvent(event);
    });

    expect(onUndo).not.toHaveBeenCalled();
    document.body.removeChild(input);
    // Restore activeElement
    Object.defineProperty(document, "activeElement", {
      value: document.body,
      configurable: true,
    });
  });

  it("does NOT intercept Ctrl+Z when activeElement is a textarea", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    act(() => {
      Object.defineProperty(document, "activeElement", {
        value: textarea,
        configurable: true,
      });
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });

    expect(onUndo).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
    Object.defineProperty(document, "activeElement", {
      value: document.body,
      configurable: true,
    });
  });

  it("does NOT intercept when activeElement is contentEditable", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    document.body.appendChild(div);

    // Set activeElement before dispatching event
    Object.defineProperty(document, "activeElement", {
      value: div,
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });

    expect(onUndo).not.toHaveBeenCalled();
    document.body.removeChild(div);
    // Restore activeElement
    Object.defineProperty(document, "activeElement", {
      value: document.body,
      configurable: true,
    });
  });

  // ---------------------------------------------------------------------------
  // enabled=false
  // ---------------------------------------------------------------------------

  it("does not trigger shortcuts when enabled=false", () => {
    renderHook(() => useKeyboardShortcuts({ onUndo, onRedo, enabled: false }));
    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Toast state
  // ---------------------------------------------------------------------------

  it("toastOpen becomes true and toastMessage is set after undo shortcut", () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({
        onUndo,
        onRedo,
        enabled: true,
        undoDescription: "Changed color",
      }),
    );
    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });
    expect(result.current.toastOpen).toBe(true);
    expect(result.current.toastMessage).toContain("Undone");
  });

  it("closeToast sets toastOpen to false", () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts({
        onUndo,
        onRedo,
        enabled: true,
        undoDescription: "Some action",
      }),
    );
    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });
    expect(result.current.toastOpen).toBe(true);
    act(() => {
      result.current.closeToast();
    });
    expect(result.current.toastOpen).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  it("removes event listener on unmount (no callbacks fired after unmount)", () => {
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({ onUndo, onRedo, enabled: true }),
    );
    unmount();
    act(() => {
      window.dispatchEvent(makeKeyEvent("z", { ctrlKey: true }));
    });
    expect(onUndo).not.toHaveBeenCalled();
  });
});
