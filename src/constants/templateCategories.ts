/**
 * Shared template category and complexity constants.
 *
 * Single source of truth consumed by:
 * - TemplateFilters (gallery)
 * - ManageTemplates (admin)
 * - templates/templateApi.ts (TemplateCategory type)
 *
 * Categories match seeded data (blog, business, creative, ecommerce, restaurant)
 * plus forward-looking values for user-created templates.
 */

export const TEMPLATE_CATEGORIES = [
  "blog",
  "business",
  "creative",
  "ecommerce",
  "restaurant",
  "portfolio",
  "agency",
  "real-estate",
  "fitness",
  "education",
  "saas",
  "landing-page",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  blog: "Blog",
  business: "Business",
  creative: "Creative",
  ecommerce: "E-commerce",
  restaurant: "Restaurant",
  portfolio: "Portfolio",
  agency: "Agency",
  "real-estate": "Real Estate",
  fitness: "Fitness",
  education: "Education",
  saas: "SaaS",
  "landing-page": "Landing Page",
};

export const TEMPLATE_COMPLEXITY_OPTIONS = [
  "standard",
  "advanced",
  "expert",
] as const;

export type TemplateComplexity = (typeof TEMPLATE_COMPLEXITY_OPTIONS)[number];
