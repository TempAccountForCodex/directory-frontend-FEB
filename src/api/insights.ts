import { apiClient } from "./client";
import { DIRECT_API_URL } from "../config/api";
import InsightData from "../utils/data/Insights";

const DIRECTORY_PROJECT_KEY = "directory";

export type InsightPost = {
  id: string | number;
  legacyId?: string;
  title: string;
  heading?: string;
  slug: string;
  category: string;
  image: string;
  content?: string;
  description?: string;
  publishedAt?: string;
  publishDate?: string;
  headings?: Array<{
    heading: string;
    description?: string[];
    subsections?: Array<{ subheading: string; content?: string[] }>;
  }>;
  author?: {
    id?: string | number;
    name?: string;
    email?: string;
    displayImage?: string;
    role?: string;
    bio?: string;
  };
  [key: string]: unknown;
};

const normalizeInsight = (item: any): InsightPost => ({
  ...item,
  id: item.id,
  legacyId: item.legacyId,
  title: item.title || item.heading || "Untitled Article",
  heading: item.heading || item.title,
  slug: item.slug || item.legacyId || item.id,
  category: item.category || "Technology",
  image: item.image || "",
  content: item.content || "",
  description: item.description || item.content || "",
  publishedAt: item.publishedAt || item.publishDate,
  publishDate: item.publishDate || item.publishedAt,
  headings: item.headings || [],
  author: item.author || { name: "Techietribe Editorial Team" },
});

export const fallbackInsights = InsightData.map(normalizeInsight);

export const getInsightImageUrl = (imagePath?: string) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith("/assets")) return imagePath;

  const appBase = DIRECT_API_URL.replace(/\/api$/, "");
  return `${appBase.replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
};

export async function fetchPublicInsights() {
  try {
    const response = await apiClient.get("/blogs/public", {
      params: {
        projectKey: DIRECTORY_PROJECT_KEY,
        page: 1,
        limit: 100,
        sortBy: "publishedAt",
        sortOrder: "desc",
      },
    });
    const rows = Array.isArray(response.data?.blogs)
      ? response.data.blogs
      : Array.isArray(response.data?.insights)
        ? response.data.insights
        : [];
    return rows.length ? rows.map(normalizeInsight) : fallbackInsights;
  } catch {
    return fallbackInsights;
  }
}

export async function fetchPublicInsight(identifier: string) {
  try {
    const response = await apiClient.get(
      `/blogs/public/${encodeURIComponent(identifier)}`,
      {
        params: {
          projectKey: DIRECTORY_PROJECT_KEY,
        },
      },
    );
    if (response.data?.blog) return normalizeInsight(response.data.blog);
  } catch {
    // fall through to local fallback
  }

  return (
    fallbackInsights.find(
      (item) =>
        item.slug === identifier ||
        item.legacyId === identifier ||
        String(item.id) === identifier,
    ) || null
  );
}
