/**
 * Static documentation seed content.
 *
 * V1 docs ship as Markdown files compiled into the frontend. This module is the
 * single source of truth for that content: it pairs raw `.md` article bodies
 * (loaded via Vite's glob import) with structured metadata, and exposes
 * accessor functions whose return shapes match what the public docs pages and
 * `DocSearch` already expect from the backend `/api/docs/*` endpoints.
 *
 * Audience: the docs are written for the people who USE the platform to create
 * websites and directory listings — not for developers maintaining the codebase.
 * Keep articles task-oriented and free of code/API internals.
 *
 * The pages call the live API first and fall back to these accessors only when
 * the request fails (e.g. no backend running in local dev), so the docs site is
 * always reachable and populated.
 */

// ---------------------------------------------------------------------------
// Raw markdown bodies — one file per article, filename === slug
// ---------------------------------------------------------------------------

const rawArticles = import.meta.glob("./articles/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

/** Map "./articles/my-slug.md" -> "my-slug" */
function slugFromPath(path: string): string {
  return path.replace(/^.*\//, "").replace(/\.md$/, "");
}

const CONTENT_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(rawArticles).map(([path, body]) => [slugFromPath(path), body]),
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocRole = "business";

export interface DocsSectionSeed {
  slug: string;
  title: string;
  description: string;
}

export interface DocArticleMeta {
  title: string;
  description: string;
  category: string;
  section: string;
  tags: string[];
  roleAudience: DocRole[];
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Manual sidebar/list ordering within a category. Lower comes first. */
  order: number;
  updatedAt: string;
  relatedSlugs?: string[];
}

export interface SeedSection {
  slug: string;
  title: string;
  description: string;
  articleCount: number;
}

export interface SeedArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  section: string;
  content: string;
  views: number;
  updatedAt: string;
  tags: string[];
  roleAudience: DocRole[];
  difficulty: "beginner" | "intermediate" | "advanced";
  relatedSlugs: string[];
  isPublished: boolean;
}

export interface SeedSearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
}

// ---------------------------------------------------------------------------
// Sections (top-level categories shown in the sidebar and on the home page)
// ---------------------------------------------------------------------------

export const DOCS_SECTIONS: DocsSectionSeed[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "New here? Create an account, build a site, and go live.",
  },
  {
    slug: "guides",
    title: "Guides",
    description:
      "Build websites and manage listings, favorites, and reviews.",
  },
  {
    slug: "customization",
    title: "Customization",
    description: "Make it yours — themes, media, and your own domain.",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Fix common issues with listings, uploads, and reviews.",
  },
  {
    slug: "changelog",
    title: "What's New",
    description: "Recent updates to the platform and these docs.",
  },
];

// ---------------------------------------------------------------------------
// Article metadata — keyed by slug (which matches the .md filename)
// ---------------------------------------------------------------------------

const UPDATED = "2026-06-22T00:00:00.000Z";

