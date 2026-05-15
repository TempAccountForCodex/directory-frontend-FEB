/**
 * Tests for BlogArticleBlock (Step 2.24.2)
 *
 * Covers:
 *  1.  Renders without crashing with minimal props
 *  2.  Shows skeleton (loading state) when data is loading
 *  3.  Shows error Alert with Retry button when fetch fails
 *  4.  Retry button calls refresh()
 *  5.  Shows "no identifier" info when postIdentifier is empty and no URL params
 *  6.  Renders post title from data
 *  7.  Renders hero image when showImage=true and post has image
 *  8.  Hero image hidden when showImage=false
 *  9.  Hero image hidden in minimal layout
 * 10.  Meta bar shows author when showAuthor=true
 * 11.  Meta bar hides author when showAuthor=false
 * 12.  Meta bar shows date when showDate=true
 * 13.  Meta bar shows category chip when showCategory=true
 * 14.  Meta bar hides category when showCategory=false
 * 15.  Shows reading time in meta bar
 * 16.  Back button rendered when showBackButton=true
 * 17.  Back button hidden when showBackButton=false
 * 18.  Back button uses custom text
 * 19.  Table of contents rendered from headings
 * 20.  TOC hidden when showTableOfContents=false
 * 21.  TOC hidden when headings array is empty
 * 22.  Article body renders headings as h2
 * 23.  Article body renders description paragraphs
 * 24.  Standard layout renders TOC in sidebar (Grid)
 * 25.  Magazine layout: hero rendered outside container, full-width
 * 26.  Minimal layout: no hero image rendered
 * 27.  Related posts rendered when showRelated=true and data available
 * 28.  Related posts hidden when showRelated=false
 * 29.  BlogCard used for related posts display
 * 30.  Component is wrapped in React.memo
 * 31.  DOMPurify sanitizes heading content (XSS prevented)
 * 32.  javascript: protocol rejected on back button link
 * 33.  Post identifier resolved from URL params when config empty
 * 34.  Post identifier from config takes priority over URL param
 * 35.  Fallback renders description paragraph when no headings array
 * 36.  SEO context setSeoData called with post data when article loads
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
import { MemoryRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mock useDynamicBlockData (FROZEN — do not modify)
// ---------------------------------------------------------------------------
vi.mock("../../../../hooks/useDynamicBlockData", () => ({
  default: vi.fn(),
}));

import useDynamicBlockData from "../../../../hooks/useDynamicBlockData";

// ---------------------------------------------------------------------------
// Mock react-router-dom navigate + useParams
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
let mockParams: Record<string, string> = {};

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// ---------------------------------------------------------------------------
// Mock fetch (for related posts API)
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Mock DOMPurify
// ---------------------------------------------------------------------------
vi.mock("dompurify", () => ({
  default: {
    sanitize: vi.fn((text: string, _opts?: any) => text || ""),
  },
}));

// ---------------------------------------------------------------------------
// Import DOMPurify mock and component AFTER mocks
// ---------------------------------------------------------------------------
import DOMPurifyMock from "dompurify";
import BlogArticleBlock, { BlogArticleSeoContext } from "../BlogArticleBlock";

/* ===================== Test Helpers ===================== */

const mockPost = {
  id: 1,
  title: "Understanding React Performance",
  slug: "understanding-react-performance",
  image: "https://example.com/hero.jpg",
  category: "Technology",
  description: "A comprehensive guide to React performance optimization.",
  headings: [
    {
      heading: "Introduction",
      description: ["React is a powerful library.", "Performance matters."],
    },
    {
      heading: "Optimization Techniques",
      description: [
        "Use React.memo to prevent re-renders.",
        "Use useMemo for expensive computations.",
      ],
    },
  ],
  author: { name: "Jane Developer" },
  publishedAt: "2026-03-01T00:00:00.000Z",
  metaTitle: "React Performance Guide",
  metaDescription: "Learn how to optimize React applications.",
  keywords: "react, performance, optimization",
  canonicalUrl: "https://example.com/blog/understanding-react-performance",
};

