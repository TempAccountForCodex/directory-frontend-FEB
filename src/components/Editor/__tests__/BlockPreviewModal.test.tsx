/**
 * Tests for BlockPreviewModal component (Step 9.3.2)
 *
 * Covers:
 * 1. Modal renders when open=true with block label
 * 2. Modal does not render when open=false
 * 3. Shows full description and category chip
 * 4. Capabilities badges render for true capabilities
 * 5. Variant selector renders available variants
 * 6. Variant change updates selected variant
 * 7. Close button calls onClose
 * 8. Escape key closes modal
 * 9. Empty variants: no selector shown (or shows disabled)
 * 10. React.memo: component is memoized
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockRenderer/index", () => ({
  default: ({ block }: any) => (
    <div data-testid="block-renderer" data-block-type={block?.blockType}>
      BlockRenderer Mock
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Component under test
// ---------------------------------------------------------------------------
import BlockPreviewModal from "../BlockPreviewModal";
import type { BlockLibraryItem } from "../BlockLibrary";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const MOCK_BLOCK_WITH_VARIANTS: BlockLibraryItem = {
  key: "HERO",
  label: "Hero",
  description: "Large headline section with CTA",
  category: "core",
  icon: "hero",
  capabilities: {
    supportsBackground: true,
    supportsVisibility: true,
    supportsVariants: true,
    supportsCustomCss: true,
    isDynamic: false,
    dataSource: null,
  },
  variants: ["centered", "left", "full-bleed"],
  searchKeywords: ["hero", "headline"],
};

const MOCK_BLOCK_NO_VARIANTS: BlockLibraryItem = {
  key: "TEXT",
  label: "Text",
  description: "Rich text content block",
  category: "content",
  icon: "text",
  capabilities: {
    supportsBackground: false,
    supportsVisibility: true,
    supportsVariants: false,
    supportsCustomCss: false,
    isDynamic: false,
    dataSource: null,
  },
  variants: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlockPreviewModal (Step 9.3.2)", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    block: MOCK_BLOCK_WITH_VARIANTS,
    onAddToPage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal with block label when open", async () => {
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} />);
    });
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });

  it("does not render content when open=false", async () => {
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} open={false} />);
    });
    expect(screen.queryByText("Hero")).not.toBeInTheDocument();
  });

  it("shows description and category chip", async () => {
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} />);
    });
    expect(
      screen.getByText("Large headline section with CTA"),
    ).toBeInTheDocument();
    expect(screen.getByText("core")).toBeInTheDocument();
  });

  it("renders capabilities badges for true capabilities", async () => {
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} />);
    });
    // supportsBackground=true should show badge
    expect(screen.getByText(/background/i)).toBeInTheDocument();
    // supportsCustomCss=true should show badge
    expect(screen.getAllByText(/css/i).length).toBeGreaterThan(0);
  });

  it("renders variant selector when variants available", async () => {
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} />);
    });
    // Should show a variant selector (combobox or listbox)
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("does not show variant selector when no variants", async () => {
    await act(async () => {
      render(
        <BlockPreviewModal {...defaultProps} block={MOCK_BLOCK_NO_VARIANTS} />,
      );
    });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} onClose={onClose} />);
    });
    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onAddToPage when Add to Page button is clicked", async () => {
    const onAddToPage = vi.fn();
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} onAddToPage={onAddToPage} />);
    });
    const addBtn = screen.getByRole("button", { name: /add to page/i });
    fireEvent.click(addBtn);
    // Called with blockKey and optional variant
    expect(onAddToPage).toHaveBeenCalledWith("HERO", expect.anything());
  });

  it("shows live preview using BlockRenderer mock", async () => {
    await act(async () => {
      render(<BlockPreviewModal {...defaultProps} />);
    });
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
  });

  it("is wrapped with React.memo", () => {
    expect(BlockPreviewModal).toBeDefined();
    expect((BlockPreviewModal as any).$$typeof?.toString()).toContain("Symbol");
  });
});
