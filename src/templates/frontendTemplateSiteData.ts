import type { BusinessData } from "../landingTemplates/types/BusinessData";
import {
  educationData,
  gardeningData,
  plumbingData,
  restaurantData,
} from "../components/publicComponents/Home/industryPreview/industryDummyData";
import { companyStudioAssets } from "../landingTemplates/assets/company/company-executive";
import { companyProAssets } from "../landingTemplates/assets/company/company-pro";
import { portfolioAssets } from "../landingTemplates/assets/portfolio/portfolio-agency";

type FrontendTemplateWebsite = {
  websiteId?: string | number;
  name: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  themeSettings?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    headingFont?: string | null;
    bodyFont?: string | null;
  } | null;
  metaDescription?: string | null;
  shortDescription?: string | null;
  logoUrl?: string | null;
  businessName?: string | null;
  fullAddress?: string | null;
  tags?: string[] | null;
  pages?: BusinessData["pages"];
};

const baseBlogData: BusinessData = {
  name: "Field Notes",
  tagline: "Editorial insights for operators, founders, and modern teams.",
  description:
    "A clean editorial publishing template for practical business writing and insights.",
  primaryColor: "#9bd238",
  secondaryColor: "#dcebb9",
  contact: { email: "hello@fieldnotes.com" },
  socialLinks: { twitter: "#", instagram: "#", linkedin: "#" },
  blogPosts: [
    {
      id: "post-1",
      title: "How operational clarity compounds over time",
      description:
        "A practical look at systems, communication, and decision quality.",
      image: companyStudioAssets.office,
      category: "Operations",
      author: "Editorial Team",
      slug: "operational-clarity",
    },
  ],
};

const baseBlogPremiumData: BusinessData = {
  ...baseBlogData,
  name: "Indise.",
  tagline: "Premium insights for modern founders and finance teams.",
  description:
    "A premium editorial template for strategy, finance, and business operations.",
  primaryColor: "#49d56b",
  secondaryColor: "#d8caea",
};

const baseCompanyData: BusinessData = {
  name: "Northlane Systems",
  tagline: "Professional systems, sharper execution, and dependable delivery.",
  description:
    "A company template for positioning services, trust, and execution strength.",
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  contact: { email: "hello@northlane.com", phone: "(555) 230-1000" },
  features: [
    {
      title: "Strategic planning",
      description: "Clearer priorities and accountable execution.",
    },
    {
      title: "Team enablement",
      description: "Systems that help teams move faster with less friction.",
    },
    {
      title: "Performance visibility",
      description: "Practical reporting for operational clarity.",
    },
  ],
  stats: [
    { label: "Projects delivered", value: "120+" },
    { label: "Client retention", value: "94%" },
    { label: "Years operating", value: "9" },
  ],
};

const baseCompanyPremiumData: BusinessData = {
  ...baseCompanyData,
  name: "Atelier North",
  tagline: "Luxury presentation with polished service positioning.",
  description:
    "A premium company template for high-trust brands and established businesses.",
  primaryColor: "#b8896a",
  secondaryColor: "#ead7c7",
};

const baseCompanyExecutiveData: BusinessData = {
  ...baseCompanyData,
  name: "Executive Partners",
  tagline: "Enterprise-ready presentation for established businesses.",
  description:
    "Professional, trustworthy, and premium service framing for executive-level brands.",
  primaryColor: "#173f73",
  secondaryColor: "#91b8f4",
};

const baseCompanyProData: BusinessData = {
  ...baseCompanyData,
  name: "Alder & Co.",
  tagline: "Clarity for companies in motion.",
  description:
    "Strategy, identity, and delivery systems for leadership teams building their next chapter.",
  primaryColor: "#12100f",
  secondaryColor: "#bd5d3f",
  contact: {
    email: "hello@alderandco.com",
    phone: "(555) 280-1440",
    address: "120 Market Street, New York, NY",
  },
  reviews: [
    {
      author: "Maya Chen",
      role: "Chief Operating Officer",
      text: "Alder turned a difficult transformation into a system we can keep using.",
      rating: 5,
      avatarUrl: companyProAssets.avatars[0],
    },
    {
      author: "Owen Brooks",
      role: "VP, Commercial Growth",
      text: "Strategic and practical in equal measure. The result feels premium without being performative.",
      rating: 5,
      avatarUrl: companyProAssets.avatars[1],
    },
  ],
};

