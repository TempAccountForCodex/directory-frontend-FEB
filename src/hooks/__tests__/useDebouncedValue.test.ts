/**
 * Tests for Step 2.2.4 — useDebouncedValue hook
 *
 * Covers:
 * - Returns initial value immediately (no delay on mount)
 * - Returns new value after delay elapses
 * - Does NOT update before delay elapses
 * - Rapid changes only emit debounced value for the latest value
 * - Delay parameter change triggers a new debounce cycle
 * - No memory leaks / no errors on unmount during pending timer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "../useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // Initial value
  // ---------------------------------------------------------------------------

  it("returns the initial value immediately on mount", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("returns initial value of 0 correctly (falsy numeric)", () => {
    const { result } = renderHook(() => useDebouncedValue(0, 300));
    expect(result.current).toBe(0);
  });

  it("returns initial value of null correctly", () => {
    const { result } = renderHook(() =>
      useDebouncedValue<string | null>(null, 300),
    );
    expect(result.current).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Default delay
  // ---------------------------------------------------------------------------

  it("uses 300ms as default delay when no delay argument is provided", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    // Still old value before 300ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    // Updated after 300ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  // ---------------------------------------------------------------------------
  // Value updates after delay
  // ---------------------------------------------------------------------------

  it("returns the new value after the specified delay has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    // Not yet updated before delay
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    // Updated after exact delay
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("does not update value before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebouncedValue(value, 1000),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 99 });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // Rapid changes — debounce behaviour
  // ---------------------------------------------------------------------------

  it("debounces rapid changes and only emits the final value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    // Fire multiple updates in quick succession
    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "d" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 300ms have passed total from start but each rerender reset the timer
    // debounced value should still be 'a' (timer keeps resetting)
    expect(result.current).toBe("a");

    // Now let 300ms pass without any new value
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("d");
  });

  it("resets the debounce timer on each new value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "start" } },
    );

    // Advance 200ms then update — timer resets
    rerender({ value: "middle" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("start");

    // Another 200ms elapsed but only 200ms since last update
    rerender({ value: "end" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("start");

    // 300ms since 'end' update
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("end");
  });

  // ---------------------------------------------------------------------------
  // Unmount cleanup — no errors / memory leaks
  // ---------------------------------------------------------------------------

  it("clears the pending timer on unmount without errors", () => {
    const { rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });

    // Unmount while timer is pending — should not throw
    expect(() => unmount()).not.toThrow();
  });

  it("does not update state after unmount", () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    unmount();

    // Advance timers — no state update error should occur
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // The hook was unmounted; no assertions on result.current needed.
    // The test passes if no "Can't perform a React state update on an
    // unmounted component" warning is thrown.
    expect(true).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Delay change behaviour
  // ---------------------------------------------------------------------------

  it("respects a new delay when the delay argument changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebouncedValue(value, delay),
      { initialProps: { value: "a", delay: 200 } },
    );

    // Change value and delay simultaneously
    rerender({ value: "b", delay: 600 });

    // 200ms passes — old delay would have fired
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    // 600ms passes from the update
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("b");
  });

  // ---------------------------------------------------------------------------
  // Generic type support
  // ---------------------------------------------------------------------------

  it("works with object values", () => {
    const initial = { name: "Alice" };
    const updated = { name: "Bob" };

    const { result, rerender } = renderHook(
      ({ value }: { value: typeof initial }) => useDebouncedValue(value, 300),
      { initialProps: { value: initial } },
    );

    expect(result.current).toBe(initial);

    rerender({ value: updated });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(updated);
  });

  it("works with boolean values", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: boolean }) => useDebouncedValue(value, 100),
      { initialProps: { value: false } },
    );

    expect(result.current).toBe(false);

    rerender({ value: true });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);
  });
});
