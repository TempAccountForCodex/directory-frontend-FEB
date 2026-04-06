/**
 * previewInjector Global Components Tests — Step 10.2
 *
 * Tests for the global component injection in previewInjector.
 * Covers:
 *   - Backward compatibility: works without globalComponents param
 *   - Navbar injection: prepends before blocks, renders brandName/navItems/CTA, hideNavbar suppresses
 *   - Footer injection: appends after blocks, renders copyright/columns/socialLinks, hideFooter suppresses
 *   - Both: navbar before blocks, footer after
 *   - renderNavbarBlock unit tests: brandName, defaults, nav items, XSS escape, CTA, data attributes, legacy schema
 *   - renderFooterBlock unit tests: copyright, columns, social links, XSS escape, data attributes, legacy schema, logo img
 *   - XSS prevention: escapes in navbar brandName, footer copyright, graceful handling of null config
 */

import { describe, it, expect } from "vitest";
import {
  generateLivePreview,
  renderNavbarBlock,
  renderFooterBlock,
  type PreviewWebsite,
  type PreviewPage,
  type PreviewBlock,
  type GlobalComponents,
} from "../previewInjector";

// ── Factories ─────────────────────────────────────────────────────────────────

const makeWebsite = (overrides?: Partial<PreviewWebsite>): PreviewWebsite => ({
  name: "Test Site",
  theme: {},
  fonts: {},
  colors: { primary: "#378C92" },
  ...overrides,
});

const makePage = (overrides?: Partial<PreviewPage>): PreviewPage => ({
  id: "page-1",
  title: "Home",
  slug: "home",
  ...overrides,
});

const makeBlock = (overrides?: Partial<PreviewBlock>): PreviewBlock => ({
  id: "block-1",
  blockType: "TEXT",
  content: { text: "Hello world" },
  order: 0,
  ...overrides,
});

// ── Backward compatibility ────────────────────────────────────────────────────

describe("generateLivePreview backward compatibility", () => {
  it("works with 3 arguments (no parentOrigin, no globalComponents)", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Hello world");
  });

  it("works with 4 arguments (parentOrigin, no globalComponents)", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "http://localhost",
    );
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Hello world");
  });

  it("works with empty globalComponents object {}", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "http://localhost",
      {},
    );
    expect(html).toContain("Hello world");
    // No navbar/footer injected
    expect(html).not.toContain('data-global-component="navbar"');
    expect(html).not.toContain('data-global-component="footer"');
  });

  it("works with undefined globalComponents", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "http://localhost",
      undefined,
    );
    expect(html).toContain("Hello world");
  });
});

// ── Navbar injection ──────────────────────────────────────────────────────────

describe("generateLivePreview — navbar injection", () => {
  const navbar: Record<string, unknown> = {
    brandName: "Acme Corp",
    navigationItems: [
      { label: "Home", link: "/" },
      { label: "About", link: "/about" },
    ],
  };

  it("injects navbar before block content", () => {
    const gc: GlobalComponents = { navbar };
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      gc,
    );
    const navbarIdx = html.indexOf('data-global-component="navbar"');
    const blockIdx = html.indexOf("Hello world");
    expect(navbarIdx).toBeGreaterThanOrEqual(0);
    expect(navbarIdx).toBeLessThan(blockIdx);
  });

  it("renders brandName in navbar", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      { navbar },
    );
    expect(html).toContain("Acme Corp");
  });

  it("renders navigation items", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      { navbar },
    );
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/about"');
    expect(html).toContain("Home");
    expect(html).toContain("About");
  });

  it("renders CTA button when ctaText/ctaLink present", () => {
    const navbarWithCta = {
      ...navbar,
      ctaText: "Get Started",
      ctaLink: "/signup",
    };
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      {
        navbar: navbarWithCta,
      },
    );
    expect(html).toContain("Get Started");
    expect(html).toContain("/signup");
  });

  it("suppresses navbar when page.hideNavbar is true", () => {
    const gc: GlobalComponents = { navbar };
    const html = generateLivePreview(
      makeWebsite(),
      makePage({ hideNavbar: true }),
      [makeBlock()],
      "",
      gc,
    );
    expect(html).not.toContain('data-global-component="navbar"');
  });

  it("does not inject navbar when globalComponents.navbar is absent", () => {
    const gc: GlobalComponents = {};
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      gc,
    );
    expect(html).not.toContain('data-global-component="navbar"');
  });
});

// ── Footer injection ──────────────────────────────────────────────────────────

