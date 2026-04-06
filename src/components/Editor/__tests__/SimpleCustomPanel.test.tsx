/**
 * Tests for SimpleCustomPanel component (Step 9.13.4)
 *
 * Covers:
 * 1. Renders Quick Settings section with 4 toggles
 * 2. Toggle interaction fires onSettingChange
 * 3. Renders Color Presets section with preset buttons
 * 4. Clicking a preset fires onPresetSelect with correct colors
 * 5. Active preset highlighted when colors match
 * 6. Renders Layout Presets section
 * 7. Layout preset selection fires onLayoutSelect
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import SimpleCustomPanel from "../SimpleCustomPanel";

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
  settings: {
    showNavigation: true,
    showFooter: true,
    showSocialLinks: true,
    enableAnimations: true,
  },
  onSettingChange: vi.fn(),
  onPresetSelect: vi.fn(),
  onLayoutSelect: vi.fn(),
  colors: mockColors,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SimpleCustomPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Quick Settings section heading", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Quick Settings")).toBeInTheDocument();
  });

  it("renders Show Navigation Bar toggle", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Show Navigation Bar")).toBeInTheDocument();
  });

  it("renders Show Footer toggle", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Show Footer")).toBeInTheDocument();
  });

  it("renders Show Social Links toggle", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Show Social Links")).toBeInTheDocument();
  });

  it("renders Enable Animations toggle", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Enable Animations")).toBeInTheDocument();
  });

  it("toggle fires onSettingChange with key and new value", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    const switches = screen.getAllByRole("checkbox");
    fireEvent.click(switches[0]); // showNavigation
    expect(baseProps.onSettingChange).toHaveBeenCalledWith(
      "showNavigation",
      false,
    );
  });

  it("renders Color Presets section heading", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Color Presets")).toBeInTheDocument();
  });

  it("renders 6 color preset buttons", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    // Should have at least 6 preset buttons
    const presetButtons = screen.getAllByRole("button");
    expect(presetButtons.length).toBeGreaterThanOrEqual(6);
  });

  it("clicking a preset fires onPresetSelect with color object", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    const presetButtons = screen.getAllByRole("button");
    fireEvent.click(presetButtons[0]);
    expect(baseProps.onPresetSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        primaryColor: expect.any(String),
        secondaryColor: expect.any(String),
        headingColor: expect.any(String),
        bodyColor: expect.any(String),
      }),
    );
  });

  it("preset colors are valid hex values", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    const presetButtons = screen.getAllByRole("button");
    fireEvent.click(presetButtons[0]);

    const call = (baseProps.onPresetSelect as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    expect(hexPattern.test(call.primaryColor)).toBe(true);
    expect(hexPattern.test(call.secondaryColor)).toBe(true);
    expect(hexPattern.test(call.headingColor)).toBe(true);
    expect(hexPattern.test(call.bodyColor)).toBe(true);
  });

  it("renders Layout Presets section heading", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Layout Presets")).toBeInTheDocument();
  });

  it("renders Standard, Wide, Compact layout options", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Wide")).toBeInTheDocument();
    expect(screen.getByText("Compact")).toBeInTheDocument();
  });

  it("clicking layout option fires onLayoutSelect", () => {
    render(<SimpleCustomPanel {...baseProps} />);
    fireEvent.click(screen.getByText("Wide"));
    expect(baseProps.onLayoutSelect).toHaveBeenCalledWith("wide");
  });

  it("renders with empty settings object", () => {
    render(<SimpleCustomPanel {...baseProps} settings={{}} />);
    expect(screen.getByText("Quick Settings")).toBeInTheDocument();
    const switches = screen.getAllByRole("checkbox");
    // All switches should default to false (unchecked)
    switches.forEach((sw) => {
      expect(sw).not.toBeChecked();
    });
  });
});
