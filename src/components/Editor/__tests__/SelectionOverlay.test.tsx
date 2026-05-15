/**
 * Tests for SelectionOverlay component (Step 9.14.2)
 *
 * Covers:
 * - Renders null when selectedBlock is null
 * - Renders block type badge when selectedBlock provided
 * - Renders quick action buttons (Edit, Duplicate, Delete, MoveUp, MoveDown, Deselect)
 * - Action button clicks fire respective callbacks
 * - AnimatePresence used for enter/exit animation
 * - React.memo applied
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import SelectionOverlay from "../SelectionOverlay";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockColors = {
  panelBg: "#121517",
  border: "rgba(55,140,146,0.15)",
  text: "#F5F5F5",
  textSecondary: "#9FA6AE",
  bgCard: "#121517",
  primary: "#378C92",
};

const makeBlock = (overrides?: Record<string, unknown>) => ({
  id: "block-1",
  blockType: "HERO",
  content: { title: "Welcome", subtitle: "Hello World" },
  ...overrides,
});

const defaultProps = {
  selectedBlock: null as ReturnType<typeof makeBlock> | null,
  onEdit: vi.fn(),
  onDuplicate: vi.fn(),
  onDelete: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  onDeselect: vi.fn(),
  colors: mockColors,
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SelectionOverlay (Step 9.14.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when selectedBlock is null", () => {
    const { container } = render(
      <SelectionOverlay {...defaultProps} selectedBlock={null} />,
    );
    // Should render empty (AnimatePresence with no children)
    expect(
      container.querySelector('[data-testid="selection-overlay"]'),
    ).toBeNull();
  });

  it("renders block type badge when selectedBlock is provided", () => {
    render(<SelectionOverlay {...defaultProps} selectedBlock={makeBlock()} />);

    expect(screen.getByTestId("selection-overlay")).toBeInTheDocument();
    expect(screen.getByText("HERO")).toBeInTheDocument();
  });

  it("renders quick action buttons", () => {
    render(<SelectionOverlay {...defaultProps} selectedBlock={makeBlock()} />);

    expect(screen.getByLabelText("Edit block")).toBeInTheDocument();
    expect(screen.getByLabelText("Duplicate block")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete block")).toBeInTheDocument();
    expect(screen.getByLabelText("Move block up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move block down")).toBeInTheDocument();
    expect(screen.getByLabelText("Deselect block")).toBeInTheDocument();
  });

  it("fires onEdit when edit button clicked", () => {
    const onEdit = vi.fn();
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock()}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByLabelText("Edit block"));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("fires onDuplicate when duplicate button clicked", () => {
    const onDuplicate = vi.fn();
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock()}
        onDuplicate={onDuplicate}
      />,
    );

    fireEvent.click(screen.getByLabelText("Duplicate block"));
    expect(onDuplicate).toHaveBeenCalledTimes(1);
  });

  it("fires onDelete when delete button clicked", () => {
    const onDelete = vi.fn();
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByLabelText("Delete block"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("fires onMoveUp when move up button clicked", () => {
    const onMoveUp = vi.fn();
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock()}
        onMoveUp={onMoveUp}
      />,
    );

    fireEvent.click(screen.getByLabelText("Move block up"));
    expect(onMoveUp).toHaveBeenCalledTimes(1);
  });

  it("fires onMoveDown when move down button clicked", () => {
    const onMoveDown = vi.fn();
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock()}
        onMoveDown={onMoveDown}
      />,
    );

    fireEvent.click(screen.getByLabelText("Move block down"));
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });

  it("fires onDeselect when deselect button clicked", () => {
    const onDeselect = vi.fn();
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock()}
        onDeselect={onDeselect}
      />,
    );

    fireEvent.click(screen.getByLabelText("Deselect block"));
    expect(onDeselect).toHaveBeenCalledTimes(1);
  });

  it("renders different block types correctly", () => {
    render(
      <SelectionOverlay
        {...defaultProps}
        selectedBlock={makeBlock({ blockType: "IMAGE" })}
      />,
    );

    expect(screen.getByText("IMAGE")).toBeInTheDocument();
  });

  it("is wrapped in React.memo (has displayName or type check)", () => {
    // React.memo wrapped components have a $$typeof of Symbol.for('react.memo')
    expect(SelectionOverlay).toBeDefined();
    // Check it's a memo component - memo wraps produce object with type
    expect(typeof SelectionOverlay).toBe("object");
    expect((SelectionOverlay as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for("react.memo"),
    );
  });
});
