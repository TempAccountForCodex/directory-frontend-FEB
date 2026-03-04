/**
 * Template API Adapter
 *
 * Frontend now consumes templates from the backend registry.
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export type TemplateType = "website" | "store";

export type TemplateCategory =
  | "business"
  | "portfolio"
  | "agency"
  | "restaurant"
  | "real-estate"
  | "fitness"
  | "education"
  | "saas"
  | "ecommerce";

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

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  business: "Business",
  portfolio: "Portfolio",
  agency: "Agency",
  restaurant: "Restaurant",
  "real-estate": "Real Estate",
  fitness: "Fitness",
  education: "Education",
  saas: "SaaS",
  ecommerce: "E-commerce",
};

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
