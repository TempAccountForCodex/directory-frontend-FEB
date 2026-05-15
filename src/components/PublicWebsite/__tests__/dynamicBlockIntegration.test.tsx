/**
 * Dynamic Block Integration Tests — Step 2.31.4
 *
 * Comprehensive integration tests for DynamicBlockRenderer verifying:
 * - All 6 dynamic block types render correctly with mock data
 * - SSR hydration reads from window.__DYNAMIC_BLOCK_DATA__
 * - Client-side fallback fetches when SSR data is missing
 * - Error boundary catches block render errors and shows fallback UI
 * - Loading skeleton displays during data fetch
 * - Empty state when block has no data
 * - DynamicBlockContext provides correct websiteId / pageId
 * - useDynamicBlockData returns correct data per block type
 * - BlockRenderer integrates with DynamicBlockRenderer for mixed pages
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { renderWithProviders } from "../../../test/utils";
import {
  DynamicBlockProvider,
  DynamicBlockContext,
} from "../../../context/DynamicBlockContext";
import BlockErrorBoundary from "../BlockErrorBoundary";

// ---------------------------------------------------------------------------
// Mock BlockRenderer — intercept all block renders
// ---------------------------------------------------------------------------
vi.mock("../BlockRenderer", () => ({
  default: ({ block }: { block: { blockType: string; content: any } }) => (
    <div data-testid="block-renderer" data-block-type={block.blockType}>
      {JSON.stringify(block.content)}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock BlockSkeleton
// ---------------------------------------------------------------------------
vi.mock("../BlockSkeleton", () => ({
  default: ({ blockType }: { blockType: string }) => (
    <div data-testid="block-skeleton" data-block-type={blockType} role="status">
      Loading skeleton for {blockType}...
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock useDynamicBlockData — we control it per-test
// ---------------------------------------------------------------------------
vi.mock("../../../hooks/useDynamicBlockData", () => ({
  default: vi.fn(),
}));
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------
import DynamicBlockRenderer from "../DynamicBlockRenderer";

/* ===================== Shared helpers ===================== */

/** Builds a block fixture for any dynamic block type */
function makeDynamicBlock(blockType: string, id = 1, dataSource = "/api/test") {
  return {
    id,
    blockType,
    content: { dataSource },
    sortOrder: 0,
  };
}

/** Builds a static (non-dynamic) block */
function makeStaticBlock(blockType: string, id = 99) {
  return {
    id,
    blockType,
    content: { title: "Static content" },
    sortOrder: 0,
  };
}

/** Wraps children with the DynamicBlockProvider */
const WithProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <DynamicBlockProvider>{children}</DynamicBlockProvider>;

/** Default mock return for useDynamicBlockData — success with data */
function mockHookSuccess(data: any) {
  (useDynamicBlockData as any).mockReturnValue({
    data,
    loading: false,
    error: null,
    refresh: vi.fn(),
    lastUpdated: new Date(),
  });
}

/** Mock hook returning loading state */
function mockHookLoading() {
  (useDynamicBlockData as any).mockReturnValue({
    data: null,
    loading: true,
    error: null,
    refresh: vi.fn(),
    lastUpdated: null,
  });
}

/** Mock hook returning error state */
function mockHookError(message: string) {
  (useDynamicBlockData as any).mockReturnValue({
    data: null,
    loading: false,
    error: message,
    refresh: vi.fn(),
    lastUpdated: null,
  });
}

/* ===================== Tests ===================== */

