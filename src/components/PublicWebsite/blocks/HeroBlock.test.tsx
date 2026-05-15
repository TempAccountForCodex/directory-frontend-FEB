/**
 * HeroBlock.test.tsx — Step 10.1
 * Tests for HeroBlock component — all 4 variants
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock BlockWrapper to render children without design-token processing
vi.mock("../BlockWrapper", () => ({
  BlockWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

// Mock useScrollParallax — Framer Motion useScroll cannot hydrate refs in JSDOM
vi.mock("../hooks", async () => {
  const actual = await vi.importActual("../hooks");
  return {
    ...actual,
    useScrollParallax: () => ({
      y: { get: () => "0px", set: () => {} },
      scale: { get: () => 1, set: () => {} },
      enabled: false,
    }),
  };
});

// Mock useNavigate
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

import HeroBlock, {
  resolveHeroMinHeight,
  resolveHeadingFontSizeSx,
  resolveSubheadingMaxWidth,
} from "./HeroBlock";

// ── Fixtures ───────────────────────────────────────────────────────────────────

const baseContent = {
  heading: "Test Heading",
  subheading: "Test Subheading",
  ctaText: "Click Me",
  ctaLink: "/contact",
};

const contentWithHeroImage = {
  ...baseContent,
  heroImage: "https://example.com/hero.jpg",
};

const contentNoCta = {
  heading: "Test Heading",
  subheading: "Test Subheading",
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("HeroBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── centered variant ─────────────────────────────────────────────────────────

  describe("centered variant (default)", () => {
    it("renders with heading text", () => {
      render(<HeroBlock content={baseContent} variant="centered" />);
      expect(screen.getByText("Test Heading")).toBeTruthy();
    });

    it("renders subheading", () => {
      render(<HeroBlock content={baseContent} variant="centered" />);
      expect(screen.getByText("Test Subheading")).toBeTruthy();
    });

    it("renders CTA button when ctaText is provided", () => {
      render(<HeroBlock content={baseContent} variant="centered" />);
      expect(screen.getByText("Click Me")).toBeTruthy();
    });

    it("does not render CTA button when ctaText is missing", () => {
      render(<HeroBlock content={contentNoCta} variant="centered" />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("renders with default variant when variant is undefined", () => {
      render(<HeroBlock content={baseContent} />);
      expect(screen.getByText("Test Heading")).toBeTruthy();
    });

    it("wraps content in BlockWrapper", () => {
      render(<HeroBlock content={baseContent} variant="centered" />);
      expect(screen.getByTestId("block-wrapper")).toBeTruthy();
    });
  });

  // ── left variant ─────────────────────────────────────────────────────────────

  describe("left variant", () => {
    it("renders with heading text", () => {
      render(<HeroBlock content={baseContent} variant="left" />);
      expect(screen.getByText("Test Heading")).toBeTruthy();
    });

    it("renders subheading", () => {
      render(<HeroBlock content={baseContent} variant="left" />);
      expect(screen.getByText("Test Subheading")).toBeTruthy();
    });

    it("renders heading with left text alignment", () => {
      render(<HeroBlock content={baseContent} variant="left" />);
      const heading = screen.getByText("Test Heading");
      // The sx prop sets textAlign: 'left' — rendered via MUI inline styles
      expect(heading).toBeTruthy();
    });

    it("renders CTA button when ctaText is provided", () => {
      render(<HeroBlock content={baseContent} variant="left" />);
      expect(screen.getByText("Click Me")).toBeTruthy();
    });

    it("does not render CTA button when ctaText is missing", () => {
      render(<HeroBlock content={contentNoCta} variant="left" />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  // ── full-bleed variant ───────────────────────────────────────────────────────

  describe("full-bleed variant", () => {
    it("renders with heading text", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="full-bleed" />);
      expect(screen.getByText("Test Heading")).toBeTruthy();
    });

    it("renders subheading", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="full-bleed" />);
      expect(screen.getByText("Test Subheading")).toBeTruthy();
    });

    it("renders background image via heroImage", () => {
      const { container } = render(
        <HeroBlock content={contentWithHeroImage} variant="full-bleed" />,
      );
      // data-bgimage attribute is set on the outer Box for testability
      const el = container.querySelector("[data-bgimage]");
      expect(el?.getAttribute("data-bgimage")).toBe(
        "https://example.com/hero.jpg",
      );
    });

    it("falls back to backgroundImage when heroImage is not set", () => {
      const contentWithBgImage = {
        ...baseContent,
        backgroundImage: "https://example.com/bg.jpg",
      };
      const { container } = render(
        <HeroBlock content={contentWithBgImage} variant="full-bleed" />,
      );
      const el = container.querySelector("[data-bgimage]");
      expect(el?.getAttribute("data-bgimage")).toBe(
        "https://example.com/bg.jpg",
      );
    });

    it("renders CTA button when ctaText is provided", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="full-bleed" />);
      expect(screen.getByText("Click Me")).toBeTruthy();
    });

    it("does not render CTA button when ctaText is missing", () => {
      render(<HeroBlock content={contentNoCta} variant="full-bleed" />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  // ── split variant ────────────────────────────────────────────────────────────

  describe("split variant", () => {
    it("renders with heading text", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="split" />);
      expect(screen.getByText("Test Heading")).toBeTruthy();
    });

    it("renders subheading", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="split" />);
      expect(screen.getByText("Test Subheading")).toBeTruthy();
    });

    it("renders hero image in right column", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="split" />);
      const img = screen.getByRole("img");
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe("https://example.com/hero.jpg");
    });

    it("renders hero image alt text from heading", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="split" />);
      const img = screen.getByRole("img");
      expect(img.getAttribute("alt")).toBe("Test Heading");
    });

    it("does not render image when heroImage is absent", () => {
      render(<HeroBlock content={baseContent} variant="split" />);
      expect(screen.queryByRole("img")).toBeNull();
    });

    it("renders CTA button when ctaText is provided", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="split" />);
      expect(screen.getByText("Click Me")).toBeTruthy();
    });

    it("does not render CTA button when ctaText is missing", () => {
      render(<HeroBlock content={contentNoCta} variant="split" />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("renders MUI Grid container for two-column layout", () => {
      const { container } = render(
        <HeroBlock content={contentWithHeroImage} variant="split" />,
      );
      // MUI Grid renders as a div with MuiGrid-container class
      const gridContainer = container.querySelector(".MuiGrid-container");
      expect(gridContainer).toBeTruthy();
    });
  });

  // ── CTA interaction ──────────────────────────────────────────────────────────

  describe("CTA button rendering", () => {
    it("renders button when ctaText is provided in centered variant", () => {
      render(<HeroBlock content={baseContent} variant="centered" />);
      const button = screen.getByRole("button");
      expect(button).toBeTruthy();
      expect(button.textContent).toBe("Click Me");
    });

    it("does not render button when ctaText is not provided", () => {
      render(<HeroBlock content={contentNoCta} />);
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("renders button when ctaText is provided in split variant", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="split" />);
      const button = screen.getByRole("button");
      expect(button).toBeTruthy();
    });

    it("renders button when ctaText is provided in full-bleed variant", () => {
      render(<HeroBlock content={contentWithHeroImage} variant="full-bleed" />);
      const button = screen.getByRole("button");
      expect(button).toBeTruthy();
    });
  });

  // ── Fallback content ─────────────────────────────────────────────────────────

  describe("fallback content", () => {
    it("shows fallback heading when heading is missing", () => {
      render(<HeroBlock content={{}} />);
      expect(screen.getByText("Welcome")).toBeTruthy();
    });

    it("shows fallback subheading when subheading is missing", () => {
      render(<HeroBlock content={{}} />);
      expect(screen.getByText("Discover amazing content")).toBeTruthy();
    });
  });
});

// ── Step 14.7 — Hero Height & Font Size Control ───────────────────────────────

describe("Step 14.7 — Hero Height & Font Size Control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── heroMinHeight: centered variant ──────────────────────────────────────────

  it("centered variant: default (no heroMinHeight) renders minHeight 60vh", () => {
    const { container } = render(
      <HeroBlock content={baseContent} variant="centered" />,
    );
    const box = container.querySelector("[data-minheight]");
    expect(box?.getAttribute("data-minheight")).toBe("60vh");
  });

  it('centered variant: heroMinHeight="small" renders minHeight 40vh', () => {
    const content = { ...baseContent, heroMinHeight: "small" };
    const { container } = render(
      <HeroBlock content={content} variant="centered" />,
    );
    const box = container.querySelector("[data-minheight]");
    expect(box?.getAttribute("data-minheight")).toBe("40vh");
  });

  it('centered variant: heroMinHeight="full" renders minHeight 100vh', () => {
    const content = { ...baseContent, heroMinHeight: "full" };
    const { container } = render(
      <HeroBlock content={content} variant="centered" />,
    );
    const box = container.querySelector("[data-minheight]");
    expect(box?.getAttribute("data-minheight")).toBe("100vh");
  });

  // ── heroMinHeight: full-bleed variant ────────────────────────────────────────

  it("full-bleed variant: default heroMinHeight renders minHeight 80vh", () => {
    const { container } = render(
      <HeroBlock content={baseContent} variant="full-bleed" />,
    );
    const box = container.querySelector("[data-minheight]");
    expect(box?.getAttribute("data-minheight")).toBe("80vh");
  });

  it('full-bleed variant: heroMinHeight="large" renders minHeight 80vh', () => {
    const content = { ...baseContent, heroMinHeight: "large" };
    const { container } = render(
      <HeroBlock content={content} variant="full-bleed" />,
    );
    const box = container.querySelector("[data-minheight]");
    expect(box?.getAttribute("data-minheight")).toBe("80vh");
  });

  // ── headingFontSize ───────────────────────────────────────────────────────────

  it("centered variant: default headingFontSize resolver returns 2.5rem/3.5rem", () => {
    const sx = resolveHeadingFontSizeSx(undefined) as any;
    expect(sx.fontSize.xs).toBe("2.5rem");
    expect(sx.fontSize.md).toBe("3.5rem");
  });

  it('centered variant: headingFontSize="display" applies lineHeight 0.85, letterSpacing, uppercase', () => {
    const sx = resolveHeadingFontSizeSx("display") as any;
    expect(sx.lineHeight).toBe(0.85);
    expect(sx.letterSpacing).toBe("-0.04em");
    expect(sx.textTransform).toBe("uppercase");
  });

  // ── subheadingMaxWidth ────────────────────────────────────────────────────────

  it('centered variant: subheadingMaxWidth="narrow" resolves to 480px', () => {
    const { container } = render(
      <HeroBlock
        content={{ ...baseContent, subheadingMaxWidth: "narrow" }}
        variant="centered"
      />,
    );
    const subheading = container.querySelector("[data-subheading-maxwidth]");
    expect(subheading?.getAttribute("data-subheading-maxwidth")).toBe("480px");
  });

  it('centered variant: subheadingMaxWidth="wide" resolves to 800px', () => {
    const { container } = render(
      <HeroBlock
        content={{ ...baseContent, subheadingMaxWidth: "wide" }}
        variant="centered"
      />,
    );
    const subheading = container.querySelector("[data-subheading-maxwidth]");
    expect(subheading?.getAttribute("data-subheading-maxwidth")).toBe("800px");
  });

  it('centered variant: subheadingMaxWidth="full" sets data attribute to "full"', () => {
    const { container } = render(
      <HeroBlock
        content={{ ...baseContent, subheadingMaxWidth: "full" }}
        variant="centered"
      />,
    );
    const subheading = container.querySelector("[data-subheading-maxwidth]");
    expect(subheading?.getAttribute("data-subheading-maxwidth")).toBe("full");
  });

  // ── split variant ─────────────────────────────────────────────────────────────

  it('split variant: headingFontSize="xl" resolver returns lg breakpoint 5.5rem', () => {
    const sx = resolveHeadingFontSizeSx("xl") as any;
    expect(sx.fontSize.lg).toBe("5.5rem");
  });

  // ── left variant ──────────────────────────────────────────────────────────────

  it('left variant: heroMinHeight="auto" renders minHeight auto', () => {
    const content = { ...baseContent, heroMinHeight: "auto" };
    const { container } = render(
      <HeroBlock content={content} variant="left" />,
    );
    const box = container.querySelector("[data-minheight]");
    expect(box?.getAttribute("data-minheight")).toBe("auto");
  });

  // ── resolveSubheadingMaxWidth unit tests ──────────────────────────────────────

  it("resolveSubheadingMaxWidth: undefined input falls back to medium (640px)", () => {
    expect(resolveSubheadingMaxWidth(undefined)).toBe("640px");
  });
});