const basePortfolioData: BusinessData = {
  name: "Studio Volta",
  tagline: "Design at the intersection of craft and technology.",
  description:
    "A portfolio template for design, client work, and selected projects.",
  primaryColor: "#111111",
  secondaryColor: "#f59e0b",
  contact: { email: "hello@studiovolta.com", phone: "(555) 240-8800" },
  portfolioItems: [
    {
      title: "Nova Brand Identity",
      image: portfolioAssets.agencyWorkspace,
      description: "Identity system and campaign direction for a modern brand.",
      category: "Branding",
    },
  ],
  services: [
    {
      name: "Brand Systems",
      description: "Identity, strategy, and visual design.",
    },
    { name: "Digital Products", description: "UI, UX, and front-end systems." },
  ],
};

const basePortfolioAgencyData: BusinessData = {
  ...basePortfolioData,
  name: "Obsidian Agency",
  tagline: "Dark, polished portfolio presentation for modern agencies.",
  primaryColor: "#171717",
  secondaryColor: "#c8a968",
};

const basePortfolioPhotoStudioData: BusinessData = {
  ...basePortfolioData,
  name: "Tim Joel",
  tagline: "Portrait and lifestyle photography with an editorial eye.",
  primaryColor: "#111111",
  secondaryColor: "#ff7a1a",
};

const baseModernData: BusinessData = {
  name: "Modern Co.",
  tagline: "Clean, professional, and built to perform.",
  description:
    "A full-service agency delivering strategy, design, and execution for ambitious brands.",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  contact: { email: "hello@modernco.com", phone: "(555) 100-2000" },
  features: [
    { title: "Fast Delivery", description: "Quick turnaround without compromising quality." },
    { title: "Expert Team", description: "Specialists with years of industry experience." },
    { title: "Full Support", description: "Dedicated support from start to finish." },
  ],
  services: [
    { name: "Strategy", description: "Research-led planning for sustainable growth." },
    { name: "Design", description: "Visual systems that communicate with clarity." },
    { name: "Execution", description: "End-to-end delivery from concept to launch." },
  ],
};

const baseMinimalData: BusinessData = {
  ...baseModernData,
  name: "Minimal Studio",
  tagline: "Elegant, refined, and purposefully understated.",
  description:
    "A minimal studio focused on the essentials — clean work, clear communication, and lasting results.",
  primaryColor: "#1a1a1a",
  secondaryColor: "#e5e5e5",
};

const basePremiumData: BusinessData = {
  ...baseModernData,
  name: "Premium Group",
  tagline: "Luxury service and craftsmanship at every level.",
  description:
    "A premium firm offering high-touch services for discerning clients who expect the best.",
  primaryColor: "#0f0f0f",
  secondaryColor: "#c8a968",
};

const baseStoreData: BusinessData = {
  name: "The Shop",
  tagline: "Quality products for everyday life.",
  description:
    "A curated store with products built to last — designed for quality and value.",
  primaryColor: "#111111",
  secondaryColor: "#f59e0b",
  contact: { email: "hello@theshop.com", phone: "(555) 200-1000" },
  products: [
    {
      id: "p-1",
      name: "Signature Collection",
      description: "Our bestselling line, crafted with premium materials.",
      price: "$49.00",
      originalPrice: "$69.00",
      category: "Featured",
      badge: "Best Seller",
    },
    {
      id: "p-2",
      name: "Essential Pack",
      description: "Everything you need in one curated bundle.",
      price: "$89.00",
      category: "Bundles",
    },
  ],
};