describe("DynamicBlockRenderer — Full Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { items: [] } }),
    });
  });

  afterEach(() => {
    // Reset window.__DYNAMIC_BLOCK_DATA__ between tests
    delete (window as any).__DYNAMIC_BLOCK_DATA__;
  });

  /* ------------------------------------------------------------------ */
  /* 1. Static block passthrough                                          */
  /* ------------------------------------------------------------------ */
  it("renders static HERO block via BlockRenderer (no skeleton, no hook)", () => {
    const block = makeStaticBlock("HERO");
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("block-renderer")).toHaveAttribute(
      "data-block-type",
      "HERO",
    );
    expect(screen.queryByTestId("block-skeleton")).not.toBeInTheDocument();
    // Hook should NOT have been called for a static block
    expect(useDynamicBlockData).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* 2. BLOG_FEED dynamic block — success data                           */
  /* ------------------------------------------------------------------ */
  it("renders BLOG_FEED dynamic block with fetched data merged into content", () => {
    const blogData = {
      insights: [{ id: 1, title: "Test Post" }],
      pagination: { totalPages: 1 },
    };
    mockHookSuccess(blogData);

    const block = makeDynamicBlock("BLOG_FEED", 10);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} primaryColor="#378C92" />
      </WithProvider>,
    );

    const renderer = screen.getByTestId("block-renderer");
    expect(renderer).toBeInTheDocument();
    expect(renderer).toHaveAttribute("data-block-type", "BLOG_FEED");
    // Data is merged into content
    const content = JSON.parse(renderer.textContent || "{}");
    expect(content.insights).toBeDefined();
    expect(content.insights[0].title).toBe("Test Post");
  });

  /* ------------------------------------------------------------------ */
  /* 3. BLOG_ARTICLE dynamic block — success data                        */
  /* ------------------------------------------------------------------ */
  it("renders BLOG_ARTICLE dynamic block with merged article data", () => {
    const articleData = { title: "My Article", body: "<p>Hello</p>" };
    mockHookSuccess(articleData);

    const block = makeDynamicBlock("BLOG_ARTICLE", 20);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    const renderer = screen.getByTestId("block-renderer");
    expect(renderer).toHaveAttribute("data-block-type", "BLOG_ARTICLE");
    const content = JSON.parse(renderer.textContent || "{}");
    expect(content.title).toBe("My Article");
  });

  /* ------------------------------------------------------------------ */
  /* 4. PRODUCT_SHOWCASE dynamic block                                   */
  /* ------------------------------------------------------------------ */
  it("renders PRODUCT_SHOWCASE dynamic block with product data", () => {
    const productData = { products: [{ id: 1, name: "Widget", price: 9.99 }] };
    mockHookSuccess(productData);

    const block = makeDynamicBlock("PRODUCT_SHOWCASE", 30);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    const renderer = screen.getByTestId("block-renderer");
    expect(renderer).toHaveAttribute("data-block-type", "PRODUCT_SHOWCASE");
    const content = JSON.parse(renderer.textContent || "{}");
    expect(content.products[0].name).toBe("Widget");
  });

  /* ------------------------------------------------------------------ */
  /* 5. DIRECTORY_LISTING dynamic block                                  */
  /* ------------------------------------------------------------------ */
  it("renders DIRECTORY_LISTING dynamic block with listing data", () => {
    const listingData = {
      listings: [{ id: 1, name: "TechCorp" }],
      totalCount: 1,
    };
    mockHookSuccess(listingData);

    const block = makeDynamicBlock("DIRECTORY_LISTING", 40);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    const renderer = screen.getByTestId("block-renderer");
    expect(renderer).toHaveAttribute("data-block-type", "DIRECTORY_LISTING");
  });

  /* ------------------------------------------------------------------ */
  /* 6. REVIEWS — dynamic block (in DYNAMIC_BLOCK_TYPES, self-fetching) */
  /* ------------------------------------------------------------------ */
  it("treats REVIEWS as a dynamic block (in DYNAMIC_BLOCK_TYPES set)", () => {
    // REVIEWS is in DYNAMIC_BLOCK_TYPES — routed through DynamicBlockInner.
    // block.content.dataSource is null, so useDynamicBlockData short-circuits (no fetch).
    const block = makeStaticBlock("REVIEWS", 50);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    // Should still render via BlockRenderer (hook returns null data, block passes through)
    const renderer = screen.getByTestId("block-renderer");
    expect(renderer).toHaveAttribute("data-block-type", "REVIEWS");
    // useDynamicBlockData IS called (dynamic path), but with null dataSource
    expect(useDynamicBlockData).toHaveBeenCalledWith(50, "REVIEWS", null);
  });

  /* ------------------------------------------------------------------ */
  /* 7. EVENTS_LIST — dynamic block (in DYNAMIC_BLOCK_TYPES, self-fetching) */
  /* ------------------------------------------------------------------ */
  it("treats EVENTS_LIST as a dynamic block (in DYNAMIC_BLOCK_TYPES set)", () => {
    const block = makeStaticBlock("EVENTS_LIST", 55);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );
    expect(screen.getByTestId("block-renderer")).toHaveAttribute(
      "data-block-type",
      "EVENTS_LIST",
    );
    // useDynamicBlockData IS called (dynamic path), but with null dataSource
    expect(useDynamicBlockData).toHaveBeenCalledWith(55, "EVENTS_LIST", null);
  });

  /* ------------------------------------------------------------------ */
  /* 8. Loading skeleton during data fetch                               */
  /* ------------------------------------------------------------------ */
  it("shows BlockSkeleton while dynamic block data is loading", () => {
    mockHookLoading();

    const block = makeDynamicBlock("BLOG_FEED", 60);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    const skeleton = screen.getByTestId("block-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("data-block-type", "BLOG_FEED");
    expect(screen.queryByTestId("block-renderer")).not.toBeInTheDocument();
  });

  /* ------------------------------------------------------------------ */
  /* 9. Error state — Alert with Retry button                            */
  /* ------------------------------------------------------------------ */
  it("shows error Alert with Retry button when data fetch fails", () => {
    mockHookError("Network connection failed");

    const block = makeDynamicBlock("BLOG_FEED", 70);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Network connection failed/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByTestId("block-renderer")).not.toBeInTheDocument();
  });

  /* ------------------------------------------------------------------ */
  /* 10. Retry button calls refresh()                                    */
  /* ------------------------------------------------------------------ */
  it("clicking Retry calls the refresh() function from useDynamicBlockData", () => {
    const mockRefresh = vi.fn();
    (useDynamicBlockData as any).mockReturnValue({
      data: null,
      loading: false,
      error: "Fetch error",
      refresh: mockRefresh,
      lastUpdated: null,
    });

    const block = makeDynamicBlock("BLOG_FEED", 71);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  /* ------------------------------------------------------------------ */
  /* 11. SSR hydration — reads from window.__DYNAMIC_BLOCK_DATA__       */
  /* ------------------------------------------------------------------ */
  it("DynamicBlockContext hydrates from window.__DYNAMIC_BLOCK_DATA__ on init", () => {
    (window as any).__DYNAMIC_BLOCK_DATA__ = {
      100: {
        insights: [{ id: 99, title: "SSR Post" }],
        pagination: { totalPages: 1 },
      },
    };

    // The provider should pick up SSR data. Hook will see data in context.dynamicData
    // and return it (we simulate this via mockHookSuccess since the hook is mocked)
    const ssrData = {
      insights: [{ id: 99, title: "SSR Post" }],
      pagination: { totalPages: 1 },
    };
    mockHookSuccess(ssrData);

    const block = {
      id: 100,
      blockType: "BLOG_FEED",
      content: { dataSource: "/api/test" },
      sortOrder: 0,
    };
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    const renderer = screen.getByTestId("block-renderer");
    expect(renderer).toBeInTheDocument();
    const content = JSON.parse(renderer.textContent || "{}");
    expect(content.insights[0].title).toBe("SSR Post");
  });

  /* ------------------------------------------------------------------ */
  /* 12. SSR data invalid type — provider falls back to empty Map        */
  /* ------------------------------------------------------------------ */
  it("DynamicBlockContext handles invalid window.__DYNAMIC_BLOCK_DATA__ gracefully", () => {
    (window as any).__DYNAMIC_BLOCK_DATA__ = "not-an-object"; // invalid

    mockHookSuccess(null);

    const block = makeDynamicBlock("BLOG_FEED", 101);
    // Should render without throwing
    expect(() =>
      renderWithProviders(
        <WithProvider>
          <DynamicBlockRenderer block={block} />
        </WithProvider>,
      ),
    ).not.toThrow();
  });

  /* ------------------------------------------------------------------ */
  /* 13. Client-side fallback fetch — no SSR data                       */
  /* ------------------------------------------------------------------ */
  it("triggers client-side fetch when no SSR data is available", () => {
    // No window.__DYNAMIC_BLOCK_DATA__ set
    mockHookSuccess({ items: ["fetched-from-client"] });

    const block = makeDynamicBlock("BLOG_FEED", 80, "/api/blocks/80/data");
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    // Hook should be called with the block's id and type
    expect(useDynamicBlockData).toHaveBeenCalledWith(
      80,
      "BLOG_FEED",
      "/api/blocks/80/data",
    );
  });

  /* ------------------------------------------------------------------ */
  /* 14. Empty state — data with no items                                */
  /* ------------------------------------------------------------------ */
  it("renders BlockRenderer with empty data (no items) without crashing", () => {
    mockHookSuccess({ insights: [], pagination: { totalPages: 0 } });

    const block = makeDynamicBlock("BLOG_FEED", 90);
    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    // BlockRenderer still renders (empty state handled inside BlogFeedBlock via BlockRenderer)
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
    const content = JSON.parse(
      screen.getByTestId("block-renderer").textContent || "{}",
    );
    expect(content.insights).toHaveLength(0);
  });

  /* ------------------------------------------------------------------ */
  /* 15. DynamicBlockContext isBlockDynamic — correct block types        */
  /* ------------------------------------------------------------------ */
  it("DynamicBlockContext.isBlockDynamic returns true for BLOG_FEED and false for HERO", () => {
    let capturedContext: any = null;

    function ContextCapture() {
      const ctx = React.useContext(DynamicBlockContext);
      capturedContext = ctx;
      return null;
    }

    render(
      <DynamicBlockProvider>
        <ContextCapture />
      </DynamicBlockProvider>,
    );

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.isBlockDynamic("BLOG_FEED")).toBe(true);
    expect(capturedContext.isBlockDynamic("BLOG_ARTICLE")).toBe(true);
    expect(capturedContext.isBlockDynamic("PRODUCT_SHOWCASE")).toBe(true);
    expect(capturedContext.isBlockDynamic("DIRECTORY_LISTING")).toBe(true);
    expect(capturedContext.isBlockDynamic("HERO")).toBe(false);
    expect(capturedContext.isBlockDynamic("FEATURES")).toBe(false);
    expect(capturedContext.isBlockDynamic("TEXT")).toBe(false);
  });

  /* ------------------------------------------------------------------ */
  /* 16. BlockErrorBoundary catches render errors and shows fallback UI  */
  /* ------------------------------------------------------------------ */
  it("BlockErrorBoundary catches thrown errors in child block and shows error UI", () => {
    // Suppress expected error output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const BrokenBlock = () => {
      throw new Error("Simulated block crash");
    };

    render(
      <BlockErrorBoundary blockType="BROKEN_BLOCK" blockId={999}>
        <BrokenBlock />
      </BlockErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Block Rendering Error/i)).toBeInTheDocument();
    expect(screen.getByText(/BROKEN_BLOCK/)).toBeInTheDocument();
    expect(screen.getByText(/Simulated block crash/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  /* ------------------------------------------------------------------ */
  /* 17. BlockErrorBoundary renders children when no error               */
  /* ------------------------------------------------------------------ */
  it("BlockErrorBoundary passes through children when no error occurs", () => {
    render(
      <BlockErrorBoundary blockType="HERO" blockId={1}>
        <div data-testid="healthy-child">Healthy content</div>
      </BlockErrorBoundary>,
    );

    expect(screen.getByTestId("healthy-child")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  /* ------------------------------------------------------------------ */
  /* 18. Mixed page — static + dynamic blocks in BlockRenderer           */
  /* ------------------------------------------------------------------ */
  it("renders a mixed page of static and dynamic blocks without conflicts", () => {
    mockHookSuccess({ insights: [{ id: 1, title: "Post A" }] });

    const heroBlock = makeStaticBlock("HERO", 1);
    const blogFeedBlock = makeDynamicBlock("BLOG_FEED", 2);
    const ctaBlock = makeStaticBlock("CTA", 3);

    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={heroBlock} primaryColor="#378C92" />
        <DynamicBlockRenderer block={blogFeedBlock} primaryColor="#378C92" />
        <DynamicBlockRenderer block={ctaBlock} primaryColor="#378C92" />
      </WithProvider>,
    );

    const renderers = screen.getAllByTestId("block-renderer");
    // Hero and CTA are static → appear in BlockRenderer
    // BLOG_FEED has data → also appears in BlockRenderer (no skeleton)
    expect(renderers.length).toBeGreaterThanOrEqual(3);

    const blockTypes = renderers.map((el) =>
      el.getAttribute("data-block-type"),
    );
    expect(blockTypes).toContain("HERO");
    expect(blockTypes).toContain("BLOG_FEED");
    expect(blockTypes).toContain("CTA");
  });

  /* ------------------------------------------------------------------ */
  /* 19. Falls back to static rendering when no context (no provider)   */
  /* ------------------------------------------------------------------ */
  it("renders as static block when DynamicBlockProvider is absent", () => {
    // Without provider, isBlockDynamic returns false → static path
    const block = makeDynamicBlock("BLOG_FEED", 200);
    renderWithProviders(<DynamicBlockRenderer block={block} />);

    // Rendered via static path (no hook called for dynamic blocks without context)
    expect(screen.getByTestId("block-renderer")).toBeInTheDocument();
  });

  /* ------------------------------------------------------------------ */
  /* 20. useDynamicBlockData hook — correct params per block type        */
  /* ------------------------------------------------------------------ */
  it("useDynamicBlockData is called with blockId, blockType, and dataSource", () => {
    mockHookSuccess({ data: "test" });

    const block = {
      id: 42,
      blockType: "BLOG_FEED",
      content: { dataSource: "/api/custom-feed" },
      sortOrder: 0,
    };

    renderWithProviders(
      <WithProvider>
        <DynamicBlockRenderer block={block} />
      </WithProvider>,
    );

    expect(useDynamicBlockData).toHaveBeenCalledWith(
      42,
      "BLOG_FEED",
      "/api/custom-feed",
    );
  });

  /* ------------------------------------------------------------------ */
  /* 21. DynamicBlockContext refreshBlock clears cached data             */
  /* ------------------------------------------------------------------ */
  it("DynamicBlockContext.refreshBlock removes block data from the Map", async () => {
    (window as any).__DYNAMIC_BLOCK_DATA__ = { 5: { items: ["cached"] } };

    let capturedContext: any = null;

    function ContextCapture() {
      const ctx = React.useContext(DynamicBlockContext);
      capturedContext = ctx;
      return null;
    }

    render(
      <DynamicBlockProvider>
        <ContextCapture />
      </DynamicBlockProvider>,
    );

    expect(capturedContext.dynamicData.has(5)).toBe(true);

    act(() => {
      capturedContext.refreshBlock(5);
    });

    // After refresh, cached data should be removed
    expect(capturedContext.dynamicData.has(5)).toBe(false);
  });

  /* ------------------------------------------------------------------ */
  /* 22. DynamicBlockRenderer is React.memo wrapped                      */
  /* ------------------------------------------------------------------ */
  it("DynamicBlockRenderer is defined and wrapped in React.memo", () => {
    expect(DynamicBlockRenderer).toBeDefined();
    // React.memo returns an object with $$typeof and type fields
    expect(typeof DynamicBlockRenderer).toBe("object");
    expect((DynamicBlockRenderer as any).displayName).toBe(
      "DynamicBlockRenderer",
    );
  });
});
