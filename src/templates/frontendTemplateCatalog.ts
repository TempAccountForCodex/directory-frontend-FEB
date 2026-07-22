import type {
  TemplateCategory,
  TemplateSummary,
  TemplateType,
} from "./templateApi";

type FrontendTemplateDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  version: string;
  previewImage: string;
  pageCount?: number;
};

export const FRONTEND_TEMPLATE_CATALOG: FrontendTemplateDefinition[] = [
  {
    id: "blog",
    slug: "blog",
    name: "Blog",
    description:
      "Editorial layout tailored for insights and content marketing.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/blog.webp",
    pageCount: 3,
  },
  {
    id: "blog-premium",
    slug: "blog-premium",
    name: "Blog Premium",
    description:
      "Premium multi-page editorial magazine template with dedicated article detail layouts.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/blog-premium.webp",
    pageCount: 3,
  },
  {
    id: "portfolio-creative",
    slug: "portfolio-creative",
    name: "Portfolio Creative",
    description:
      "Creative-first portfolio template for individual professionals.",
    type: "website",
    category: "portfolio",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/portfolioCreative.webp",
    pageCount: 3,
  },
  {
    id: "portfolio-agency",
    slug: "portfolio-agency",
    name: "Portfolio Agency",
    description: "Agency-style portfolio layout for studios and teams.",
    type: "website",
    category: "agency",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/portfolioAgency.webp",
    pageCount: 3,
  },
  {
    id: "portfolio-photo-studio",
    slug: "portfolio-photo-studio",
    name: "Portfolio Photo Studio",
    description:
      "Bold editorial photo studio template with cinematic hero, service list, works showcase, FAQ, and image-led storytelling.",
    type: "website",
    category: "portfolio",
    version: "1.0.0",
    previewImage:
      "/assets/templateAssets/images/dummy/portfolio-photo-studio.webp",
    pageCount: 4,
  },
  {
    id: "store-basic",
    slug: "store-basic",
    name: "Store Basic",
    description:
      "Editorial store template with bold campaign layout and reusable product storytelling.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storeBasic.webp",
    pageCount: 3,
  },
  {
    id: "store-premium",
    slug: "store-premium",
    name: "Store Premium",
    description:
      "Premium soft-luxury store template with refined collection presentation, about story block, and contact form.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storePremium.webp",
    pageCount: 3,
  },
  {
    id: "store-performance",
    slug: "store-performance",
    name: "Store Performance",
    description:
      "High-contrast neon performance store template inspired by gym campaigns and bold sports retail visuals.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storePerformance.webp",
    pageCount: 3,
  },
  {
    id: "store-fit",
    slug: "store-fit",
    name: "Store Fit",
    description:
      "Dark footwear store template modeled on stacked mobile retail cards, campaign imagery, and sale-first sports merchandising.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storefit.webp",
    pageCount: 3,
  },
  {
    id: "store-paws",
    slug: "store-paws",
    name: "Store Paws",
    description:
      "Editorial dog-products store template with a video hero, premium pet merchandising, curated sections, and a soft luxury look.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storePaws.webp",
    pageCount: 3,
  },
  {
    id: "company",
    slug: "company",
    name: "Company",
    description:
      "Multi-section company template for product and team storytelling.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/company.webp",
    pageCount: 3,
  },
  {
    id: "company-premium",
    slug: "company-premium",
    name: "Company Premium",
    description:
      "Premium editorial company template with luxury presentation and enquiry-first sections.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/company-premium.webp",
    pageCount: 3,
  },
  {
    id: "company-executive",
    slug: "company-executive",
    name: "Company Executive",
    description:
      "Top-class editorial company template with premium service framing, trust-led storytelling, and a polished contact finish.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/companyExecutive.webp",
    pageCount: 3,
  },
  {
    id: "company-pro",
    slug: "company-pro",
    name: "Company Pro",
    description:
      "Editorial company template with sculptural portraiture, serif-led storytelling, structured services, and a high-impact call to action.",
    type: "website",
    category: "business",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/companyProEditorial.png",
    pageCount: 1,
  },
  {
    id: "gardening",
    slug: "gardening",
    name: "Gardening",
    description:
      "Nature-focused local business template for garden and landscaping services.",
    type: "website",
    category: "business",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/gardening.webp",
    pageCount: 3,
  },
  {
    id: "education",
    slug: "education",
    name: "Education",
    description:
      "Structured template for courses, institutions, and educational programs.",
    type: "website",
    category: "education",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/education.webp",
    pageCount: 3,
  },
  {
    id: "education-pro",
    slug: "education-pro",
    name: "Education Pro",
    description:
      "Multi-page learning academy template with course showcases, instructor profiles, testimonials, and a dedicated contact page.",
    type: "website",
    category: "education",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/educationPro.webp",
    pageCount: 4,
  },
  {
    id: "restaurant",
    slug: "restaurant",
    name: "Restaurant",
    description:
      "Restaurant website layout for menu highlights, reservations, and contact.",
    type: "website",
    category: "restaurant",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/restaurant.webp",
    pageCount: 3,
  },
  {
    id: "plumbing",
    slug: "plumbing",
    name: "Plumbing",
    description:
      "Service template for plumbing businesses with emergency and booking focus.",
    type: "website",
    category: "business",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/plumbing.webp",
    pageCount: 3,
  },
];

export const getFrontendWebsiteTemplates = (): TemplateSummary[] =>
  FRONTEND_TEMPLATE_CATALOG.filter(
    (template) => template.type === "website",
  ).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    type: template.type,
    category: template.category,
    version: template.version,
    previewImage: template.previewImage,
    pageCount: template.pageCount,
    blockCount: undefined,
    defaultWebsiteConfig: null,
  }));

export const getFrontendTemplateSlug = (templateId: string): string | null =>
  FRONTEND_TEMPLATE_CATALOG.find((template) => template.id === templateId)
    ?.slug ?? null;

export const getFrontendTemplatePreviewImage = (
  templateId: string | null | undefined,
): string | null =>
  FRONTEND_TEMPLATE_CATALOG.find((template) => template.id === templateId)
    ?.previewImage ?? null;
