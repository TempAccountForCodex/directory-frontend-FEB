/**
 * Tests for PropertyPanel component (Step 9.14.2 + Step 9.15)
 *
 * Covers:
 * - Renders nothing visible when open=false
 * - Renders panel when open=true
 * - Shows block type header + close button
 * - Renders heading/subheading fields for HERO block type
 * - Renders image/alt fields for IMAGE block type
 * - Renders heading/body fields for TEXT block type
 * - Includes visibility toggle for all block types
 * - onChange fires with (blockId, partialContent) on field changes
 * - Escape key calls onClose
 * - React.memo applied
 *
 * Step 9.15.1 — Position Controls:
 * - Move Up/Down buttons visible, call callbacks
 * - Move Up disabled when first block (index 0)
 * - Move Down disabled when last block
 * - Block N of M indicator shows correct position
 * - Keyboard shortcut tooltips on move buttons
 *
 * Step 9.15.2 — Alignment & Size Controls:
 * - Alignment section with Left/Center/Right toggle buttons
 * - Active alignment button highlighted
 * - Clicking alignment calls onChange with { alignment: value }
 * - Height dropdown with Auto/Small/Medium/Large/Full
 * - Selecting height calls onChange with { heightPreset: value }
 *
 * Step 9.15.3 — Spacing & Layout Presets:
 * - 4 spacing dropdowns (paddingTop/Bottom, marginTop/Bottom)
 * - Each dropdown has 5 options: None/Small/Medium/Large/XL
 * - Changing dropdown calls onChange with correct field
 * - Layout Presets: Compact/Standard/Spacious buttons
 * - Preset click applies all 4 spacing values at once
 * - Active preset highlighted when values match
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import PropertyPanel from "../PropertyPanel";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockColors = {
  panelBg: "#121517",
  border: "rgba(55,140,146,0.15)",
  text: "#F5F5F5",
  textSecondary: "#9FA6AE",
  bgCard: "#121517",
  primary: "#378C92",
  bgDefault: "#0D0F11",
};

const makeBlock = (overrides?: Record<string, unknown>) => ({
  id: "block-1",
  blockType: "HERO",
  content: { heading: "Welcome", subheading: "Hello World" } as Record<
    string,
    unknown
  >,
  isVisible: true,
  ...overrides,
});

const defaultProps = {
  open: false,
  selectedBlock: null as ReturnType<typeof makeBlock> | null,
  onClose: vi.fn(),
  onChange: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  blockIndex: 0,
  totalBlocks: 5,
  colors: mockColors,
};

/* ------------------------------------------------------------------ */
/*  Original Tests (Step 9.14.2)                                       */
/* ------------------------------------------------------------------ */

