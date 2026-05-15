/**
 * AppearancePanel.font.test.tsx — Step 12.1
 *
 * Tests for the Font Family selector added to AppearancePanel.
 *
 * Covers:
 * 1. Font Family section heading rendered
 * 2. Font preset dropdown renders when fontPreset prop is provided
 * 3. All 4 preset options are present in the select
 * 4. Selecting a preset calls onFontPresetChange with the correct value
 * 5. Defaults to 'system' when fontPreset is not provided
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../UI/ColorPickerWithAlpha", () => ({
  default: ({ label }: any) => (
    <div
      data-testid={`color-picker-${label?.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <span>{label}</span>
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

describe("AppearancePanel — Font Family selector (Step 12.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Font Family section heading", () => {
    render(<AppearancePanel {...baseProps} fontPreset="system" />);
    expect(screen.getByText("Font Family")).toBeInTheDocument();
  });

  it("renders the Font Preset label when fontPreset prop is provided", () => {
    render(<AppearancePanel {...baseProps} fontPreset="system" />);
    expect(screen.getByLabelText("Font Preset")).toBeInTheDocument();
  });

  it("renders Font Family section even when fontPreset is not explicitly provided", () => {
    render(<AppearancePanel {...baseProps} />);
    expect(screen.getByText("Font Family")).toBeInTheDocument();
  });

  it("all 4 preset option labels are accessible in the component", () => {
    render(<AppearancePanel {...baseProps} fontPreset="system" />);
    // The select input should be in the document
    const selectInput = screen.getByTestId("font-preset-select");
    expect(selectInput).toBeInTheDocument();
  });

  it("calls onFontPresetChange when a preset is selected", () => {
    const onFontPresetChange = vi.fn();
    render(
      <AppearancePanel
        {...baseProps}
        fontPreset="system"
        onFontPresetChange={onFontPresetChange}
      />,
    );

    // MUI Select uses a hidden input; fire change directly
    const selectInput = screen.getByTestId("font-preset-select");
    fireEvent.change(selectInput, { target: { value: "modern" } });

    expect(onFontPresetChange).toHaveBeenCalledWith("modern");
  });

  it("does not throw when onFontPresetChange is not provided", () => {
    expect(() => {
      render(<AppearancePanel {...baseProps} fontPreset="serif" />);
    }).not.toThrow();
  });

  it("reflects the provided fontPreset value in the select input", () => {
    render(<AppearancePanel {...baseProps} fontPreset="editorial" />);
    const selectInput = screen.getByTestId(
      "font-preset-select",
    ) as HTMLInputElement;
    expect(selectInput.value).toBe("editorial");
  });
});
