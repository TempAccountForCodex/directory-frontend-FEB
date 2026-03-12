import { lazy } from "react";
import { TemplateDefinition } from "./types";

// Service templates
const ModernTemplate = lazy(() => import("../templates/modern/ModernTemplate"));
const MinimalTemplate = lazy(() => import("../templates/minimal/MinimalTemplate"));
const PremiumTemplate = lazy(() => import("../templates/premium/PremiumTemplate"));

// Blog
const BlogTemplate = lazy(() => import("../templates/blog/BlogTemplate"));
const PremiumBlogTemplate = lazy(() => import("../templates/blog/PremiumBlogTemplate"));

// Portfolio
const PortfolioCreativeTemplate = lazy(() => import("../templates/portfolio/PortfolioCreativeTemplate"));
const PortfolioAgencyTemplate = lazy(() => import("../templates/portfolio/PortfolioAgencyTemplate"));

// Store
const StoreGridTemplate = lazy(() => import("../templates/store/StoreGridTemplate"));
const StoreCatalogTemplate = lazy(() => import("../templates/store/StoreCatalogTemplate"));

// Company / Product site
const CompanySiteTemplate = lazy(() => import("../templates/company/CompanySiteTemplate"));

const templateRegistry: Record<string, TemplateDefinition> = {
  // --- Service business ---
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean, professional design with full-bleed photo hero and card-based layout.",
    tags: ["service", "professional", "colorful"],
    component: ModernTemplate,
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Elegant serif design with a split hero and typography focus.",
    tags: ["service", "minimal", "elegant"],
    component: MinimalTemplate,
  },
  premium: {
    id: "premium",
    name: "Premium",
    description: "Dark luxury design with gold accents and cinematic gallery.",
    tags: ["service", "luxury", "dark"],
    component: PremiumTemplate,
  },

  // --- Blog ---
  blog: {
    id: "blog",
    name: "Blog",
    description: "Editorial blog layout that fetches live articles from the insights API.",
    tags: ["blog", "editorial", "insights"],
    component: BlogTemplate,
  },
  "blog-premium": {
    id: "blog-premium",
    name: "Blog – Premium",
    description: "Premium multi-page editorial magazine with dedicated article detail experience.",
    tags: ["blog", "premium", "editorial", "magazine"],
    component: PremiumBlogTemplate,
  },

  // --- Portfolio ---
  "portfolio-creative": {
    id: "portfolio-creative",
    name: "Portfolio – Creative",
    description: "Light masonry portfolio with hover overlays and project lightbox.",
    tags: ["portfolio", "creative", "light"],
    component: PortfolioCreativeTemplate,
  },
  "portfolio-agency": {
    id: "portfolio-agency",
    name: "Portfolio – Agency",
    description: "Dark agency portfolio with numbered work list and gold accents.",
    tags: ["portfolio", "agency", "dark"],
    component: PortfolioAgencyTemplate,
  },

  // --- Store ---
  "store-grid": {
    id: "store-grid",
    name: "Store – Grid",
    description: "E-commerce product grid with categories, wishlist, and add-to-cart.",
    tags: ["store", "shop", "ecommerce"],
    component: StoreGridTemplate,
  },
  "store-catalog": {
    id: "store-catalog",
    name: "Store – Catalog",
    description: "Sidebar category navigation with featured product and catalog rows.",
    tags: ["store", "catalog", "ecommerce"],
    component: StoreCatalogTemplate,
  },

  // --- Company / Product ---
  company: {
    id: "company",
    name: "Company / Product",
    description: "Full company site with features, pricing tiers, team, and reviews.",
    tags: ["company", "saas", "product"],
    component: CompanySiteTemplate,
  },
};

export const getAllTemplates = (): TemplateDefinition[] =>
  Object.values(templateRegistry);

export const getTemplateById = (id: string): TemplateDefinition | undefined =>
  templateRegistry[id];
