import type { BusinessData } from '../landingTemplates/types/BusinessData';
import {
  educationData,
  gardeningData,
  plumbingData,
  restaurantData,
} from '../components/publicComponents/Home/industryPreview/industryDummyData';

type FrontendTemplateWebsite = {
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
};

const baseBlogData: BusinessData = {
  name: 'Field Notes',
  tagline: 'Editorial insights for operators, founders, and modern teams.',
  description: 'A clean editorial publishing template for practical business writing and insights.',
  primaryColor: '#9bd238',
  secondaryColor: '#dcebb9',
  contact: { email: 'hello@fieldnotes.com' },
  socialLinks: { twitter: '#', instagram: '#', linkedin: '#' },
  blogPosts: [
    {
      id: 'post-1',
      title: 'How operational clarity compounds over time',
      description: 'A practical look at systems, communication, and decision quality.',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200',
      category: 'Operations',
      author: 'Editorial Team',
      slug: 'operational-clarity',
    },
  ],
};

const baseBlogPremiumData: BusinessData = {
  ...baseBlogData,
  name: 'Indise.',
  tagline: 'Premium insights for modern founders and finance teams.',
  description: 'A premium editorial template for strategy, finance, and business operations.',
  primaryColor: '#49d56b',
  secondaryColor: '#d8caea',
};

const baseCompanyData: BusinessData = {
  name: 'Northlane Systems',
  tagline: 'Professional systems, sharper execution, and dependable delivery.',
  description: 'A company template for positioning services, trust, and execution strength.',
  primaryColor: '#378C92',
  secondaryColor: '#D3EB63',
  contact: { email: 'hello@northlane.com', phone: '(555) 230-1000' },
  features: [
    { title: 'Strategic planning', description: 'Clearer priorities and accountable execution.' },
    { title: 'Team enablement', description: 'Systems that help teams move faster with less friction.' },
    { title: 'Performance visibility', description: 'Practical reporting for operational clarity.' },
  ],
  stats: [
    { label: 'Projects delivered', value: '120+' },
    { label: 'Client retention', value: '94%' },
    { label: 'Years operating', value: '9' },
  ],
};

const baseCompanyPremiumData: BusinessData = {
  ...baseCompanyData,
  name: 'Atelier North',
  tagline: 'Luxury presentation with polished service positioning.',
  description: 'A premium company template for high-trust brands and established businesses.',
  primaryColor: '#b8896a',
  secondaryColor: '#ead7c7',
};

const baseCompanyExecutiveData: BusinessData = {
  ...baseCompanyData,
  name: 'Executive Partners',
  tagline: 'Enterprise-ready presentation for established businesses.',
  description: 'Professional, trustworthy, and premium service framing for executive-level brands.',
  primaryColor: '#173f73',
  secondaryColor: '#91b8f4',
};

const basePortfolioData: BusinessData = {
  name: 'Studio Volta',
  tagline: 'Design at the intersection of craft and technology.',
  description: 'A portfolio template for design, client work, and selected projects.',
  primaryColor: '#111111',
  secondaryColor: '#f59e0b',
  contact: { email: 'hello@studiovolta.com', phone: '(555) 240-8800' },
  portfolioItems: [
    {
      title: 'Nova Brand Identity',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      description: 'Identity system and campaign direction for a modern brand.',
      category: 'Branding',
    },
  ],
  services: [
    { name: 'Brand Systems', description: 'Identity, strategy, and visual design.' },
    { name: 'Digital Products', description: 'UI, UX, and front-end systems.' },
  ],
};

const basePortfolioAgencyData: BusinessData = {
  ...basePortfolioData,
  name: 'Obsidian Agency',
  tagline: 'Dark, polished portfolio presentation for modern agencies.',
  primaryColor: '#171717',
  secondaryColor: '#c8a968',
};

const basePortfolioPhotoStudioData: BusinessData = {
  ...basePortfolioData,
  name: 'Tim Joel',
  tagline: 'Portrait and lifestyle photography with an editorial eye.',
  primaryColor: '#111111',
  secondaryColor: '#ff7a1a',
};

const FRONTEND_TEMPLATE_BASE_DATA: Record<string, BusinessData> = {
  blog: baseBlogData,
  'blog-premium': baseBlogPremiumData,
  company: baseCompanyData,
  'company-premium': baseCompanyPremiumData,
  'company-executive': baseCompanyExecutiveData,
  education: educationData,
  gardening: gardeningData,
  plumbing: plumbingData,
  'portfolio-creative': basePortfolioData,
  'portfolio-agency': basePortfolioAgencyData,
  'portfolio-photo-studio': basePortfolioPhotoStudioData,
  restaurant: restaurantData,
};

export const hasFrontendTemplateBaseData = (templateId: string | null | undefined): boolean =>
  !!templateId && !!FRONTEND_TEMPLATE_BASE_DATA[templateId];

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
    name: website.businessName || website.name || base.name,
    tagline: website.shortDescription || base.tagline,
    description: website.metaDescription || website.shortDescription || base.description,
    primaryColor: website.themeSettings?.primaryColor || website.primaryColor || base.primaryColor,
    secondaryColor: website.themeSettings?.secondaryColor || website.secondaryColor || base.secondaryColor,
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
