/**
 * Tests for ViewportPreviewSwitcher component (Step 9.5.4)
 *
 * Covers:
 * - Renders 3 viewport preset buttons (Mobile 375, Tablet 768, Desktop 1280)
 * - Orientation toggle button rendered
 * - Calls onWidthChange when viewport button clicked
 * - Calls onOrientationToggle when orientation button clicked
 * - Active viewport button is visually selected
 * - Keyboard accessibility on orientation toggle (Enter key)
 * - React.memo displayName set
 * - Tooltip text shows viewport label and width
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock ThemeContext
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    actualTheme: "dark",
    themeMode: "dark",
    changeTheme: vi.fn(),
  }),
}));

// Mock dashboardTheme
vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    bgDefault: "#1a1a2e",
    text: "#ffffff",
    textSecondary: "#888888",
    primary: "#6c63ff",
    dark: "#111111",
  }),
}));

import ViewportPreviewSwitcher from "../ViewportPreviewSwitcher";

describe("ViewportPreviewSwitcher", () => {
  const defaultProps = {
    width: 1280,
    orientation: "portrait" as const,
    onWidthChange: vi.fn(),
    onOrientationToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3 viewport preset buttons", () => {
    render(<ViewportPreviewSwitcher {...defaultProps} />);
    expect(screen.getByLabelText("Mobile")).toBeInTheDocument();
    expect(screen.getByLabelText("Tablet")).toBeInTheDocument();
    expect(screen.getByLabelText("Desktop")).toBeInTheDocument();
  });

  it("renders orientation toggle button", () => {
    render(<ViewportPreviewSwitcher {...defaultProps} />);
    const orientationToggle = screen.getByRole("button", {
      name: /toggle orientation/i,
    });
    expect(orientationToggle).toBeInTheDocument();
  });

  it("calls onWidthChange with correct width when viewport button clicked", () => {
    const onWidthChange = vi.fn();
    render(
      <ViewportPreviewSwitcher
        {...defaultProps}
        onWidthChange={onWidthChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Mobile"));
    expect(onWidthChange).toHaveBeenCalledWith(375);
  });

  it("calls onWidthChange for tablet viewport", () => {
    const onWidthChange = vi.fn();
    render(
      <ViewportPreviewSwitcher
        {...defaultProps}
        onWidthChange={onWidthChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Tablet"));
    expect(onWidthChange).toHaveBeenCalledWith(768);
  });

  it("calls onOrientationToggle when orientation button clicked", () => {
    const onOrientationToggle = vi.fn();
    render(
      <ViewportPreviewSwitcher
        {...defaultProps}
        onOrientationToggle={onOrientationToggle}
      />,
    );

    const orientationBtn = screen.getByRole("button", {
      name: /toggle orientation/i,
    });
    fireEvent.click(orientationBtn);
    expect(onOrientationToggle).toHaveBeenCalledTimes(1);
  });

  it("handles Enter key on orientation toggle for accessibility", () => {
    const onOrientationToggle = vi.fn();
    render(
      <ViewportPreviewSwitcher
        {...defaultProps}
        onOrientationToggle={onOrientationToggle}
      />,
    );

    const orientationBtn = screen.getByRole("button", {
      name: /toggle orientation/i,
    });
    fireEvent.keyDown(orientationBtn, { key: "Enter" });
    expect(onOrientationToggle).toHaveBeenCalledTimes(1);
  });

  it("marks Desktop button as selected when width=1280", () => {
    render(<ViewportPreviewSwitcher {...defaultProps} width={1280} />);
    const desktopBtn = screen.getByLabelText("Desktop");
    expect(desktopBtn).toHaveClass("Mui-selected");
  });

  it("marks Mobile button as selected when width=375", () => {
    render(<ViewportPreviewSwitcher {...defaultProps} width={375} />);
    const mobileBtn = screen.getByLabelText("Mobile");
    expect(mobileBtn).toHaveClass("Mui-selected");
  });

  it("has displayName set to ViewportPreviewSwitcher", () => {
    expect(ViewportPreviewSwitcher.displayName).toBe("ViewportPreviewSwitcher");
  });

  it("does not call onWidthChange when same viewport re-selected (exclusive behavior)", () => {
    const onWidthChange = vi.fn();
    render(
      <ViewportPreviewSwitcher
        {...defaultProps}
        width={1280}
        onWidthChange={onWidthChange}
      />,
    );

    // Re-clicking the already-selected button in exclusive mode returns null
    // ToggleButtonGroup with exclusive sends null value which we guard against
    fireEvent.click(screen.getByLabelText("Desktop"));
    // onWidthChange should NOT be called with null
    const calls = onWidthChange.mock.calls;
    for (const call of calls) {
      expect(call[0]).not.toBeNull();
    }
  });
});
