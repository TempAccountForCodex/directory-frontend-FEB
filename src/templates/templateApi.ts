/**
 * Template API Adapter
 *
 * React Query (via src/api/queries/templates.ts) owns template caching now.
 * These helpers remain for non-React callers and as convenience wrappers;
 * the old in-memory TTL + in-flight-Promise cache was removed in Phase I.
 */

import { apiClient } from "../api/client";
import type { TemplateCategory } from "../constants/templateCategories";

export type TemplateType = "website" | "store";

// Re-export shared constants for all consumers
export {
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
  type TemplateCategory,
} from "../constants/templateCategories";
// Re-export under the legacy name consumed by TemplateFilters and other callers
export { TEMPLATE_CATEGORY_LABELS as CATEGORY_LABELS } from "../constants/templateCategories";

export interface TemplateBlock {
  type: string;
  content: Record<string, any>;
  sortOrder: number;
}

export interface TemplatePage {
  title: string;
  path: string;
  isHome: boolean;
  sortOrder: number;
  blocks: TemplateBlock[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  version: string;
  previewImage: string | null;
  defaultWebsiteConfig?: {
    primaryColor: string;
    secondaryColor: string;
    headingTextColor: string;
    bodyTextColor: string;
  } | null;
  pageCount?: number;
  blockCount?: number;
}

export interface Template extends TemplateSummary {
  defaultPages: TemplatePage[];
}

const fetchTemplates = async (): Promise<TemplateSummary[]> => {
  const response = await apiClient.get("/templates");
  return response.data?.data || [];
};

export const getWebsiteTemplates = async (): Promise<TemplateSummary[]> => {
  const templates = await fetchTemplates();
  return templates.filter((template) => template.type === "website");
};

export const getStoreTemplates = async (): Promise<TemplateSummary[]> => {
  const templates = await fetchTemplates();
  return templates.filter((template) => template.type === "store");
};

export const getTemplateById = async (
  id: string,
): Promise<Template | undefined> => {
  const response = await apiClient.get(`/templates/${id}`);
  return response.data?.data;
};

export const getAllCategories = (
  templates: TemplateSummary[],
): TemplateCategory[] => {
  const categories = new Set<TemplateCategory>();
  templates.forEach((template) => {
    categories.add(template.category);
  });
  return Array.from(categories);
};

// Backward-compat shims — React Query owns caching now. Callers should prefer
// `queryClient.invalidateQueries({ queryKey: queryKeys.templates.all() })`.
export const clearTemplateCache = (): void => undefined;
export const refreshTemplateCache = async (): Promise<TemplateSummary[]> =>
  fetchTemplates();

// ===================================================================
// Step 4.14 — Template Preview Contract Normalization
// ===================================================================

/** Normalized preview URLs for a template */
export interface TemplatePreviewUrls {
  thumbnail: string | null;
  desktop: string | null;
  mobile: string | null;
}

/**
 * Normalize any backend template shape into TemplateSummary.
 */
export function normalizeTemplateSummary(
  raw: Record<string, unknown>,
): TemplateSummary {
  const previews = raw.previews as Record<string, string | null> | undefined;
  const previewImage =
    (previews?.thumbnail as string) ||
    (raw.thumbnailUrl as string) ||
    (raw.previewImage as string) ||
    null;

  return {
    id: raw.id as string,
    name: raw.name as string,
    description: (raw.description as string) || "",
    type: (raw.category as string) === "ecommerce" ? "store" : "website",
    category: (raw.category as TemplateCategory) || "business",
    version: (raw.version as string) || "1.0.0",
    previewImage,
    pageCount: raw.pageCount as number | undefined,
    blockCount: raw.blockCount as number | undefined,
    defaultWebsiteConfig:
      raw.defaultWebsiteConfig as TemplateSummary["defaultWebsiteConfig"],
  };
}

/**
 * Extract preview URLs from any backend template response.
 */
export function extractPreviewUrls(
  raw: Record<string, unknown>,
): TemplatePreviewUrls {
  const screenshots = raw.screenshots as
    | Record<string, string | null>
    | undefined;
  if (screenshots) {
    return {
      thumbnail: screenshots.thumbnail || null,
      desktop: screenshots.desktop || null,
      mobile: screenshots.mobile || null,
    };
  }

  const previews = raw.previews as Record<string, string | null> | undefined;
  if (previews) {
    return {
      thumbnail: previews.thumbnail || null,
      desktop: previews.desktop || null,
      mobile: previews.mobile || null,
    };
  }

  return {
    thumbnail: (raw.thumbnailUrl as string) || null,
    desktop: (raw.desktopPreviewUrl as string) || null,
    mobile: (raw.mobilePreviewUrl as string) || null,
  };
}