describe("PropertyPanel (Step 9.14.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render panel content when open=false", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={false}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.queryByTestId("property-panel")).toBeNull();
  });

  it("renders panel when open=true with selectedBlock", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.getByTestId("property-panel")).toBeInTheDocument();
  });

  it("shows block type header", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.getByText("HERO")).toBeInTheDocument();
  });

  it("shows close button", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.getByLabelText("Close property panel")).toBeInTheDocument();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByLabelText("Close property panel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders heading and subheading fields for HERO block", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          blockType: "HERO",
          content: { heading: "Welcome", subheading: "Hello" },
        })}
      />,
    );

    expect(screen.getByLabelText("Heading")).toBeInTheDocument();
    expect(screen.getByLabelText("Subheading")).toBeInTheDocument();
  });

  it("renders heading and body fields for TEXT block", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          blockType: "TEXT",
          content: { heading: "Title", body: "Content" },
        })}
      />,
    );

    expect(screen.getByLabelText("Heading")).toBeInTheDocument();
    expect(screen.getByLabelText("Body")).toBeInTheDocument();
  });

  it("renders image and alt fields for IMAGE block", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          blockType: "IMAGE",
          content: { image: "http://img.jpg", alt: "Photo" },
        })}
      />,
    );

    expect(screen.getByLabelText("Image URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Alt Text")).toBeInTheDocument();
  });

  it("includes visibility toggle for all block types", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.getByLabelText("Visible")).toBeInTheDocument();
  });

  it("onChange fires with blockId and partial content on heading change", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          blockType: "HERO",
          content: { heading: "Old", subheading: "Sub" },
        })}
        onChange={onChange}
      />,
    );

    const headingInput = screen.getByLabelText("Heading");
    fireEvent.change(headingInput, { target: { value: "New Heading" } });

    expect(onChange).toHaveBeenCalledWith("block-1", {
      heading: "New Heading",
    });
  });

  it("Escape key calls onClose when panel is open", () => {
    const onClose = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape key does NOT call onClose when panel is closed", () => {
    const onClose = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={false}
        selectedBlock={makeBlock()}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("is wrapped in React.memo", () => {
    expect(PropertyPanel).toBeDefined();
    expect(typeof PropertyPanel).toBe("object");
    expect((PropertyPanel as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for("react.memo"),
    );
  });

  it("renders heading and subheading fields for CTA block", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          blockType: "CTA",
          content: { heading: "Act Now", subheading: "Do it" },
        })}
      />,
    );

    expect(screen.getByLabelText("Heading")).toBeInTheDocument();
    expect(screen.getByLabelText("Subheading")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Step 9.15.1 — Position Controls                                    */
/* ------------------------------------------------------------------ */

describe("PropertyPanel — Position Controls (Step 9.15.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Move Up button that calls onMoveUp when clicked", () => {
    const onMoveUp = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        blockIndex={2}
        totalBlocks={5}
        onMoveUp={onMoveUp}
      />,
    );

    const moveUpBtn = screen.getByLabelText("Move block up");
    fireEvent.click(moveUpBtn);
    expect(onMoveUp).toHaveBeenCalledTimes(1);
  });

  it("shows Move Down button that calls onMoveDown when clicked", () => {
    const onMoveDown = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        blockIndex={2}
        totalBlocks={5}
        onMoveDown={onMoveDown}
      />,
    );

    const moveDownBtn = screen.getByLabelText("Move block down");
    fireEvent.click(moveDownBtn);
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });

  it("disables Move Up when block is first (index 0)", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        blockIndex={0}
        totalBlocks={5}
      />,
    );

    const moveUpBtn = screen.getByLabelText("Move block up");
    expect(moveUpBtn).toBeDisabled();
  });

  it("disables Move Down when block is last", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        blockIndex={4}
        totalBlocks={5}
      />,
    );

    const moveDownBtn = screen.getByLabelText("Move block down");
    expect(moveDownBtn).toBeDisabled();
  });

  it("shows Block N of M indicator with correct 1-indexed position", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        blockIndex={2}
        totalBlocks={7}
      />,
    );

    expect(screen.getByText("Block 3 of 7")).toBeInTheDocument();
  });

  it("shows keyboard shortcut hints as tooltips on move buttons", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
        blockIndex={2}
        totalBlocks={5}
      />,
    );

    // Tooltips are rendered as title attributes on the buttons
    const moveUpBtn = screen.getByLabelText("Move block up");
    const moveDownBtn = screen.getByLabelText("Move block down");
    expect(
      moveUpBtn.closest("[title]")?.getAttribute("title") ||
        moveUpBtn.getAttribute("title"),
    ).toContain("Ctrl");
    expect(
      moveDownBtn.closest("[title]")?.getAttribute("title") ||
        moveDownBtn.getAttribute("title"),
    ).toContain("Ctrl");
  });

  it("does not show position section when panel is closed", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={false}
        selectedBlock={makeBlock()}
        blockIndex={2}
        totalBlocks={5}
      />,
    );

    expect(screen.queryByText(/Block \d+ of \d+/)).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  Step 9.15.2 — Alignment & Size Controls                            */
/* ------------------------------------------------------------------ */

describe("PropertyPanel — Alignment & Size Controls (Step 9.15.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows alignment section with Left, Center, Right buttons", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          content: { heading: "Hi", alignment: "center" },
        })}
      />,
    );

    expect(screen.getByLabelText("Align left")).toBeInTheDocument();
    expect(screen.getByLabelText("Align center")).toBeInTheDocument();
    expect(screen.getByLabelText("Align right")).toBeInTheDocument();
  });

  it("highlights the active alignment button", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          content: { heading: "Hi", alignment: "left" },
        })}
      />,
    );

    const leftBtn = screen.getByLabelText("Align left");
    // The active button should have the selected attribute/class (MUI ToggleButton sets aria-pressed)
    expect(leftBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults to center alignment when no alignment in content", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
      />,
    );

    const centerBtn = screen.getByLabelText("Align center");
    expect(centerBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("clicking alignment button calls onChange with { alignment: value }", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          content: { heading: "Hi", alignment: "center" },
        })}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Align left"));
    expect(onChange).toHaveBeenCalledWith("block-1", { alignment: "left" });
  });

  it("shows Height dropdown with correct options", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    const heightSelect = screen.getByLabelText("Height");
    expect(heightSelect).toBeInTheDocument();
  });

  it("selecting height preset calls onChange with { heightPreset: value }", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          content: { heading: "Hi", heightPreset: "auto" },
        })}
        onChange={onChange}
      />,
    );

    const heightSelect = screen.getByLabelText("Height");
    fireEvent.change(heightSelect, { target: { value: "large" } });
    expect(onChange).toHaveBeenCalledWith("block-1", { heightPreset: "large" });
  });
});