export const DOC_META: Record<string, DocArticleMeta> = {
  // --- Getting Started ---------------------------------------------------
  "what-is-techietribe-directory": {
    title: "What is Techietribe Directory?",
    description:
      "A quick tour of what you can create: websites and directory listings.",
    category: "getting-started",
    section: "Overview",
    tags: ["overview", "basics"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1,
    updatedAt: UPDATED,
    relatedSlugs: ["create-your-first-website", "publish-your-first-listing"],
  },
  "create-your-first-website": {
    title: "Create your first website",
    description: "Pick a template, customize it, and publish your own site.",
    category: "getting-started",
    section: "Quickstart",
    tags: ["websites", "quickstart"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 2,
    updatedAt: UPDATED,
    relatedSlugs: ["website-builder", "themes"],
  },
  "publish-your-first-listing": {
    title: "Publish your first directory listing",
    description: "Create a listing, complete the required fields, and go live.",
    category: "getting-started",
    section: "Quickstart",
    tags: ["listings", "quickstart"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 3,
    updatedAt: UPDATED,
    relatedSlugs: ["directory-listings", "listing-completeness"],
  },
  "dashboard-overview": {
    title: "Find your way around the dashboard",
    description: "Where to manage your websites, listings, media, and reviews.",
    category: "getting-started",
    section: "Overview",
    tags: ["dashboard", "basics"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 4,
    updatedAt: UPDATED,
    relatedSlugs: ["create-your-first-website", "publish-your-first-listing"],
  },
  "understand-plans-and-visibility": {
    title: "Understand plans and visibility",
    description: "What your plan unlocks and what visitors can see publicly.",
    category: "getting-started",
    section: "Concepts",
    tags: ["plans", "billing", "visibility"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 5,
    updatedAt: UPDATED,
    relatedSlugs: ["why-a-listing-may-not-show"],
  },
  "launch-checklist": {
    title: "Launch checklist",
    description: "Everything to check before you announce your site or listing.",
    category: "getting-started",
    section: "Quickstart",
    tags: ["checklist", "launch"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 6,
    updatedAt: UPDATED,
    relatedSlugs: ["publish-your-first-listing", "create-your-first-website"],
  },

  // --- Guides ------------------------------------------------------------
  "website-builder": {
    title: "Build and edit your website",
    description:
      "Add and arrange sections in the editor, edit content, preview, and publish.",
    category: "guides",
    section: "Websites",
    tags: ["websites", "builder", "editor"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1,
    updatedAt: UPDATED,
    relatedSlugs: ["manage-your-website", "website-media-library", "themes"],
  },
  "manage-your-website": {
    title: "Manage your website",
    description:
      "The website workspace: Overview, Pages, Design, Media, Domain, SEO, and more.",
    category: "guides",
    section: "Websites",
    tags: ["websites", "dashboard", "settings"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1.3,
    updatedAt: UPDATED,
    relatedSlugs: ["website-builder", "website-media-library", "custom-domain"],
  },
  "website-media-library": {
    title: "Website media library",
    description:
      "Upload images, reuse them across pages, copy URLs, and see where each is used.",
    category: "guides",
    section: "Websites",
    tags: ["websites", "media", "images"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1.6,
    updatedAt: UPDATED,
    relatedSlugs: ["images-and-media", "manage-your-website", "upload-fails"],
  },
  templates: {
    title: "Use a template",
    description: "Start from a ready-made design and make it your own.",
    category: "guides",
    section: "Websites",
    tags: ["templates", "websites"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 2,
    updatedAt: UPDATED,
    relatedSlugs: ["create-your-first-website", "themes"],
  },
  "directory-listings": {
    title: "Directory listing lifecycle",
    description:
      "The stages a listing moves through: draft, needs completion, published, archived.",
    category: "guides",
    section: "Directory Listings",
    tags: ["listings", "lifecycle"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 3,
    updatedAt: UPDATED,
    relatedSlugs: ["listing-completeness", "publish-archive-republish"],
  },
  "listing-completeness": {
    title: "Listing completeness requirements",
    description: "Which fields a listing needs before you can publish it.",
    category: "guides",
    section: "Directory Listings",
    tags: ["listings", "completeness"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 4,
    updatedAt: UPDATED,
    relatedSlugs: ["completeness-fields-missing", "directory-listings"],
  },
  "edit-listing-fields": {
    title: "Edit your listing details",
    description:
      "Update your business name, rich description, category, location, contact info, image, and tags.",
    category: "guides",
    section: "Directory Listings",
    tags: ["listings", "editing"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 5,
    updatedAt: UPDATED,
    relatedSlugs: ["add-listing-media", "listing-completeness"],
  },
  "add-listing-media": {
    title: "Add listing images and media",
    description:
      "Choose the card image and add limited inline media inside the listing description.",
    category: "guides",
    section: "Directory Listings",
    tags: ["listings", "media", "photos"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 6,
    updatedAt: UPDATED,
    relatedSlugs: ["images-and-media", "upload-fails"],
  },
  "publish-archive-republish": {
    title: "Publish, unpublish, archive, republish",
    description: "Control whether your listing is visible to the public.",
    category: "guides",
    section: "Directory Listings",
    tags: ["listings", "publishing"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 7,
    updatedAt: UPDATED,
    relatedSlugs: ["directory-listings", "published-listing-not-visible"],
  },
  favorites: {
    title: "How favorites work",
    description: "How visitors save your listing, and how favorites are kept.",
    category: "guides",
    section: "Favorites",
    tags: ["favorites"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 8,
    updatedAt: UPDATED,
    relatedSlugs: ["publish-archive-republish"],
  },
  "reviews-and-replies": {
    title: "Reviews and replies",
    description: "How visitors leave reviews and how you reply to them.",
    category: "guides",
    section: "Reviews",
    tags: ["reviews", "replies"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 9,
    updatedAt: UPDATED,
    relatedSlugs: ["content-moderation", "review-submit-redirects-to-login"],
  },
  stores: {
    title: "Set up a store",
    description: "Store setup is coming soon and is not available yet.",
    category: "guides",
    section: "Stores",
    tags: ["stores", "commerce"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 10,
    updatedAt: UPDATED,
    relatedSlugs: ["website-builder", "images-and-media"],
  },
  "content-moderation": {
    title: "Content rules and moderation",
    description: "What content is allowed and how moderation works.",
    category: "guides",
    section: "Content Moderation",
    tags: ["moderation", "policy"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 11,
    updatedAt: UPDATED,
    relatedSlugs: ["content-rejected-by-moderation", "reviews-and-replies"],
  },

  // --- Customization -----------------------------------------------------
  themes: {
    title: "Themes and branding",
    description: "Set colors and fonts so your site matches your brand.",
    category: "customization",
    section: "Themes",
    tags: ["themes", "branding"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1,
    updatedAt: UPDATED,
    relatedSlugs: ["create-your-first-website", "images-and-media"],
  },
  "images-and-media": {
    title: "Images and media",
    description: "Supported formats, sizing tips, and where media appears.",
    category: "customization",
    section: "Images and Media",
    tags: ["media", "images"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 2,
    updatedAt: UPDATED,
    relatedSlugs: ["add-listing-media", "upload-fails"],
  },
  "custom-domain": {
    title: "Use your own domain",
    description: "Connect a custom domain to your published website.",
    category: "customization",
    section: "Domains",
    tags: ["domains", "websites"],
    roleAudience: ["business"],
    difficulty: "intermediate",
    order: 3,
    updatedAt: UPDATED,
    relatedSlugs: ["create-your-first-website", "understand-plans-and-visibility"],
  },

  // --- Troubleshooting ---------------------------------------------------
  "published-listing-not-visible": {
    title: "My listing is published but not showing",
    description: "What to check when a published listing isn't in the directory.",
    category: "troubleshooting",
    section: "Listings",
    tags: ["listings", "publishing"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1,
    updatedAt: UPDATED,
    relatedSlugs: ["publish-archive-republish", "why-a-listing-may-not-show"],
  },
  "why-a-listing-may-not-show": {
    title: "Why a listing may not show publicly",
    description: "Every reason a listing might be hidden from the directory.",
    category: "troubleshooting",
    section: "Listings",
    tags: ["listings", "visibility"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 2,
    updatedAt: UPDATED,
    relatedSlugs: ["published-listing-not-visible", "understand-plans-and-visibility"],
  },
  "completeness-fields-missing": {
    title: "It says a field is missing, but I filled it in",
    description: "Resolve completeness errors that block publishing.",
    category: "troubleshooting",
    section: "Publishing",
    tags: ["listings", "completeness"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 3,
    updatedAt: UPDATED,
    relatedSlugs: ["listing-completeness"],
  },
  "upload-fails": {
    title: "My photo upload fails",
    description: "Fix failed image and media uploads.",
    category: "troubleshooting",
    section: "Uploads",
    tags: ["uploads", "media"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 4,
    updatedAt: UPDATED,
    relatedSlugs: ["images-and-media", "add-listing-media"],
  },
  "review-submit-redirects-to-login": {
    title: "Submitting a review sends me to login",
    description: "Why a review submit asks you to log in first.",
    category: "troubleshooting",
    section: "Reviews",
    tags: ["reviews", "login"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 5,
    updatedAt: UPDATED,
    relatedSlugs: ["reviews-and-replies"],
  },
  "content-rejected-by-moderation": {
    title: "My content was rejected",
    description: "Understand why content was rejected and how to resubmit it.",
    category: "troubleshooting",
    section: "Moderation",
    tags: ["moderation"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 6,
    updatedAt: UPDATED,
    relatedSlugs: ["content-moderation"],
  },

  // --- What's New --------------------------------------------------------
  changelog: {
    title: "What's new",
    description: "Recent updates to the platform and these docs.",
    category: "changelog",
    section: "Changelog",
    tags: ["changelog"],
    roleAudience: ["business"],
    difficulty: "beginner",
    order: 1,
    updatedAt: UPDATED,
  },
};

// ---------------------------------------------------------------------------
// Assemble the full article list from metadata + raw markdown bodies
// ---------------------------------------------------------------------------

function buildArticles(): SeedArticle[] {
  return Object.entries(DOC_META)
    .filter(([slug]) => CONTENT_BY_SLUG[slug] !== undefined)
    .map(([slug, meta]) => ({
      id: slug,
      title: meta.title,
      slug,
      description: meta.description,
      category: meta.category,
      section: meta.section,
      content: CONTENT_BY_SLUG[slug],
      views: 0,
      updatedAt: meta.updatedAt,
      tags: meta.tags,
      roleAudience: meta.roleAudience,
      difficulty: meta.difficulty,
      relatedSlugs: meta.relatedSlugs ?? [],
      isPublished: true,
    }))
    .sort((a, b) => {
      const oa = DOC_META[a.slug]?.order ?? 999;
      const ob = DOC_META[b.slug]?.order ?? 999;
      return oa - ob;
    });
}

export const SEED_ARTICLES: SeedArticle[] = buildArticles();

// ---------------------------------------------------------------------------
// Accessors — return shapes mirror the backend `/api/docs/*` responses so the
// public pages can use these as a drop-in fallback.
// ---------------------------------------------------------------------------

/** Mirrors `GET /api/docs/sections`. Article counts are computed from seed. */
export function getSeedSections(): SeedSection[] {
  return DOCS_SECTIONS.map((section) => ({
    ...section,
    articleCount: SEED_ARTICLES.filter((a) => a.category === section.slug).length,
  }));
}

/** Mirrors `GET /api/docs?category=&page=&limit=`. */
export function getSeedArticlesByCategory(
  category: string,
  page = 1,
  limit = 10,
): {
  articles: SeedArticle[];
  total: number;
  page: number;
  totalPages: number;
} {
  const all = SEED_ARTICLES.filter((a) => a.category === category);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    articles: all.slice(start, start + limit),
    total,
    page,
    totalPages,
  };
}

/** Mirrors `GET /api/docs/:slug`. Returns null when the slug is unknown. */
export function getSeedArticle(slug: string): SeedArticle | null {
  return SEED_ARTICLES.find((a) => a.slug === slug) ?? null;
}

/** Look up several articles by slug, preserving the requested order. */
export function getSeedArticlesBySlugs(slugs: string[]): SeedArticle[] {
  return slugs
    .map((slug) => getSeedArticle(slug))
    .filter((a): a is SeedArticle => a !== null);
}

/** Mirrors `GET /api/docs/search?q=`. Matches title, description, tags, body. */
export function searchSeedArticles(query: string, limit = 8): SeedSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = SEED_ARTICLES.map((article) => {
    const haystackTitle = article.title.toLowerCase();
    const haystackDesc = article.description.toLowerCase();
    const haystackTags = article.tags.join(" ").toLowerCase();
    const haystackBody = article.content.toLowerCase();

    let score = 0;
    if (haystackTitle.includes(q)) score += 10;
    if (haystackDesc.includes(q)) score += 5;
    if (haystackTags.includes(q)) score += 4;
    if (haystackBody.includes(q)) score += 1;

    return { article, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ article }) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    excerpt: article.description,
  }));
}

/** Human-readable label for a category slug (used in breadcrumbs/chips). */
export function getCategoryLabel(slug: string): string {
  return DOCS_SECTIONS.find((s) => s.slug === slug)?.title ?? slug;
}
