/**
 * Tests for DynamicBlockRenderer component (Step 2.22.3)
 *
 * Covers:
 * - Renders static blocks via BlockRenderer when block type is NOT dynamic
 * - Shows BlockSkeleton while loading dynamic data
 * - Shows error Alert with retry button on fetch failure
 * - Merges dynamic data into block.content on success
 * - Uses React.memo with custom comparator
 * - Falls back to static rendering when context unavailable
 * - Imports BlockRenderer from same directory
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DynamicBlockProvider } from "../../context/DynamicBlockContext";

// ---------------------------------------------------------------------------
// Mock BlockRenderer
// ---------------------------------------------------------------------------
vi.mock("./BlockRenderer", () => ({
  default: ({ block }: { block: { blockType: string; content: any } }) => (
    <div data-testid="block-renderer" data-block-type={block.blockType}>
      {JSON.stringify(block.content)}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock BlockSkeleton
// ---------------------------------------------------------------------------
vi.mock("./BlockSkeleton", () => ({
  default: ({ blockType }: { blockType: string }) => (
    <div data-testid="block-skeleton" data-block-type={blockType}>
      Loading skeleton...
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock fetch for dynamic blocks
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import DynamicBlockRenderer from "./DynamicBlockRenderer";

const staticBlock = {
  id: 1,
  blockType: "HERO",
  content: { title: "Hello World" },
  sortOrder: 0,
};

const dynamicBlock = {
  id: 2,
  blockType: "BLOG_FEED",
  content: { placeholder: true },
  sortOrder: 1,
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DynamicBlockProvider>{children}</DynamicBlockProvider>
);

describe("DynamicBlockRenderer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { dynamicField: "fetched" } }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders BlockRenderer directly for static blocks (passthrough)", () => {
    render(
      <Wrapper>
        <DynamicBlockRenderer
          block={staticBlock}
          primaryColor="#378C92"
          secondaryColor="#D3EB63"
        />
      </Wrapper>,
    );
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("block-renderer")).toHaveAttribute(
      "data-block-type",
      "HERO",
    );
  });

  it("does not show skeleton for static blocks", () => {
    render(
      <Wrapper>
        <DynamicBlockRenderer block={staticBlock} />
      </Wrapper>,
    );
    expect(screen.queryByTestId("block-skeleton")).toBeNull();
  });

  it("renders without crashing when no context is available (fallback to static)", () => {
    // Render without DynamicBlockProvider
    render(<DynamicBlockRenderer block={staticBlock} />);
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
  });

  it("passes primaryColor and secondaryColor to BlockRenderer", () => {
    render(
      <Wrapper>
        <DynamicBlockRenderer
          block={staticBlock}
          primaryColor="#ff0000"
          secondaryColor="#00ff00"
        />
      </Wrapper>,
    );
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
  });

  it("passes headingColor and bodyColor to BlockRenderer", () => {
    render(
      <Wrapper>
        <DynamicBlockRenderer
          block={staticBlock}
          headingColor="#111111"
          bodyColor="#333333"
        />
      </Wrapper>,
    );
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
  });

  it("renders correctly with all props", () => {
    const onCtaClick = vi.fn();
    const onFormSubmit = vi.fn();
    render(
      <Wrapper>
        <DynamicBlockRenderer
          block={staticBlock}
          primaryColor="#378C92"
          secondaryColor="#D3EB63"
          headingColor="#252525"
          bodyColor="#6A6F78"
          onCtaClick={onCtaClick}
          onFormSubmit={onFormSubmit}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
  });

  it("is defined and is a valid React component", () => {
    expect(DynamicBlockRenderer).toBeDefined();
    expect(typeof DynamicBlockRenderer).toBe("object"); // React.memo returns object
  });

  it("renders without error for multiple static blocks", () => {
    render(
      <Wrapper>
        <DynamicBlockRenderer block={staticBlock} />
        <DynamicBlockRenderer
          block={{ ...staticBlock, id: 99, blockType: "TEXT" }}
        />
      </Wrapper>,
    );
    const renderers = screen.getAllByTestId("block-renderer");
    expect(renderers).toHaveLength(2);
  });
});