const baseStorePremiumData: BusinessData = {
  ...baseStoreData,
  name: "Maison Edit",
  tagline: "Soft luxury, premium curation, and editorial presence.",
  description:
    "A premium collection store with elegant merchandising and bespoke customer service.",
  primaryColor: "#2c2420",
  secondaryColor: "#c8a968",
};

const baseStorePerformanceData: BusinessData = {
  ...baseStoreData,
  name: "Apex Gear",
  tagline: "Built for performance. Worn by champions.",
  description:
    "High-performance athletic gear engineered for those who push limits.",
  primaryColor: "#0a0a0a",
  secondaryColor: "#00ff88",
};

const baseStoreFitData: BusinessData = {
  ...baseStoreData,
  name: "Stride Co.",
  tagline: "Sport footwear and apparel for every pursuit.",
  description:
    "Bold sports-fashion brand delivering footwear and apparel built for movement and style.",
  primaryColor: "#1e3a8a",
  secondaryColor: "#f97316",
};

const baseStorePawsData: BusinessData = {
  ...baseStoreData,
  name: "Paws & Co.",
  tagline: "Premium products for the dogs you love.",
  description:
    "A soft editorial pet store curating the very best for your four-legged companions.",
  primaryColor: "#7c3aed",
  secondaryColor: "#fbbf24",
};

const FRONTEND_TEMPLATE_BASE_DATA: Record<string, BusinessData> = {
  blog: baseBlogData,
  "blog-premium": baseBlogPremiumData,
  company: baseCompanyData,
  "company-premium": baseCompanyPremiumData,
  "company-executive": baseCompanyExecutiveData,
  "company-pro": baseCompanyProData,
  education: educationData,
  gardening: gardeningData,
  minimal: baseMinimalData,
  modern: baseModernData,
  plumbing: plumbingData,
  premium: basePremiumData,
  "portfolio-creative": basePortfolioData,
  "portfolio-agency": basePortfolioAgencyData,
  "portfolio-photo-studio": basePortfolioPhotoStudioData,
  restaurant: restaurantData,
  "store-basic": baseStoreData,
  "store-fit": baseStoreFitData,
  "store-paws": baseStorePawsData,
  "store-performance": baseStorePerformanceData,
  "store-premium": baseStorePremiumData,
};

export const hasFrontendTemplateBaseData = (
  templateId: string | null | undefined,
): boolean => !!templateId && !!FRONTEND_TEMPLATE_BASE_DATA[templateId];

export const buildFrontendTemplateBusinessData = (
  templateId: string,
  website: FrontendTemplateWebsite,
): BusinessData | null => {
  const base = FRONTEND_TEMPLATE_BASE_DATA[templateId];
  if (!base) {
    return null;
  }

  return {
    ...base,
    websiteId: website.websiteId,
    pages: website.pages,
    name: website.businessName || website.name || base.name,
    tagline: website.shortDescription || base.tagline,
    description:
      website.metaDescription || website.shortDescription || base.description,
    primaryColor:
      website.themeSettings?.primaryColor ||
      website.primaryColor ||
      base.primaryColor,
    secondaryColor:
      website.themeSettings?.secondaryColor ||
      website.secondaryColor ||
      base.secondaryColor,
    logoUrl: website.logoUrl || base.logoUrl,
    themeSettings: website.themeSettings
      ? {
          ...(base.themeSettings || {}),
          primaryColor: website.themeSettings.primaryColor || undefined,
          secondaryColor: website.themeSettings.secondaryColor || undefined,
          headingFont: website.themeSettings.headingFont || undefined,
          bodyFont: website.themeSettings.bodyFont || undefined,
        }
      : base.themeSettings,
    contact: {
      ...base.contact,
      address: website.fullAddress || base.contact.address,
    },
    location: {
      ...base.location,
      address: website.fullAddress || base.location?.address,
    },
    services:
      website.tags && website.tags.length
        ? website.tags.map((tag) => ({
            name: tag,
            description: `Professional ${tag.toLowerCase()} support tailored to your business.`,
          }))
        : base.services,
  };
};