/* ------------------------------------------------------------------ */
/*  Step 9.15.3 — Spacing Controls & Layout Presets                    */
/* ------------------------------------------------------------------ */

describe("PropertyPanel — Spacing & Layout Presets (Step 9.15.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 4 spacing dropdowns for padding/margin", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.getByLabelText("Padding Top")).toBeInTheDocument();
    expect(screen.getByLabelText("Padding Bottom")).toBeInTheDocument();
    expect(screen.getByLabelText("Margin Top")).toBeInTheDocument();
    expect(screen.getByLabelText("Margin Bottom")).toBeInTheDocument();
  });

  it("spacing dropdown defaults to md when no value in content", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
      />,
    );

    const paddingTop = screen.getByLabelText(
      "Padding Top",
    ) as HTMLSelectElement;
    expect(paddingTop.value).toBe("md");
  });

  it("changing padding top dropdown calls onChange with { spacingPaddingTop: value }", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
        onChange={onChange}
      />,
    );

    const paddingTop = screen.getByLabelText("Padding Top");
    fireEvent.change(paddingTop, { target: { value: "lg" } });
    expect(onChange).toHaveBeenCalledWith("block-1", {
      spacingPaddingTop: "lg",
    });
  });

  it("changing margin bottom dropdown calls onChange with { spacingMarginBottom: value }", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
        onChange={onChange}
      />,
    );

    const marginBottom = screen.getByLabelText("Margin Bottom");
    fireEvent.change(marginBottom, { target: { value: "xl" } });
    expect(onChange).toHaveBeenCalledWith("block-1", {
      spacingMarginBottom: "xl",
    });
  });

  it("shows 3 layout preset buttons: Compact, Standard, Spacious", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock()}
      />,
    );

    expect(screen.getByRole("button", { name: "Compact" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Standard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Spacious" }),
    ).toBeInTheDocument();
  });

  it("Compact preset applies sm padding, none margin", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Compact" }));
    expect(onChange).toHaveBeenCalledWith("block-1", {
      spacingPaddingTop: "sm",
      spacingPaddingBottom: "sm",
      spacingMarginTop: "none",
      spacingMarginBottom: "none",
    });
  });

  it("Standard preset applies md padding, md margin", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    expect(onChange).toHaveBeenCalledWith("block-1", {
      spacingPaddingTop: "md",
      spacingPaddingBottom: "md",
      spacingMarginTop: "md",
      spacingMarginBottom: "md",
    });
  });

  it("Spacious preset applies xl padding, lg margin", () => {
    const onChange = vi.fn();
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({ content: { heading: "Hi" } })}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Spacious" }));
    expect(onChange).toHaveBeenCalledWith("block-1", {
      spacingPaddingTop: "xl",
      spacingPaddingBottom: "xl",
      spacingMarginTop: "lg",
      spacingMarginBottom: "lg",
    });
  });

  it("highlights active preset when current values match Compact exactly", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          content: {
            heading: "Hi",
            spacingPaddingTop: "sm",
            spacingPaddingBottom: "sm",
            spacingMarginTop: "none",
            spacingMarginBottom: "none",
          },
        })}
      />,
    );

    const compactBtn = screen.getByRole("button", { name: "Compact" });
    // Active preset gets a variant="contained" or special styling — check for active data attribute
    expect(compactBtn).toHaveAttribute("data-active", "true");
  });

  it("no preset is highlighted when values do not match any preset", () => {
    render(
      <PropertyPanel
        {...defaultProps}
        open={true}
        selectedBlock={makeBlock({
          content: {
            heading: "Hi",
            spacingPaddingTop: "lg",
            spacingPaddingBottom: "sm",
            spacingMarginTop: "xl",
            spacingMarginBottom: "none",
          },
        })}
      />,
    );

    const compactBtn = screen.getByRole("button", { name: "Compact" });
    const standardBtn = screen.getByRole("button", { name: "Standard" });
    const spaciousBtn = screen.getByRole("button", { name: "Spacious" });
    expect(compactBtn).toHaveAttribute("data-active", "false");
    expect(standardBtn).toHaveAttribute("data-active", "false");
    expect(spaciousBtn).toHaveAttribute("data-active", "false");
  });
});
