/**
 * Tests for useHistory hook (Step 9.2.1)
 *
 * Covers:
 * - push/undo/redo/clear lifecycle
 * - Deduplication via JSON comparison
 * - Max depth enforcement (50 entries, FIFO eviction)
 * - canUndo/canRedo boolean flags
 * - lastActionDescription for tooltip display
 * - Undo/redo noop when at boundary
 * - Push after undo truncates future branch
 * - Empty stack graceful handling
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHistory } from "../useHistory";

describe("useHistory", () => {
  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  it("starts with empty state — canUndo and canRedo false", () => {
    const { result } = renderHook(() => useHistory<string>());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historyLength).toBe(0);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.lastActionDescription).toBe("");
  });

  // ---------------------------------------------------------------------------
  // push()
  // ---------------------------------------------------------------------------

  it("push() adds snapshot and enables canUndo after second push", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("state1", "First action");
    });
    // After first push: index=0, length=1 — no previous state to undo to
    expect(result.current.canUndo).toBe(false);
    expect(result.current.historyLength).toBe(1);

    act(() => {
      result.current.push("state2", "Second action");
    });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.historyLength).toBe(2);
    expect(result.current.lastActionDescription).toBe("Second action");
  });

  it("push() deduplicates — same state does not add new snapshot", () => {
    const { result } = renderHook(() => useHistory<object>());
    const obj = { color: "#fff" };
    act(() => {
      result.current.push(obj, "Set color");
    });
    act(() => {
      result.current.push({ color: "#fff" }, "Set color again");
    });
    expect(result.current.historyLength).toBe(1);
  });

  it("push() does not deduplicate when state actually changes", () => {
    const { result } = renderHook(() => useHistory<object>());
    act(() => {
      result.current.push({ color: "#fff" }, "Set white");
    });
    act(() => {
      result.current.push({ color: "#000" }, "Set black");
    });
    expect(result.current.historyLength).toBe(2);
  });

  it("push() after undo truncates future branch", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("A", "Action A");
    });
    act(() => {
      result.current.push("B", "Action B");
    });
    act(() => {
      result.current.push("C", "Action C");
    });
    act(() => {
      result.current.undo();
    }); // back to B
    act(() => {
      result.current.push("D", "Action D");
    }); // truncate C
    expect(result.current.historyLength).toBe(3); // A, B, D
    expect(result.current.canRedo).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // undo()
  // ---------------------------------------------------------------------------

  it("undo() returns previous state and decrements index", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("state1", "Action 1");
    });
    act(() => {
      result.current.push("state2", "Action 2");
    });

    let state: string | undefined;
    act(() => {
      state = result.current.undo();
    });
    expect(state).toBe("state1");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("undo() is noop (returns current state) when at start of stack", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("only", "Only action");
    });

    let state: string | undefined;
    act(() => {
      state = result.current.undo();
    });
    // Still at index 0 — cannot go further back
    expect(state).toBe("only");
    expect(result.current.canUndo).toBe(false);
  });

  it("undo() on empty stack returns undefined gracefully without throwing", () => {
    const { result } = renderHook(() => useHistory<string>());
    let threw = false;
    let state: string | undefined;
    act(() => {
      try {
        state = result.current.undo();
      } catch {
        threw = true;
      }
    });
    expect(threw).toBe(false);
    expect(state).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // redo()
  // ---------------------------------------------------------------------------

  it("redo() returns next state and increments index", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("A", "A");
    });
    act(() => {
      result.current.push("B", "B");
    });
    act(() => {
      result.current.undo();
    });

    let state: string | undefined;
    act(() => {
      state = result.current.redo();
    });
    expect(state).toBe("B");
    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("redo() is noop (returns current state) when at end of stack", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("A", "A");
    });
    act(() => {
      result.current.push("B", "B");
    });

    let state: string | undefined;
    act(() => {
      state = result.current.redo();
    });
    expect(state).toBe("B"); // already at end
    expect(result.current.canRedo).toBe(false);
  });

  it("redo() on empty stack returns undefined gracefully without throwing", () => {
    const { result } = renderHook(() => useHistory<string>());
    let threw = false;
    let state: string | undefined;
    act(() => {
      try {
        state = result.current.redo();
      } catch {
        threw = true;
      }
    });
    expect(threw).toBe(false);
    expect(state).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // clear()
  // ---------------------------------------------------------------------------

  it("clear() resets stack to empty state", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("A", "A");
    });
    act(() => {
      result.current.push("B", "B");
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historyLength).toBe(0);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.lastActionDescription).toBe("");
  });

  // ---------------------------------------------------------------------------
  // Max depth (50 entries — FIFO eviction)
  // ---------------------------------------------------------------------------

  it("enforces max depth of 50 — oldest entries evicted on push beyond limit", () => {
    const { result } = renderHook(() => useHistory<number>());
    // Push 51 items
    for (let i = 1; i <= 51; i++) {
      act(() => {
        result.current.push(i, `Action ${i}`);
      });
    }
    expect(result.current.historyLength).toBe(50);
    // currentIndex should be at end
    expect(result.current.currentIndex).toBe(49);
    // Undo all the way back — should reach state 2 (1 was evicted)
    for (let i = 0; i < 49; i++) {
      act(() => {
        result.current.undo();
      });
    }
    // First accessible state after eviction is state 2
    let first: number | undefined;
    act(() => {
      first = result.current.undo();
    });
    expect(first).toBe(2); // state 1 was evicted — cannot go before 2
  });

  // ---------------------------------------------------------------------------
  // lastActionDescription
  // ---------------------------------------------------------------------------

  it("lastActionDescription reflects most recent snapshot at current index", () => {
    const { result } = renderHook(() => useHistory<string>());
    act(() => {
      result.current.push("A", "Changed name");
    });
    act(() => {
      result.current.push("B", "Changed color");
    });
    expect(result.current.lastActionDescription).toBe("Changed color");

    act(() => {
      result.current.undo();
    });
    expect(result.current.lastActionDescription).toBe("Changed name");
  });
});
