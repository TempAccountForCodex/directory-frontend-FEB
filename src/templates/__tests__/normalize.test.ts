/**
 * Tests for normalizeTemplateSummary & extractPreviewUrls — Step 4.14
 *
 * Validates centralized template data normalization:
 * - normalizeTemplateSummary: handles thumbnailUrl, previews.thumbnail, and previewImage fields
 * - extractPreviewUrls: handles screenshots, previews, and flat field shapes
 */
import { describe, it, expect } from "vitest";
import { normalizeTemplateSummary, extractPreviewUrls } from "../templateApi";

describe("normalizeTemplateSummary", () => {
  it("maps thumbnailUrl to previewImage", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-1",
      name: "Test Template",
      description: "A template",
      type: "website",
      category: "business",
      version: "1.0.0",
      thumbnailUrl: "/template-previews/tpl-1-thumb-abc.png",
    });

    expect(result.previewImage).toBe("/template-previews/tpl-1-thumb-abc.png");
    expect(result.id).toBe("tpl-1");
    expect(result.name).toBe("Test Template");
  });

  it("maps previews.thumbnail to previewImage", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-2",
      name: "Gallery Template",
      description: "",
      type: "website",
      category: "portfolio",
      version: "2.0.0",
      previews: {
        thumbnail: "https://cdn.example.com/thumb.png",
        desktop: "https://cdn.example.com/desktop.png",
        mobile: null,
      },
    });

    expect(result.previewImage).toBe("https://cdn.example.com/thumb.png");
  });

  it("uses previewImage field directly when available", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-3",
      name: "Direct",
      previewImage: "https://example.com/direct.png",
    });

    expect(result.previewImage).toBe("https://example.com/direct.png");
  });

  it("defaults previewImage to null when no preview fields exist", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-4",
      name: "No Preview",
    });

    expect(result.previewImage).toBeNull();
  });

  it("prioritizes previews.thumbnail over thumbnailUrl", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-5",
      name: "Priority Test",
      previews: { thumbnail: "/new-thumb.png", desktop: null, mobile: null },
      thumbnailUrl: "/old-thumb.png",
    });

    expect(result.previewImage).toBe("/new-thumb.png");
  });

  it("provides sensible defaults for missing fields", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-6",
      name: "Minimal",
    });

    expect(result.description).toBe("");
    expect(result.type).toBe("website");
    expect(result.category).toBe("business");
    expect(result.version).toBe("1.0.0");
    expect(result.pageCount).toBeUndefined();
    expect(result.blockCount).toBeUndefined();
  });

  it("preserves pageCount and blockCount when provided", () => {
    const result = normalizeTemplateSummary({
      id: "tpl-7",
      name: "Counts",
      pageCount: 5,
      blockCount: 20,
    });

    expect(result.pageCount).toBe(5);
    expect(result.blockCount).toBe(20);
  });

  it("preserves defaultWebsiteConfig when provided", () => {
    const config = {
      primaryColor: "#378C92",
      secondaryColor: "#2A6F74",
      headingTextColor: "#1a1a1a",
      bodyTextColor: "#444",
    };
    const result = normalizeTemplateSummary({
      id: "tpl-8",
      name: "Config",
      defaultWebsiteConfig: config,
    });

    expect(result.defaultWebsiteConfig).toEqual(config);
  });
});

describe("extractPreviewUrls", () => {
  it("extracts from screenshots shape", () => {
    const result = extractPreviewUrls({
      screenshots: {
        desktop: "/previews/desktop.png",
        mobile: "/previews/mobile.png",
        thumbnail: "/previews/thumb.png",
      },
    });

    expect(result.desktop).toBe("/previews/desktop.png");
    expect(result.mobile).toBe("/previews/mobile.png");
    expect(result.thumbnail).toBe("/previews/thumb.png");
  });

  it("extracts from previews shape", () => {
    const result = extractPreviewUrls({
      previews: {
        desktop: "https://cdn.example.com/desktop.png",
        mobile: "https://cdn.example.com/mobile.png",
        thumbnail: "https://cdn.example.com/thumb.png",
      },
    });

    expect(result.desktop).toBe("https://cdn.example.com/desktop.png");
    expect(result.mobile).toBe("https://cdn.example.com/mobile.png");
    expect(result.thumbnail).toBe("https://cdn.example.com/thumb.png");
  });

  it("extracts from flat fields shape", () => {
    const result = extractPreviewUrls({
      thumbnailUrl: "/template-previews/thumb.png",
      desktopPreviewUrl: "/template-previews/desktop.png",
      mobilePreviewUrl: "/template-previews/mobile.png",
    });

    expect(result.thumbnail).toBe("/template-previews/thumb.png");
    expect(result.desktop).toBe("/template-previews/desktop.png");
    expect(result.mobile).toBe("/template-previews/mobile.png");
  });

  it("returns nulls when no preview data exists", () => {
    const result = extractPreviewUrls({});

    expect(result.thumbnail).toBeNull();
    expect(result.desktop).toBeNull();
    expect(result.mobile).toBeNull();
  });

  it("handles null values in screenshots", () => {
    const result = extractPreviewUrls({
      screenshots: {
        desktop: null,
        mobile: "/previews/mobile.png",
        thumbnail: null,
      },
    });

    expect(result.desktop).toBeNull();
    expect(result.mobile).toBe("/previews/mobile.png");
    expect(result.thumbnail).toBeNull();
  });

  it("prioritizes screenshots shape over previews shape", () => {
    const result = extractPreviewUrls({
      screenshots: {
        desktop: "/screenshots/desktop.png",
        mobile: null,
        thumbnail: null,
      },
      previews: {
        desktop: "/previews/desktop.png",
        mobile: "/previews/mobile.png",
        thumbnail: "/previews/thumb.png",
      },
    });

    // screenshots shape should be used, not previews
    expect(result.desktop).toBe("/screenshots/desktop.png");
    expect(result.mobile).toBeNull();
  });
});
