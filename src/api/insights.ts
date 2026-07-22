import { apiClient } from "./client";
import { DIRECT_API_URL } from "../config/api";
import InsightData from "../utils/data/Insights";
import { normalizeInsight, normalizeInsights } from "../utils/insightsNormalizer";

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
  blocks?: Array<{
    id: string;
    type: "section" | "quote" | "keyTakeaway" | "conclusion" | "code";
    anchorId?: string;
    heading?: string;
    paragraphs?: string[];
    text?: string;
    attribution?: string | null;
    title?: string;
    language?: string;
    code?: string;
  }>;
  format?: {
    version: number;
    readTimeMinutes: number;
    excerpt: string;
    tags: string[];
  };
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

export const fallbackInsights = normalizeInsights(InsightData);

export const getInsightImageUrl = (imagePath?: string) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith("/assets")) return imagePath;

  const appBase = DIRECT_API_URL.replace(/\/api$/, "");
  return `${appBase.replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
};

export async function fetchPublicInsights(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  try {
    const response = await apiClient.get("/insights/public", {
      params: {
        projectKey: DIRECTORY_PROJECT_KEY,
        page: params.page || 1,
        limit: params.limit || 100,
        sortBy: params.sortBy || "publishedAt",
        sortOrder: params.sortOrder || "desc",
        ...(params.category && { category: params.category }),
        ...(params.search && { search: params.search }),
      },
    });
    const rows = Array.isArray(response.data?.insights)
      ? response.data.insights
      : Array.isArray(response.data?.blogs)
        ? response.data.blogs
        : [];
    return rows.length ? normalizeInsights(rows) : fallbackInsights;
  } catch {
    return fallbackInsights;
  }
}

export async function fetchPublicInsight(identifier: string) {
  try {
    const response = await apiClient.get(
      `/insights/public/${encodeURIComponent(identifier)}`,
      {
        params: {
          projectKey: DIRECTORY_PROJECT_KEY,
        },
      },
    );
    if (response.data?.insight) return normalizeInsight(response.data.insight);
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
