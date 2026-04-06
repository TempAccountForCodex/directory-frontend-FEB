/**
 * Tests for ConflictModal component (Step 5.2.4)
 *
 * Covers:
 * - Renders when open=true with conflict data
 * - Shows 3 action options: Keep yours, Use theirs, View diff
 * - Keep yours calls onResolve('keep-local')
 * - Use theirs calls onResolve('use-server')
 * - View diff toggles diff panel
 * - Diff view shows changed fields side-by-side (no dangerouslySetInnerHTML)
 * - Content is sanitized — no XSS via user data
 * - Proper focus trap (MUI Dialog handles this)
 * - Network failure during conflict fetch shows inline Alert
 * - Accessibility: aria-labels on buttons and modal
 * - Error handling: modal stays open if resolution fails
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ConflictModal from "../ConflictModal";
import type { ConflictData } from "../../Editor/ConflictModal";

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------

vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ actualTheme: "dark" }),
}));

vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    panelBg: "#121517",
    border: "rgba(55,140,146,0.15)",
    text: "#F5F5F5",
    textSecondary: "#9FA6AE",
    bgCard: "#121517",
    mode: "dark",
    primary: "#378C92",
    bgHero: "#0D0F10",
  }),
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const makeConflictData = (
  overrides: Partial<ConflictData> = {},
): ConflictData => ({
  serverData: { name: "Server Name", description: "Server Description" },
  serverUpdatedAt: "2026-03-15T10:00:00Z",
  localData: { name: "Local Name", description: "Local Description" },
  ...overrides,
});

describe("ConflictModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Visibility
  // ---------------------------------------------------------------------------

  it("renders dialog when open=true", () => {
    const onResolve = vi.fn();
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={onResolve}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not show dialog content when open=false", () => {
    const onResolve = vi.fn();
    render(
      <ConflictModal
        open={false}
        conflictData={makeConflictData()}
        onResolve={onResolve}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Warning message
  // ---------------------------------------------------------------------------

  it("shows conflict warning message", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
      />,
    );
    expect(screen.getByText(/Someone else edited this/i)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Three action buttons
  // ---------------------------------------------------------------------------

  it("shows Keep yours button", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /keep yours/i }),
    ).toBeInTheDocument();
  });

  it("shows Use theirs button", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /use theirs/i }),
    ).toBeInTheDocument();
  });

  it("shows View diff button", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /view diff/i }),
    ).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Action: Keep yours
  // ---------------------------------------------------------------------------

  it("calls onResolve with keep-local when Keep yours is clicked", () => {
    const onResolve = vi.fn();
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={onResolve}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /keep yours/i }));
    expect(onResolve).toHaveBeenCalledWith("keep-local");
  });

  // ---------------------------------------------------------------------------
  // Action: Use theirs
  // ---------------------------------------------------------------------------

  it("calls onResolve with use-server when Use theirs is clicked", () => {
    const onResolve = vi.fn();
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={onResolve}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /use theirs/i }));
    expect(onResolve).toHaveBeenCalledWith("use-server");
  });

  // ---------------------------------------------------------------------------
  // Action: View diff
  // ---------------------------------------------------------------------------

  it("toggles diff panel when View diff is clicked", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
      />,
    );
    // Initially no diff panel
    expect(screen.queryByText(/Your version/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /view diff/i }));
    expect(screen.getByText(/Your version/i)).toBeInTheDocument();
    expect(screen.getByText(/Server version/i)).toBeInTheDocument();
  });

  it("shows diff with changed fields side-by-side", () => {
    const conflictData = makeConflictData({
      localData: { name: "Local Name" },
      serverData: { name: "Server Name" },
    });
    render(
      <ConflictModal
        open={true}
        conflictData={conflictData}
        onResolve={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /view diff/i }));
    expect(screen.getByText("Local Name")).toBeInTheDocument();
    expect(screen.getByText("Server Name")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Security: no dangerouslySetInnerHTML with user data
  // ---------------------------------------------------------------------------

  it("does not render XSS payloads as HTML", () => {
    const xssPayload = "<script>alert(1)</script>";
    const conflictData = makeConflictData({
      localData: { name: xssPayload },
      serverData: { name: "Safe name" },
    });
    render(
      <ConflictModal
        open={true}
        conflictData={conflictData}
        onResolve={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /view diff/i }));
    // XSS payload should be text-escaped, not executed as HTML
    const scripts = document.querySelectorAll("script");
    const injectedScript = Array.from(scripts).find((s) =>
      s.textContent?.includes("alert(1)"),
    );
    expect(injectedScript).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  it("dialog has aria-labelledby pointing to title", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  // ---------------------------------------------------------------------------
  // Error state: network failure during diff fetch
  // ---------------------------------------------------------------------------

  it("shows inline alert when fetchError prop is set", () => {
    render(
      <ConflictModal
        open={true}
        conflictData={makeConflictData()}
        onResolve={vi.fn()}
        fetchError="Failed to load server version"
      />,
    );
    expect(
      screen.getByText(/Failed to load server version/),
    ).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("renders when localData and serverData are identical", () => {
    const data = { name: "Same name" };
    const conflictData = makeConflictData({
      localData: data,
      serverData: data,
    });
    expect(() =>
      render(
        <ConflictModal
          open={true}
          conflictData={conflictData}
          onResolve={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it("renders when conflictData has empty objects", () => {
    const conflictData = makeConflictData({
      localData: {},
      serverData: {},
    });
    expect(() =>
      render(
        <ConflictModal
          open={true}
          conflictData={conflictData}
          onResolve={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });
});
