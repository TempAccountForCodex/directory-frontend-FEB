export interface Service {
  name: string;
  description?: string;
  icon?: string;
  price?: string;
}

export interface GalleryItem {
  url: string;
  caption?: string;
  alt?: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date?: string;
  avatarUrl?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface LocationInfo {
  lat?: number;
  lng?: number;
  embedUrl?: string;
  address?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
  dribbble?: string;
}

export interface WorkingHour {
  day: string;
  hours: string;
}

// --- Blog ---
export interface BlogPost {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  author?: string;
  slug?: string;
}

// --- Portfolio ---
export interface PortfolioItem {
  title: string;
  description?: string;
  image: string;
  category?: string;
  client?: string;
  year?: string;
  tags?: string[];
  url?: string;
}

// --- Store ---
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  image?: string;
  category?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

// --- Company / Product Site ---
export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface BusinessData {
  name: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  primaryColor: string;
  secondaryColor?: string;

  // Service business
  services?: Service[];
  gallery?: GalleryItem[];
  reviews?: Review[];
  contact: ContactInfo;
  location?: LocationInfo;
  socialLinks?: SocialLinks;
  workingHours?: WorkingHour[];

  // Blog / insights
  blogPosts?: BlogPost[];

  // Portfolio
  portfolioItems?: PortfolioItem[];

  // Store
  products?: Product[];
  storeCategories?: string[];

  // Company / product site
  team?: TeamMember[];
  features?: Feature[];
  pricingPlans?: PricingPlan[];
  stats?: Stat[];
}
