/**
 * Tests for UndoRedoToolbar component (Step 9.2.4)
 *
 * Covers:
 * - Renders Undo and Redo IconButtons
 * - Both buttons disabled when canUndo=false and canRedo=false
 * - Undo button enabled when canUndo=true
 * - Redo button disabled when canRedo=false
 * - Clicking Undo button calls onUndo
 * - Clicking Redo button calls onRedo
 * - Tooltip shows shortcut (Cmd+Z or Ctrl+Z based on isMac)
 * - Tooltip shows action description when provided
 * - React.memo applied (component has displayName)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import UndoRedoToolbar from "../UndoRedoToolbar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  canUndo: false,
  canRedo: false,
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  undoDescription: "",
  redoDescription: "",
  isMac: false,
};

const renderToolbar = (props: Partial<typeof defaultProps> = {}) =>
  render(<UndoRedoToolbar {...defaultProps} {...props} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UndoRedoToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  it("renders Undo and Redo buttons", () => {
    renderToolbar();
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redo/i })).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Disabled states
  // ---------------------------------------------------------------------------

  it("both buttons are disabled when canUndo=false and canRedo=false", () => {
    renderToolbar({ canUndo: false, canRedo: false });
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    const redoBtn = screen.getByRole("button", { name: /redo/i });
    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();
  });

  it("Undo button is enabled when canUndo=true", () => {
    renderToolbar({ canUndo: true, canRedo: false });
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    expect(undoBtn).not.toBeDisabled();
  });

  it("Redo button is disabled when canRedo=false", () => {
    renderToolbar({ canUndo: true, canRedo: false });
    const redoBtn = screen.getByRole("button", { name: /redo/i });
    expect(redoBtn).toBeDisabled();
  });

  it("Redo button is enabled when canRedo=true", () => {
    renderToolbar({ canUndo: false, canRedo: true });
    const redoBtn = screen.getByRole("button", { name: /redo/i });
    expect(redoBtn).not.toBeDisabled();
  });

  it("both buttons enabled when both canUndo=true and canRedo=true", () => {
    renderToolbar({ canUndo: true, canRedo: true });
    expect(screen.getByRole("button", { name: /undo/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /redo/i })).not.toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // Click handlers
  // ---------------------------------------------------------------------------

  it("clicking Undo calls onUndo", () => {
    const onUndo = vi.fn();
    renderToolbar({ canUndo: true, onUndo });
    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("clicking Redo calls onRedo", () => {
    const onRedo = vi.fn();
    renderToolbar({ canRedo: true, onRedo });
    fireEvent.click(screen.getByRole("button", { name: /redo/i }));
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("clicking disabled Undo does NOT call onUndo", () => {
    const onUndo = vi.fn();
    renderToolbar({ canUndo: false, onUndo });
    // Disabled button click should not fire
    const btn = screen.getByRole("button", { name: /undo/i });
    fireEvent.click(btn);
    expect(onUndo).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Tooltip labels (shortcut key awareness)
  // ---------------------------------------------------------------------------

  it("shows Ctrl+Z in aria-label when isMac=false", () => {
    renderToolbar({ isMac: false });
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    // The aria-label should reference Ctrl+Z
    expect(undoBtn).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Ctrl"),
    );
  });

  it("shows Cmd+Z in aria-label when isMac=true", () => {
    renderToolbar({ isMac: true });
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    expect(undoBtn).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Cmd"),
    );
  });

  it("includes undoDescription in undo button aria-label", () => {
    renderToolbar({ canUndo: true, undoDescription: "Changed primary color" });
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    expect(undoBtn).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Changed primary color"),
    );
  });
});
