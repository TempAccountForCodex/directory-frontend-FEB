import InsightData from "../utils/data/Insights";

export type BlogPost = {
  id: string;
  slug: string;
  legacyId?: string;
  title: string;
  heading?: string;
  category: string;
  image: string;
  description: string;
  content?: string;
  publishedAt?: string;
  publishDate?: string;
  author?: { name?: string; role?: string; bio?: string };
  authorName?: string;
  authorRole?: string;
  authorBio?: string;
  headings?: Array<{ heading: string; description?: string[] }>;
  [key: string]: unknown;
};

const BLOGS_API_URL = import.meta.env.VITE_BLOGS_API_URL as string | undefined;
const BLOGS_ASSET_URL =
  (import.meta.env.VITE_BLOGS_ASSET_URL as string | undefined) ?? BLOGS_API_URL;

const normalizeBlogPost = (item: any): BlogPost => ({
  ...item,
  id: String(item.id ?? item.slug),
  slug: String(item.slug ?? item.legacyId ?? item.id),
  legacyId: item.legacyId,
  title: item.title ?? item.heading ?? "Untitled Article",
  heading: item.heading ?? item.title,
  category: item.category ?? "Technology",
  image: item.image ?? "",
  description: item.description ?? item.content ?? "",
  content: item.content ?? item.description ?? "",
  publishedAt: item.publishedAt ?? item.publishDate,
  publishDate: item.publishDate ?? item.publishedAt,
  headings: item.headings ?? [],
});

const normalizeBlogResponse = (payload: any): BlogPost[] => {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.blogs)
        ? payload.blogs
        : Array.isArray(payload?.posts)
          ? payload.posts
          : [];

  return rows.map(normalizeBlogPost).filter((item) => item.id && item.slug);
};

export const fallbackBlogPosts: BlogPost[] =
  InsightData.map(normalizeBlogPost);

export function getBlogAssetUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/assets")) return path;
  if (!BLOGS_ASSET_URL) return path;
  return `${BLOGS_ASSET_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!BLOGS_API_URL) return fallbackBlogPosts;

  try {
    const response = await fetch(`${BLOGS_API_URL.replace(/\/+$/, "")}/blogs`);
    if (!response.ok) throw new Error("Failed to fetch blogs");

    const blogs = normalizeBlogResponse(await response.json());
    return blogs.length ? blogs : fallbackBlogPosts;
  } catch {
    return fallbackBlogPosts;
  }
}

export async function fetchBlogPost(identifier: string): Promise<BlogPost | null> {
  if (!BLOGS_API_URL) {
    return (
      fallbackBlogPosts.find(
        (item) =>
          item.slug === identifier ||
          item.legacyId === identifier ||
          item.id === identifier,
      ) ?? null
    );
  }

  try {
    const base = BLOGS_API_URL.replace(/\/+$/, "");
    const response = await fetch(`${base}/blogs/${encodeURIComponent(identifier)}`);
    if (!response.ok) throw new Error("Failed to fetch blog");

    const payload = await response.json();
    return normalizeBlogPost(payload?.data ?? payload?.blog ?? payload?.post ?? payload);
  } catch {
    return (
      fallbackBlogPosts.find(
        (item) =>
          item.slug === identifier ||
          item.legacyId === identifier ||
          item.id === identifier,
      ) ?? null
    );
  }
}
