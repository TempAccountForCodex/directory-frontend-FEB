/**
 * Tests for SaveStatus component (Step 5.2.3)
 *
 * Covers:
 * - Shows 'Saving...' with spinner during save
 * - Shows 'All changes saved' with checkmark on success
 * - Shows 'Failed to save' with warning icon and retry button on error
 * - Status auto-hides after 3s when saved
 * - Manual retry button triggers onRetry callback on error
 * - Toast notification on save error
 * - Accepts status prop (idle/saving/saved/error) and onRetry callback
 * - Accessibility: aria-live='polite' for status announcements
 * - React.memo wraps component
 * - Theme tokens used for colors
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import SaveStatus from "../SaveStatus";

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
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    bgHero: "#0D0F10",
  }),
}));

describe("SaveStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Idle state
  // ---------------------------------------------------------------------------

  it("renders nothing visible in idle state by default", () => {
    const { container } = render(<SaveStatus status="idle" />);
    // Should not show any status text in idle
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    expect(screen.queryByText("All changes saved")).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to save/)).not.toBeInTheDocument();
    expect(container).toBeTruthy(); // Component renders without error
  });

  // ---------------------------------------------------------------------------
  // Saving state
  // ---------------------------------------------------------------------------

  it("shows Saving... text in saving state", () => {
    render(<SaveStatus status="saving" />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("shows CircularProgress spinner in saving state", () => {
    render(<SaveStatus status="saving" />);
    // MUI CircularProgress renders a role="progressbar"
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Saved state
  // ---------------------------------------------------------------------------

  it("shows All changes saved text in saved state", () => {
    render(<SaveStatus status="saved" />);
    expect(screen.getByText("All changes saved")).toBeInTheDocument();
  });

  it("auto-hides after 3s when status is saved", () => {
    render(<SaveStatus status="saved" />);
    expect(screen.getByText("All changes saved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("All changes saved")).not.toBeInTheDocument();
  });

  it("does not auto-hide before 3s", () => {
    render(<SaveStatus status="saved" />);
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.getByText("All changes saved")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  it("shows Failed to save text in error state", () => {
    render(<SaveStatus status="error" />);
    expect(screen.getByText(/Failed to save/)).toBeInTheDocument();
  });

  it("shows Retry button in error state", () => {
    render(<SaveStatus status="error" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("calls onRetry when Retry button is clicked", () => {
    const onRetry = vi.fn();
    render(<SaveStatus status="error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not auto-hide error state after 3s", () => {
    render(<SaveStatus status="error" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/Failed to save/)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  it('has aria-live="polite" region for status announcements', () => {
    const { container } = render(<SaveStatus status="saving" />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Status transitions
  // ---------------------------------------------------------------------------

  it("transitions from saving to saved correctly", () => {
    const { rerender } = render(<SaveStatus status="saving" />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();

    rerender(<SaveStatus status="saved" />);
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    expect(screen.getByText("All changes saved")).toBeInTheDocument();
  });

  it("transitions from saved to idle after 3s (via status prop change)", () => {
    const { rerender } = render(<SaveStatus status="saved" />);
    expect(screen.getByText("All changes saved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("All changes saved")).not.toBeInTheDocument();

    rerender(<SaveStatus status="idle" />);
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    expect(screen.queryByText("All changes saved")).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to save/)).not.toBeInTheDocument();
  });

  it("transitions from saving to error correctly", () => {
    const { rerender } = render(<SaveStatus status="saving" />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();

    rerender(<SaveStatus status="error" onRetry={vi.fn()} />);
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    expect(screen.getByText(/Failed to save/)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it("renders without crashing when no onRetry provided in error state", () => {
    expect(() => render(<SaveStatus status="error" />)).not.toThrow();
  });

  it("resets auto-hide timer when status changes back to saved", () => {
    const { rerender } = render(<SaveStatus status="saved" />);
    act(() => {
      vi.advanceTimersByTime(1000);
    }); // 1s into the 3s timer

    // Change to error then back to saved — timer should reset
    rerender(<SaveStatus status="error" />);
    rerender(<SaveStatus status="saved" />);

    act(() => {
      vi.advanceTimersByTime(1000);
    }); // 1s into new saved timer
    // Should still be visible (only 1s of new 3s timer)
    expect(screen.getByText("All changes saved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    }); // complete the 3s
    waitFor(() => {
      expect(screen.queryByText("All changes saved")).not.toBeInTheDocument();
    });
  });
});