describe("generateLivePreview — footer injection", () => {
  const footer: Record<string, unknown> = {
    copyright: "© 2026 Acme Corp.",
    columns: [
      {
        title: "Company",
        links: [
          { label: "About", url: "/about" },
          { label: "Careers", url: "/careers" },
        ],
      },
    ],
    socialLinks: [{ platform: "twitter", url: "https://twitter.com/acme" }],
  };

  it("appends footer after block content", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      { footer },
    );
    const blockIdx = html.indexOf("Hello world");
    const footerIdx = html.indexOf('data-global-component="footer"');
    expect(footerIdx).toBeGreaterThanOrEqual(0);
    expect(footerIdx).toBeGreaterThan(blockIdx);
  });

  it("renders copyright text", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      { footer },
    );
    expect(html).toContain("© 2026 Acme Corp.");
  });

  it("renders column titles and links", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      { footer },
    );
    expect(html).toContain("Company");
    expect(html).toContain("About");
    expect(html).toContain("/careers");
  });

  it("renders social links", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      { footer },
    );
    expect(html).toContain("TW");
    expect(html).toContain("https://twitter.com/acme");
  });

  it("suppresses footer when page.hideFooter is true", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage({ hideFooter: true }),
      [makeBlock()],
      "",
      { footer },
    );
    expect(html).not.toContain('data-global-component="footer"');
  });

  it("does not inject footer when globalComponents.footer is absent", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      {},
    );
    expect(html).not.toContain('data-global-component="footer"');
  });
});

// ── Both navbar and footer ────────────────────────────────────────────────────

describe("generateLivePreview — both navbar and footer", () => {
  it("navbar appears before block content, footer appears after", () => {
    const gc: GlobalComponents = {
      navbar: {
        brandName: "Acme",
        navigationItems: [{ label: "Home", link: "/" }],
      },
      footer: { copyright: "© 2026 Acme." },
    };
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      gc,
    );
    const navbarIdx = html.indexOf('data-global-component="navbar"');
    const blockIdx = html.indexOf("Hello world");
    const footerIdx = html.indexOf('data-global-component="footer"');

    expect(navbarIdx).toBeGreaterThanOrEqual(0);
    expect(blockIdx).toBeGreaterThan(navbarIdx);
    expect(footerIdx).toBeGreaterThan(blockIdx);
  });
});

// ── renderNavbarBlock unit tests ──────────────────────────────────────────────

describe("renderNavbarBlock", () => {
  it("renders brandName", () => {
    const html = renderNavbarBlock({
      brandName: "My Brand",
      navigationItems: [{ label: "Home", link: "/" }],
    });
    expect(html).toContain("My Brand");
  });

  it('falls back to "My Brand" when brandName is absent', () => {
    const html = renderNavbarBlock({
      navigationItems: [{ label: "Home", link: "/" }],
    });
    expect(html).toContain("My Brand");
  });

  it("renders navigation items", () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: [
        { label: "Home", link: "/" },
        { label: "Contact", link: "/contact" },
      ],
    });
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/contact"');
    expect(html).toContain("Home");
    expect(html).toContain("Contact");
  });

  it("caps navigation items at 8", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      label: `Item ${i}`,
      link: `/i${i}`,
    }));
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: items,
    });
    // Items 8-11 should not appear
    expect(html).not.toContain("Item 8");
    expect(html).not.toContain("Item 11");
  });

  it("renders CTA when ctaText and ctaLink provided", () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: [{ label: "Home", link: "/" }],
      ctaText: "Sign Up",
      ctaLink: "/register",
    });
    expect(html).toContain("Sign Up");
    expect(html).toContain("/register");
  });

  it("does not render CTA when ctaText is absent", () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: [{ label: "Home", link: "/" }],
      ctaLink: "/register",
    });
    expect(html).not.toContain("/register");
  });

  it("escapes XSS in brandName", () => {
    const html = renderNavbarBlock({
      brandName: "<script>alert(1)</script>",
      navigationItems: [{ label: "Home", link: "/" }],
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it('has data-block-type="NAVBAR" attribute', () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: [{ label: "Home", link: "/" }],
    });
    expect(html).toContain('data-block-type="NAVBAR"');
  });

  it('has data-global-component="navbar" attribute', () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: [{ label: "Home", link: "/" }],
    });
    expect(html).toContain('data-global-component="navbar"');
  });

  it("uses legacy logo/links schema when navigationItems absent", () => {
    const html = renderNavbarBlock({
      logo: "My Legacy Brand",
      links: [
        { text: "Page1", url: "/page1" },
        { text: "Page2", url: "/page2" },
      ],
    });
    expect(html).toContain("My Legacy Brand");
    expect(html).toContain('href="/page1"');
    expect(html).toContain('href="/page2"');
  });

  it("renders sticky style when sticky is true", () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      navigationItems: [{ label: "Home", link: "/" }],
      sticky: true,
    });
    expect(html).toContain("position:sticky");
  });

  it("renders logo img when logo is an http URL", () => {
    const html = renderNavbarBlock({
      brandName: "Site",
      logo: "https://example.com/logo.png",
      navigationItems: [{ label: "Home", link: "/" }],
    });
    expect(html).toContain("<img");
    expect(html).toContain("https://example.com/logo.png");
  });
});

