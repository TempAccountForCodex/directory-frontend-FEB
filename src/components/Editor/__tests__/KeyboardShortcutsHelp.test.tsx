/**
 * Tests for KeyboardShortcutsHelp component (Step 9.6.4)
 *
 * Covers:
 * - Renders a Dialog when open=true
 * - Does NOT render dialog content when open=false
 * - Shows shortcuts grouped by category
 * - Platform-specific keys: 'Cmd' on Mac, 'Ctrl' on Windows
 * - Search/filter by description
 * - Search/filter by key combo
 * - aria-label on dialog for screen reader
 * - Close button calls onClose
 * - Empty state when no shortcuts match filter
 * - First-time tooltip: shown when localStorage flag absent
 * - First-time tooltip: NOT shown when localStorage flag present
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import KeyboardShortcutsHelp from "../KeyboardShortcutsHelp";
import type { ShortcutEntry } from "../../../hooks/useShortcutManager";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeShortcuts = (): ReadonlyMap<string, ShortcutEntry> => {
  const map = new Map<string, ShortcutEntry>();
  map.set("ctrl+s", {
    key: "ctrl+s",
    action: vi.fn(),
    description: "Save changes",
    category: "Editing",
    scope: "global",
  });
  map.set("ctrl+b", {
    key: "ctrl+b",
    action: vi.fn(),
    description: "Toggle block library",
    category: "Blocks",
    scope: "global",
  });
  map.set("ctrl+shift+p", {
    key: "ctrl+shift+p",
    action: vi.fn(),
    description: "Open preview",
    category: "Navigation",
    scope: "global",
  });
  map.set("delete", {
    key: "delete",
    action: vi.fn(),
    description: "Delete selected block",
    category: "Blocks",
    scope: "editor",
  });
  return map;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("KeyboardShortcutsHelp", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    // Default: no localStorage flag set (returns null)
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  // -------------------------------------------------------------------------
  // Open / closed state
  // -------------------------------------------------------------------------

  it("renders dialog content when open=true", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render dialog when open=false", () => {
    render(
      <KeyboardShortcutsHelp
        open={false}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  it("dialog has aria-label for screen readers", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label");
  });

  // -------------------------------------------------------------------------
  // Content — shortcuts listed
  // -------------------------------------------------------------------------

  it("shows shortcut descriptions in the dialog", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    expect(screen.getByText("Save changes")).toBeInTheDocument();
    expect(screen.getByText("Toggle block library")).toBeInTheDocument();
    expect(screen.getByText("Open preview")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Category grouping
  // -------------------------------------------------------------------------

  it("shows category headers (Editing, Blocks, Navigation)", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    expect(screen.getByText("Editing")).toBeInTheDocument();
    expect(screen.getByText("Blocks")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Platform display
  // -------------------------------------------------------------------------

  it('shows "Ctrl" on non-Mac', () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    // Should have at least one mention of Ctrl in the key display area
    const ctrlChips = screen.getAllByText(/ctrl/i);
    expect(ctrlChips.length).toBeGreaterThan(0);
  });

  it('shows "Cmd" on Mac', () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={true}
      />,
    );
    // On Mac, ctrl in combo should be shown as Cmd
    const cmdChips = screen.getAllByText(/cmd/i);
    expect(cmdChips.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Search / filter
  // -------------------------------------------------------------------------

  it("filters shortcuts by description when typing in search box", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "save" } });

    expect(screen.getByText("Save changes")).toBeInTheDocument();
    expect(screen.queryByText("Toggle block library")).not.toBeInTheDocument();
    expect(screen.queryByText("Open preview")).not.toBeInTheDocument();
  });

  it("shows empty state when search yields no results", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "xyznotfound" } });

    expect(screen.getByText(/no shortcuts/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Close button
  // -------------------------------------------------------------------------

  it("calls onClose when Close button is clicked", () => {
    render(
      <KeyboardShortcutsHelp
        open={true}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
      />,
    );
    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // First-time tooltip
  // -------------------------------------------------------------------------

  it("shows first-time snackbar when localStorage flag is not set", () => {
    // Mock getItem to return null (flag not set)
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    render(
      <KeyboardShortcutsHelp
        open={false}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
        showFirstTimeHint={true}
      />,
    );
    expect(screen.getByText(/ctrl\+\?/i)).toBeInTheDocument();
  });

  it("does NOT show first-time snackbar when localStorage flag is present", () => {
    // Mock getItem to return a value (flag is set)
    vi.mocked(localStorage.getItem).mockReturnValue("1");
    render(
      <KeyboardShortcutsHelp
        open={false}
        onClose={onClose}
        shortcuts={makeShortcuts()}
        isMac={false}
        showFirstTimeHint={true}
      />,
    );
    expect(screen.queryByText(/ctrl\+\?/i)).not.toBeInTheDocument();
  });
});
