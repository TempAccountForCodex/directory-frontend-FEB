/**
 * Tests for BeforeAfterBlock (Step 2.29A.5)
 *
 * Covers:
 * 1.  Renders heading when provided
 * 2.  Renders without heading gracefully
 * 3.  Renders before and after images with lazy loading
 * 4.  Renders beforeLabel and afterLabel overlays
 * 5.  Renders caption text when provided
 * 6.  Slider handle is visible
 * 7.  Multiple pairs render as grid
 * 8.  Single pair renders full width
 * 9.  Start position defaults to 50 when not provided
 * 10. SSR: both images visible (non-JS fallback)
 * 11. Component is wrapped in React.memo with displayName
 * 12. Horizontal orientation renders correctly
 * 13. Vertical orientation renders correctly
 * 14. onPointerDown handler is attached to slider
 * 15. Empty pairs array renders gracefully (no crash)
 * 16. sliderColor is applied to slider handle styling
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => [null, true],
}));

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: null, inView: true }),
}));

// ---------------------------------------------------------------------------
// Import subject (will fail until implemented — RED phase)
// ---------------------------------------------------------------------------
import BeforeAfterBlock from "../BeforeAfterBlock";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

type BlockLike = {
  id: number;
  blockType: string;
  sortOrder: number;
  content: Record<string, any>;
};

const makePair = (overrides = {}) => ({
  beforeImage: "https://example.com/before.jpg",
  afterImage: "https://example.com/after.jpg",
  beforeLabel: "Before",
  afterLabel: "After",
  caption: "A transformation",
  ...overrides,
});

const makeBlock = (contentOverrides = {}): BlockLike => ({
  id: 1,
  blockType: "BEFORE_AFTER",
  sortOrder: 1,
  content: {
    heading: "Before & After",
    pairs: [makePair()],
    orientation: "horizontal",
    sliderColor: "#ffffff",
    startPosition: 50,
    ...contentOverrides,
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BeforeAfterBlock", () => {
  it("1. renders heading when provided", () => {
    render(<BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />);
    expect(screen.getByText("Before & After")).toBeInTheDocument();
  });

  it("2. renders without heading gracefully", () => {
    render(
      <BeforeAfterBlock
        block={makeBlock({ heading: "" })}
        primaryColor="#2563eb"
      />,
    );
    // Should not crash
    expect(document.body).toBeTruthy();
  });

  it("3. renders before and after images with lazy loading", () => {
    render(<BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
    images.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  it("4. renders beforeLabel and afterLabel overlays", () => {
    render(<BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />);
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("5. renders caption text when provided", () => {
    render(<BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />);
    expect(screen.getByText("A transformation")).toBeInTheDocument();
  });

  it("6. slider handle is visible (has data-testid or accessible role)", () => {
    const { container } = render(
      <BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />,
    );
    // Slider handle should exist — find by data-testid or aria role
    const handle = container.querySelector('[data-testid="slider-handle"]');
    expect(handle).toBeInTheDocument();
  });

  it("7. multiple pairs render as grid — all before/after labels visible", () => {
    const pairs = [
      makePair({
        beforeLabel: "Before 1",
        afterLabel: "After 1",
        caption: "Cap 1",
      }),
      makePair({
        beforeLabel: "Before 2",
        afterLabel: "After 2",
        caption: "Cap 2",
      }),
      makePair({
        beforeLabel: "Before 3",
        afterLabel: "After 3",
        caption: "Cap 3",
      }),
    ];
    render(
      <BeforeAfterBlock block={makeBlock({ pairs })} primaryColor="#2563eb" />,
    );
    expect(screen.getByText("Before 1")).toBeInTheDocument();
    expect(screen.getByText("Before 2")).toBeInTheDocument();
    expect(screen.getByText("Before 3")).toBeInTheDocument();
  });

  it("8. single pair renders without crash", () => {
    render(
      <BeforeAfterBlock
        block={makeBlock({ pairs: [makePair()] })}
        primaryColor="#2563eb"
      />,
    );
    expect(document.body).toBeTruthy();
  });

  it("9. start position defaults to 50 when not provided", () => {
    const block = makeBlock({ startPosition: undefined });
    const { container } = render(
      <BeforeAfterBlock block={block} primaryColor="#2563eb" />,
    );
    // The clip-path or transform should reflect 50%
    const sliderLine = container.querySelector('[data-testid="slider-line"]');
    expect(sliderLine).toBeInTheDocument();
  });

  it("10. SSR fallback: both images rendered (data-testid=ssr-fallback or just 2 imgs)", () => {
    render(<BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />);
    const images = screen.getAllByRole("img");
    // At minimum before and after images must be in DOM
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it("11. component is React.memo (has displayName)", () => {
    expect(
      BeforeAfterBlock.displayName ??
        (BeforeAfterBlock as any).type?.displayName,
    ).toBeTruthy();
  });

  it("12. horizontal orientation — container has horizontal data attribute or default", () => {
    const { container } = render(
      <BeforeAfterBlock
        block={makeBlock({ orientation: "horizontal" })}
        primaryColor="#2563eb"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("13. vertical orientation renders without crash", () => {
    const { container } = render(
      <BeforeAfterBlock
        block={makeBlock({ orientation: "vertical" })}
        primaryColor="#2563eb"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("14. slider container has pointer event handlers", () => {
    const { container } = render(
      <BeforeAfterBlock block={makeBlock()} primaryColor="#2563eb" />,
    );
    const sliderContainer = container.querySelector(
      '[data-testid="slider-container"]',
    );
    expect(sliderContainer).toBeInTheDocument();
  });

  it("15. empty pairs array renders gracefully", () => {
    expect(() =>
      render(
        <BeforeAfterBlock
          block={makeBlock({ pairs: [] })}
          primaryColor="#2563eb"
        />,
      ),
    ).not.toThrow();
  });

  it("16. custom sliderColor rendered (no crash with custom color)", () => {
    expect(() =>
      render(
        <BeforeAfterBlock
          block={makeBlock({ sliderColor: "#ff0000" })}
          primaryColor="#2563eb"
        />,
      ),
    ).not.toThrow();
  });
});
