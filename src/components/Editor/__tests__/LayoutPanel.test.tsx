/**
 * Tests for LayoutPanel component (Step 9.13.3)
 *
 * Covers:
 * 1. Renders page list with checkboxes
 * 2. Toggle page fires onTogglePage callback
 * 3. DraggablePageList renders when >1 selected page
 * 4. Section toggles rendered
 * 5. Max page limit warning shown
 * 6. Home page checkbox disabled with 'Required' chip
 * 7. DraggableBlockList conditional render
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../Editor/DraggablePageList", () => ({
  default: ({ pages }: any) => (
    <div data-testid="draggable-page-list">
      {pages.map((p: any) => (
        <span key={p.id}>{p.title}</span>
      ))}
    </div>
  ),
}));

vi.mock("../../Editor/DraggableBlockList", () => ({
  default: ({ blocks }: any) => (
    <div data-testid="draggable-block-list">
      {blocks.map((b: any) => (
        <span key={b.id}>{b.blockType}</span>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import LayoutPanel from "../LayoutPanel";

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
  warning: "#ff9800",
};

const makePage = (
  id: string,
  title: string,
  selected: boolean,
  isHome = false,
) => ({
  id,
  title,
  path: `/${title.toLowerCase()}`,
  isHome,
  selected,
  sortOrder: 0,
  blocks: [],
});

const baseSections = [
  {
    pageTitle: "Home",
    sectionIndex: 0,
    sectionName: "Hero Section",
    enabled: true,
  },
  {
    pageTitle: "Services",
    sectionIndex: 0,
    sectionName: "Services Section",
    enabled: true,
  },
];

const baseProps = {
  pages: [
    makePage("p1", "Home", true, true),
    makePage("p2", "About", true),
    makePage("p3", "Services", false),
  ],
  sections: baseSections,
  maxPagesPerWebsite: 5,
  onTogglePage: vi.fn(),
  onMovePage: vi.fn(),
  onPagesChange: vi.fn(),
  onToggleSection: vi.fn(),
  colors: mockColors,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LayoutPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Page Selection & Order section heading", () => {
    render(<LayoutPanel {...baseProps} />);
    expect(screen.getByText("Page Selection & Order")).toBeInTheDocument();
  });

  it("renders all pages in the list", () => {
    render(<LayoutPanel {...baseProps} />);
    // Page titles may appear in both page card and DraggablePageList mock
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("home page has Required chip", () => {
    render(<LayoutPanel {...baseProps} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("clicking a non-home page checkbox fires onTogglePage", () => {
    render(<LayoutPanel {...baseProps} />);
    // Find About page checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    // Home is index 0 (disabled), About is index 1
    fireEvent.click(checkboxes[1]);
    expect(baseProps.onTogglePage).toHaveBeenCalledWith("p2");
  });

  it("renders DraggablePageList when >1 selected pages", () => {
    render(<LayoutPanel {...baseProps} />);
    // 2 selected pages (Home + About)
    expect(screen.getByTestId("draggable-page-list")).toBeInTheDocument();
  });

  it("does NOT render DraggablePageList when only 1 selected page", () => {
    const props = {
      ...baseProps,
      pages: [
        makePage("p1", "Home", true, true),
        makePage("p2", "About", false),
      ],
    };
    render(<LayoutPanel {...props} />);
    expect(screen.queryByTestId("draggable-page-list")).not.toBeInTheDocument();
  });

  it("renders Section Visibility heading", () => {
    render(<LayoutPanel {...baseProps} />);
    expect(screen.getByText("Section Visibility")).toBeInTheDocument();
  });

  it("renders section toggles", () => {
    render(<LayoutPanel {...baseProps} />);
    expect(screen.getByText("Hero Section")).toBeInTheDocument();
    expect(screen.getByText("Services Section")).toBeInTheDocument();
  });

  it("clicking section toggle fires onToggleSection", () => {
    render(<LayoutPanel {...baseProps} />);
    const sectionCheckboxes = screen.getAllByRole("checkbox");
    // After page checkboxes, section checkboxes follow
    // Home (disabled) + About + Services = 3 page checkboxes, then section checkboxes
    const sectionCheckbox = sectionCheckboxes[3]; // first section checkbox
    fireEvent.click(sectionCheckbox);
    expect(baseProps.onToggleSection).toHaveBeenCalled();
  });

  it("shows max page warning when limit reached", () => {
    const props = {
      ...baseProps,
      pages: [
        makePage("p1", "Home", true, true),
        makePage("p2", "About", true),
        makePage("p3", "Services", true),
        makePage("p4", "Contact", true),
        makePage("p5", "Blog", true),
      ],
      maxPagesPerWebsite: 5,
    };
    render(<LayoutPanel {...props} />);
    expect(screen.getByText(/Maximum reached/i)).toBeInTheDocument();
  });

  it("does NOT render DraggableBlockList when blocks/pageId/websiteId not provided", () => {
    render(<LayoutPanel {...baseProps} />);
    expect(
      screen.queryByTestId("draggable-block-list"),
    ).not.toBeInTheDocument();
  });

  it("renders DraggableBlockList when blocks, pageId, websiteId all provided", () => {
    const blocks = [
      { id: 1, blockType: "HERO", content: {}, isVisible: true, sortOrder: 0 },
    ];
    render(
      <LayoutPanel
        {...baseProps}
        blocks={blocks}
        pageId={10}
        websiteId={5}
        onBlocksChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId("draggable-block-list")).toBeInTheDocument();
  });
});
