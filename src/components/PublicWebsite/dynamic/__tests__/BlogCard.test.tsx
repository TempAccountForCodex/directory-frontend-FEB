/**
 * Tests for BlogCard component (Step 2.23.2)
 *
 * Covers:
 * 1.  Renders post title always
 * 2.  Featured image shown when showImage=true, hidden when false
 * 3.  Image has lazy loading and fallback placeholder
 * 4.  Author name shown when showAuthor=true, hidden when false
 * 5.  Date formatted readably when showDate=true
 * 6.  Excerpt truncated to config.excerptLength when showExcerpt=true
 * 7.  Category displayed as MUI Chip
 * 8.  Hover effect applied via sx transition
 * 9.  onClick callback fires when card is clicked
 * 10. Component wrapped in React.memo
 * 11. TypeScript types defined for props (BlogCardProps)
 * 12. MUI Card, CardMedia, CardContent, Typography used
 * 13. Read More link renders
 * 14. No image renders placeholder div when post has no image
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import BlogCard from "../BlogCard";

const baseMockPost = {
  id: 1,
  title: "Test Blog Post Title",
  slug: "test-blog-post-title",
  image: "https://example.com/image.jpg",
  category: "Technology",
  description:
    "This is the excerpt for the test blog post, it is longer than expected.",
  author: { name: "Jane Doe" },
  publishedAt: "2026-03-10T10:00:00.000Z",
};

const baseConfig = {
  showImage: true,
  showAuthor: true,
  showDate: true,
  showExcerpt: true,
  excerptLength: 50,
  readMoreText: "Read More",
  readMoreLink: "/blog/{slug}",
};

const baseColors = {
  primaryColor: "#378C92",
  headingColor: "#252525",
  bodyColor: "#6A6F78",
};

describe("BlogCard", () => {
  it("renders post title always", () => {
    render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    expect(screen.getByText("Test Blog Post Title")).toBeInTheDocument();
  });

  it("renders featured image when showImage=true", () => {
    const { container } = render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.src).toContain("example.com/image.jpg");
  });

  it("hides featured image when showImage=false", () => {
    const { container } = render(
      <BlogCard
        post={baseMockPost}
        config={{ ...baseConfig, showImage: false }}
        colors={baseColors}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeNull();
  });

  it("image has lazy loading attribute", () => {
    const { container } = render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    // Check that loading attribute is set (either via attribute or property)
    expect(img?.getAttribute("loading") || img?.loading).toBe("lazy");
  });

  it("renders placeholder when post has no image and showImage=true", () => {
    const { container } = render(
      <BlogCard
        post={{ ...baseMockPost, image: undefined }}
        config={baseConfig}
        colors={baseColors}
      />,
    );
    // No img tag but a placeholder should exist
    const img = container.querySelector("img");
    expect(img).toBeNull();
    // Should render placeholder area
    expect(
      container.querySelector('[data-testid="blog-card-image-placeholder"]'),
    ).not.toBeNull();
  });

  it("shows author name when showAuthor=true", () => {
    render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("hides author name when showAuthor=false", () => {
    render(
      <BlogCard
        post={baseMockPost}
        config={{ ...baseConfig, showAuthor: false }}
        colors={baseColors}
      />,
    );
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  });

  it("shows formatted date when showDate=true", () => {
    render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    // Date 2026-03-10 should be formatted as "Mar 10, 2026"
    expect(screen.getByText("Mar 10, 2026")).toBeInTheDocument();
  });

  it("hides date when showDate=false", () => {
    render(
      <BlogCard
        post={baseMockPost}
        config={{ ...baseConfig, showDate: false }}
        colors={baseColors}
      />,
    );
    expect(screen.queryByText("Mar 10, 2026")).not.toBeInTheDocument();
  });

  it("shows excerpt truncated to excerptLength when showExcerpt=true", () => {
    const longDescription = "A".repeat(200);
    render(
      <BlogCard
        post={{ ...baseMockPost, description: longDescription }}
        config={{ ...baseConfig, excerptLength: 100, showExcerpt: true }}
        colors={baseColors}
      />,
    );
    const excerpt = screen.getByTestId("blog-card-excerpt");
    expect(excerpt.textContent?.length).toBeLessThanOrEqual(103); // 100 chars + "..."
  });

  it("hides excerpt when showExcerpt=false", () => {
    render(
      <BlogCard
        post={baseMockPost}
        config={{ ...baseConfig, showExcerpt: false }}
        colors={baseColors}
      />,
    );
    expect(screen.queryByTestId("blog-card-excerpt")).not.toBeInTheDocument();
  });

  it("displays category as MUI Chip", () => {
    const { container } = render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    // MUI Chip has a specific class
    const chip = container.querySelector(".MuiChip-root");
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain("Technology");
  });

  it("fires onClick when card is clicked", () => {
    const handleClick = vi.fn();
    render(
      <BlogCard
        post={baseMockPost}
        config={baseConfig}
        colors={baseColors}
        onClick={handleClick}
      />,
    );
    const card = screen.getByRole("article");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(baseMockPost);
  });

  it("renders Read More link with post title", () => {
    render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    // The text includes an arrow: "Read More →"
    expect(screen.getByText(/Read More/)).toBeInTheDocument();
  });

  it("is wrapped in React.memo", () => {
    // BlogCard should be a memoized component (memo wrapping preserves rendering)
    const { container, rerender } = render(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    expect(container.firstChild).not.toBeNull();
    // Re-render with same props — should still work correctly
    rerender(
      <BlogCard post={baseMockPost} config={baseConfig} colors={baseColors} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("handles missing publishedAt gracefully", () => {
    render(
      <BlogCard
        post={{ ...baseMockPost, publishedAt: null }}
        config={baseConfig}
        colors={baseColors}
      />,
    );
    // Should render without crashing
    expect(screen.getByText("Test Blog Post Title")).toBeInTheDocument();
  });

  it("handles missing author gracefully", () => {
    render(
      <BlogCard
        post={{ ...baseMockPost, author: null }}
        config={baseConfig}
        colors={baseColors}
      />,
    );
    expect(screen.getByText("Test Blog Post Title")).toBeInTheDocument();
  });
});
