/**
 * Tests for FooterBlock (Step 10.6)
 *
 * Covers:
 *  1.  Renders without crashing with minimal content
 *  2.  Renders simple variant with copyright
 *  3.  Renders multi-column variant with columns
 *  4.  Renders centered variant with inline links
 *  5.  Defaults to multi-column when no variant specified
 *  6.  Renders logo when provided
 *  7.  Does not render logo when not provided
 *  8.  Renders Facebook social icon
 *  9.  Renders Twitter/X social icon
 *  10. Renders Instagram social icon
 *  11. Renders LinkedIn social icon
 *  12. Renders YouTube social icon
 *  13. Social links have target="_blank"
 *  14. Social links have rel="noopener noreferrer"
 *  15. Newsletter section renders when showNewsletter=true
 *  16. Newsletter section hidden when showNewsletter=false
 *  17. Newsletter heading renders
 *  18. Newsletter placeholder renders on input
 *  19. Multi-column renders column titles
 *  20. Centered variant flattens links from all columns inline
 *  21. React.memo applied (displayName present)
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import FooterBlock from "../FooterBlock";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockWrapper", () => ({
  BlockWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultContent = {
  copyright: "© 2026 Acme Corp. All rights reserved.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "About", url: "/about" },
        { label: "Contact", url: "/contact" },
      ],
    },
    {
      title: "Product",
      links: [
        { label: "Features", url: "/features" },
        { label: "Pricing", url: "/pricing" },
      ],
    },
  ],
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com/acme" },
    { platform: "twitter", url: "https://twitter.com/acme" },
    { platform: "instagram", url: "https://instagram.com/acme" },
    { platform: "linkedin", url: "https://linkedin.com/company/acme" },
    { platform: "youtube", url: "https://youtube.com/acme" },
  ],
};

const renderBlock = (contentOverrides: Record<string, unknown> = {}) =>
  render(<FooterBlock content={{ ...defaultContent, ...contentOverrides }} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FooterBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1
  it("renders without crashing with minimal content", () => {
    render(<FooterBlock content={{ copyright: "© 2026" }} />);
    expect(document.body).toBeTruthy();
  });

  // 2
  it("renders simple variant with copyright", () => {
    renderBlock({ variant: "simple" });
    expect(
      screen.getByText("© 2026 Acme Corp. All rights reserved."),
    ).toBeInTheDocument();
  });

  // 3
  it("renders multi-column variant with column titles", () => {
    renderBlock({ variant: "multi-column" });
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
  });

  // 4
  it("renders centered variant", () => {
    renderBlock({ variant: "centered" });
    // Centered copyright still renders
    expect(
      screen.getByText("© 2026 Acme Corp. All rights reserved."),
    ).toBeInTheDocument();
  });

  // 5
  it("defaults to multi-column when no variant specified", () => {
    renderBlock({});
    // Column titles only appear in multi-column
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  // 6
  it("renders logo when provided", () => {
    renderBlock({ logo: "https://example.com/logo.png" });
    const logos = screen.getAllByTestId("footer-logo");
    expect(logos.length).toBeGreaterThan(0);
    expect(logos[0]).toHaveAttribute("src", "https://example.com/logo.png");
  });

  // 7
  it("does not render logo when not provided", () => {
    renderBlock({ logo: undefined });
    expect(screen.queryByTestId("footer-logo")).not.toBeInTheDocument();
  });

  // 8
  it("renders Facebook social icon link", () => {
    renderBlock();
    expect(screen.getByRole("link", { name: /facebook/i })).toBeInTheDocument();
  });

  // 9
  it("renders Twitter/X social icon link", () => {
    renderBlock();
    expect(
      screen.getByRole("link", { name: /twitter|x/i }),
    ).toBeInTheDocument();
  });

  // 10
  it("renders Instagram social icon link", () => {
    renderBlock();
    expect(
      screen.getByRole("link", { name: /instagram/i }),
    ).toBeInTheDocument();
  });

  // 11
  it("renders LinkedIn social icon link", () => {
    renderBlock();
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });

  // 12
  it("renders YouTube social icon link", () => {
    renderBlock();
    expect(screen.getByRole("link", { name: /youtube/i })).toBeInTheDocument();
  });

  // 13
  it('social links have target="_blank"', () => {
    renderBlock();
    const fbLink = screen.getByRole("link", { name: /facebook/i });
    expect(fbLink).toHaveAttribute("target", "_blank");
  });

  // 14
  it('social links have rel="noopener noreferrer"', () => {
    renderBlock();
    const fbLink = screen.getByRole("link", { name: /facebook/i });
    expect(fbLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  // 15
  it("newsletter section renders when showNewsletter=true", () => {
    renderBlock({
      showNewsletter: true,
      newsletterHeading: "Stay in the loop",
    });
    expect(screen.getAllByText("Stay in the loop").length).toBeGreaterThan(0);
  });

  // 16
  it("newsletter section hidden when showNewsletter=false", () => {
    renderBlock({
      showNewsletter: false,
      newsletterHeading: "Stay in the loop",
    });
    expect(screen.queryByText("Stay in the loop")).not.toBeInTheDocument();
  });

  // 17
  it("newsletter heading renders when showNewsletter=true", () => {
    renderBlock({ showNewsletter: true, newsletterHeading: "Get the news" });
    expect(screen.getByText("Get the news")).toBeInTheDocument();
  });

  // 18
  it("newsletter email input renders with placeholder", () => {
    renderBlock({
      showNewsletter: true,
      newsletterPlaceholder: "your@email.com",
    });
    const input = document.querySelector('input[type="email"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "your@email.com");
  });

  // 19
  it("multi-column variant renders column link labels", () => {
    renderBlock({ variant: "multi-column" });
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
  });

  // 20
  it("centered variant flattens links from all columns inline", () => {
    renderBlock({
      variant: "centered",
      columns: [
        { title: "A", links: [{ label: "Link1", url: "/1" }] },
        { title: "B", links: [{ label: "Link2", url: "/2" }] },
      ],
    });
    expect(screen.getByText("Link1")).toBeInTheDocument();
    expect(screen.getByText("Link2")).toBeInTheDocument();
  });

  // 21
  it("is wrapped with React.memo (displayName present)", () => {
    expect(FooterBlock).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sym = (FooterBlock as any).$$typeof;
    expect(sym).toBeDefined();
    expect(sym.toString()).toContain("memo");
  });
});
