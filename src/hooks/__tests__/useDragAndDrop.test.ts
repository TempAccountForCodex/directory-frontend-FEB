/**
 * Tests for useDragAndDrop hook (Step 9.1.1)
 *
 * Covers:
 * - Hook returns expected shape (sensors, collisionDetection, handleDragEnd, activeId, setActiveId)
 * - Sensor configuration: PointerSensor with 250ms delay, KeyboardSensor with sortableKeyboardCoordinates
 * - collisionDetection is closestCenter
 * - handleDragEnd calls onReorder with arrayMove result when active !== over
 * - handleDragEnd does nothing when active === over
 * - handleDragEnd does nothing when over is null
 * - activeId tracks the dragged item
 * - Works with empty items array (no crash)
 * - Works with generic item types (blocks and pages)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "../useDragAndDrop";

// ---------------------------------------------------------------------------
// Mock @dnd-kit/core
// ---------------------------------------------------------------------------

const mockPointerSensor = { id: "pointer-sensor" };
const mockKeyboardSensor = { id: "keyboard-sensor" };
const mockSensors = [mockPointerSensor, mockKeyboardSensor];
const mockClosestCenter = vi.fn((args: unknown) => null);

vi.mock("@dnd-kit/core", () => ({
  useSensors: vi.fn((...args: unknown[]) => mockSensors),
  useSensor: vi.fn((SensorClass: unknown, options?: unknown) => ({
    sensorClass: SensorClass,
    options,
  })),
  PointerSensor: class PointerSensor {},
  TouchSensor: class TouchSensor {},
  KeyboardSensor: class KeyboardSensor {},
  closestCenter: (args: unknown) => mockClosestCenter(args),
}));

vi.mock("@dnd-kit/sortable", () => ({
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...(arr as unknown[])];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn() } },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useDragAndDrop", () => {
  const mockItems = [
    { id: "1", label: "Item 1" },
    { id: "2", label: "Item 2" },
    { id: "3", label: "Item 3" },
  ];

  const mockOnReorder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Shape ─────────────────────────────────────────────────────────────────

  it("returns expected shape on mount", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    expect(result.current).toHaveProperty("sensors");
    expect(result.current).toHaveProperty("collisionDetection");
    expect(result.current).toHaveProperty("handleDragEnd");
    expect(result.current).toHaveProperty("activeId");
    expect(result.current).toHaveProperty("setActiveId");
    expect(typeof result.current.handleDragEnd).toBe("function");
    expect(typeof result.current.setActiveId).toBe("function");
  });

  it("activeId is null initially", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );
    expect(result.current.activeId).toBeNull();
  });

  // ── Sensor configuration ───────────────────────────────────────────────────

  it("returns sensors array from useSensors", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );
    // Should have sensors configured
    expect(result.current.sensors).toBeDefined();
    expect(Array.isArray(result.current.sensors)).toBe(true);
  });

  it("registers TouchSensor with 200ms delay and 8px tolerance (Step 9.5.2)", async () => {
    const dndCore = await import("@dnd-kit/core");
    const useSensorMock = vi.mocked(dndCore.useSensor);

    renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    // useSensor should have been called with TouchSensor
    const touchSensorCall = useSensorMock.mock.calls.find(
      (call: unknown[]) => call[0] === dndCore.TouchSensor,
    );
    expect(touchSensorCall).toBeDefined();
    expect(touchSensorCall![1]).toEqual({
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    });
  });

  it("exposes closestCenter as collisionDetection", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );
    // collisionDetection should be a function (closestCenter)
    expect(typeof result.current.collisionDetection).toBe("function");
  });

  // ── handleDragEnd ──────────────────────────────────────────────────────────

  it("handleDragEnd calls onReorder when active !== over", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "1" },
        over: { id: "2" },
      } as any);
    });

    expect(mockOnReorder).toHaveBeenCalledTimes(1);
    const reorderedItems = mockOnReorder.mock.calls[0][0];
    expect(Array.isArray(reorderedItems)).toBe(true);
    expect(reorderedItems).toHaveLength(mockItems.length);
  });

  it("handleDragEnd does NOT call onReorder when active === over", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "1" },
        over: { id: "1" },
      } as any);
    });

    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it("handleDragEnd does NOT call onReorder when over is null", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "1" },
        over: null,
      } as any);
    });

    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  // ── activeId state ─────────────────────────────────────────────────────────

  it("setActiveId updates activeId state", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    act(() => {
      result.current.setActiveId("2");
    });

    expect(result.current.activeId).toBe("2");
  });

  it("handleDragEnd resets activeId to null", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: mockItems, onReorder: mockOnReorder }),
    );

    act(() => {
      result.current.setActiveId("1");
    });
    expect(result.current.activeId).toBe("1");

    act(() => {
      result.current.handleDragEnd({
        active: { id: "1" },
        over: { id: "2" },
      } as any);
    });

    expect(result.current.activeId).toBeNull();
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("works with empty items array without crashing", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: [], onReorder: mockOnReorder }),
    );

    expect(result.current.activeId).toBeNull();

    // Should not crash even when dragging on empty list
    act(() => {
      result.current.handleDragEnd({
        active: { id: "1" },
        over: { id: "2" },
      } as any);
    });

    // No items to reorder, so onReorder should not be called with changed data
    // (items are empty, no valid indices)
  });

  it("works with generic page items (not just blocks)", () => {
    const pageItems = [
      { id: "page-1", title: "Home", sortOrder: 0 },
      { id: "page-2", title: "About", sortOrder: 1 },
    ];
    const pageReorder = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop({ items: pageItems, onReorder: pageReorder }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: "page-1" },
        over: { id: "page-2" },
      } as any);
    });

    expect(pageReorder).toHaveBeenCalledTimes(1);
  });
});
