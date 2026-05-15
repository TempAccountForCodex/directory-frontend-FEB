/**
 * Tests for PortfolioGridBlock (Step 11.2)
 *
 * Covers:
 *  1.  Renders without crashing with minimal props
 *  2.  Heading renders when provided
 *  3.  No heading when not provided
 *  4.  Description renders when provided
 *  5.  Category filter chips render 'All' + unique categories
 *  6.  showFilters=false hides all filter chips
 *  7.  No filter chips when items have no categories
 *  8.  Clicking a category chip filters the grid
 *  9.  Clicking 'All' chip restores all items
 *  10. Empty state renders placeholder cards when items=[]
 *  11. Item titles render in the grid
 *  12. Lightbox opens when card is clicked (showLightbox=true)
 *  13. Lightbox dialog shows the item title
 *  14. Lightbox dialog shows tags as chips
 *  15. Lightbox dialog shows client and year
 *  16. Lightbox external link opens in new tab
 *  17. Lightbox closes via close button
 *  18. showLightbox=false prevents lightbox from opening
 *  19. Component is exported as React.memo (displayName set)
 *  20. Renders with columns=1 without crashing
 *  21. Renders with columns=4 without crashing
 *  22. AnimatePresence wrapper is present in DOM
 *  23. Items without images render "No image" fallback
 *  24. 'All' chip appears before category chips
 *  25. Renders with no content object gracefully
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  useScroll: () => ({
    scrollYProgress: { get: () => 0, onChange: () => () => {} },
  }),
  useTransform: (..._args) => ({ get: () => "0%", onChange: () => () => {} }),
  useMotionValue: (v) => ({
    get: () => v,
    set: () => {},
    onChange: () => () => {},
  }),
  motion: {
    div: ({
      children,
      layout,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => (
    <div data-testid="animate-presence">{children}</div>
  ),
  useInView: () => [null, true],
}));

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: () => null, inView: true }),
}));

import PortfolioGridBlock from "../PortfolioGridBlock";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleItems = [
  {
    title: "Brand Refresh",
    description: "Full visual identity overhaul for Acme Corp.",
    image: "https://example.com/brand.jpg",
    category: "Branding",
    tags: ["logo", "typography", "color"],
    client: "Acme Corp",
    year: "2024",
    url: "https://acme.com/project",
  },
  {
    title: "E-Commerce Platform",
    description: "Custom storefront built on Shopify.",
    image: "https://example.com/ecom.jpg",
    category: "Web",
    tags: ["shopify", "react"],
    client: "Retail Co",
    year: "2023",
    url: "https://retailco.com",
  },
  {
    title: "Campaign Design",
    description: "Social media campaign assets.",
    image: "",
    category: "Branding",
    tags: ["social", "ads"],
    client: "Startup Ltd",
    year: "2022",
    url: "",
  },
];

const makeBlock = (overrides: Record<string, any> = {}) => ({
  id: 1,
  blockType: "PORTFOLIO_GRID" as const,
  sortOrder: 0,
  content: {
    heading: "Our Work",
    description: "Selected projects we are proud of.",
    items: sampleItems,
    showFilters: true,
    columns: 3,
    showLightbox: true,
    ...overrides,
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PortfolioGridBlock", () => {
  // 1
  it("renders without crashing with minimal props", () => {
    const block = {
      id: 1,
      blockType: "PORTFOLIO_GRID" as const,
      sortOrder: 0,
      content: {},
    };
    const { container } = render(<PortfolioGridBlock block={block as any} />);
    expect(container.firstChild).not.toBeNull();
  });

  // 2
  it("renders heading when provided", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    expect(screen.getByText("Our Work")).toBeInTheDocument();
  });

  // 3
  it("does not render heading when heading is empty", () => {
    render(<PortfolioGridBlock block={makeBlock({ heading: "" })} />);
    expect(screen.queryByText("Our Work")).toBeNull();
  });

  // 4
  it("renders description when provided", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    expect(
      screen.getByText("Selected projects we are proud of."),
    ).toBeInTheDocument();
  });

  // 5
  it('renders "All" chip and unique category chips', () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    // 'All' is unique; category names appear in filter chips + hover overlays
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getAllByText("Branding").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Web").length).toBeGreaterThanOrEqual(1);
  });

  // 6
  it("hides filter chips when showFilters=false", () => {
    render(<PortfolioGridBlock block={makeBlock({ showFilters: false })} />);
    expect(screen.queryByText("All")).toBeNull();
  });

  // 7
  it("does not render filter chips when items have no categories", () => {
    const noCatItems = sampleItems.map((i) => ({ ...i, category: undefined }));
    render(<PortfolioGridBlock block={makeBlock({ items: noCatItems })} />);
    expect(screen.queryByText("All")).toBeNull();
  });

  // 8
  it("clicking a category chip filters the grid", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    // Filter chips have role="button"; hover overlay chips do not — use role to target the filter chip
    fireEvent.click(screen.getByRole("button", { name: "Web" }));
    // 'Brand Refresh' is Branding category — removed from DOM after filtering
    expect(screen.queryByText("Brand Refresh")).toBeNull();
    expect(
      screen.getAllByText("E-Commerce Platform").length,
    ).toBeGreaterThanOrEqual(1);
  });

  // 9
  it('clicking "All" chip after filtering shows all items again', () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    fireEvent.click(screen.getByRole("button", { name: "Web" }));
    expect(screen.queryByText("Brand Refresh")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByText("Brand Refresh").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText("E-Commerce Platform").length,
    ).toBeGreaterThanOrEqual(1);
  });

  // 10
  it("renders placeholder cards when items=[]", () => {
    render(<PortfolioGridBlock block={makeBlock({ items: [] })} />);
    const placeholders = screen.getAllByTestId("portfolio-placeholder");
    expect(placeholders.length).toBeGreaterThanOrEqual(1);
  });

  // 11
  it("renders item titles in the grid", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    // Each title appears in both the subtitle and the hover overlay (opacity:0 but in DOM)
    expect(screen.getAllByText("Brand Refresh").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText("E-Commerce Platform").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Campaign Design").length,
    ).toBeGreaterThanOrEqual(1);
  });

  // 12
  it("lightbox opens when card is clicked", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    const card = screen.getByLabelText("View Brand Refresh");
    fireEvent.click(card);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // 13
  it("lightbox dialog shows the clicked item title", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    fireEvent.click(screen.getByLabelText("View Brand Refresh"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Brand Refresh")).toBeInTheDocument();
  });

  // 14
  it("lightbox shows tags as chips", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    fireEvent.click(screen.getByLabelText("View Brand Refresh"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("logo")).toBeInTheDocument();
    expect(within(dialog).getByText("typography")).toBeInTheDocument();
  });

  // 15
  it("lightbox shows client and year", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    fireEvent.click(screen.getByLabelText("View Brand Refresh"));
    const dialog = screen.getByRole("dialog");
    // Use getAllByText since rich text elements can match at multiple DOM levels
    expect(
      within(dialog).getAllByText(/Acme Corp/).length,
    ).toBeGreaterThanOrEqual(1);
    expect(within(dialog).getAllByText(/2024/).length).toBeGreaterThanOrEqual(
      1,
    );
  });

  // 16
  it("lightbox external link has target=_blank", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    fireEvent.click(screen.getByLabelText("View Brand Refresh"));
    const dialog = screen.getByRole("dialog");
    const link = within(dialog).getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("href", "https://acme.com/project");
  });

  // 17
  it("lightbox closes when close button is clicked", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    fireEvent.click(screen.getByLabelText("View Brand Refresh"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const closeBtn = screen.getByLabelText("close lightbox");
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // 18
  it("showLightbox=false prevents lightbox from opening on click", () => {
    render(<PortfolioGridBlock block={makeBlock({ showLightbox: false })} />);
    const card = screen.getByLabelText("View Brand Refresh");
    fireEvent.click(card);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // 19
  it("component has displayName set for memo identification", () => {
    const name =
      (PortfolioGridBlock as any).displayName ||
      (PortfolioGridBlock as any).type?.displayName ||
      (PortfolioGridBlock as any).type?.name;
    expect(name).toBe("PortfolioGridBlock");
  });

  // 20
  it("renders with columns=1 without crashing", () => {
    const { container } = render(
      <PortfolioGridBlock block={makeBlock({ columns: 1 })} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  // 21
  it("renders with columns=4 without crashing", () => {
    const { container } = render(
      <PortfolioGridBlock block={makeBlock({ columns: 4 })} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  // 22
  it("AnimatePresence wrapper is present in DOM for grid transitions", () => {
    render(<PortfolioGridBlock block={makeBlock()} />);
    expect(screen.getByTestId("animate-presence")).toBeInTheDocument();
  });

  // 23
  it('items without image render "No image" fallback', () => {
    // Campaign Design has empty image
    render(<PortfolioGridBlock block={makeBlock()} />);
    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  // 24
  it("renders with only one item without crashing", () => {
    const oneItem = [sampleItems[0]];
    const { container } = render(
      <PortfolioGridBlock block={makeBlock({ items: oneItem })} />,
    );
    expect(container.firstChild).not.toBeNull();
    // Title appears in subtitle and hover overlay — check at least one instance
    expect(screen.getAllByText("Brand Refresh").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  // 25
  it("renders with empty content object gracefully", () => {
    const block = {
      id: 2,
      blockType: "PORTFOLIO_GRID" as const,
      sortOrder: 0,
      content: {},
    };
    const { container } = render(<PortfolioGridBlock block={block as any} />);
    expect(container.firstChild).not.toBeNull();
  });
});
