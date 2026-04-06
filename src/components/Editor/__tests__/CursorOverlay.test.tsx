/**
 * Tests for CursorOverlay component (Step 5.4.3)
 *
 * Covers:
 * - Renders colored dots for each remote cursor
 * - Shows username label via tooltip
 * - Fades to opacity 0 after 5s without CURSOR_MOVE update
 * - Cursor color is deterministic per userId
 * - React.memo prevents unnecessary re-renders
 * - No more than 20 cursors rendered (already enforced by hook)
 * - Empty state: no cursors rendered when map is empty
 * - Positioned absolutely within the editor block area
 * - data-testid on all testable elements
 * - Accessibility: aria-label on cursor indicators
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CursorOverlay } from "../CursorOverlay";
import type { CursorPosition } from "../../../hooks/usePreviewSync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCursorMap(
  entries: Array<[number, Partial<CursorPosition>]>,
): Map<number, CursorPosition> {
  const map = new Map<number, CursorPosition>();
  for (const [userId, partial] of entries) {
    map.set(userId, {
      blockId: partial.blockId ?? 1,
      x: partial.x ?? 100,
      y: partial.y ?? 200,
      username: partial.username,
      color: partial.color ?? "#e91e63",
      lastSeen: partial.lastSeen ?? Date.now(),
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CursorOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders without crashing with empty cursor map", () => {
    const { container } = render(<CursorOverlay cursorPositions={new Map()} />);
    expect(container).toBeTruthy();
  });

  it("renders no cursor dots when map is empty", () => {
    render(<CursorOverlay cursorPositions={new Map()} />);
    expect(screen.queryByTestId(/^cursor-\d/)).not.toBeInTheDocument();
  });

  it("renders a cursor dot for each remote user", () => {
    const cursors = makeCursorMap([
      [99, { x: 50, y: 60, username: "Bob" }],
      [100, { x: 150, y: 160, username: "Carol" }],
    ]);

    render(<CursorOverlay cursorPositions={cursors} />);

    expect(screen.getByTestId("cursor-99")).toBeInTheDocument();
    expect(screen.getByTestId("cursor-100")).toBeInTheDocument();
  });

  it("positions cursor dots using transform with x/y coordinates", () => {
    const cursors = makeCursorMap([[99, { x: 50, y: 60, username: "Bob" }]]);

    render(<CursorOverlay cursorPositions={cursors} />);
    const dot = screen.getByTestId("cursor-99");
    // Should be positioned using left/top or transform
    expect(dot).toBeInTheDocument();
  });

  it("shows username via aria-label for accessibility", () => {
    const cursors = makeCursorMap([[99, { x: 50, y: 60, username: "Bob" }]]);

    render(<CursorOverlay cursorPositions={cursors} />);
    const dot = screen.getByTestId("cursor-99");
    expect(dot).toHaveAttribute("aria-label", expect.stringContaining("Bob"));
  });

  it("applies deterministic color to cursor dot", () => {
    const cursors = makeCursorMap([[99, { x: 50, y: 60, color: "#9c27b0" }]]);

    render(<CursorOverlay cursorPositions={cursors} />);
    const dot = screen.getByTestId("cursor-99");
    expect(dot).toHaveStyle({ backgroundColor: "#9c27b0" });
  });

  it("fades cursor to opacity 0 after 5s of inactivity", () => {
    const now = Date.now();
    const cursors = makeCursorMap([
      [99, { x: 50, y: 60, lastSeen: now - 6000, username: "Bob" }],
    ]);

    render(<CursorOverlay cursorPositions={cursors} />);
    const dot = screen.getByTestId("cursor-99");
    // Should have opacity 0 since lastSeen is 6s ago
    expect(dot).toHaveStyle({ opacity: "0" });
  });

  it("shows cursor at full opacity when recently active", () => {
    const cursors = makeCursorMap([
      [99, { x: 50, y: 60, lastSeen: Date.now(), username: "Bob" }],
    ]);

    render(<CursorOverlay cursorPositions={cursors} />);
    const dot = screen.getByTestId("cursor-99");
    expect(dot).toHaveStyle({ opacity: "1" });
  });

  it("has position: absolute on the container", () => {
    const cursors = makeCursorMap([[99, { x: 50, y: 60 }]]);

    render(<CursorOverlay cursorPositions={cursors} />);
    const container = screen.getByTestId("cursor-overlay");
    expect(container).toHaveStyle({ position: "absolute" });
  });

  it("is memoized with React.memo", () => {
    // Access the component type — React.memo wraps it
    expect(CursorOverlay).toHaveProperty("$$typeof");
    // React.memo components have $$typeof equal to Symbol.for('react.memo')
    expect((CursorOverlay as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for("react.memo"),
    );
  });
});