// ── renderFooterBlock unit tests ──────────────────────────────────────────────

describe("renderFooterBlock", () => {
  it("renders copyright", () => {
    const html = renderFooterBlock({ copyright: "© 2026 Acme Corp." });
    expect(html).toContain("© 2026 Acme Corp.");
  });

  it("renders columns with title and links", () => {
    const html = renderFooterBlock({
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
    });
    expect(html).toContain("Company");
    expect(html).toContain("About");
    expect(html).toContain('href="/careers"');
  });

  it("caps columns at 4", () => {
    const columns = Array.from({ length: 6 }, (_, i) => ({
      title: `Col${i}`,
      links: [],
    }));
    const html = renderFooterBlock({ copyright: "© 2026", columns });
    expect(html).not.toContain("Col4");
    expect(html).not.toContain("Col5");
  });

  it("caps column links at 8", () => {
    const links = Array.from({ length: 10 }, (_, i) => ({
      label: `Link${i}`,
      url: `/l${i}`,
    }));
    const html = renderFooterBlock({
      copyright: "© 2026",
      columns: [{ title: "Nav", links }],
    });
    expect(html).not.toContain("Link8");
    expect(html).not.toContain("Link9");
  });

  it("renders social links with platform labels", () => {
    const html = renderFooterBlock({
      copyright: "© 2026",
      socialLinks: [
        { platform: "facebook", url: "https://facebook.com/acme" },
        { platform: "instagram", url: "https://instagram.com/acme" },
      ],
    });
    expect(html).toContain(">FB<");
    expect(html).toContain(">IG<");
    expect(html).toContain("https://facebook.com/acme");
  });

  it("caps social links at 5", () => {
    const socialLinks = Array.from({ length: 7 }, (_, i) => ({
      platform: "twitter",
      url: `https://twitter.com/acme${i}`,
    }));
    const html = renderFooterBlock({ copyright: "© 2026", socialLinks });
    // 6th and 7th entries should not appear
    expect(html).not.toContain("acme5");
    expect(html).not.toContain("acme6");
  });

  it("escapes XSS in copyright", () => {
    const html = renderFooterBlock({ copyright: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it('has data-block-type="FOOTER" attribute', () => {
    const html = renderFooterBlock({ copyright: "© 2026" });
    expect(html).toContain('data-block-type="FOOTER"');
  });

  it('has data-global-component="footer" attribute', () => {
    const html = renderFooterBlock({ copyright: "© 2026" });
    expect(html).toContain('data-global-component="footer"');
  });

  it("renders legacy links from content.links array", () => {
    const html = renderFooterBlock({
      copyright: "© 2026",
      links: [
        { text: "Privacy", url: "/privacy" },
        { label: "Terms", url: "/terms" },
      ],
    });
    expect(html).toContain("Privacy");
    expect(html).toContain('href="/terms"');
  });

  it("renders logo img when logo is provided", () => {
    const html = renderFooterBlock({
      copyright: "© 2026",
      logo: "https://example.com/footer-logo.png",
    });
    expect(html).toContain("<img");
    expect(html).toContain("https://example.com/footer-logo.png");
  });

  it("does not render empty copyright paragraph", () => {
    const html = renderFooterBlock({ copyright: "" });
    expect(html).not.toContain('data-editable="copyright"');
  });

  it("gracefully handles null/undefined content fields", () => {
    expect(() =>
      renderFooterBlock({ copyright: "© 2026", columns: null }),
    ).not.toThrow();
    expect(() =>
      renderFooterBlock({ copyright: "© 2026", socialLinks: null }),
    ).not.toThrow();
  });
});

// ── XSS prevention integration ────────────────────────────────────────────────

describe("XSS prevention in global components", () => {
  it("escapes navbar brandName in full preview", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      {
        navbar: {
          brandName: "<img src=x onerror=alert(1)>",
          navigationItems: [{ label: "Home", link: "/" }],
        },
      },
    );
    expect(html).not.toContain("<img src=x onerror");
    expect(html).toContain("&lt;img");
  });

  it("escapes footer copyright in full preview", () => {
    const html = generateLivePreview(
      makeWebsite(),
      makePage(),
      [makeBlock()],
      "",
      {
        footer: { copyright: '<script>alert("xss")</script>' },
      },
    );
    // The footer section should contain the escaped copyright, not raw script tags
    // (The full HTML has legitimate <script> tags for postMessage handlers)
    expect(html).toContain("&lt;script&gt;alert");
    expect(html).not.toContain("<script>alert");
  });

  it("gracefully handles null navbar config without throwing", () => {
    // Pass null config — generateLivePreview catches errors gracefully
    expect(() =>
      generateLivePreview(makeWebsite(), makePage(), [makeBlock()], "", {
        navbar: null as unknown as Record<string, unknown>,
      }),
    ).not.toThrow();
  });
});
