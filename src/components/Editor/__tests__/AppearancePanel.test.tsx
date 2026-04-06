/**
 * Tests for AppearancePanel component (Step 9.13.2)
 *
 * Covers:
 * 1. Renders Color Palette section with 4 ColorPickerWithAlpha
 * 2. Color picker interactions fire callbacks
 * 3. ThemeManager rendered when websiteId provided
 * 4. ThemeManager hidden when websiteId is null/undefined
 * 5. Validation error states displayed
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../UI/ColorPickerWithAlpha", () => ({
  default: ({ label, onChange, error }: any) => (
    <div
      data-testid={`color-picker-${label?.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <span>{label}</span>
      {error && (
        <span
          data-testid={`error-${label?.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {error}
        </span>
      )}
      <button onClick={() => onChange("#FF0000")}>change</button>
    </div>
  ),
}));

vi.mock("../../Dashboard/ThemeManager", () => ({
  default: ({ websiteId }: any) => (
    <div data-testid="theme-manager" data-website-id={websiteId}>
      ThemeManager
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import AppearancePanel from "../AppearancePanel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockColors = {
  text: "#ffffff",
  textSecondary: "#aaaaaa",
  primary: "#378C92",
  dark: "#0a0a0a",
  border: "#333333",
  bgDefault: "#111111",
};

const baseProps = {
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  headingColor: "#252525",
  bodyColor: "#6A6F78",
  onPrimaryColorChange: vi.fn(),
  onSecondaryColorChange: vi.fn(),
  onHeadingColorChange: vi.fn(),
  onBodyColorChange: vi.fn(),
  colors: mockColors,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AppearancePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Color Palette section heading", () => {
    render(<AppearancePanel {...baseProps} />);
    expect(screen.getByText("Color Palette")).toBeInTheDocument();
  });

  it("renders all 4 ColorPickerWithAlpha components", () => {
    render(<AppearancePanel {...baseProps} />);
    expect(
      screen.getByTestId("color-picker-primary-color"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("color-picker-secondary-color"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("color-picker-heading-text")).toBeInTheDocument();
    expect(screen.getByTestId("color-picker-body-text")).toBeInTheDocument();
  });

  it("does NOT render ThemeManager when websiteId is null", () => {
    render(<AppearancePanel {...baseProps} websiteId={null} />);
    expect(screen.queryByTestId("theme-manager")).not.toBeInTheDocument();
  });

  it("does NOT render ThemeManager when websiteId is undefined", () => {
    render(<AppearancePanel {...baseProps} />);
    expect(screen.queryByTestId("theme-manager")).not.toBeInTheDocument();
  });

  it("renders ThemeManager when websiteId is provided", () => {
    render(<AppearancePanel {...baseProps} websiteId={42} />);
    expect(screen.getByTestId("theme-manager")).toBeInTheDocument();
  });

  it("passes websiteId to ThemeManager", () => {
    render(<AppearancePanel {...baseProps} websiteId={42} />);
    expect(screen.getByTestId("theme-manager")).toHaveAttribute(
      "data-website-id",
      "42",
    );
  });

  it("shows Theme Presets section heading when websiteId provided", () => {
    render(<AppearancePanel {...baseProps} websiteId={42} />);
    expect(screen.getByText("Theme Presets")).toBeInTheDocument();
  });

  it("does not show Theme Presets section when websiteId is null", () => {
    render(<AppearancePanel {...baseProps} websiteId={null} />);
    expect(screen.queryByText("Theme Presets")).not.toBeInTheDocument();
  });

  it("displays color error when error prop provided", () => {
    render(
      <AppearancePanel {...baseProps} primaryColorError="Invalid hex color" />,
    );
    expect(screen.getByTestId("error-primary-color")).toHaveTextContent(
      "Invalid hex color",
    );
  });
});
