/**
 * Template API Adapter
 *
 * React Query (via src/api/queries/templates.ts) owns template caching now.
 * These helpers remain for non-React callers and as convenience wrappers;
 * the old in-memory TTL + in-flight-Promise cache was removed in Phase I.
 */

import { apiClient } from '../api/client';

export type TemplateType = 'website' | 'store';

export type TemplateCategory =
  | 'business'
  | 'portfolio'
  | 'agency'
  | 'restaurant'
  | 'real-estate'
  | 'fitness'
  | 'education'
  | 'saas'
  | 'ecommerce';

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
  business: 'Business',
  portfolio: 'Portfolio',
  agency: 'Agency',
  restaurant: 'Restaurant',
  'real-estate': 'Real Estate',
  fitness: 'Fitness',
  education: 'Education',
  saas: 'SaaS',
  ecommerce: 'E-commerce',
};

const fetchTemplates = async (): Promise<TemplateSummary[]> => {
  const response = await apiClient.get('/templates');
  return response.data?.data || [];
};

export const getWebsiteTemplates = async (): Promise<TemplateSummary[]> => {
  const templates = await fetchTemplates();
  return templates.filter((template) => template.type === 'website');
};

export const getStoreTemplates = async (): Promise<TemplateSummary[]> => {
  const templates = await fetchTemplates();
  return templates.filter((template) => template.type === 'store');
};

export const getTemplateById = async (id: string): Promise<Template | undefined> => {
  const response = await apiClient.get(`/templates/${id}`);
  return response.data?.data;
};

export const getAllCategories = (templates: TemplateSummary[]): TemplateCategory[] => {
  const categories = new Set<TemplateCategory>();
  templates.forEach((template) => {
    categories.add(template.category);
  });
  return Array.from(categories);
};

// Backward-compat shims — React Query owns caching now. Callers should prefer
// `queryClient.invalidateQueries({ queryKey: queryKeys.templates.all() })`.
export const clearTemplateCache = (): void => undefined;
export const refreshTemplateCache = async (): Promise<TemplateSummary[]> => fetchTemplates();
