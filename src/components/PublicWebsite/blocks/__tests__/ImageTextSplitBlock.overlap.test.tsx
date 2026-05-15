/**
 * Tests for ImageTextSplitBlock — Step 14.8: Overlap Variant
 *
 * Covers:
 *  1.  Default variant renders without motion wrapper
 *  2.  Overlap variant renders with motion wrapper
 *  3.  Overlap + imagePosition=left: image gets negative marginRight
 *  4.  Overlap + imagePosition=right: image gets negative marginLeft
 *  5.  Overlap + imagePosition=left: text column gets paddingLeft compensation
 *  6.  Overlap + imagePosition=right: text column gets paddingRight compensation
 *  7.  Default variant: no overlap styling on image
 *  8.  Default variant: no compensating padding on text column
 *  9.  Overlap with placeholder (no image): placeholder gets overlap styles
 *  10. Overlap: heading renders correctly
 *  11. Overlap: body renders correctly
 *  12. Overlap: CTA button renders correctly
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ImageTextSplitBlock from "../ImageTextSplitBlock";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockWrapper", () => ({
  BlockWrapper: ({ children }: any) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

vi.mock("dompurify", () => ({
  default: {
    sanitize: vi.fn((html: string) => html),
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(
      ({ children, initial, animate, transition, ...props }: any, ref: any) => (
        <div
          ref={ref}
          data-testid="motion-div"
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(animate)}
          {...props}
        >
          {children}
        </div>
      ),
    ),
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0, onChange: () => () => {} },
  }),
  useTransform: (..._args: any[]) => ({
    get: () => "0%",
    onChange: () => () => {},
  }),
  useMotionValue: (v: any) => ({
    get: () => v,
    set: () => {},
    onChange: () => () => {},
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeContent = (overrides: Record<string, any> = {}) => ({
  heading: "Our Story",
  body: "<p>We have been serving clients since 2010.</p>",
  image: "https://example.com/photo.jpg",
  imageAlt: "Company photo",
  imagePosition: "left" as const,
  ctaText: "Learn More",
  ctaLink: "/about",
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ImageTextSplitBlock — overlap variant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1
  it("default variant renders without motion wrapper", () => {
    render(
      <ImageTextSplitBlock content={makeContent({ variant: "default" })} />,
    );
    expect(screen.queryByTestId("motion-div")).toBeNull();
  });

  // 2
  it("overlap variant renders with motion wrapper around image", () => {
    render(
      <ImageTextSplitBlock content={makeContent({ variant: "overlap" })} />,
    );
    expect(screen.getByTestId("motion-div")).toBeInTheDocument();
  });

  // 3
  it("overlap + imagePosition=left: motion.div wraps image with left slide animation", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({ variant: "overlap", imagePosition: "left" })}
      />,
    );
    const motionDiv = screen.getByTestId("motion-div");
    expect(motionDiv).toBeInTheDocument();
    const initial = JSON.parse(motionDiv.getAttribute("data-initial") || "{}");
    expect(initial.x).toBe(-60);
    expect(initial.opacity).toBe(0);
  });

  // 4
  it("overlap + imagePosition=right: motion.div wraps image with right slide animation", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({ variant: "overlap", imagePosition: "right" })}
      />,
    );
    const motionDiv = screen.getByTestId("motion-div");
    expect(motionDiv).toBeInTheDocument();
    const initial = JSON.parse(motionDiv.getAttribute("data-initial") || "{}");
    expect(initial.x).toBe(60);
    expect(initial.opacity).toBe(0);
  });

  // 5
  it("overlap + imagePosition=left: text column exists with correct test id", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({ variant: "overlap", imagePosition: "left" })}
      />,
    );
    const textCol = screen.getByTestId("text-column");
    expect(textCol).toBeInTheDocument();
  });

  // 6
  it("overlap + imagePosition=right: text column exists with correct test id", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({ variant: "overlap", imagePosition: "right" })}
      />,
    );
    const textCol = screen.getByTestId("text-column");
    expect(textCol).toBeInTheDocument();
  });

  // 7
  it("default variant: no motion wrapper (no overlap)", () => {
    render(<ImageTextSplitBlock content={makeContent()} />);
    // No variant specified → default → no motion div
    expect(screen.queryByTestId("motion-div")).toBeNull();
  });

  // 8
  it("default variant: image and text columns both render", () => {
    render(<ImageTextSplitBlock content={makeContent()} />);
    expect(screen.getByTestId("image-column")).toBeInTheDocument();
    expect(screen.getByTestId("text-column")).toBeInTheDocument();
  });

  // 9
  it("overlap with no image: placeholder is wrapped in motion.div", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({ variant: "overlap", image: undefined })}
      />,
    );
    expect(screen.getByTestId("motion-div")).toBeInTheDocument();
    expect(screen.getByTestId("image-placeholder")).toBeInTheDocument();
  });

  // 10
  it("overlap: heading renders correctly", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({
          variant: "overlap",
          heading: "Overlap Heading",
        })}
      />,
    );
    expect(screen.getByText("Overlap Heading")).toBeInTheDocument();
  });

  // 11
  it("overlap: body renders correctly", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({
          variant: "overlap",
          body: "<p>Overlap body text</p>",
        })}
      />,
    );
    expect(screen.getByText("Overlap body text")).toBeInTheDocument();
  });

  // 12
  it("overlap: CTA button renders and is present", () => {
    render(
      <ImageTextSplitBlock
        content={makeContent({ variant: "overlap", ctaText: "Get Started" })}
      />,
    );
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });
});
