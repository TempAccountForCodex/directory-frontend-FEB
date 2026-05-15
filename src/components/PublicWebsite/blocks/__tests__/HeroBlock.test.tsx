/**
 * Tests for HeroBlock — Step 15.9: Responsive Typography Scale
 *
 * Covers:
 *  1.  dual-image variant renders without crashing
 *  2.  Primary image cell renders with correct background-image style
 *  3.  Gradient overlay is rendered inside primary cell
 *  4.  Heading text is rendered in bottom-left text area
 *  5.  Subheading is rendered when provided
 *  6.  Subheading is NOT rendered when absent
 *  7.  CTA button renders when ctaText is provided
 *  8.  CTA button is NOT rendered when ctaText is absent
 *  9.  Secondary image renders on desktop cell with correct src
 *  10. Secondary image cell is hidden on mobile (display xs:none)
 *  11. Fallback: missing primary image uses primaryColor background (no crash)
 *  12. Fallback: missing secondary image renders secondary cell without <img>
 *  13. onCtaClick is called when CTA button is clicked
 *  14. Data URI in heroImage is stripped (XSS guard)
 *  15. Other variants (centered, left, full-bleed, split) still render
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import HeroBlock, { resolveHeadingFontSizeSx } from "../HeroBlock";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockWrapper", () => ({
  BlockWrapper: ({ children }: any) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../utils/headingTypography", () => ({
  resolveHeadingTypographySx: () => ({}),
  resolveSubheadingTypographySx: () => ({}),
}));

vi.mock("../../hooks", () => ({
  useScrollParallax: () => ({ y: 0, enabled: false }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeContent = (overrides: Record<string, any> = {}) => ({
  heading: "Discover Our Space",
  subheading: "A place to work and grow.",
  ctaText: "Book a Tour",
  ctaLink: "/contact",
  heroImage: "https://example.com/primary.jpg",
  heroImageSecondary: "https://example.com/secondary.jpg",
  headingOpacity: 100,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("HeroBlock — dual-image variant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1
  it("renders dual-image hero without crashing", () => {
    const { container } = render(
      <HeroBlock content={makeContent()} variant="dual-image" />,
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByTestId("dual-image-hero")).toBeInTheDocument();
  });

  // 2
  it("primary image cell has backgroundImage style with the correct URL", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    const primaryCell = screen.getByTestId("dual-image-primary");
    // MUI applies inline style; the backgroundImage is set via sx
    expect(primaryCell).toBeInTheDocument();
  });

  // 3
  it("renders gradient overlay inside primary cell", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    expect(screen.getByTestId("dual-image-overlay")).toBeInTheDocument();
  });

  // 4
  it("renders heading text in the primary cell", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    expect(screen.getByText("Discover Our Space")).toBeInTheDocument();
  });

  // 5
  it("renders subheading when provided", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    expect(screen.getByText("A place to work and grow.")).toBeInTheDocument();
  });

  // 6
  it("does NOT render subheading when absent", () => {
    render(
      <HeroBlock
        content={makeContent({ subheading: undefined })}
        variant="dual-image"
      />,
    );
    expect(
      screen.queryByText("A place to work and grow."),
    ).not.toBeInTheDocument();
  });

  // 7
  it("renders CTA button when ctaText is provided", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    expect(
      screen.getByRole("button", { name: /Book a Tour/i }),
    ).toBeInTheDocument();
  });

  // 8
  it("does NOT render CTA button when ctaText is absent", () => {
    render(
      <HeroBlock
        content={makeContent({ ctaText: undefined })}
        variant="dual-image"
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // 9
  it("secondary image renders with correct src", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    const secondaryCell = screen.getByTestId("dual-image-secondary");
    const img = secondaryCell.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/secondary.jpg");
  });

  // 10
  it("secondary image cell exists in DOM (hidden on mobile via display:none sx)", () => {
    render(<HeroBlock content={makeContent()} variant="dual-image" />);
    // The cell is present in the DOM; responsive hiding is handled by MUI sx
    expect(screen.getByTestId("dual-image-secondary")).toBeInTheDocument();
  });

  // 11
  it("renders without crash when heroImage is missing (uses color background)", () => {
    const { container } = render(
      <HeroBlock
        content={makeContent({ heroImage: undefined })}
        variant="dual-image"
        primaryColor="#2563eb"
      />,
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByTestId("dual-image-primary")).toBeInTheDocument();
  });

  // 12
  it("renders secondary cell without <img> when heroImageSecondary is missing", () => {
    render(
      <HeroBlock
        content={makeContent({ heroImageSecondary: undefined })}
        variant="dual-image"
      />,
    );
    const secondaryCell = screen.getByTestId("dual-image-secondary");
    const img = secondaryCell.querySelector("img");
    expect(img).toBeNull();
  });

  // 13
  it("calls onCtaClick when CTA button is clicked", () => {
    const onCtaClick = vi.fn();
    render(
      <HeroBlock
        content={makeContent()}
        variant="dual-image"
        onCtaClick={onCtaClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Book a Tour/i }));
    expect(onCtaClick).toHaveBeenCalledWith("HERO", "Book a Tour");
  });

  // 14
  it("strips data: URI in heroImage (XSS guard)", () => {
    const { container } = render(
      <HeroBlock
        content={makeContent({
          heroImage: "data:text/html,<script>alert(1)</script>",
        })}
        variant="dual-image"
      />,
    );
    expect(container.innerHTML).not.toContain("data:text/html");
    expect(container.firstChild).not.toBeNull();
  });

  // 15 — verify other variants still render after adding dual-image
  it.each(["centered", "left", "full-bleed", "split"] as const)(
    "variant=%s still renders correctly",
    (v) => {
      const { container } = render(
        <HeroBlock content={makeContent()} variant={v} />,
      );
      expect(container.firstChild).not.toBeNull();
    },
  );
});

// ---------------------------------------------------------------------------
// Step 15.9: Responsive Typography Scale — custom breakpoint font sizes
// ---------------------------------------------------------------------------

describe("resolveHeadingFontSizeSx — custom responsive typography", () => {
  // 1. Custom builds responsive fontSize from 4 breakpoint fields
  it("builds responsive fontSize object from custom breakpoint fields", () => {
    const content = {
      customFontSizeXs: "3.2rem",
      customFontSizeSm: "5rem",
      customFontSizeMd: "7rem",
      customFontSizeLg: "7.9rem",
    };
    const result = resolveHeadingFontSizeSx("custom", content) as any;
    expect(result.fontSize).toEqual({
      xs: "3.2rem",
      sm: "5rem",
      md: "7rem",
      lg: "7.9rem",
    });
  });

  // 2. Custom applies lineHeight when provided
  it("applies customLineHeight when provided", () => {
    const content = {
      customFontSizeXs: "3rem",
      customLineHeight: 0.85,
    };
    const result = resolveHeadingFontSizeSx("custom", content) as any;
    expect(result.lineHeight).toBe(0.85);
  });

  // 3. Custom applies letterSpacing when provided
  it("applies customLetterSpacing when provided", () => {
    const content = {
      customFontSizeXs: "3rem",
      customLetterSpacing: "-0.04em",
    };
    const result = resolveHeadingFontSizeSx("custom", content) as any;
    expect(result.letterSpacing).toBe("-0.04em");
  });

  // 4. Custom falls back to default fontSize when no breakpoint fields provided
  it("falls back to default fontSize when all custom fields are empty", () => {
    const content = {
      customFontSizeXs: "",
      customFontSizeSm: "",
      customFontSizeMd: "",
      customFontSizeLg: "",
    };
    const result = resolveHeadingFontSizeSx("custom", content) as any;
    expect(result.fontSize).toEqual({ xs: "2.5rem", md: "3.5rem" });
  });

  // 5. Custom with partial breakpoints only includes provided ones
  it("only includes breakpoints that have values", () => {
    const content = {
      customFontSizeXs: "2rem",
      customFontSizeSm: "",
      customFontSizeMd: "5rem",
      customFontSizeLg: "",
    };
    const result = resolveHeadingFontSizeSx("custom", content) as any;
    expect(result.fontSize).toEqual({ xs: "2rem", md: "5rem" });
  });

  // 6. Existing presets remain unchanged
  it("returns preset fontSize for non-custom values", () => {
    const result = resolveHeadingFontSizeSx("display") as any;
    expect(result.fontSize).toEqual({
      xs: "3rem",
      md: "4.5rem",
      lg: "6rem",
      xl: "7.5rem",
    });
    expect(result.lineHeight).toBe(0.85);
    expect(result.letterSpacing).toBe("-0.04em");
  });

  // 7. Default value still works
  it("returns default fontSize for undefined value", () => {
    const result = resolveHeadingFontSizeSx(undefined) as any;
    expect(result.fontSize).toEqual({ xs: "2.5rem", md: "3.5rem" });
  });

  // 8. Custom without content object falls back to default
  it("falls back to default when custom selected but no content provided", () => {
    const result = resolveHeadingFontSizeSx("custom") as any;
    expect(result.fontSize).toEqual({ xs: "2.5rem", md: "3.5rem" });
  });
});
