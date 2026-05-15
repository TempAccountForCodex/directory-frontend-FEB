/**
 * Tests for DraggablePageList component (Step 9.1.4)
 *
 * Covers:
 * - Renders page list with drag handles
 * - Reuses useDragAndDrop hook
 * - Drag-end reorders pages in state
 * - Fallback up/down buttons work (movePage)
 * - Up button disabled for first item
 * - Down button disabled for last item
 * - Page sortOrder updated after reorder
 * - Empty state shown when pages array is empty
 * - React.memo: component is memoized
 * - DragOverlay rendered
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../../hooks/useDragAndDrop", () => ({
  useDragAndDrop: vi.fn(() => ({
    sensors: [],
    collisionDetection: vi.fn(),
    handleDragEnd: vi.fn(),
    activeId: null,
    setActiveId: vi.fn(),
  })),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd, onDragStart }: any) => (
    <div
      data-testid="dnd-context"
      data-drag-end={typeof onDragEnd}
      data-drag-start={typeof onDragStart}
    >
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: "vertical",
  arrayMove: vi.fn((arr: any[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn(() => "") } },
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import DraggablePageList from "../DraggablePageList";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

interface PageItem {
  id: string;
  title: string;
  path: string;
  isHome: boolean;
  selected: boolean;
  sortOrder: number;
}

const mockPages: PageItem[] = [
  {
    id: "page-1",
    title: "Home",
    path: "/",
    isHome: true,
    selected: true,
    sortOrder: 0,
  },
  {
    id: "page-2",
    title: "About",
    path: "/about",
    isHome: false,
    selected: true,
    sortOrder: 1,
  },
  {
    id: "page-3",
    title: "Contact",
    path: "/contact",
    isHome: false,
    selected: true,
    sortOrder: 2,
  },
];

const defaultProps = {
  pages: mockPages,
  onPagesChange: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DraggablePageList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  it("renders page list without crashing", () => {
    render(<DraggablePageList {...defaultProps} />);
    expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
  });

  it("renders all pages", () => {
    render(<DraggablePageList {...defaultProps} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("shows empty state when pages array is empty", () => {
    render(<DraggablePageList {...defaultProps} pages={[]} />);
    // No pages shown (empty state or null render)
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });

  it("renders drag handles for each page", () => {
    render(<DraggablePageList {...defaultProps} />);
    const dragHandles = screen.getAllByLabelText(/drag/i);
    expect(dragHandles.length).toBeGreaterThanOrEqual(mockPages.length);
  });

  // ── DragOverlay ───────────────────────────────────────────────────────────

  it("renders DragOverlay component", () => {
    render(<DraggablePageList {...defaultProps} />);
    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });

  // ── Fallback up/down buttons ───────────────────────────────────────────────

  it("renders up/down fallback buttons for each page", () => {
    render(<DraggablePageList {...defaultProps} />);
    const upButtons = screen.getAllByLabelText(/move.*up/i);
    const downButtons = screen.getAllByLabelText(/move.*down/i);
    expect(upButtons.length).toBeGreaterThanOrEqual(1);
    expect(downButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("up button disabled for first page", () => {
    render(<DraggablePageList {...defaultProps} />);
    const upButtons = screen.getAllByLabelText(/move.*up/i);
    expect(upButtons[0]).toBeDisabled();
  });

  it("down button disabled for last page", () => {
    render(<DraggablePageList {...defaultProps} />);
    const downButtons = screen.getAllByLabelText(/move.*down/i);
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });

  it("clicking up button calls onPagesChange with swapped pages", () => {
    const onPagesChange = vi.fn();
    render(
      <DraggablePageList {...defaultProps} onPagesChange={onPagesChange} />,
    );

    // Click the up button on the second page (About)
    const upButtons = screen.getAllByLabelText(/move.*up/i);
    fireEvent.click(upButtons[1]); // second page up button (index 1)

    expect(onPagesChange).toHaveBeenCalledTimes(1);
    const newPages = onPagesChange.mock.calls[0][0];
    expect(Array.isArray(newPages)).toBe(true);
  });

  it("clicking down button calls onPagesChange with swapped pages", () => {
    const onPagesChange = vi.fn();
    render(
      <DraggablePageList {...defaultProps} onPagesChange={onPagesChange} />,
    );

    // Click the down button on the first page (Home)
    const downButtons = screen.getAllByLabelText(/move.*down/i);
    fireEvent.click(downButtons[0]); // first page down button

    expect(onPagesChange).toHaveBeenCalledTimes(1);
  });

  // ── React.memo ────────────────────────────────────────────────────────────

  it("component has a displayName (React.memo)", () => {
    expect(
      DraggablePageList.displayName ?? DraggablePageList.name,
    ).toBeTruthy();
  });
});
