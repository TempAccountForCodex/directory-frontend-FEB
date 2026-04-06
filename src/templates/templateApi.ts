/**
 * Template API Adapter
 *
 * Frontend now consumes templates from the backend registry.
 */

import axios from "axios";
import type { TemplateCategory } from "../constants/templateCategories";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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

// CATEGORY_LABELS is now re-exported from ../constants/templateCategories above

let cachedTemplates: TemplateSummary[] | null = null;
let cachedTemplatesPromise: Promise<TemplateSummary[]> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

const fetchTemplates = async (): Promise<TemplateSummary[]> => {
  if (
    cachedTemplates &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_TTL_MS
  ) {
    return cachedTemplates;
  }

  if (!cachedTemplatesPromise) {
    cachedTemplatesPromise = axios
      .get(`${API_URL}/templates`)
      .then((response) => response.data?.data || [])
      .then((templates) => {
        cachedTemplates = templates;
        cacheTimestamp = Date.now();
        return templates;
      })
      .finally(() => {
        cachedTemplatesPromise = null;
      });
  }

  return cachedTemplatesPromise;
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
  const response = await axios.get(`${API_URL}/templates/${id}`);
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

export const clearTemplateCache = () => {
  cachedTemplates = null;
  cacheTimestamp = null;
};

export const refreshTemplateCache = async () => {
  clearTemplateCache();
  return fetchTemplates();
};

// ===================================================================
// Step 4.14 â€” Template Preview Contract Normalization
// ===================================================================

/** Normalized preview URLs for a template */
export interface TemplatePreviewUrls {
  thumbnail: string | null;
  desktop: string | null;
  mobile: string | null;
}

/**
 * Normalize any backend template shape into TemplateSummary.
 * Handles:
 * - thumbnailUrl (registry/favorites) -> previewImage
 * - previews.thumbnail (gallery/detail) -> previewImage
 * - Missing fields get sensible defaults
 */
export function normalizeTemplateSummary(
  raw: Record<string, unknown>,
): TemplateSummary {
  // Extract preview image from whichever shape the backend provides
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
    type: (raw.type as TemplateType) || "website",
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
 * Normalizes the different shapes (screenshots object, previews object, flat fields).
 */
export function extractPreviewUrls(
  raw: Record<string, unknown>,
): TemplatePreviewUrls {
  // Shape 1: screenshots endpoint { data: { screenshots: { desktop, mobile, thumbnail } } }
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

  // Shape 2: gallery/detail { previews: { thumbnail, desktop, mobile } }
  const previews = raw.previews as Record<string, string | null> | undefined;
  if (previews) {
    return {
      thumbnail: previews.thumbnail || null,
      desktop: previews.desktop || null,
      mobile: previews.mobile || null,
    };
  }

  // Shape 3: flat fields on template record
  return {
    thumbnail: (raw.thumbnailUrl as string) || null,
    desktop: (raw.desktopPreviewUrl as string) || null,
    mobile: (raw.mobilePreviewUrl as string) || null,
  };
}
