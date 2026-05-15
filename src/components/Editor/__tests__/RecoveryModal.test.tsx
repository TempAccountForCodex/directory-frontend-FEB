/**
 * Tests for RecoveryModal component (Step 5.10)
 *
 * Covers:
 * - Renders when open=true
 * - Does not render when open=false
 * - Shows time-ago message
 * - Restore button calls onRestore
 * - Discard button calls onDiscard
 * - Auto-dismisses after 30 seconds (calls onDiscard)
 * - Progress bar present
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import RecoveryModal from "../RecoveryModal";

describe("RecoveryModal", () => {
  const defaultProps = {
    open: true,
    timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    onRestore: vi.fn(),
    onDiscard: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders dialog when open=true", () => {
    render(<RecoveryModal {...defaultProps} />);
    expect(screen.getByText("Unsaved Changes Detected")).toBeInTheDocument();
  });

  it("does not render dialog content when open=false", () => {
    render(<RecoveryModal {...defaultProps} open={false} />);
    expect(
      screen.queryByText("Unsaved Changes Detected"),
    ).not.toBeInTheDocument();
  });

  it("shows time-ago message", () => {
    render(<RecoveryModal {...defaultProps} />);
    expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
  });

  it('shows "just now" for very recent timestamp', () => {
    render(<RecoveryModal {...defaultProps} timestamp={Date.now() - 10000} />);
    expect(screen.getByText(/just now/)).toBeInTheDocument();
  });

  it("calls onRestore when Restore button clicked", () => {
    render(<RecoveryModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("recovery-restore"));
    expect(defaultProps.onRestore).toHaveBeenCalledTimes(1);
  });

  it("calls onDiscard when Discard button clicked", () => {
    render(<RecoveryModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("recovery-discard"));
    expect(defaultProps.onDiscard).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after 30 seconds by calling onDiscard", () => {
    render(<RecoveryModal {...defaultProps} />);

    expect(defaultProps.onDiscard).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(defaultProps.onDiscard).toHaveBeenCalledTimes(1);
  });

  it("does NOT auto-dismiss if Restore was clicked before timeout", () => {
    render(<RecoveryModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId("recovery-restore"));
    expect(defaultProps.onRestore).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    // onDiscard should not be called after Restore was clicked
    expect(defaultProps.onDiscard).not.toHaveBeenCalled();
  });

  it("renders progress bar", () => {
    render(<RecoveryModal {...defaultProps} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows auto-dismiss warning text", () => {
    render(<RecoveryModal {...defaultProps} />);
    expect(screen.getByText(/30 seconds/)).toBeInTheDocument();
  });
});
