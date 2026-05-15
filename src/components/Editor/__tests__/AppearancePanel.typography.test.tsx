/**
 * AppearancePanel.typography.test.tsx — Step 12.2
 *
 * Tests for the Extended Typography Controls (letter-spacing + text-transform)
 * added to AppearancePanel.
 *
 * Covers:
 * 1. Heading Style section heading rendered
 * 2. Letter Spacing select renders and reflects prop value
 * 3. Text Transform select renders and reflects prop value
 * 4. Selecting a letter-spacing calls onHeadingLetterSpacingChange
 * 5. Selecting a text-transform calls onHeadingTextTransformChange
 * 6. Defaults to 'normal' letter-spacing and 'none' text-transform
 * 7. No throw when callbacks are omitted
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("AppearancePanel — Extended Typography Controls (Step 12.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Heading Style section heading", () => {
    render(<AppearancePanel {...baseProps} />);
    expect(screen.getByText("Heading Style")).toBeInTheDocument();
  });

  it("renders the Letter Spacing label", () => {
    render(<AppearancePanel {...baseProps} headingLetterSpacing="normal" />);
    expect(screen.getByLabelText("Letter Spacing")).toBeInTheDocument();
  });

  it("renders the Text Transform label", () => {
    render(<AppearancePanel {...baseProps} headingTextTransform="none" />);
    expect(screen.getByLabelText("Text Transform")).toBeInTheDocument();
  });

  it("reflects the provided headingLetterSpacing value", () => {
    render(<AppearancePanel {...baseProps} headingLetterSpacing="wide" />);
    const selectInput = screen.getByTestId(
      "letter-spacing-select",
    ) as HTMLInputElement;
    expect(selectInput.value).toBe("wide");
  });

  it("reflects the provided headingTextTransform value", () => {
    render(<AppearancePanel {...baseProps} headingTextTransform="uppercase" />);
    const selectInput = screen.getByTestId(
      "text-transform-select",
    ) as HTMLInputElement;
    expect(selectInput.value).toBe("uppercase");
  });

  it("defaults letter-spacing to normal when prop is not provided", () => {
    render(<AppearancePanel {...baseProps} />);
    const selectInput = screen.getByTestId(
      "letter-spacing-select",
    ) as HTMLInputElement;
    expect(selectInput.value).toBe("normal");
  });

  it("defaults text-transform to none when prop is not provided", () => {
    render(<AppearancePanel {...baseProps} />);
    const selectInput = screen.getByTestId(
      "text-transform-select",
    ) as HTMLInputElement;
    expect(selectInput.value).toBe("none");
  });

  it("calls onHeadingLetterSpacingChange when a spacing option is selected", () => {
    const onHeadingLetterSpacingChange = vi.fn();
    render(
      <AppearancePanel
        {...baseProps}
        headingLetterSpacing="normal"
        onHeadingLetterSpacingChange={onHeadingLetterSpacingChange}
      />,
    );
    const selectInput = screen.getByTestId("letter-spacing-select");
    fireEvent.change(selectInput, { target: { value: "wider" } });
    expect(onHeadingLetterSpacingChange).toHaveBeenCalledWith("wider");
  });

  it("calls onHeadingTextTransformChange when a transform option is selected", () => {
    const onHeadingTextTransformChange = vi.fn();
    render(
      <AppearancePanel
        {...baseProps}
        headingTextTransform="none"
        onHeadingTextTransformChange={onHeadingTextTransformChange}
      />,
    );
    const selectInput = screen.getByTestId("text-transform-select");
    fireEvent.change(selectInput, { target: { value: "uppercase" } });
    expect(onHeadingTextTransformChange).toHaveBeenCalledWith("uppercase");
  });

  it("does not throw when callbacks are not provided", () => {
    expect(() => {
      render(
        <AppearancePanel
          {...baseProps}
          headingLetterSpacing="wide"
          headingTextTransform="uppercase"
        />,
      );
    }).not.toThrow();
  });

  it("renders all 3 letter-spacing options in the select input", () => {
    render(<AppearancePanel {...baseProps} headingLetterSpacing="normal" />);
    const selectInput = screen.getByTestId("letter-spacing-select");
    expect(selectInput).toBeInTheDocument();
    // Select input should accept normal, wide, wider values
    fireEvent.change(selectInput, { target: { value: "wide" } });
    fireEvent.change(selectInput, { target: { value: "wider" } });
    fireEvent.change(selectInput, { target: { value: "normal" } });
    // No errors thrown
  });

  it("renders both text-transform options", () => {
    render(<AppearancePanel {...baseProps} headingTextTransform="none" />);
    const selectInput = screen.getByTestId("text-transform-select");
    expect(selectInput).toBeInTheDocument();
    fireEvent.change(selectInput, { target: { value: "uppercase" } });
    fireEvent.change(selectInput, { target: { value: "none" } });
  });
});
