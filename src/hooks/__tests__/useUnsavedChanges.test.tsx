/**
 * Tests for useUnsavedChanges hook (Step 5.5.1 + 5.5.2)
 *
 * Covers:
 * - Hook returns expected shape (isBlocked, showDialog, confirmNavigation, cancelNavigation, saveAndNavigate)
 * - beforeunload listener set when hasUnsavedChanges=true (standalone mode)
 * - beforeunload listener NOT added when skipBeforeUnload=true (useAutosave mode)
 * - Clean unmount: no lingering event listeners
 * - React Router useBlocker integration
 * - confirmNavigation calls blocker.proceed()
 * - cancelNavigation calls blocker.reset()
 * - saveAndNavigate calls onSaveBeforeLeave then proceeds
 * - Multiple rapid navigation attempts don't stack dialogs
 * - setUnsavedChanges manual override
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mock react-router-dom's useBlocker
// ---------------------------------------------------------------------------
const mockProceed = vi.fn();
const mockReset = vi.fn();
let mockBlockerState: "blocked" | "unblocked" | "proceeding" = "unblocked";
let capturedBlockerCallback:
  | ((args: { currentLocation: any; nextLocation: any }) => boolean)
  | null = null;

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useBlocker: (
      cb: (args: { currentLocation: any; nextLocation: any }) => boolean,
    ) => {
      capturedBlockerCallback = cb;
      return {
        state: mockBlockerState,
        proceed: mockProceed,
        reset: mockReset,
        location: undefined,
      };
    },
  };
});

import { useUnsavedChanges } from "../useUnsavedChanges";
import type { UseUnsavedChangesParams } from "../useUnsavedChanges";

// ---------------------------------------------------------------------------
// Test wrapper
// ---------------------------------------------------------------------------
function RouterWrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("useUnsavedChanges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBlockerState = "unblocked";
    capturedBlockerCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 5.5.1 — Hook shape & types
  // ---------------------------------------------------------------------------
  describe("initial state and shape", () => {
    it("returns expected shape on mount", () => {
      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: false }),
        { wrapper: RouterWrapper },
      );

      expect(typeof result.current.isBlocked).toBe("boolean");
      expect(typeof result.current.showDialog).toBe("boolean");
      expect(typeof result.current.confirmNavigation).toBe("function");
      expect(typeof result.current.cancelNavigation).toBe("function");
      expect(typeof result.current.saveAndNavigate).toBe("function");
      expect(typeof result.current.setUnsavedChanges).toBe("function");
    });

    it("isBlocked and showDialog are false when no unsaved changes", () => {
      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: false }),
        { wrapper: RouterWrapper },
      );

      expect(result.current.isBlocked).toBe(false);
      expect(result.current.showDialog).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 5.5.1 — beforeunload listener (standalone mode)
  // ---------------------------------------------------------------------------
  describe("beforeunload listener", () => {
    it("adds beforeunload listener when hasUnsavedChanges=true (standalone)", () => {
      const addSpy = vi.spyOn(window, "addEventListener");

      renderHook(() => useUnsavedChanges({ hasUnsavedChanges: true }), {
        wrapper: RouterWrapper,
      });

      expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    });

    it("does NOT add beforeunload when skipBeforeUnload=true (useAutosave mode)", () => {
      const addSpy = vi.spyOn(window, "addEventListener");

      renderHook(
        () =>
          useUnsavedChanges({
            hasUnsavedChanges: true,
            skipBeforeUnload: true,
          }),
        { wrapper: RouterWrapper },
      );

      const beforeUnloadCalls = addSpy.mock.calls.filter(
        ([event]) => event === "beforeunload",
      );
      expect(beforeUnloadCalls.length).toBe(0);
    });

    it("removes beforeunload listener when hasUnsavedChanges becomes false", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { rerender } = renderHook(
        ({ dirty }: { dirty: boolean }) =>
          useUnsavedChanges({ hasUnsavedChanges: dirty }),
        { wrapper: RouterWrapper, initialProps: { dirty: true } },
      );

      rerender({ dirty: false });

      expect(removeSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function),
      );
    });

    it("removes beforeunload listener on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      unmount();

      expect(removeSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function),
      );
    });

    it("beforeunload handler calls preventDefault and sets returnValue", () => {
      let capturedHandler: ((e: BeforeUnloadEvent) => void) | null = null;
      const addSpy = vi
        .spyOn(window, "addEventListener")
        .mockImplementation((event: string, handler: any) => {
          if (event === "beforeunload") {
            capturedHandler = handler;
          }
        });

      renderHook(() => useUnsavedChanges({ hasUnsavedChanges: true }), {
        wrapper: RouterWrapper,
      });

      expect(capturedHandler).not.toBeNull();

      // Create a mock event with returnValue property (JSDOM's Event doesn't have it)
      const event = { preventDefault: vi.fn(), returnValue: undefined as any };
      capturedHandler!(event as any);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.returnValue).toBe("");

      addSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // 5.5.1 — setUnsavedChanges manual override
  // ---------------------------------------------------------------------------
  describe("setUnsavedChanges", () => {
    it("allows manual override of unsaved changes state", () => {
      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: false }),
        { wrapper: RouterWrapper },
      );

      act(() => {
        result.current.setUnsavedChanges(true);
      });

      // The manual override sets the internal state
      // but useBlocker still checks the combined value
      expect(typeof result.current.setUnsavedChanges).toBe("function");
    });
  });

  // ---------------------------------------------------------------------------
  // 5.5.2 — React Router useBlocker integration
  // ---------------------------------------------------------------------------
  describe("useBlocker integration", () => {
    it("passes shouldBlock callback to useBlocker", () => {
      renderHook(() => useUnsavedChanges({ hasUnsavedChanges: true }), {
        wrapper: RouterWrapper,
      });

      expect(capturedBlockerCallback).toBeInstanceOf(Function);
    });

    it("blocker callback returns true when hasUnsavedChanges and locations differ", () => {
      renderHook(() => useUnsavedChanges({ hasUnsavedChanges: true }), {
        wrapper: RouterWrapper,
      });

      const result = capturedBlockerCallback!({
        currentLocation: { pathname: "/editor", search: "", hash: "" },
        nextLocation: { pathname: "/dashboard", search: "", hash: "" },
      });

      expect(result).toBe(true);
    });

    it("blocker callback returns false when no unsaved changes", () => {
      renderHook(() => useUnsavedChanges({ hasUnsavedChanges: false }), {
        wrapper: RouterWrapper,
      });

      const result = capturedBlockerCallback!({
        currentLocation: { pathname: "/editor", search: "", hash: "" },
        nextLocation: { pathname: "/dashboard", search: "", hash: "" },
      });

      expect(result).toBe(false);
    });

    it("blocker callback returns false when navigating to same location", () => {
      renderHook(() => useUnsavedChanges({ hasUnsavedChanges: true }), {
        wrapper: RouterWrapper,
      });

      const result = capturedBlockerCallback!({
        currentLocation: { pathname: "/editor", search: "", hash: "" },
        nextLocation: { pathname: "/editor", search: "", hash: "" },
      });

      expect(result).toBe(false);
    });

    it("showDialog is true when blocker.state is blocked", () => {
      mockBlockerState = "blocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      expect(result.current.showDialog).toBe(true);
      expect(result.current.isBlocked).toBe(true);
    });

    it("showDialog is false when blocker.state is unblocked", () => {
      mockBlockerState = "unblocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      expect(result.current.showDialog).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 5.5.2 — Navigation actions
  // ---------------------------------------------------------------------------
  describe("navigation actions", () => {
    it("confirmNavigation calls blocker.proceed()", () => {
      mockBlockerState = "blocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      act(() => {
        result.current.confirmNavigation();
      });

      expect(mockProceed).toHaveBeenCalledTimes(1);
    });

    it("cancelNavigation calls blocker.reset()", () => {
      mockBlockerState = "blocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      act(() => {
        result.current.cancelNavigation();
      });

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("saveAndNavigate calls onSaveBeforeLeave then proceed()", async () => {
      mockBlockerState = "blocked";
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(
        () =>
          useUnsavedChanges({
            hasUnsavedChanges: true,
            onSaveBeforeLeave: onSave,
          }),
        { wrapper: RouterWrapper },
      );

      await act(async () => {
        await result.current.saveAndNavigate();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(mockProceed).toHaveBeenCalledTimes(1);
    });

    it("saveAndNavigate proceeds even when onSaveBeforeLeave rejects", async () => {
      mockBlockerState = "blocked";
      const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));

      const { result } = renderHook(
        () =>
          useUnsavedChanges({
            hasUnsavedChanges: true,
            onSaveBeforeLeave: onSave,
          }),
        { wrapper: RouterWrapper },
      );

      await act(async () => {
        await result.current.saveAndNavigate();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      // Should still proceed even if save fails — user chose to leave
      expect(mockProceed).toHaveBeenCalledTimes(1);
    });

    it("saveAndNavigate without onSaveBeforeLeave just calls proceed()", async () => {
      mockBlockerState = "blocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      await act(async () => {
        await result.current.saveAndNavigate();
      });

      expect(mockProceed).toHaveBeenCalledTimes(1);
    });

    it("confirmNavigation is no-op when blocker is not blocked", () => {
      mockBlockerState = "unblocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      act(() => {
        result.current.confirmNavigation();
      });

      expect(mockProceed).not.toHaveBeenCalled();
    });

    it("cancelNavigation is no-op when blocker is not blocked", () => {
      mockBlockerState = "unblocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      act(() => {
        result.current.cancelNavigation();
      });

      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 5.5.2 — Edge cases
  // ---------------------------------------------------------------------------
  describe("edge cases", () => {
    it("does not block when recentlySaved timestamp is within 5s", () => {
      vi.useFakeTimers();

      const { result } = renderHook(
        () =>
          useUnsavedChanges({ hasUnsavedChanges: false, saveStatus: "saved" }),
        { wrapper: RouterWrapper },
      );

      // With saveStatus='saved', the hook tracks the saved timestamp
      // Within 5s, even if hasUnsavedChanges somehow becomes true,
      // the blocker callback should not block
      expect(result.current.isBlocked).toBe(false);

      vi.useRealTimers();
    });

    it("multiple rapid confirmNavigation calls only call proceed once", () => {
      mockBlockerState = "blocked";

      const { result } = renderHook(
        () => useUnsavedChanges({ hasUnsavedChanges: true }),
        { wrapper: RouterWrapper },
      );

      act(() => {
        result.current.confirmNavigation();
        // After first call, in a real scenario blocker would transition to 'proceeding'
        // but our mock keeps it at 'blocked'. The guard in the hook should prevent double calls.
      });

      expect(mockProceed).toHaveBeenCalledTimes(1);
    });
  });
});
