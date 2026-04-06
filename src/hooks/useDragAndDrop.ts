/**
 * useDragAndDrop — Step 9.1.1
 *
 * Reusable drag-and-drop hook encapsulating @dnd-kit sensor configuration,
 * collision detection, and drag-end logic. Works for both blocks and pages.
 *
 * Features:
 * - PointerSensor with 250ms activation delay (touch-friendly)
 * - KeyboardSensor with sortableKeyboardCoordinates (accessibility)
 * - closestCenter collision detection
 * - DragOverlay support via activeId state
 * - Generic: accepts any items array with id property + onReorder callback
 *
 * Keyboard accessibility:
 * - Space: pick up / drop item
 * - Arrow keys: move dragged item
 * - Escape: cancel drag
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - useCallback on all event handlers for stable references
 */

import { useState, useCallback } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraggableItem {
  id: string | number;
}

export interface UseDragAndDropOptions<T extends DraggableItem> {
  /** Items to be sorted */
  items: T[];
  /** Called with the reordered items array after a valid drag-end */
  onReorder: (items: T[]) => void;
}

export interface UseDragAndDropReturn<T extends DraggableItem> {
  /** Configured sensor array for DndContext */
  sensors: ReturnType<typeof useSensors>;
  /** closestCenter collision detection algorithm */
  collisionDetection: CollisionDetection;
  /** Drag-end handler: reorders items and calls onReorder */
  handleDragEnd: (event: DragEndEvent) => void;
  /** ID of the currently dragged item (for DragOverlay) */
  activeId: string | number | null;
  /** Set the active dragged item ID (call on DragStart) */
  setActiveId: (id: string | number | null) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Reusable drag-and-drop hook for sortable lists.
 *
 * @example
 * const { sensors, collisionDetection, handleDragEnd, activeId, setActiveId } =
 *   useDragAndDrop({ items: blocks, onReorder: setBlocks });
 */
export function useDragAndDrop<T extends DraggableItem>({
  items,
  onReorder,
}: UseDragAndDropOptions<T>): UseDragAndDropReturn<T> {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  // ── Sensors ───────────────────────────────────────────────────────────────
  // PointerSensor: 250ms touch delay prevents accidental drag on scroll
  // KeyboardSensor: Space/Arrow/Esc keyboard navigation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── Drag-end handler ───────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event;

      // Reset active item for DragOverlay
      setActiveId(null);

      // No drop target or dropped on self — no reorder needed
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    },
    [items, onReorder],
  );

  // ── setActiveId callback ───────────────────────────────────────────────────
  const handleSetActiveId = useCallback((id: string | number | null): void => {
    setActiveId(id);
  }, []);

  return {
    sensors,
    collisionDetection: closestCenter,
    handleDragEnd,
    activeId,
    setActiveId: handleSetActiveId,
  };
}

export default useDragAndDrop;
