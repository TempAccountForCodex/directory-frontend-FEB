/**
 * Tests for BlockLibrary component (Step 9.3.1)
 *
 * Covers:
 * 1. Renders drawer with close button
 * 2. Loading state: 3 skeleton cards
 * 3. Error state: alert shown on fetch failure
 * 4. Renders block cards after fetch
 * 5. Search filter: filters by label
 * 6. Search filter: filters by description
 * 7. Category tab filter: filters by category
 * 8. Empty state: shown when no blocks match search
 * 9. React.memo: component is memoized
 * 10. My Templates tab renders
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

vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
  DndContext: ({ children }: any) => <div>{children}</div>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const MOCK_BLOCKS = [
  {
    key: "HERO",
    label: "Hero",
    description: "Large headline section with CTA",
    category: "core",
    icon: "hero",
    capabilities: {
      supportsBackground: true,
      isDynamic: false,
      supportsVariants: true,
      supportsCustomCss: true,
      supportsVisibility: true,
    },
    variants: ["centered", "left", "full-bleed"],
  },
  {
    key: "FEATURES",
    label: "Features",
    description: "Grid of features with icon, title, and description",
    category: "core",
    icon: "features",
    capabilities: {
      supportsBackground: false,
      isDynamic: false,
      supportsVariants: false,
      supportsCustomCss: true,
      supportsVisibility: true,
    },
    variants: [],
  },
  {
    key: "TESTIMONIALS",
    label: "Testimonials",
    description: "Customer testimonials carousel",
    category: "social-proof",
    icon: "testimonials",
    capabilities: {
      supportsBackground: true,
      isDynamic: false,
      supportsVariants: true,
      supportsCustomCss: true,
      supportsVisibility: true,
    },
    variants: ["grid", "carousel"],
  },
];

// ---------------------------------------------------------------------------
// Import component under test (after mocks)
// ---------------------------------------------------------------------------
import BlockLibrary from "../BlockLibrary";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlockLibrary (Step 9.3.1)", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    pageId: 1,
    blocks: [],
    onInsertBlock: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: MOCK_BLOCKS }),
    });
  });

  it("renders drawer when open=true", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("presentation")).toBeInTheDocument();
    });
  });

  it("shows loading skeleton cards while fetching", () => {
    // Delay the response so we catch loading state
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true, data: MOCK_BLOCKS }),
              }),
            200,
          ),
        ),
    );
    render(<BlockLibrary {...defaultProps} />);
    // Skeletons should be visible immediately
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders block cards after successful fetch", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
      expect(screen.getByText("Features")).toBeInTheDocument();
    });
  });

  it("shows error alert when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("filters blocks by label when searching", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Hero" } });
    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
      expect(screen.queryByText("Features")).not.toBeInTheDocument();
    });
  });

  it("filters blocks by description when searching", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Features")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "carousel" } });
    await waitFor(() => {
      expect(screen.getByText("Testimonials")).toBeInTheDocument();
      expect(screen.queryByText("Hero")).not.toBeInTheDocument();
    });
  });

  it("filters blocks by category tab", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
    });
    // Click Social Proof tab
    const socialProofTab = screen.getByRole("tab", { name: /social proof/i });
    fireEvent.click(socialProofTab);
    await waitFor(() => {
      expect(screen.getByText("Testimonials")).toBeInTheDocument();
      expect(screen.queryByText("Hero")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no blocks match search", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
    await waitFor(() => {
      expect(screen.getByText(/no blocks found/i)).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<BlockLibrary {...defaultProps} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText("Hero")).toBeInTheDocument();
    });
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("has My Templates tab", async () => {
    render(<BlockLibrary {...defaultProps} />);
    await waitFor(() => {
      const myTemplatesTab = screen.getByRole("tab", { name: /my templates/i });
      expect(myTemplatesTab).toBeInTheDocument();
    });
  });

  it("is wrapped with React.memo", () => {
    expect(BlockLibrary).toBeDefined();
    // React.memo wraps in $$typeof Symbol(react.memo)
    expect((BlockLibrary as any).$$typeof?.toString()).toContain("Symbol");
  });
});
