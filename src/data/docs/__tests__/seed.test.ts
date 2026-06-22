/**
 * Tests for the static documentation seed.
 *
 * These guard the content inventory and the accessor shapes that the public
 * docs pages fall back to when no backend is reachable.
 */

import { describe, it, expect } from "vitest";
import {
  DOCS_SECTIONS,
  SEED_ARTICLES,
  getSeedSections,
  getSeedArticlesByCategory,
  getSeedArticle,
  searchSeedArticles,
  getCategoryLabel,
} from "../index";

describe("docs seed content", () => {
  it("ships at least 25 published V1 articles", () => {
    // Keep the initial help center broad enough to cover core product flows.
    expect(SEED_ARTICLES.length).toBeGreaterThanOrEqual(25);
    expect(SEED_ARTICLES.every((a) => a.isPublished)).toBe(true);
  });

  it("gives every article non-empty markdown content and a description", () => {
    for (const article of SEED_ARTICLES) {
      expect(article.content.trim().length).toBeGreaterThan(0);
      expect(article.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("only uses categories that exist in the section list", () => {
    const sectionSlugs = new Set(DOCS_SECTIONS.map((s) => s.slug));
    for (const article of SEED_ARTICLES) {
      expect(sectionSlugs.has(article.category)).toBe(true);
    }
  });

  it("computes article counts per section", () => {
    const sections = getSeedSections();
    const totalFromSections = sections.reduce(
      (sum, s) => sum + s.articleCount,
      0,
    );
    expect(totalFromSections).toBe(SEED_ARTICLES.length);
  });

  it("paginates articles by category", () => {
    const page = getSeedArticlesByCategory("getting-started", 1, 10);
    expect(page.articles.length).toBeGreaterThan(0);
    expect(page.articles.every((a) => a.category === "getting-started")).toBe(
      true,
    );
    expect(page.total).toBe(page.articles.length);
  });

  it("looks up an article by slug and returns null for unknown slugs", () => {
    const known = SEED_ARTICLES[0].slug;
    expect(getSeedArticle(known)?.slug).toBe(known);
    expect(getSeedArticle("definitely-not-a-real-slug")).toBeNull();
  });

  it("searches title, description, tags, and body", () => {
    const results = searchSeedArticles("listing");
    expect(results.length).toBeGreaterThan(0);
    // Title/description match should rank a listing-focused article first.
    expect(results[0].slug).toContain("listing");
    expect(searchSeedArticles("")).toHaveLength(0);
  });

  it("maps category slugs to human labels", () => {
    expect(getCategoryLabel("getting-started")).toBe("Getting Started");
    expect(getCategoryLabel("unknown-slug")).toBe("unknown-slug");
  });
});
