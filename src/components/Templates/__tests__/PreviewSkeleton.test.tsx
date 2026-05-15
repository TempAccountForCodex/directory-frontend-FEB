/**
 * Tests for PreviewSkeleton, PreviewImageError, PreviewNetworkError (Step 4.6.5)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

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
  }),
}));

import {
  PreviewCardSkeleton,
  PreviewImageError,
  PreviewNetworkError,
  PreviewTimeoutWarning,
  usePreviewTimeout,
} from "../PreviewSkeleton";

describe("PreviewCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<PreviewCardSkeleton />);
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });
});

describe("PreviewImageError", () => {
  it("shows error message", () => {
    render(<PreviewImageError message="Test error" />);
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("shows default message when none provided", () => {
    render(<PreviewImageError />);
    expect(screen.getByText("Failed to load preview")).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<PreviewImageError onRetry={onRetry} />);
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show retry button without onRetry", () => {
    render(<PreviewImageError />);
    expect(
      screen.queryByRole("button", { name: /retry/i }),
    ).not.toBeInTheDocument();
  });

  it("has ARIA alert role", () => {
    render(<PreviewImageError message="Error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("PreviewNetworkError", () => {
  it("shows offline message", () => {
    render(<PreviewNetworkError />);
    expect(screen.getByText("Unable to connect")).toBeInTheDocument();
    expect(screen.getByText(/check your internet/i)).toBeInTheDocument();
  });

  it("shows try again button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<PreviewNetworkError onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("PreviewTimeoutWarning", () => {
  it("renders when visible=true", () => {
    render(<PreviewTimeoutWarning visible={true} />);
    expect(screen.getByText(/taking longer/i)).toBeInTheDocument();
  });

  it("renders nothing when visible=false", () => {
    const { container } = render(<PreviewTimeoutWarning visible={false} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("usePreviewTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function TestComponent({
    loading,
    timeout,
  }: {
    loading: boolean;
    timeout?: number;
  }) {
    const timedOut = usePreviewTimeout(loading, timeout);
    return <div data-testid="result">{timedOut ? "timed-out" : "ok"}</div>;
  }

  it("returns false initially", () => {
    render(<TestComponent loading={true} />);
    expect(screen.getByTestId("result").textContent).toBe("ok");
  });

  it("returns true after timeout while loading", () => {
    render(<TestComponent loading={true} timeout={1000} />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByTestId("result").textContent).toBe("timed-out");
  });

  it("resets when loading becomes false", () => {
    const { rerender } = render(
      <TestComponent loading={true} timeout={1000} />,
    );
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByTestId("result").textContent).toBe("timed-out");

    rerender(<TestComponent loading={false} timeout={1000} />);
    expect(screen.getByTestId("result").textContent).toBe("ok");
  });
});
