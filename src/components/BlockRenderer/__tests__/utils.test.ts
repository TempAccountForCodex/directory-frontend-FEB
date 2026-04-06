import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  escapeAttr,
  sanitizeUrl,
  sanitizeRichText,
} from "../utils";

describe("escapeHtml", () => {
  it('escapes & < > "', () => {
    expect(escapeHtml('a & b < c > d "e"')).toBe(
      "a &amp; b &lt; c &gt; d &quot;e&quot;",
    );
  });

  it("handles null/undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("converts numbers to string", () => {
    expect(escapeHtml(42)).toBe("42");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});

describe("escapeAttr", () => {
  it("escapes single quotes in addition to HTML chars", () => {
    expect(escapeAttr("it's")).toBe("it&#39;s");
  });

  it("escapes all special chars", () => {
    expect(escapeAttr('<a href="x\'s">')).toBe(
      "&lt;a href=&quot;x&#39;s&quot;&gt;",
    );
  });
});

describe("sanitizeUrl", () => {
  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
  });

  it("blocks JAVASCRIPT: (case-insensitive)", () => {
    expect(sanitizeUrl("JAVASCRIPT:void(0)")).toBe("#");
  });

  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("allows http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("allows relative paths", () => {
    expect(sanitizeUrl("/about")).toBe("/about");
  });

  it("returns # for empty/null/undefined", () => {
    expect(sanitizeUrl("")).toBe("#");
    expect(sanitizeUrl(null)).toBe("#");
    expect(sanitizeUrl(undefined)).toBe("#");
  });

  it("trims whitespace", () => {
    expect(sanitizeUrl("  https://example.com  ")).toBe("https://example.com");
  });
});

describe("sanitizeRichText", () => {
  it("allows safe tags (b, i, em, strong, p, br)", () => {
    expect(sanitizeRichText("<b>bold</b> <i>italic</i>")).toBe(
      "<b>bold</b> <i>italic</i>",
    );
    expect(sanitizeRichText("<p>para</p><br>")).toBe("<p>para</p><br>");
  });

  it("allows list tags", () => {
    expect(sanitizeRichText("<ul><li>item</li></ul>")).toBe(
      "<ul><li>item</li></ul>",
    );
    expect(sanitizeRichText("<ol><li>item</li></ol>")).toBe(
      "<ol><li>item</li></ol>",
    );
  });

  it("strips script tags", () => {
    expect(sanitizeRichText("<script>alert(1)</script>")).toBe("alert(1)");
  });

  it("strips div, span, img tags", () => {
    expect(sanitizeRichText("<div>text</div>")).toBe("text");
    expect(sanitizeRichText("<span>text</span>")).toBe("text");
    expect(sanitizeRichText('<img src="x">')).toBe("");
  });

  it("adds rel to anchor tags", () => {
    const result = sanitizeRichText('<a href="https://example.com">link</a>');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('href="https://example.com"');
  });

  it("handles null/undefined", () => {
    expect(sanitizeRichText(null)).toBe("");
    expect(sanitizeRichText(undefined)).toBe("");
  });
});
