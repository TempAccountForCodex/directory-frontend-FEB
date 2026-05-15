/**
 * Tests for useInputMethod hook (Step 9.11.1)
 *
 * Covers:
 * - Hook returns correct shape (inputMethod, isKeyboardMode, forceKeyboardMode, setForceKeyboardMode)
 * - Touch detection: inputMethod='touch' after touchstart
 * - Mouse detection: inputMethod='mouse' after mousemove
 * - Keyboard detection: inputMethod='keyboard' after keydown with no recent touch
 * - 5-second touch timeout: keyboard mode only activates after 5s without touch
 * - document.body class: 'keyboard-active' added/removed
 * - forceKeyboardMode: overrides detection, persists to localStorage
 * - Cleanup: listeners removed on unmount
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInputMethod } from "../useInputMethod";

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  document.body.classList.remove("keyboard-active");
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.classList.remove("keyboard-active");
  window.localStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useInputMethod", () => {
  it("returns the correct shape", () => {
    const { result } = renderHook(() => useInputMethod());
    expect(result.current).toHaveProperty("inputMethod");
    expect(result.current).toHaveProperty("isKeyboardMode");
    expect(result.current).toHaveProperty("forceKeyboardMode");
    expect(result.current).toHaveProperty("setForceKeyboardMode");
    expect(typeof result.current.setForceKeyboardMode).toBe("function");
  });

  it('defaults to inputMethod="mouse"', () => {
    const { result } = renderHook(() => useInputMethod());
    expect(result.current.inputMethod).toBe("mouse");
    expect(result.current.isKeyboardMode).toBe(false);
  });

  it("detects touch input after touchstart event", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(result.current.inputMethod).toBe("touch");
    expect(result.current.isKeyboardMode).toBe(false);
  });

  it("detects mouse input after mousemove event", () => {
    const { result } = renderHook(() => useInputMethod());
    // Start with touch to ensure switch
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(result.current.inputMethod).toBe("touch");

    // Advance past 5s timeout and switch to mouse
    act(() => {
      vi.advanceTimersByTime(5100);
      window.dispatchEvent(new Event("mousemove"));
    });
    expect(result.current.inputMethod).toBe("mouse");
  });

  it("detects keyboard input after keydown with no recent touch", () => {
    const { result } = renderHook(() => useInputMethod());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(result.current.inputMethod).toBe("keyboard");
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("does NOT switch to keyboard mode if touch happened within 5 seconds", () => {
    const { result } = renderHook(() => useInputMethod());

    // Touch first
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(result.current.inputMethod).toBe("touch");

    // Keyboard within 5s
    act(() => {
      vi.advanceTimersByTime(3000);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    // Should stay touch, not keyboard
    expect(result.current.inputMethod).toBe("touch");
    expect(result.current.isKeyboardMode).toBe(false);
  });

  it("switches to keyboard mode after 5 seconds without touch", () => {
    const { result } = renderHook(() => useInputMethod());

    // Touch first
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(result.current.inputMethod).toBe("touch");

    // Wait 5.1s, then keyboard
    act(() => {
      vi.advanceTimersByTime(5100);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(result.current.inputMethod).toBe("keyboard");
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it('adds "keyboard-active" class to document.body in keyboard mode', () => {
    renderHook(() => useInputMethod());
    expect(document.body.classList.contains("keyboard-active")).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(true);
  });

  it('removes "keyboard-active" class when leaving keyboard mode', () => {
    renderHook(() => useInputMethod());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(document.body.classList.contains("keyboard-active")).toBe(false);
  });

  it("forceKeyboardMode overrides touch detection", () => {
    const { result } = renderHook(() => useInputMethod());

    act(() => {
      result.current.setForceKeyboardMode(true);
    });
    expect(result.current.forceKeyboardMode).toBe(true);
    expect(result.current.isKeyboardMode).toBe(true);

    // Touch should NOT override forced keyboard mode
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("persists forceKeyboardMode to localStorage", () => {
    const { result } = renderHook(() => useInputMethod());

    act(() => {
      result.current.setForceKeyboardMode(true);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "keyboardNavigationMode",
      "true",
    );

    act(() => {
      result.current.setForceKeyboardMode(false);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "keyboardNavigationMode",
      "false",
    );
  });

  it("reads forceKeyboardMode from localStorage on mount", () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) =>
      key === "keyboardNavigationMode" ? "true" : null,
    );
    const { result } = renderHook(() => useInputMethod());
    expect(result.current.forceKeyboardMode).toBe(true);
    expect(result.current.isKeyboardMode).toBe(true);
  });

  it("cleans up event listeners on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useInputMethod());

    // Should have added touchstart, mousemove, keydown
    const addedEvents = addSpy.mock.calls.map((c) => c[0]);
    expect(addedEvents).toContain("touchstart");
    expect(addedEvents).toContain("mousemove");
    expect(addedEvents).toContain("keydown");

    unmount();

    const removedEvents = removeSpy.mock.calls.map((c) => c[0]);
    expect(removedEvents).toContain("touchstart");
    expect(removedEvents).toContain("mousemove");
    expect(removedEvents).toContain("keydown");

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
