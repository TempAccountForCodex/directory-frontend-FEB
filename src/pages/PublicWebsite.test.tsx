/**
 * Tests for PublicWebsite integration with DynamicBlockProvider (Step 2.22.5)
 *
 * Covers:
 * - DynamicBlockProvider wraps the content area
 * - DynamicBlockRenderer is used instead of BlockRenderer
 * - BlockErrorBoundary still wraps each DynamicBlockRenderer
 * - Page renders correctly for all-static blocks
 * - Loading state renders spinner
 * - Error state renders error alert
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Route, Routes, MemoryRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock react-helmet
vi.mock("react-helmet", () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock BlockRenderer (should NOT be rendered after integration)
vi.mock("../components/PublicWebsite/BlockRenderer", () => ({
  default: ({ block }: { block: any }) => (
    <div data-testid="block-renderer" data-block-type={block.blockType}>
      {block.blockType}
    </div>
  ),
}));

// Mock DynamicBlockRenderer
vi.mock("../components/PublicWebsite/DynamicBlockRenderer", () => ({
  default: ({ block }: { block: any }) => (
    <div data-testid="dynamic-block-renderer" data-block-type={block.blockType}>
      {block.blockType}
    </div>
  ),
}));

// Mock DynamicBlockContext
vi.mock("../context/DynamicBlockContext", () => ({
  DynamicBlockProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dynamic-block-provider">{children}</div>
  ),
}));

// Mock BlockErrorBoundary
vi.mock("../components/PublicWebsite/BlockErrorBoundary", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="block-error-boundary">{children}</div>
  ),
}));

// Mock ImageWithLoader
vi.mock("../components/UI/ImageWithLoader", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

// Mock useGoogleAnalytics
vi.mock("../hooks/useGoogleAnalytics", () => ({
  useGoogleAnalytics: () => ({
    trackClick: vi.fn(),
    trackFormSubmit: vi.fn(),
  }),
}));

// Mock LanguageSelector
vi.mock("../components/LanguageSelector", () => ({
  default: () => <div data-testid="language-selector" />,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import axios from "axios";
import PublicWebsite from "./PublicWebsite";

const mockWebsite = {
  id: 1,
  name: "Test Site",
  slug: "test-site",
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  headingTextColor: "#252525",
  bodyTextColor: "#6A6F78",
  pages: [
    {
      id: 1,
      title: "Home",
      path: "/",
      isHome: true,
      sortOrder: 0,
      blocks: [
        {
          id: 10,
          blockType: "HERO",
          content: { title: "Welcome" },
          sortOrder: 0,
        },
        { id: 11, blockType: "FEATURES", content: { items: [] }, sortOrder: 1 },
      ],
    },
  ],
};

// Helper to render PublicWebsite with proper slug routing
const renderWithSlug = (slug: string) =>
  render(
    <MemoryRouter initialEntries={[`/site/${slug}`]}>
      <Routes>
        <Route path="/site/:slug" element={<PublicWebsite />} />
        <Route path="/site/:slug/*" element={<PublicWebsite />} />
      </Routes>
    </MemoryRouter>,
  );

describe("PublicWebsite integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockWebsite,
    });
  });

  it("renders loading spinner initially", () => {
    (axios.get as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    ); // never resolves
    renderWithSlug("test-site");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders website name after loading", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      expect(screen.getByText("Test Site")).toBeInTheDocument();
    });
  });

  it("renders DynamicBlockProvider wrapper", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      expect(screen.getByTestId("dynamic-block-provider")).toBeInTheDocument();
    });
  });

  it("renders DynamicBlockRenderer for each block", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      const renderers = screen.getAllByTestId("dynamic-block-renderer");
      expect(renderers).toHaveLength(2);
    });
  });

  it("renders BlockErrorBoundary wrapping each DynamicBlockRenderer", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      const boundaries = screen.getAllByTestId("block-error-boundary");
      expect(boundaries).toHaveLength(2);
    });
  });

  it("does NOT render classic BlockRenderer (replaced by DynamicBlockRenderer)", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      // DynamicBlockRenderer should be present
      expect(screen.getAllByTestId("dynamic-block-renderer")).toHaveLength(2);
    });
    // Original BlockRenderer should not be present
    expect(screen.queryByTestId("block-renderer")).toBeNull();
  });

  it("shows error alert when fetch fails", async () => {
    (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(
      Object.assign(new Error("Not found"), {
        response: { data: { message: "Website not found" } },
      }),
    );
    renderWithSlug("missing-site");
    await waitFor(() => {
      expect(screen.getByText("Website not found")).toBeInTheDocument();
    });
  });

  it("renders footer with copyright", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      expect(screen.getByText(/Powered by TechieTribe/)).toBeInTheDocument();
    });
  });

  it("shows empty page message when page has no blocks", async () => {
    const emptyWebsite = {
      ...mockWebsite,
      pages: [{ ...mockWebsite.pages[0], blocks: [] }],
    };
    (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: emptyWebsite,
    });

    renderWithSlug("test-site");
    await waitFor(() => {
      expect(
        screen.getByText("This page has no content yet."),
      ).toBeInTheDocument();
    });
  });

  it("renders page navigation buttons", async () => {
    renderWithSlug("test-site");
    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });
});
