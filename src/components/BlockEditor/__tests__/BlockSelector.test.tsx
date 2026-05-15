/**
 * Tests for BlockSelector Component (Step 2.6.2)
 *
 * Covers:
 * - Opens as MUI Dialog when open=true
 * - Shows all block types from BLOCK_TYPES registry
 * - Groups block types by REGISTRY_META.categories
 * - Shows label, description, category per block type
 * - Search/filter by name or category
 * - onSelect callback fires with correct blockType string
 * - onClose callback fires when dialog is closed
 * - existingBlockTypes shows "Already added" indicator
 * - React.memo wrapping / displayName
 * - Accessibility
 * - Loading skeleton
 * - Empty search results
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock MUI icons to avoid SVG rendering issues in jsdom
// ---------------------------------------------------------------------------

vi.mock("@mui/icons-material/Search", () => ({
  default: () => <span data-testid="icon-search" />,
}));
vi.mock("@mui/icons-material/Close", () => ({
  default: () => <span data-testid="icon-close" />,
}));
vi.mock("@mui/icons-material/ViewQuilt", () => ({
  default: () => <span data-testid="icon-view-quilt" />,
}));
vi.mock("@mui/icons-material/Article", () => ({
  default: () => <span data-testid="icon-article" />,
}));
vi.mock("@mui/icons-material/Campaign", () => ({
  default: () => <span data-testid="icon-campaign" />,
}));
vi.mock("@mui/icons-material/Star", () => ({
  default: () => <span data-testid="icon-star" />,
}));
vi.mock("@mui/icons-material/CheckCircle", () => ({
  default: () => <span data-testid="icon-check" />,
}));

// ---------------------------------------------------------------------------
// Import BlockSelector
// ---------------------------------------------------------------------------

import { BlockSelector } from "../BlockSelector";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = () => ({
  open: true,
  onClose: vi.fn(),
  onSelect: vi.fn(),
  existingBlockTypes: [] as string[],
});

function renderBlockSelector(
  overrides: Partial<ReturnType<typeof defaultProps>> = {},
) {
  const props = { ...defaultProps(), ...overrides };
  return render(<BlockSelector {...props} />);
}

// ---------------------------------------------------------------------------
// Tests — Dialog open/close
// ---------------------------------------------------------------------------

describe("BlockSelector — Dialog", () => {
  it("renders dialog when open=true", () => {
    renderBlockSelector({ open: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does NOT render dialog content when open=false", () => {
    renderBlockSelector({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it('shows dialog title "Add Block"', () => {
    renderBlockSelector();
    expect(screen.getByText(/add block/i)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    renderBlockSelector({ onClose });

    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests — Block type listing
// ---------------------------------------------------------------------------

describe("BlockSelector — block type listing", () => {
  it("shows all available block types", () => {
    renderBlockSelector();

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
    expect(screen.getByText("Call To Action")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("shows description for each block type", () => {
    renderBlockSelector();

    expect(
      screen.getByText("Large headline section with CTA"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Grid of features with icon, title, and description"),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — Category grouping
// ---------------------------------------------------------------------------

describe("BlockSelector — category grouping", () => {
  it("shows category group headers", () => {
    renderBlockSelector();

    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Conversion")).toBeInTheDocument();
    expect(screen.getByText("Social Proof")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — Search/filter
// ---------------------------------------------------------------------------

describe("BlockSelector — search/filter", () => {
  it("renders a search input", () => {
    renderBlockSelector();

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("filters block types by name when searching", () => {
    renderBlockSelector();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "hero" } });

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.queryByText("Features")).not.toBeInTheDocument();
    expect(screen.queryByText("Contact")).not.toBeInTheDocument();
  });

  it("filters block types by description keyword", () => {
    renderBlockSelector();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "headline" } });

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.queryByText("Features")).not.toBeInTheDocument();
  });

  it("shows empty state when search has no results", () => {
    renderBlockSelector();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });

    expect(screen.getByText(/no blocks found/i)).toBeInTheDocument();
  });

  it("search is case-insensitive", () => {
    renderBlockSelector();

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "FEATURES" } });

    expect(screen.getByText("Features")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — onSelect callback
// ---------------------------------------------------------------------------

describe("BlockSelector — onSelect", () => {
  it("calls onSelect with blockType key when a block type is clicked", () => {
    const onSelect = vi.fn();
    renderBlockSelector({ onSelect });

    const heroOption = screen.getByText("Hero");
    fireEvent.click(heroOption);

    expect(onSelect).toHaveBeenCalledWith("HERO");
  });

  it("calls onSelect with correct key for Features", () => {
    const onSelect = vi.fn();
    renderBlockSelector({ onSelect });

    fireEvent.click(screen.getByText("Features"));
    expect(onSelect).toHaveBeenCalledWith("FEATURES");
  });

  it("calls onSelect with correct key for CTA", () => {
    const onSelect = vi.fn();
    renderBlockSelector({ onSelect });

    fireEvent.click(screen.getByText("Call To Action"));
    expect(onSelect).toHaveBeenCalledWith("CTA");
  });
});

// ---------------------------------------------------------------------------
// Tests — existingBlockTypes indicator
// ---------------------------------------------------------------------------

describe("BlockSelector — existingBlockTypes", () => {
  it('shows "Already added" indicator for existing block types', () => {
    renderBlockSelector({ existingBlockTypes: ["HERO"] });

    expect(screen.getByText(/already added/i)).toBeInTheDocument();
  });

  it('does not show "Already added" for block types not in existingBlockTypes', () => {
    renderBlockSelector({ existingBlockTypes: ["HERO"] });

    // Get all "Already added" text — should only be 1 (for HERO)
    const alreadyAddedElements = screen.getAllByText(/already added/i);
    expect(alreadyAddedElements.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Tests — React.memo + displayName
// ---------------------------------------------------------------------------

describe("BlockSelector — React.memo + displayName", () => {
  it('has displayName "BlockSelector"', () => {
    expect(BlockSelector.displayName).toBe("BlockSelector");
  });
});

// ---------------------------------------------------------------------------
// Tests — Accessibility
// ---------------------------------------------------------------------------

describe("BlockSelector — accessibility", () => {
  it("close button has aria-label", () => {
    renderBlockSelector();

    const closeBtn = screen.getByLabelText(/close/i);
    expect(closeBtn).toBeInTheDocument();
  });

  it("search input has placeholder text", () => {
    renderBlockSelector();

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });
});