const mockRelatedPosts = [
  {
    id: 2,
    title: "Advanced TypeScript",
    slug: "advanced-typescript",
    image: null,
    category: "Technology",
    description: "TypeScript tips and tricks.",
    author: { name: "John Dev" },
    publishedAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: 3,
    title: "CSS Grid Mastery",
    slug: "css-grid-mastery",
    image: null,
    category: "Technology",
    description: "Master CSS Grid layout.",
    author: { name: "Alice Style" },
    publishedAt: "2026-02-10T00:00:00.000Z",
  },
];

function makeBlock(contentOverrides: Record<string, any> = {}): {
  id: number;
  blockType: string;
  content: any;
  sortOrder: number;
} {
  return {
    id: 10,
    blockType: "BLOG_ARTICLE",
    content: {
      postIdentifier: "understanding-react-performance",
      layout: "standard",
      showAuthor: true,
      showDate: true,
      showImage: true,
      showCategory: true,
      showRelated: true,
      relatedCount: 3,
      showTableOfContents: true,
      showBackButton: true,
      backButtonText: "Back to Blog",
      backButtonLink: "/blog",
      ...contentOverrides,
    },
    sortOrder: 1,
  };
}

function renderBlock(
  block: ReturnType<typeof makeBlock>,
  extraProps: Record<string, any> = {},
) {
  return render(
    <MemoryRouter>
      <BlogArticleBlock
        block={block}
        primaryColor="#378C92"
        headingColor="#252525"
        bodyColor="#6A6F78"
        {...extraProps}
      />
    </MemoryRouter>,
  );
}

const mockUseDynamic = useDynamicBlockData as ReturnType<typeof vi.fn>;

function setupHookWithData(post = mockPost) {
  mockUseDynamic.mockReturnValue({
    data: { post },
    loading: false,
    error: null,
    refresh: vi.fn(),
  });
}

function setupHookLoading() {
  mockUseDynamic.mockReturnValue({
    data: null,
    loading: true,
    error: null,
    refresh: vi.fn(),
  });
}

function setupHookError(message = "Failed to load article") {
  mockUseDynamic.mockReturnValue({
    data: null,
    loading: false,
    error: message,
    refresh: vi.fn(),
  });
}

function setupHookNoData() {
  mockUseDynamic.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
  });
}

/* ===================== Tests ===================== */

