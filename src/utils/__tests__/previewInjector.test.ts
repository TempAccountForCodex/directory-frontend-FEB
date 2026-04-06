/**
 * Tests for previewInjector (Step 5.1.3)
 *
 * Covers: generates valid HTML, includes design tokens as CSS vars,
 * includes responsive breakpoints, renders HERO/TEXT/CTA blocks,
 * sanitizes XSS, includes postMessage listener, handles empty blocks,
 * handles missing optional fields, IMAGE block rendering, FEATURES block.
 */
import { describe, it, expect } from "vitest";
import {
  generateLivePreview,
  escapeHtml,
  type PreviewWebsite,
  type PreviewPage,
  type PreviewBlock,
} from "../previewInjector";

/* ------------------------------------------------------------------ */
/*  Factories                                                          */
/* ------------------------------------------------------------------ */
const makeWebsite = (overrides?: Partial<PreviewWebsite>): PreviewWebsite => ({
  name: "Test Site",
  theme: {},
  fonts: { heading: "Inter", body: "Roboto" },
  colors: {
    primary: "#378C92",
    secondary: "#2A6B70",
    background: "#FFFFFF",
    text: "#111111",
  },
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

describe("previewInjector (Step 5.1.3)", () => {
  it("generates valid HTML with DOCTYPE and essential tags", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("<head>");
    expect(html).toContain('<meta charset="UTF-8"');
    expect(html).toContain('<meta name="viewport"');
    expect(html).toContain("</head>");
    expect(html).toContain("<body");
    expect(html).toContain("</body>");
    expect(html).toContain("</html>");
  });

  it("includes design tokens as CSS custom properties on :root", () => {
    const html = generateLivePreview(
      makeWebsite({ colors: { primary: "#FF0000", secondary: "#00FF00" } }),
      makePage(),
      [makeBlock()],
    );

    expect(html).toContain("--color-primary: #FF0000");
    expect(html).toContain("--color-secondary: #00FF00");
  });

  it("includes font tokens as CSS custom properties", () => {
    const html = generateLivePreview(
      makeWebsite({
        fonts: { heading: "Playfair Display", body: "Open Sans" },
      }),
      makePage(),
      [makeBlock()],
    );

    expect(html).toContain("--font-heading: Playfair Display");
    expect(html).toContain("--font-body: Open Sans");
  });

  it("includes responsive CSS breakpoints", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("@media");
    expect(html).toContain("768px");
    expect(html).toContain("375px");
  });

  it("renders HERO block with title and subtitle", () => {
    const block = makeBlock({
      blockType: "HERO",
      content: {
        title: "Welcome",
        subtitle: "To our site",
        buttonText: "Get Started",
      },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("Welcome");
    expect(html).toContain("To our site");
    expect(html).toContain("Get Started");
  });

  it("renders TEXT block with text content", () => {
    const block = makeBlock({
      blockType: "TEXT",
      content: { text: "Some paragraph text here" },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("Some paragraph text here");
  });

  it("renders CTA block with heading, description, and button", () => {
    const block = makeBlock({
      blockType: "CTA",
      content: {
        heading: "Act Now",
        description: "Limited time",
        buttonText: "Sign Up",
      },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("Act Now");
    expect(html).toContain("Limited time");
    expect(html).toContain("Sign Up");
  });

  it("renders IMAGE block with src and alt", () => {
    const block = makeBlock({
      blockType: "IMAGE",
      content: { src: "https://example.com/img.jpg", alt: "Example image" },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain('src="https://example.com/img.jpg"');
    expect(html).toContain('alt="Example image"');
  });

  it("renders FEATURES block with feature items", () => {
    const block = makeBlock({
      blockType: "FEATURES",
      content: {
        features: [
          { title: "Fast", description: "Blazing speed" },
          { title: "Secure", description: "Bank grade" },
        ],
      },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("Fast");
    expect(html).toContain("Blazing speed");
    expect(html).toContain("Secure");
    expect(html).toContain("Bank grade");
  });

  it("sanitizes XSS in user content — script tags are escaped", () => {
    const block = makeBlock({
      blockType: "TEXT",
      content: { text: '<script>alert("xss")</script>' },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    // The literal <script> should be escaped
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain("&lt;script&gt;");
  });

  it("sanitizes XSS in HERO title", () => {
    const block = makeBlock({
      blockType: "HERO",
      content: { title: "<img src=x onerror=alert(1)>", subtitle: "Safe" },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    // Angle brackets are escaped so the tag cannot be parsed as HTML
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
    expect(html).toContain("&gt;");
  });

  it("includes postMessage listener script with origin validation", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("addEventListener");
    expect(html).toContain("message");
    expect(html).toContain("CONTENT_UPDATE");
    // Origin validation must exist
    expect(html).toContain("origin");
  });

  it("handles empty blocks array gracefully", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), []);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Add blocks to see a preview");
  });

  it("handles missing optional fields gracefully", () => {
    const website: PreviewWebsite = { name: "Minimal" };
    const page: PreviewPage = { id: "p1", title: "Page" };
    const html = generateLivePreview(website, page, [makeBlock()]);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Hello world");
  });

  it("renders NAVBAR block with logo and links", () => {
    const block = makeBlock({
      blockType: "NAVBAR",
      content: {
        logo: "My Brand",
        links: [
          { text: "Home", url: "/" },
          { text: "About", url: "/about" },
        ],
      },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("My Brand");
    expect(html).toContain("Home");
    expect(html).toContain("About");
  });

  it("renders FOOTER block with links and copyright", () => {
    const block = makeBlock({
      blockType: "FOOTER",
      content: {
        copyright: "2026 TestCo",
        links: [{ text: "Privacy", url: "/privacy" }],
      },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("2026 TestCo");
    expect(html).toContain("Privacy");
  });

  it("renders CONTACT block", () => {
    const block = makeBlock({
      blockType: "CONTACT",
      content: { heading: "Get in Touch", email: "info@test.com" },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("Get in Touch");
  });

  it("escapeHtml correctly escapes all special characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml('"quotes"')).toBe("&quot;quotes&quot;");
    expect(escapeHtml("it's")).toBe("it&#39;s");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("assigns block IDs for postMessage DOM updates", () => {
    const block = makeBlock({ id: "block-42" });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain('id="block-block-42"');
  });

  it("includes CSP violation handler in generated HTML", () => {
    const html = generateLivePreview(makeWebsite(), makePage(), [makeBlock()]);

    expect(html).toContain("securitypolicyviolation");
  });

  it("includes broken image fallback handler", () => {
    const block = makeBlock({
      blockType: "IMAGE",
      content: { src: "https://example.com/broken.jpg", alt: "Broken" },
    });
    const html = generateLivePreview(makeWebsite(), makePage(), [block]);

    expect(html).toContain("onerror");
  });
});
