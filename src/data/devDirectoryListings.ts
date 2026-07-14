import type { Place } from "../context/ListingsContext";

type DirectoryApiListing = {
  id: number;
  slug: string;
  businessName: string;
  businessCategory: string | null;
  shortDescription: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  priceLevel: string | null;
  tags: string[] | null;
  hasStore: boolean;
  websitePlan: string;
  score: number;
  location: {
    latitude: number | null;
    longitude: number | null;
    isRemoteOnly: boolean;
  };
  distance: number | null;
  averageRating: number;
  reviewCount: number;
  favouriteCount: number;
  businessLogo: string | null;
  createdAt: string | null;
  ownerId?: string | number | null;
};

export type DirectoryListingsResponse = {
  page: number;
  pageSize: number;
  total: number;
  results: DirectoryApiListing[];
};

const fallbackImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80";

export const devDirectoryListingsResponse: DirectoryListingsResponse = {
  page: 1,
  pageSize: 20,
  total: 5,
  results: [
    {
      id: 1,
      slug: "ledgerwise-accounting",
      businessName: "Ledgerwise Accounting",
      businessCategory: "Accounting and Bookkeeping",
      shortDescription:
        "Cloud bookkeeping, payroll, and month-end reporting for growing service businesses.",
      city: "New York",
      region: "NY",
      country: "USA",
      priceLevel: "$$",
      tags: ["bookkeeping", "payroll", "tax-prep"],
      hasStore: false,
      websitePlan: "website_growth",
      score: 92.5,
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        isRemoteOnly: true,
      },
      distance: null,
      averageRating: 4.8,
      reviewCount: 247,
      favouriteCount: 89,
      businessLogo:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
      createdAt: "2025-01-15T10:30:00Z",
    },
    {
      id: 2,
      slug: "northstar-digital",
      businessName: "Northstar Digital",
      businessCategory: "Marketing and Advertising",
      shortDescription:
        "Performance marketing, brand strategy, and paid media management for B2B teams.",
      city: "San Francisco",
      region: "CA",
      country: "USA",
      priceLevel: "$$$",
      tags: ["digital-marketing", "paid-media", "brand-strategy"],
      hasStore: false,
      websitePlan: "website_agency",
      score: 88.2,
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        isRemoteOnly: true,
      },
      distance: null,
      averageRating: 4.6,
      reviewCount: 156,
      favouriteCount: 67,
      businessLogo:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
      createdAt: "2025-02-20T14:45:00Z",
    },
    {
      id: 3,
      slug: "stackline-support",
      businessName: "Stackline Support",
      businessCategory: "IT and Technical Support",
      shortDescription:
        "Managed IT support, help desk coverage, cybersecurity monitoring, and cloud administration.",
      city: "Houston",
      region: "TX",
      country: "USA",
      priceLevel: "$$$",
      tags: ["managed-it", "help-desk", "cybersecurity"],
      hasStore: false,
      websitePlan: "website_core",
      score: 85.7,
      location: {
        latitude: 30.2672,
        longitude: -97.7431,
        isRemoteOnly: false,
      },
      distance: null,
      averageRating: 4.4,
      reviewCount: 93,
      favouriteCount: 34,
      businessLogo:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      createdAt: "2025-03-10T09:15:00Z",
    },
    {
      id: 4,
      slug: "clearpath-consulting",
      businessName: "Clearpath Consulting",
      businessCategory: "Consulting Services",
      shortDescription:
        "Operations consulting and process improvement for professional service organizations.",
      city: "Portland",
      region: "OR",
      country: "USA",
      priceLevel: "$$$",
      tags: ["operations", "process-improvement", "strategy"],
      hasStore: true,
      websitePlan: "website_growth",
      score: 83.4,
      location: {
        latitude: 45.5152,
        longitude: -122.6784,
        isRemoteOnly: false,
      },
      distance: null,
      averageRating: 4.7,
      reviewCount: 189,
      favouriteCount: 112,
      businessLogo:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
      createdAt: "2025-04-05T11:20:00Z",
    },
    {
      id: 5,
      slug: "peoplefirst-hr",
      businessName: "PeopleFirst HR",
      businessCategory: "Human Resources and Recruitment",
      shortDescription:
        "Recruiting support, HR documentation, onboarding workflows, and employee relations guidance.",
      city: "Chicago",
      region: "IL",
      country: "USA",
      priceLevel: "$$",
      tags: ["recruiting", "onboarding", "hr-compliance"],
      hasStore: false,
      websitePlan: "website_core",
      score: 80.1,
      location: {
        latitude: 41.8781,
        longitude: -87.6298,
        isRemoteOnly: true,
      },
      distance: null,
      averageRating: 4.2,
      reviewCount: 76,
      favouriteCount: 28,
      businessLogo:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
      createdAt: "2025-05-12T16:30:00Z",
    },
  ],
};

export const mapDirectoryListingToPlace = (
  listing: DirectoryApiListing,
): Place => {
  const addressParts = [listing.city, listing.region, listing.country].filter(
    Boolean,
  );
  const image = listing.businessLogo || fallbackImage;

  return {
    id: String(listing.id),
    creator: "directory",
    title: listing.businessName,
    desc: listing.shortDescription || "",
    address:
      addressParts.length > 0
        ? addressParts.join(", ")
        : listing.location.isRemoteOnly
          ? "Remote / Online"
          : "",
    slug: listing.slug,
    phone: "",
    category: listing.businessCategory || "",
    city: listing.city || "",
    region: listing.region || "",
    status: "active",
    createdAt: listing.createdAt || "",
    updatedAt: listing.createdAt || "",
    website: "",
    priceRange: listing.priceLevel,
    accountingAndTaxService: listing.tags?.join(", ") || null,
    area: listing.city || listing.region || null,
    businessLogo: image,
    businessBanner: image,
    image,
    image1: image,
    images: [image],
    intro: listing.shortDescription || "",
    featured: listing.score >= 85,
    businessName: listing.businessName,
    businessCategory: listing.businessCategory,
    shortDescription: listing.shortDescription,
    country: listing.country,
    priceLevel: listing.priceLevel,
    tags: listing.tags || [],
    hasStore: listing.hasStore,
    websitePlan: listing.websitePlan,
    score: listing.score,
    location: listing.location,
    distance: listing.distance,
    averageRating: listing.averageRating,
    reviewCount: listing.reviewCount,
    favouriteCount: listing.favouriteCount,
    ownerId: listing.ownerId ?? null,
  };
};

export const devDirectoryPlaces = devDirectoryListingsResponse.results.map(
  mapDirectoryListingToPlace,
);
