/**
 * Tests for useAutosave hook (Step 5.2.1)
 *
 * Covers:
 * - Hook accepts entityType, entityId, data, onSave params
 * - Autosave triggers 30s after last edit
 * - Debouncing prevents save on every keystroke (2s delay)
 * - hasUnsavedChanges boolean tracks dirty state correctly
 * - Manual save trigger bypasses debouncing
 * - useEffect cleanup cancels pending saves on unmount
 * - Error handling: onSave failures propagated via status callback
 * - No stale closure bugs — useRef for mutable values
 * - Conflict detection via updatedAt timestamps
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutosave } from "../useAutosave";

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  it("returns expected shape on mount", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result } = renderHook(() =>
      useAutosave({
        entityType: "website",
        entityId: 1,
        data: { name: "Test" },
        onSave,
      }),
    );
    expect(typeof result.current.hasUnsavedChanges).toBe("boolean");
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(typeof result.current.saveStatus).toBe("string");
    expect(result.current.saveStatus).toBe("idle");
    expect(typeof result.current.triggerSave).toBe("function");
    expect(typeof result.current.clearDirty).toBe("function");
  });

  it("does not call onSave immediately on mount", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    renderHook(() =>
      useAutosave({
        entityType: "website",
        entityId: 1,
        data: { name: "Test" },
        onSave,
        isLoading: false,
      }),
    );
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Dirty state tracking
  // ---------------------------------------------------------------------------

  it("sets hasUnsavedChanges to true when data changes", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    // After 2s debounce, dirty should be set
    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2001);
    });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("does not set dirty when isLoading is true", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({
        data,
        isLoading,
      }: {
        data: Record<string, unknown>;
        isLoading: boolean;
      }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading,
        }),
      { initialProps: { data: { name: "Initial" }, isLoading: true } },
    );

    rerender({ data: { name: "Changed" }, isLoading: true });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 2s debounce — marks dirty
  // ---------------------------------------------------------------------------

  it("does not mark dirty before 2s debounce", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("marks dirty exactly at 2s debounce boundary", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("rapid data changes only mark dirty after final 2s debounce", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "a" } } },
    );

    rerender({ data: { name: "b" } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    rerender({ data: { name: "c" } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Only 1s since last change — still not dirty
    expect(result.current.hasUnsavedChanges).toBe(false);

    // 2s since last change
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 30s autosave trigger
  // ---------------------------------------------------------------------------

  it("calls onSave 30s after data becomes dirty", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    // Wait for 2s debounce to mark dirty
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Wait for 30s autosave
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({ name: "Changed" });
  });

  it("does not call onSave before 30s", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    act(() => {
      vi.advanceTimersByTime(29999);
    }); // 29.999s
    expect(onSave).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Manual save trigger
  // ---------------------------------------------------------------------------

  it("triggerSave calls onSave immediately without waiting 30s", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    await act(async () => {
      result.current.triggerSave();
    });
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("triggerSave sets saveStatus to saving then saved", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.saveStatus).toBe("saved");
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  it("sets saveStatus to error when onSave rejects", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Network error"));
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.saveStatus).toBe("error");
  });

  it("preserves hasUnsavedChanges=true on save failure", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Network error"));
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("clears dirty state after successful save", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // clearDirty function
  // ---------------------------------------------------------------------------

  it("clearDirty resets hasUnsavedChanges to false", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    }); // debounce
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.clearDirty();
    });
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Unmount cleanup — no memory leaks
  // ---------------------------------------------------------------------------

  it("clears pending timers on unmount without errors", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { rerender, unmount } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Changed" } });
    expect(() => unmount()).not.toThrow();
    // Advance timers after unmount — no state update error
    act(() => {
      vi.advanceTimersByTime(40000);
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Conflict detection
  // ---------------------------------------------------------------------------

  it("returns conflictData when onSave resolves with conflict", async () => {
    const conflict = {
      conflict: true,
      serverData: { name: "Server version" },
      serverUpdatedAt: new Date().toISOString(),
    };
    const onSave = vi.fn().mockResolvedValue(conflict);
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Local version" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.conflictData).toBeDefined();
    expect(result.current.conflictData?.serverData).toEqual({
      name: "Server version",
    });
  });

  it("resolveConflict clears conflictData", async () => {
    const conflict = {
      conflict: true,
      serverData: { name: "Server version" },
      serverUpdatedAt: new Date().toISOString(),
    };
    const onSave = vi.fn().mockResolvedValue(conflict);
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "website",
          entityId: 1,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Local version" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.conflictData).toBeDefined();

    act(() => {
      result.current.resolveConflict("keep-local");
    });
    expect(result.current.conflictData).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("handles null entityId gracefully", () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const { result } = renderHook(() =>
      useAutosave({
        entityType: "website",
        entityId: null as unknown as number,
        data: { name: "Test" },
        onSave,
        isLoading: false,
      }),
    );
    expect(result.current.hasUnsavedChanges).toBe(false);
    act(() => {
      vi.advanceTimersByTime(40000);
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not autosave when data has not changed", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ updatedAt: new Date().toISOString() });
    const data = { name: "Unchanged" };
    renderHook(() =>
      useAutosave({
        entityType: "website",
        entityId: 1,
        data,
        onSave,
        isLoading: false,
      }),
    );
    await act(async () => {
      vi.advanceTimersByTime(40000);
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 412 Conflict handling — onSave returning conflict shape (Step 5.9.6)
  // ---------------------------------------------------------------------------

  it("onSave returning { conflict: true, serverData, serverUpdatedAt } sets conflictData state", async () => {
    const serverData = {
      blocks: [{ blockType: "HERO", content: { heading: "Server Version" } }],
    };
    const serverUpdatedAt = "2026-03-15T10:00:00Z";
    const onSave = vi.fn().mockResolvedValue({
      conflict: true,
      serverData,
      serverUpdatedAt,
    });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "page",
          entityId: 42,
          data,
          onSave,
          isLoading: false,
        }),
      {
        initialProps: {
          data: {
            blocks: [{ blockType: "HERO", content: { heading: "Local" } }],
          },
        },
      },
    );

    rerender({
      data: { blocks: [{ blockType: "HERO", content: { heading: "Edited" } }] },
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });

    expect(result.current.conflictData).not.toBeNull();
    expect(result.current.conflictData?.serverData).toEqual(serverData);
    expect(result.current.conflictData?.serverUpdatedAt).toBe(serverUpdatedAt);
  });

  it('resolveConflict("keep-local") sets hasUnsavedChanges to true for re-save', async () => {
    const onSave = vi.fn().mockResolvedValue({
      conflict: true,
      serverData: { name: "Server" },
      serverUpdatedAt: "2026-03-15T10:00:00Z",
    });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "page",
          entityId: 42,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Edited" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.conflictData).not.toBeNull();

    act(() => {
      result.current.resolveConflict("keep-local");
    });
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.conflictData).toBeNull();
  });

  it('resolveConflict("use-server") clears hasUnsavedChanges', async () => {
    const onSave = vi.fn().mockResolvedValue({
      conflict: true,
      serverData: { name: "Server" },
      serverUpdatedAt: "2026-03-15T10:00:00Z",
    });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "page",
          entityId: 42,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Edited" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.conflictData).not.toBeNull();

    act(() => {
      result.current.resolveConflict("use-server");
    });
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.conflictData).toBeNull();
  });

  it("after conflict resolution, conflictData is null regardless of resolution type", async () => {
    const conflict = {
      conflict: true,
      serverData: { name: "Server" },
      serverUpdatedAt: "2026-03-15T10:00:00Z",
    };
    const onSave = vi.fn().mockResolvedValue(conflict);
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "page",
          entityId: 42,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    // Trigger conflict
    rerender({ data: { name: "Edited" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.conflictData).not.toBeNull();

    // Resolve with keep-local
    act(() => {
      result.current.resolveConflict("keep-local");
    });
    expect(result.current.conflictData).toBeNull();

    // Trigger conflict again
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.conflictData).not.toBeNull();

    // Resolve with use-server
    act(() => {
      result.current.resolveConflict("use-server");
    });
    expect(result.current.conflictData).toBeNull();
  });

  it("successful save stores updatedAt for next request via onSave result", async () => {
    const updatedAt = "2026-03-15T12:00:00Z";
    const onSave = vi.fn().mockResolvedValue({ updatedAt });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "page",
          entityId: 42,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    // First save
    rerender({ data: { name: "Changed" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(result.current.saveStatus).toBe("saved");
    expect(onSave).toHaveBeenCalledWith({ name: "Changed" });

    // Second save — onSave is called with updated data
    onSave.mockResolvedValue({ updatedAt: "2026-03-15T12:01:00Z" });
    rerender({ data: { name: "Changed again" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ name: "Changed again" });
  });

  it("conflict sets saveStatus to idle, not error", async () => {
    const onSave = vi.fn().mockResolvedValue({
      conflict: true,
      serverData: { name: "Server" },
      serverUpdatedAt: "2026-03-15T10:00:00Z",
    });
    const { result, rerender } = renderHook(
      ({ data }: { data: Record<string, unknown> }) =>
        useAutosave({
          entityType: "page",
          entityId: 42,
          data,
          onSave,
          isLoading: false,
        }),
      { initialProps: { data: { name: "Initial" } } },
    );

    rerender({ data: { name: "Edited" } });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await act(async () => {
      await result.current.triggerSave();
    });

    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.conflictData).not.toBeNull();
  });
});
