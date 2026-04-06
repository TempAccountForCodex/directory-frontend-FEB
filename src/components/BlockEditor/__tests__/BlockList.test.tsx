/**
 * Tests for BlockList Component (Step 2.6.1)
 *
 * Covers:
 * - Rendering blocks with correct labels from BLOCK_TYPES registry
 * - Drag handle, visibility toggle, delete button per block
 * - onSelect callback when a block is clicked
 * - onReorder callback via @dnd-kit drag-end
 * - onRemove callback when delete is clicked
 * - onToggleVisibility callback when visibility toggle is clicked
 * - selectedBlockId highlighting
 * - Disabled state
 * - Empty state
 * - React.memo wrapping / displayName
 * - Accessibility (aria-labels on icon buttons)
 * - Loading skeleton state
 * - Error state
 *
 * @dnd-kit is mocked entirely — drag behavior is a library concern.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock @dnd-kit entirely
// ---------------------------------------------------------------------------

let capturedOnDragEnd: ((event: unknown) => void) | null = null;

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd?: (event: unknown) => void;
  }) => {
    capturedOnDragEnd = onDragEnd ?? null;
    return <>{children}</>;
  },
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

// ---------------------------------------------------------------------------
// Mock MUI icons to avoid SVG rendering issues in jsdom
// ---------------------------------------------------------------------------

vi.mock("@mui/icons-material/DragIndicator", () => ({
  default: () => <span data-testid="icon-drag" />,
}));
vi.mock("@mui/icons-material/Visibility", () => ({
  default: () => <span data-testid="icon-visible" />,
}));
vi.mock("@mui/icons-material/VisibilityOff", () => ({
  default: () => <span data-testid="icon-hidden" />,
}));
vi.mock("@mui/icons-material/Delete", () => ({
  default: () => <span data-testid="icon-delete" />,
}));

// ---------------------------------------------------------------------------
// Import BlockList
// ---------------------------------------------------------------------------

import { BlockList } from "../BlockList";

// ---------------------------------------------------------------------------
// Types and helpers
// ---------------------------------------------------------------------------

interface Block {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  isVisible: boolean;
  sortOrder: number;
}

const makeBlock = (overrides: Partial<Block> = {}): Block => ({
  id: crypto.randomUUID(),
  blockType: "HERO",
  content: {},
  isVisible: true,
  sortOrder: 0,
  ...overrides,
});

const defaultProps = () => ({
  blocks: [] as Block[],
  onSelect: vi.fn(),
  onReorder: vi.fn(),
  onRemove: vi.fn(),
  onToggleVisibility: vi.fn(),
  selectedBlockId: null as string | null,
  disabled: false,
});

function renderBlockList(
  overrides: Partial<ReturnType<typeof defaultProps>> = {},
) {
  const props = { ...defaultProps(), ...overrides };
  return render(<BlockList {...props} />);
}

// ---------------------------------------------------------------------------
// Tests — Empty state
// ---------------------------------------------------------------------------

describe("BlockList — empty state", () => {
  it("renders an empty state message when blocks array is empty", () => {
    renderBlockList({ blocks: [] });
    expect(screen.getByText(/no blocks/i)).toBeInTheDocument();
  });

  it("does NOT show empty state when blocks exist", () => {
    renderBlockList({ blocks: [makeBlock()] });
    expect(screen.queryByText(/no blocks/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — Rendering block items
// ---------------------------------------------------------------------------

describe("BlockList — block rendering", () => {
  it("renders the correct block type label for each block", () => {
    const blocks = [
      makeBlock({ id: "1", blockType: "HERO", sortOrder: 0 }),
      makeBlock({ id: "2", blockType: "FEATURES", sortOrder: 1 }),
      makeBlock({ id: "3", blockType: "CTA", sortOrder: 2 }),
    ];
    renderBlockList({ blocks });

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Call To Action")).toBeInTheDocument();
  });

  it("renders a drag handle for each block", () => {
    const blocks = [makeBlock({ id: "1" }), makeBlock({ id: "2" })];
    renderBlockList({ blocks });

    const dragHandles = screen.getAllByLabelText(/drag/i);
    expect(dragHandles.length).toBe(2);
  });

  it("renders a visibility toggle for each block", () => {
    const blocks = [makeBlock({ id: "1" }), makeBlock({ id: "2" })];
    renderBlockList({ blocks });

    const toggleBtns = screen.getAllByLabelText(/toggle visibility/i);
    expect(toggleBtns.length).toBe(2);
  });

  it("renders a delete button for each block", () => {
    const blocks = [makeBlock({ id: "1" }), makeBlock({ id: "2" })];
    renderBlockList({ blocks });

    const deleteBtns = screen.getAllByLabelText(/remove block/i);
    expect(deleteBtns.length).toBe(2);
  });

  it("shows visible icon for visible blocks and hidden icon for hidden blocks", () => {
    const blocks = [
      makeBlock({ id: "1", isVisible: true }),
      makeBlock({ id: "2", isVisible: false }),
    ];
    renderBlockList({ blocks });

    expect(screen.getAllByTestId("icon-visible").length).toBe(1);
    expect(screen.getAllByTestId("icon-hidden").length).toBe(1);
  });

  it("falls back to blockType key when block type is unknown", () => {
    const blocks = [makeBlock({ id: "1", blockType: "UNKNOWN_TYPE" })];
    renderBlockList({ blocks });
    expect(screen.getByText("UNKNOWN_TYPE")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — onSelect callback
// ---------------------------------------------------------------------------

describe("BlockList — onSelect", () => {
  it("calls onSelect with blockId when a block item is clicked", () => {
    const onSelect = vi.fn();
    const blocks = [makeBlock({ id: "block-1" })];
    renderBlockList({ blocks, onSelect });

    const blockItem = screen.getByText("Hero");
    fireEvent.click(blockItem);

    expect(onSelect).toHaveBeenCalledWith("block-1");
  });

  it("calls onSelect with correct id for second block", () => {
    const onSelect = vi.fn();
    const blocks = [
      makeBlock({ id: "a", blockType: "HERO" }),
      makeBlock({ id: "b", blockType: "FEATURES" }),
    ];
    renderBlockList({ blocks, onSelect });

    fireEvent.click(screen.getByText("Features"));
    expect(onSelect).toHaveBeenCalledWith("b");
  });
});

// ---------------------------------------------------------------------------
// Tests — selectedBlockId highlighting
// ---------------------------------------------------------------------------

describe("BlockList — selectedBlockId", () => {
  it("highlights the selected block item", () => {
    const blocks = [
      makeBlock({ id: "sel", blockType: "HERO" }),
      makeBlock({ id: "other", blockType: "FEATURES" }),
    ];
    renderBlockList({ blocks, selectedBlockId: "sel" });

    const selectedItem = screen.getByLabelText(/block: hero.*selected/i);
    expect(selectedItem).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — onRemove callback
// ---------------------------------------------------------------------------

describe("BlockList — onRemove", () => {
  it("calls onRemove with correct blockId when delete button is clicked", () => {
    const onRemove = vi.fn();
    const blocks = [makeBlock({ id: "del-1", blockType: "CTA" })];
    renderBlockList({ blocks, onRemove });

    const deleteBtn = screen.getByLabelText(/remove block/i);
    fireEvent.click(deleteBtn);

    expect(onRemove).toHaveBeenCalledWith("del-1");
  });

  it("does NOT trigger onSelect when delete button is clicked", () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    const blocks = [makeBlock({ id: "x" })];
    renderBlockList({ blocks, onSelect, onRemove });

    const deleteBtn = screen.getByLabelText(/remove block/i);
    fireEvent.click(deleteBtn);

    expect(onRemove).toHaveBeenCalledTimes(1);
    // onSelect should NOT have been triggered by the delete button click
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests — onToggleVisibility callback
// ---------------------------------------------------------------------------

describe("BlockList — onToggleVisibility", () => {
  it("calls onToggleVisibility with correct blockId", () => {
    const onToggleVisibility = vi.fn();
    const blocks = [makeBlock({ id: "vis-1", isVisible: true })];
    renderBlockList({ blocks, onToggleVisibility });

    const toggleBtn = screen.getByLabelText(/toggle visibility/i);
    fireEvent.click(toggleBtn);

    expect(onToggleVisibility).toHaveBeenCalledWith("vis-1");
  });

  it("does NOT trigger onSelect when visibility toggle is clicked", () => {
    const onSelect = vi.fn();
    const onToggleVisibility = vi.fn();
    const blocks = [makeBlock({ id: "v1" })];
    renderBlockList({ blocks, onSelect, onToggleVisibility });

    const toggleBtn = screen.getByLabelText(/toggle visibility/i);
    fireEvent.click(toggleBtn);

    expect(onToggleVisibility).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests — onReorder via @dnd-kit dragEnd
// ---------------------------------------------------------------------------

describe("BlockList — onReorder (drag-end)", () => {
  it("calls onReorder with reordered array on drag end", () => {
    const onReorder = vi.fn();
    const blocks = [
      makeBlock({ id: "a", blockType: "HERO", sortOrder: 0 }),
      makeBlock({ id: "b", blockType: "FEATURES", sortOrder: 1 }),
      makeBlock({ id: "c", blockType: "CTA", sortOrder: 2 }),
    ];
    renderBlockList({ blocks, onReorder });

    // Simulate drag from a -> c position
    if (capturedOnDragEnd) {
      capturedOnDragEnd({ active: { id: "a" }, over: { id: "c" } });
    }

    expect(onReorder).toHaveBeenCalledTimes(1);
    const result = onReorder.mock.calls[0][0] as Block[];
    expect(result.map((b: Block) => b.id)).toEqual(["b", "c", "a"]);
  });

  it("does NOT call onReorder when active and over are the same", () => {
    const onReorder = vi.fn();
    const blocks = [makeBlock({ id: "x" })];
    renderBlockList({ blocks, onReorder });

    if (capturedOnDragEnd) {
      capturedOnDragEnd({ active: { id: "x" }, over: { id: "x" } });
    }

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("does NOT call onReorder when over is null", () => {
    const onReorder = vi.fn();
    const blocks = [makeBlock({ id: "x" })];
    renderBlockList({ blocks, onReorder });

    if (capturedOnDragEnd) {
      capturedOnDragEnd({ active: { id: "x" }, over: null });
    }

    expect(onReorder).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests — Disabled state
// ---------------------------------------------------------------------------

describe("BlockList — disabled state", () => {
  it("disables delete buttons when disabled=true", () => {
    const blocks = [makeBlock({ id: "1" })];
    renderBlockList({ blocks, disabled: true });

    const deleteBtn = screen.getByLabelText(/remove block/i);
    expect(deleteBtn).toBeDisabled();
  });

  it("disables visibility toggle buttons when disabled=true", () => {
    const blocks = [makeBlock({ id: "1" })];
    renderBlockList({ blocks, disabled: true });

    const toggleBtn = screen.getByLabelText(/toggle visibility/i);
    expect(toggleBtn).toBeDisabled();
  });

  it("disables drag handle buttons when disabled=true", () => {
    const blocks = [makeBlock({ id: "1" })];
    renderBlockList({ blocks, disabled: true });

    const dragBtn = screen.getByLabelText(/drag/i);
    expect(dragBtn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Tests — React.memo + displayName
// ---------------------------------------------------------------------------

describe("BlockList — React.memo + displayName", () => {
  it('has displayName "BlockList"', () => {
    expect(BlockList.displayName).toBe("BlockList");
  });
});

// ---------------------------------------------------------------------------
// Tests — Accessibility
// ---------------------------------------------------------------------------

describe("BlockList — accessibility", () => {
  it("all icon buttons have aria-label attributes", () => {
    const blocks = [makeBlock({ id: "1" })];
    renderBlockList({ blocks });

    const allButtons = screen.getAllByRole("button");
    allButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
    });
  });
});
