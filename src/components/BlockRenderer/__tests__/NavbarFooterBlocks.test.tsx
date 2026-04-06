/**
 * NavbarBlock and FooterBlock Tests — Step 10.2
 *
 * Tests for the preview-specific NavbarBlock and FooterBlock components.
 * Verifies rendering, XSS prevention, data attributes, and edge cases.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NavbarBlock from "../blocks/NavbarBlock";
import FooterBlock from "../blocks/FooterBlock";
import type { PreviewBlock } from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeNavbarBlock(content: Record<string, unknown> = {}): PreviewBlock {
  return { id: 1, blockType: "NAVBAR", content, sortOrder: 0 };
}

function makeFooterBlock(content: Record<string, unknown> = {}): PreviewBlock {
  return { id: 2, blockType: "FOOTER", content, sortOrder: 1 };
}

// ── NavbarBlock ───────────────────────────────────────────────────────────────

describe("NavbarBlock", () => {
  it("renders brandName", () => {
    render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Acme Corp",
          navigationItems: [{ label: "Home", link: "/" }],
        })}
      />,
    );
    expect(screen.getByText("Acme Corp")).toBeTruthy();
  });

  it("renders navigation links", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [
            { label: "Home", link: "/" },
            { label: "About", link: "/about" },
          ],
        })}
      />,
    );
    const links = container.querySelectorAll("a");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/about");
  });

  it("renders CTA button when ctaText and ctaLink are provided", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [{ label: "Home", link: "/" }],
          ctaText: "Get Started",
          ctaLink: "/signup",
        })}
      />,
    );
    const cta = Array.from(container.querySelectorAll("a")).find(
      (a) => a.textContent === "Get Started",
    );
    expect(cta).toBeTruthy();
    expect(cta?.getAttribute("href")).toBe("/signup");
  });

  it("renders logo img when logo is http URL", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          logo: "https://example.com/logo.png",
          navigationItems: [{ label: "Home", link: "/" }],
        })}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("https://example.com/logo.png");
  });

  it("caps nav items at 8", () => {
    const manyItems = Array.from({ length: 12 }, (_, i) => ({
      label: `Item${i}`,
      link: `/i${i}`,
    }));
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: manyItems,
        })}
      />,
    );
    // Links inside nav div (excluding any CTA link)
    const navLinks = container.querySelectorAll("a");
    expect(navLinks.length).toBeLessThanOrEqual(8);
  });

  it("uses legacy logo/links schema when navigationItems is absent", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          logo: "My Brand",
          links: [
            { text: "Page1", url: "/p1" },
            { text: "Page2", url: "/p2" },
          ],
        })}
      />,
    );
    expect(screen.getByText("My Brand")).toBeTruthy();
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/p1");
  });

  it('falls back to "My Brand" when no brandName or logo', () => {
    render(
      <NavbarBlock
        block={makeNavbarBlock({
          navigationItems: [{ label: "Home", link: "/" }],
        })}
      />,
    );
    expect(screen.getByText("My Brand")).toBeTruthy();
  });

  it("does not crash with empty content", () => {
    expect(() =>
      render(<NavbarBlock block={makeNavbarBlock({})} />),
    ).not.toThrow();
  });

  it('has data-block-type="NAVBAR" attribute', () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [{ label: "Home", link: "/" }],
        })}
      />,
    );
    const nav = container.querySelector('[data-block-type="NAVBAR"]');
    expect(nav).toBeTruthy();
  });

  it('has data-global-component="navbar" attribute', () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [{ label: "Home", link: "/" }],
        })}
      />,
    );
    const nav = container.querySelector('[data-global-component="navbar"]');
    expect(nav).toBeTruthy();
  });

  it("uses sanitizeUrl — blocks javascript: in nav link href", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [{ label: "XSS", link: "javascript:alert(1)" }],
        })}
      />,
    );
    const links = container.querySelectorAll("a");
    links.forEach((a) => {
      expect(a.getAttribute("href")).not.toContain("javascript:");
    });
  });

  it("uses sanitizeUrl — blocks javascript: in ctaLink", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [{ label: "Home", link: "/" }],
          ctaText: "Click",
          ctaLink: "javascript:void(0)",
        })}
      />,
    );
    const links = container.querySelectorAll("a");
    links.forEach((a) => {
      expect(a.getAttribute("href")).not.toContain("javascript:");
    });
  });

  it("renders sticky nav when sticky is true", () => {
    const { container } = render(
      <NavbarBlock
        block={makeNavbarBlock({
          brandName: "Site",
          navigationItems: [{ label: "Home", link: "/" }],
          sticky: true,
        })}
      />,
    );
    const nav = container.querySelector("nav");
    expect(nav?.style.position).toBe("sticky");
  });
});

// ── FooterBlock ───────────────────────────────────────────────────────────────

describe("FooterBlock", () => {
  it("renders copyright text", () => {
    render(
      <FooterBlock
        block={makeFooterBlock({ copyright: "© 2026 Acme Corp." })}
      />,
    );
    expect(screen.getByText("© 2026 Acme Corp.")).toBeTruthy();
  });

  it("renders footer columns with titles and links", () => {
    const { container } = render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          columns: [
            {
              title: "Company",
              links: [
                { label: "About", url: "/about" },
                { label: "Careers", url: "/careers" },
              ],
            },
          ],
        })}
      />,
    );
    expect(screen.getByText("Company")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/about");
  });

  it("caps columns at 4", () => {
    const manyCols = Array.from({ length: 6 }, (_, i) => ({
      title: `Col${i}`,
      links: [],
    }));
    render(
      <FooterBlock
        block={makeFooterBlock({ copyright: "© 2026", columns: manyCols })}
      />,
    );
    expect(screen.getAllByText(/Col\d/).length).toBeLessThanOrEqual(4);
  });

  it("renders social links with platform labels", () => {
    render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          socialLinks: [
            { platform: "facebook", url: "https://facebook.com/acme" },
            { platform: "twitter", url: "https://twitter.com/acme" },
          ],
        })}
      />,
    );
    expect(screen.getByText("FB")).toBeTruthy();
    expect(screen.getByText("TW")).toBeTruthy();
  });

  it("caps social links at 5", () => {
    const manySocial = Array.from({ length: 7 }, (_, i) => ({
      platform: "twitter",
      url: `https://twitter.com/acme${i}`,
    }));
    const { container } = render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          socialLinks: manySocial,
        })}
      />,
    );
    // All social links rendered as 'TW'
    const twLinks = Array.from(container.querySelectorAll("a")).filter(
      (a) => a.textContent === "TW",
    );
    expect(twLinks.length).toBeLessThanOrEqual(5);
  });

  it("renders logo img when logo is provided", () => {
    const { container } = render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          logo: "https://example.com/footer-logo.png",
        })}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe(
      "https://example.com/footer-logo.png",
    );
  });

  it("renders legacy links when columns is absent", () => {
    const { container } = render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          links: [
            { text: "Privacy", url: "/privacy" },
            { label: "Terms", url: "/terms" },
          ],
        })}
      />,
    );
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toContain("/privacy");
    expect(hrefs).toContain("/terms");
  });

  it("does not crash with empty content", () => {
    expect(() =>
      render(<FooterBlock block={makeFooterBlock({})} />),
    ).not.toThrow();
  });

  it('has data-block-type="FOOTER" attribute', () => {
    const { container } = render(
      <FooterBlock block={makeFooterBlock({ copyright: "© 2026" })} />,
    );
    const footer = container.querySelector('[data-block-type="FOOTER"]');
    expect(footer).toBeTruthy();
  });

  it('has data-global-component="footer" attribute', () => {
    const { container } = render(
      <FooterBlock block={makeFooterBlock({ copyright: "© 2026" })} />,
    );
    const footer = container.querySelector('[data-global-component="footer"]');
    expect(footer).toBeTruthy();
  });

  it("uses sanitizeUrl — blocks javascript: in column link href", () => {
    const { container } = render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          columns: [
            {
              title: "Nav",
              links: [{ label: "XSS", url: "javascript:alert(1)" }],
            },
          ],
        })}
      />,
    );
    const links = container.querySelectorAll("a");
    links.forEach((a) => {
      expect(a.getAttribute("href")).not.toContain("javascript:");
    });
  });

  it("uses sanitizeUrl — blocks javascript: in social link href", () => {
    const { container } = render(
      <FooterBlock
        block={makeFooterBlock({
          copyright: "© 2026",
          socialLinks: [{ platform: "twitter", url: "javascript:alert(1)" }],
        })}
      />,
    );
    const links = container.querySelectorAll("a");
    links.forEach((a) => {
      expect(a.getAttribute("href")).not.toContain("javascript:");
    });
  });

  it("copyright has data-editable attribute", () => {
    const { container } = render(
      <FooterBlock block={makeFooterBlock({ copyright: "© 2026 Acme." })} />,
    );
    const el = container.querySelector('[data-editable="copyright"]');
    expect(el).toBeTruthy();
  });
});
