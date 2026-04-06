import { lazy } from "react";
import type { TemplateDefinition } from "./types";

// Service templates
const EducationTemplate = lazy(
  () => import("../templates/education/EducationTemplate"),
);
const GardeningTemplate = lazy(
  () => import("../templates/gardening/GardeningTemplate"),
);
const PlumbingTemplate = lazy(
  () => import("../templates/plumbing/PlumbingTemplate"),
);
const RestaurantTemplate = lazy(
  () => import("../templates/restaurant/RestaurantTemplate"),
);
const ModernTemplate = lazy(() => import("../templates/modern/ModernTemplate"));
const MinimalTemplate = lazy(
  () => import("../templates/minimal/MinimalTemplate"),
);
const PremiumTemplate = lazy(
  () => import("../templates/premium/PremiumTemplate"),
);

// Blog
const BlogTemplate = lazy(() => import("../templates/blog/BlogTemplate"));
const PremiumBlogTemplate = lazy(
  () => import("../templates/blog/PremiumBlogTemplate"),
);

// Portfolio
const PortfolioCreativeTemplate = lazy(
  () => import("../templates/portfolio/PortfolioCreativeTemplate"),
);
const PortfolioAgencyTemplate = lazy(
  () => import("../templates/portfolio/PortfolioAgencyTemplate"),
);
const PortfolioPhotoStudioTemplate = lazy(
  () => import("../templates/portfolio/PortfolioPhotoStudioTemplate"),
);

// Store
const StoreBasicTemplate = lazy(
  () => import("../templates/store/StoreBasicTemplate"),
);
const StorePremiumTemplate = lazy(
  () => import("../templates/store/StorePremiumTemplate"),
);
const StorePerformanceTemplate = lazy(
  () => import("../templates/store/StorePerformanceTemplate"),
);

// Company / Product site
const CompanySiteTemplate = lazy(
  () => import("../templates/company/CompanySiteTemplate"),
);
const CompanyPremiumTemplate = lazy(
  () => import("../templates/company/CompanyPremiumTemplate"),
);

const templateRegistry: Record<string, TemplateDefinition> = {
  // --- Service business ---
  education: {
    id: "education",
    name: "Education",
    description:
      "Academic-focused design with admissions hero, program highlights, parent trust blocks, and a school-specific contact flow.",
    tags: ["service", "education", "academic"],
    component: EducationTemplate,
  },
  gardening: {
    id: "gardening",
    name: "Gardening",
    description:
      "Soft editorial garden studio layout with large imagery, portfolio mosaic, alternating service storytelling, and a calm contact experience.",
    tags: ["service", "gardening", "editorial", "nature"],
    component: GardeningTemplate,
  },
  plumbing: {
    id: "plumbing",
    name: "Plumbing",
    description:
      "Editorial plumbing layout with oversized hero typography, dark service storytelling, and image-led project presentation.",
    tags: ["service", "plumbing", "editorial", "repair"],
    component: PlumbingTemplate,
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    description:
      "Dark-and-warm editorial restaurant layout with cinematic food imagery, story sections, promo strip, and reservation-focused contact area.",
    tags: ["service", "restaurant", "editorial", "food"],
    component: RestaurantTemplate,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description:
      "Clean, professional design with full-bleed photo hero and card-based layout.",
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
    description:
      "Editorial blog layout that fetches live articles from the insights API.",
    tags: ["blog", "editorial", "insights"],
    component: BlogTemplate,
  },
  "blog-premium": {
    id: "blog-premium",
    name: "Blog – Premium",
    description:
      "Premium multi-page editorial magazine with dedicated article detail experience.",
    tags: ["blog", "premium", "editorial", "magazine"],
    component: PremiumBlogTemplate,
  },

  // --- Portfolio ---
  "portfolio-creative": {
    id: "portfolio-creative",
    name: "Portfolio – Creative",
    description:
      "Light masonry portfolio with hover overlays and project lightbox.",
    tags: ["portfolio", "creative", "light"],
    component: PortfolioCreativeTemplate,
  },
  "portfolio-agency": {
    id: "portfolio-agency",
    name: "Portfolio – Agency",
    description:
      "Dark agency portfolio with numbered work list and gold accents.",
    tags: ["portfolio", "agency", "dark"],
    component: PortfolioAgencyTemplate,
  },
  "portfolio-photo-studio": {
    id: "portfolio-photo-studio",
    name: "Portfolio – Photo Studio",
    description:
      "Editorial photographer portfolio with bold hero typography, collaboration logos, works grid, FAQ, and cinematic footer CTA.",
    tags: ["portfolio", "photography", "editorial", "studio"],
    component: PortfolioPhotoStudioTemplate,
  },

  // --- Store ---
  "store-basic": {
    id: "store-basic",
    name: "Store – Basic",
    description:
      "Bold editorial food store with hero oval, featured flavors, and campaign storytelling.",
    tags: ["store", "basic", "editorial", "food"],
    component: StoreBasicTemplate,
  },
  "store-premium": {
    id: "store-premium",
    name: "Store – Premium",
    description:
      "Soft premium collection store with elegant merchandising, editorial about section, and enquiry-first contact layout.",
    tags: ["store", "premium", "editorial", "luxury"],
    component: StorePremiumTemplate,
  },
  "store-performance": {
    id: "store-performance",
    name: "Store – Performance",
    description:
      "Neon black athletic gear store with campaign-style promo sections, fitness products, and high-contrast product storytelling.",
    tags: ["store", "performance", "fitness", "campaign"],
    component: StorePerformanceTemplate,
  },

  // --- Company / Product ---
  company: {
    id: "company",
    name: "Company / Product",
    description:
      "Full company site with features, pricing tiers, team, and reviews.",
    tags: ["company", "saas", "product"],
    component: CompanySiteTemplate,
  },
  "company-premium": {
    id: "company-premium",
    name: "Company / Product – Premium",
    description:
      "Premium editorial company site with luxury storytelling and lead-generation sections.",
    tags: ["company", "premium", "editorial"],
    component: CompanyPremiumTemplate,
  },
};

export const getAllTemplates = (): TemplateDefinition[] =>
  Object.values(templateRegistry);

export const getTemplateById = (id: string): TemplateDefinition | undefined =>
  templateRegistry[id];