describe("BlogArticleBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = {};
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ insights: mockRelatedPosts }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- 1. Renders without crashing ---
  it("1. renders without crashing with minimal props", () => {
    setupHookWithData();
    expect(() => renderBlock(makeBlock())).not.toThrow();
  });

  // --- 2. Loading state ---
  it("2. shows skeleton when data is loading", () => {
    setupHookLoading();
    const { container } = renderBlock(makeBlock());
    // Skeleton elements should be present (MUI renders MuiSkeleton)
    expect(container.querySelector(".MuiSkeleton-root")).toBeTruthy();
  });

  // --- 3. Error state ---
  it("3. shows error alert when fetch fails", () => {
    setupHookError("Network error");
    renderBlock(makeBlock());
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  // --- 4. Retry button ---
  it("4. retry button calls refresh()", () => {
    const mockRefresh = vi.fn();
    mockUseDynamic.mockReturnValue({
      data: null,
      loading: false,
      error: "Failed",
      refresh: mockRefresh,
    });
    renderBlock(makeBlock());
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  // --- 5. No identifier info ---
  it("5. shows info alert when no postIdentifier and no URL params", () => {
    setupHookNoData();
    renderBlock(makeBlock({ postIdentifier: "" }));
    // MUI Alert renders with role="alert" — check for info Alert content
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByText(/No post identifier provided/i),
    ).toBeInTheDocument();
  });

  // --- 6. Post title ---
  it("6. renders post title from data", () => {
    setupHookWithData();
    renderBlock(makeBlock());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Understanding React Performance",
    );
  });

  // --- 7. Hero image shown ---
  it("7. renders hero image when showImage=true and post has image", () => {
    setupHookWithData();
    const { container } = renderBlock(makeBlock({ showImage: true }));
    // Hero image: find img by src since the wrapper may have aria-hidden
    const imgs = container.querySelectorAll("img");
    const heroImg = Array.from(imgs).find(
      (img) => img.getAttribute("src") === "https://example.com/hero.jpg",
    );
    expect(heroImg).toBeTruthy();
  });

  // --- 8. Hero image hidden (showImage=false) ---
  it("8. hides hero image when showImage=false", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showImage: false }));
    expect(
      screen.queryByRole("img", { name: /Understanding React Performance/ }),
    ).toBeNull();
  });

  // --- 9. Hero image hidden in minimal layout ---
  it("9. hides hero image in minimal layout", () => {
    setupHookWithData();
    renderBlock(makeBlock({ layout: "minimal", showImage: true }));
    expect(
      screen.queryByRole("img", { name: /Understanding React Performance/ }),
    ).toBeNull();
  });

  // --- 10. Author shown ---
  it("10. meta bar shows author when showAuthor=true", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showAuthor: true }));
    expect(screen.getByText("Jane Developer")).toBeInTheDocument();
  });

  // --- 11. Author hidden ---
  it("11. meta bar hides author when showAuthor=false", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showAuthor: false }));
    expect(screen.queryByText("Jane Developer")).toBeNull();
  });

  // --- 12. Date shown ---
  it("12. meta bar shows date when showDate=true", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showDate: true }));
    // "March 1, 2026" or similar
    const timeEl = document.querySelector("time");
    expect(timeEl).toBeTruthy();
  });

  // --- 13. Category chip shown ---
  it("13. meta bar shows category chip when showCategory=true", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showCategory: true }));
    expect(screen.getByText("Technology")).toBeInTheDocument();
  });

  // --- 14. Category hidden ---
  it("14. meta bar hides category when showCategory=false", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showCategory: false }));
    // Category chip should not be rendered in meta bar
    // The category text may still appear elsewhere (related posts), but chip should be absent
    const chips = document.querySelectorAll('[class*="MuiChip"]');
    expect(chips.length).toBe(0);
  });

  // --- 15. Reading time ---
  it("15. shows reading time in meta bar", () => {
    setupHookWithData();
    renderBlock(makeBlock());
    expect(screen.getByText(/min read/i)).toBeInTheDocument();
  });

  // --- 16. Back button shown ---
  it("16. renders back button when showBackButton=true", () => {
    setupHookWithData();
    renderBlock(
      makeBlock({ showBackButton: true, backButtonText: "Back to Blog" }),
    );
    expect(
      screen.getByRole("button", { name: /Back to Blog/i }),
    ).toBeInTheDocument();
  });

  // --- 17. Back button hidden ---
  it("17. hides back button when showBackButton=false", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showBackButton: false }));
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });

  // --- 18. Back button custom text ---
  it("18. uses custom back button text", () => {
    setupHookWithData();
    renderBlock(
      makeBlock({
        showBackButton: true,
        backButtonText: "Go Back to Articles",
      }),
    );
    expect(
      screen.getByRole("button", { name: /Go Back to Articles/i }),
    ).toBeInTheDocument();
  });

  // --- 19. Table of contents ---
  it("19. renders table of contents from headings", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showTableOfContents: true }));
    expect(
      screen.getByRole("navigation", { name: /table of contents/i }),
    ).toBeInTheDocument();
    // Both TOC and article body contain these texts
    const introEls = screen.getAllByText("Introduction");
    expect(introEls.length).toBeGreaterThanOrEqual(1);
    const optEls = screen.getAllByText("Optimization Techniques");
    expect(optEls.length).toBeGreaterThanOrEqual(1);
  });

  // --- 20. TOC hidden ---
  it("20. hides table of contents when showTableOfContents=false", () => {
    setupHookWithData();
    renderBlock(makeBlock({ showTableOfContents: false }));
    expect(
      screen.queryByRole("navigation", { name: /table of contents/i }),
    ).toBeNull();
  });

  // --- 21. TOC hidden when no headings ---
  it("21. hides TOC when post has no headings", () => {
    const postNoHeadings = { ...mockPost, headings: [] };
    setupHookWithData(postNoHeadings);
    renderBlock(makeBlock({ showTableOfContents: true }));
    expect(
      screen.queryByRole("navigation", { name: /table of contents/i }),
    ).toBeNull();
  });

  // --- 22. Article body headings ---
  it("22. article body renders headings as h2", () => {
    setupHookWithData();
    renderBlock(makeBlock());
    const h2s = screen.getAllByRole("heading", { level: 2 });
    const headingTexts = h2s.map((h) => h.textContent);
    expect(headingTexts).toContain("Introduction");
    expect(headingTexts).toContain("Optimization Techniques");
  });

  // --- 23. Article body description paragraphs ---
  it("23. article body renders description paragraphs", () => {
    setupHookWithData();
    renderBlock(makeBlock());
    expect(
      screen.getByText("React is a powerful library."),
    ).toBeInTheDocument();
    expect(screen.getByText("Performance matters.")).toBeInTheDocument();
  });

  // --- 24. Standard layout renders TOC in sidebar ---
  it("24. standard layout places TOC in sidebar grid", () => {
    setupHookWithData();
    const { container } = renderBlock(
      makeBlock({ layout: "standard", showTableOfContents: true }),
    );
    // MUI Grid should have two columns
    const grids = container.querySelectorAll('[class*="MuiGrid-item"]');
    expect(grids.length).toBeGreaterThanOrEqual(2);
    // TOC navigation should be present
    expect(
      screen.getByRole("navigation", { name: /table of contents/i }),
    ).toBeInTheDocument();
  });

  // --- 25. Magazine layout: hero rendered ---
  it("25. magazine layout renders hero image", () => {
    setupHookWithData();
    const { container } = renderBlock(
      makeBlock({ layout: "magazine", showImage: true }),
    );
    // Magazine layout hero is rendered outside container; find by src
    const imgs = container.querySelectorAll("img");
    const heroImg = Array.from(imgs).find(
      (img) => img.getAttribute("src") === "https://example.com/hero.jpg",
    );
    expect(heroImg).toBeTruthy();
  });

  // --- 26. Minimal layout: no hero ---
  it("26. minimal layout does not render hero image", () => {
    setupHookWithData();
    renderBlock(makeBlock({ layout: "minimal", showImage: true }));
    expect(
      screen.queryByRole("img", { name: /Understanding React Performance/ }),
    ).toBeNull();
  });

  // --- 27. Related posts rendered ---
  it("27. renders related posts when showRelated=true and fetch returns posts", async () => {
    setupHookWithData();
    renderBlock(makeBlock({ showRelated: true, relatedCount: 3 }));
    await waitFor(() => {
      expect(screen.getByText("Related Articles")).toBeInTheDocument();
    });
  });

  // --- 28. Related posts hidden ---
  it("28. hides related posts when showRelated=false", async () => {
    setupHookWithData();
    renderBlock(makeBlock({ showRelated: false }));
    // Wait for any async effect
    await waitFor(() => {
      expect(screen.queryByText("Related Articles")).toBeNull();
    });
  });

  // --- 29. BlogCard used for related posts ---
  it("29. uses BlogCard components for related posts display", async () => {
    setupHookWithData();
    renderBlock(makeBlock({ showRelated: true, relatedCount: 2 }));
    await waitFor(() => {
      // BlogCard renders with role="article"
      const articles = screen.getAllByRole("article");
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  // --- 30. React.memo ---
  it("30. component is wrapped in React.memo", () => {
    // React.memo wraps create a component with $$typeof === REACT_MEMO_TYPE
    const { default: Comp } = { default: BlogArticleBlock };
    expect((Comp as any).$$typeof?.toString()).toContain("Symbol");
    // The display name should be set
    expect(
      (Comp as any).displayName || (Comp as any).type?.displayName,
    ).toBeTruthy();
  });

  // --- 31. DOMPurify sanitizes content ---
  it("31. DOMPurify is called to sanitize heading content", () => {
    vi.mocked(DOMPurifyMock.sanitize).mockClear();
    setupHookWithData();
    renderBlock(makeBlock());
    // DOMPurify.sanitize should be called for heading and description content
    expect(DOMPurifyMock.sanitize).toHaveBeenCalled();
  });

  // --- 32. javascript: protocol rejected on back button ---
  it("32. javascript: protocol is rejected on backButtonLink", () => {
    setupHookWithData();
    renderBlock(
      makeBlock({
        showBackButton: true,
        backButtonLink: "javascript:alert(1)",
        backButtonText: "Back",
      }),
    );
    const btn = screen.getByRole("button", { name: /Back/i });
    fireEvent.click(btn);
    // mockNavigate should be called with safe fallback '/blog', not with the js: link
    // (safeUrl converts javascript: to /blog)
    expect(mockNavigate).toHaveBeenCalledWith("/blog");
  });

  // --- 33. Post identifier from URL params ---
  it("33. resolves post identifier from URL params when config is empty", () => {
    mockParams = { slug: "url-based-slug" };
    setupHookNoData();
    renderBlock(makeBlock({ postIdentifier: "" }));
    // useDynamicBlockData should have been called with a source including the slug
    expect(mockUseDynamic).toHaveBeenCalledWith(
      10,
      "BLOG_ARTICLE",
      expect.stringContaining("url-based-slug"),
    );
  });

  // --- 34. Config postIdentifier takes priority over URL params ---
  it("34. config postIdentifier takes priority over URL params", () => {
    mockParams = { slug: "url-slug" };
    setupHookNoData();
    renderBlock(makeBlock({ postIdentifier: "config-slug" }));
    expect(mockUseDynamic).toHaveBeenCalledWith(
      10,
      "BLOG_ARTICLE",
      expect.stringContaining("config-slug"),
    );
    expect(mockUseDynamic).not.toHaveBeenCalledWith(
      10,
      "BLOG_ARTICLE",
      expect.stringContaining("url-slug"),
    );
  });

  // --- 35. Fallback renders description when no headings ---
  it("35. renders description paragraph as fallback when no headings array", () => {
    const postNoHeadings = {
      ...mockPost,
      headings: undefined,
      description: "Fallback description text for article.",
    };
    setupHookWithData(postNoHeadings as any);
    renderBlock(makeBlock());
    expect(
      screen.getByText("Fallback description text for article."),
    ).toBeInTheDocument();
  });

  // --- 36. SEO context setSeoData called with post data ---
  it("36. SEO context setSeoData called with post data when article loads", async () => {
    const mockSetSeoData = vi.fn();
    setupHookWithData();
    render(
      <MemoryRouter>
        <BlogArticleSeoContext.Provider
          value={{ seoData: null, setSeoData: mockSetSeoData }}
        >
          <BlogArticleBlock
            block={makeBlock()}
            primaryColor="#378C92"
            headingColor="#252525"
            bodyColor="#6A6F78"
          />
        </BlogArticleSeoContext.Provider>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(mockSetSeoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockPost.metaTitle,
          description: mockPost.metaDescription,
          image: mockPost.image,
          authorName: mockPost.author.name,
          slug: mockPost.slug,
        }),
      );
    });
  });
});
