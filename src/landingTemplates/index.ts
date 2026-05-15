// Public API for the landing template system
export { default as TemplateEngine } from "./templateEngine/TemplateEngine";
export {
  getAllTemplates,
  getTemplateById,
} from "./templateEngine/templateRegistry";

// Types
export type {
  BusinessData,
  Service,
  GalleryItem,
  Review,
  ContactInfo,
  LocationInfo,
  SocialLinks,
  WorkingHour,
  BlogPost,
  PortfolioItem,
  Product,
  TeamMember,
  Feature,
  PricingPlan,
  Stat,
} from "./types/BusinessData";
export type {
  TemplateTheme,
  TemplateProps,
  TemplateDefinition,
} from "./templateEngine/types";

// Blocks
export {
  FadeIn,
  HeroBlock,
  ServicesBlock,
  GalleryBlock,
  ReviewsBlock,
  ContactBlock,
  LocationBlock,
  CTASection,
} from "./blocks";

// Service template themes
export { buildModernTheme } from "./templates/modern/modernTheme";
export { buildMinimalTheme } from "./templates/minimal/minimalTheme";
export { buildPremiumTheme } from "./templates/premium/premiumTheme";
