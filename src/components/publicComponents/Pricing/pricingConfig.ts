export type BillingCycle = "monthly" | "annual";
export type PlanId = "free" | "pro" | "business";
export type SiteCount = number;

export type Feature = string | { label: string; sub: string[] };
export type Cell = string | boolean;
export type CompareRow = {
  feature: string;
  free: Cell;
  pro: Cell;
  business: Cell;
};

export type Plan = {
  id: PlanId;
  label: string;
  tagline: string;
  positioning: string;
  free?: boolean;
  recommended?: boolean;
  comingSoon?: boolean;
  cta: string;
  features: Feature[];
};

// Edit these values to change paid-plan site-count controls and volume pricing.
export const SITE_COUNT_MIN = 5;
export const SITE_COUNT_MAX = 250;
export const SITE_COUNT_STEP = 5;
export const PLAN_BASE_SITE_COUNT: SiteCount = 5;

// Prices are placeholder display values pending final pricing approval.
// Paid plan prices are the 5-site base price; 10-site and 15-site prices scale from this base.
export const PLAN_BASE_PRICES: Record<PlanId, Record<BillingCycle, number>> = {
  free: {
    monthly: 0,
    annual: 0,
  },
  pro: {
    monthly: 9,
    annual: 108,
  },
  business: {
    monthly: 19,
    annual: 228,
  },
};

// Temporary frontend-only discount display.
// Replace or connect to checkout once final promotion rules are approved.
export const PRICING_DISCOUNT_DISPLAY = {
  annualFreeMonths: 2,
  launchPercent: 20,
  launchCode: "LAUNCH20",
  volumeDiscountPercentPerTenSites: 1,
  maxVolumeDiscountPercent: 20,
};

export const PLANS: Plan[] = [
  {
    id: "free",
    label: "Free",
    tagline: "Get online",
    positioning: "Launch a simple online presence.",
    free: true,
    cta: "Get Started",
    features: [
      "1 single-page landing site",
      "1 form · 50 submissions/mo",
      "5 blog posts",
      "50 MB storage",
      "5 AI actions/day",
      "Free techietribe.app subdomain",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    tagline: "Look professional",
    positioning: "Build a branded presence on your domain.",
    recommended: true,
    cta: "Get Started",
    features: [
      "Everything in Free, plus:",
      // {
      //   label: "Up to 5 websites",
      //   sub: [
      //     "A directory listing for each",
      //     "1 custom domain for each",
      //     "5 forms per website",
      //   ],
      // },
      "A directory listing for each site",
      "1 custom domain & 5 forms/website",
      "500 form submissions/mo",
      "Unlimited posts",
      "upto 200 MB storage/site",
      "100 AI actions/daily",
      "Custom code & embeds",
      "SEO optimization",
      "Premium templates · custom CSS",
      "Detailed analytics",
      "2 collaborators per website",
    ],
  },
  {
    id: "business",
    label: "Business",
    tagline: "Grow and scale",
    positioning: "Scale with maximum directory visibility.",
    comingSoon: true,
    cta: "Coming Soon",
    features: [
      "Everything in Pro, plus:",
      "Priority based directory listing",
      "Advanced integrations",
      "Unlimited forms and custom domains",
      "Unlimited blog posts",
      "1 GB storage/site",
      "500 AI actions/daily",
      "Custom code, CSS & embeds",
      "SEO optimization for websites & blogs",
      "Blog comments & moderation controls",
      "Conversion, funnel & real-time analytics",
      "10 collaborators per website",
      "Priority support",
      "Custom Integrated Shops",
    ],
  },
];

export const getPlanListPrice = (
  planId: PlanId,
  billing: BillingCycle,
  siteCount: SiteCount,
) =>
  PLAN_BASE_PRICES[planId][billing] *
  (planId === "free" ? 1 : siteCount / PLAN_BASE_SITE_COUNT);

export const getVolumeDiscountPercent = (siteCount: SiteCount) => {
  const addedSites = Math.max(0, siteCount - PLAN_BASE_SITE_COUNT);
  const discountSteps = Math.floor(addedSites / 10);

  return Math.min(
    discountSteps * PRICING_DISCOUNT_DISPLAY.volumeDiscountPercentPerTenSites,
    PRICING_DISCOUNT_DISPLAY.maxVolumeDiscountPercent,
  );
};

export const getPlanPrice = (
  planId: PlanId,
  billing: BillingCycle,
  siteCount: SiteCount,
) => {
  if (planId === "free") return 0;

  const volumeDiscountMultiplier =
    1 - getVolumeDiscountPercent(siteCount) / 100;

  if (billing === "annual") {
    return Math.round(
      PLAN_BASE_PRICES[planId].monthly *
        (12 - PRICING_DISCOUNT_DISPLAY.annualFreeMonths) *
        (siteCount / PLAN_BASE_SITE_COUNT) *
        volumeDiscountMultiplier,
    );
  }

  return Math.round(
    getPlanListPrice(planId, billing, siteCount) * volumeDiscountMultiplier,
  );
};

export const getPlanPriceBreakdown = (
  planId: PlanId,
  billing: BillingCycle,
  siteCount: SiteCount,
) => {
  const listPrice = getPlanListPrice(planId, billing, siteCount);
  const volumeDiscountPercent =
    planId === "free" ? 0 : getVolumeDiscountPercent(siteCount);
  const volumeDiscountMultiplier = 1 - volumeDiscountPercent / 100;
  const priceAfterVolumeDiscount = Math.round(
    listPrice * volumeDiscountMultiplier,
  );
  const price = getPlanPrice(planId, billing, siteCount);

  return {
    listPrice,
    price,
    volumeDiscountPercent,
    volumeSavings: listPrice - priceAfterVolumeDiscount,
    annualSavings: billing === "annual" ? priceAfterVolumeDiscount - price : 0,
    totalSavings: listPrice - price,
  };
};

export const getNextSiteCount = (siteCount: SiteCount, direction: -1 | 1) => {
  const nextSiteCount = siteCount + direction * SITE_COUNT_STEP;

  return Math.max(SITE_COUNT_MIN, Math.min(SITE_COUNT_MAX, nextSiteCount));
};

export const COMPARISON_GROUPS: { category: string; rows: CompareRow[] }[] = [
  {
    category: "Websites & content",
    rows: [
      {
        feature: "Landing pages",
        free: "1 single-page",
        pro: `${SITE_COUNT_MIN}-${SITE_COUNT_MAX}`,
        business: "Unlimited*",
      },
      {
        feature: "Directory listings",
        free: "1 standard",
        pro: "1 per site",
        business: "Unlimited*",
      },
      {
        feature: "Link-in-bio pages",
        free: "1",
        pro: `${SITE_COUNT_MIN}-${SITE_COUNT_MAX}`,
        business: "Unlimited*",
      },
      {
        feature: "Blog posts",
        free: "5",
        pro: "Unlimited posts",
        business: "Unlimited",
      },
      {
        feature: "Storage",
        free: "50 MB",
        pro: "200 MB/site",
        business: "1 GB",
      },
      {
        feature: "Site-count step",
        free: false,
        pro: `${SITE_COUNT_STEP} sites`,
        business: `${SITE_COUNT_STEP} sites`,
      },
    ],
  },
  {
    category: "Forms & leads",
    rows: [
      {
        feature: "Forms",
        free: "1",
        pro: "5 per website",
        business: "Unlimited",
      },
      {
        feature: "Form submissions",
        free: "50/month",
        pro: "500/month",
        business: "10,000/month",
      },
      {
        feature: "Booking/reservation forms",
        free: false,
        pro: true,
        business: true,
      },
      { feature: "CSV lead export", free: false, pro: true, business: true },
    ],
  },
  {
    category: "AI tools",
    rows: [
      {
        feature: "AI actions",
        free: "5/daily",
        pro: "100/daily",
        business: "500/daily",
      },
      {
        feature: "AI listing enhancement",
        free: false,
        pro: true,
        business: true,
      },
    ],
  },
  {
    category: "Domain & branding",
    rows: [
      {
        feature: "Techietribe subdomain",
        free: true,
        pro: true,
        business: true,
      },
      {
        feature: "Custom domains",
        free: false,
        pro: "1 per website",
        business: "1 per website",
      },
    ],
  },
  {
    category: "Pricing discounts",
    rows: [
      {
        feature: "Annual billing savings",
        free: false,
        pro: `${PRICING_DISCOUNT_DISPLAY.annualFreeMonths} months free`,
        business: `${PRICING_DISCOUNT_DISPLAY.annualFreeMonths} months free`,
      },
      {
        feature: "Volume discount",
        free: false,
        pro: `${PRICING_DISCOUNT_DISPLAY.volumeDiscountPercentPerTenSites}% per 10 added sites`,
        business: `${PRICING_DISCOUNT_DISPLAY.volumeDiscountPercentPerTenSites}% per 10 added sites`,
      },
      {
        feature: "Max volume discount",
        free: false,
        pro: `${PRICING_DISCOUNT_DISPLAY.maxVolumeDiscountPercent}%`,
        business: `${PRICING_DISCOUNT_DISPLAY.maxVolumeDiscountPercent}%`,
      },
      {
        feature: "Launch code",
        free: false,
        pro: PRICING_DISCOUNT_DISPLAY.launchCode,
        business: PRICING_DISCOUNT_DISPLAY.launchCode,
      },
    ],
  },
  {
    category: "Design & editor",
    rows: [
      {
        feature: "Templates",
        free: "Free",
        pro: "Free & premium",
        business: "All templates",
      },
      {
        feature: "Video blocks & uploads",
        free: false,
        pro: true,
        business: true,
      },
      { feature: "Custom CSS", free: false, pro: true, business: true },
      {
        feature: "Custom code & embeds",
        free: false,
        pro: false,
        business: true,
      },
    ],
  },
  {
    category: "Analytics",
    rows: [
      { feature: "Basic analytics", free: true, pro: true, business: true },
      {
        feature: "Detailed traffic analytics",
        free: false,
        pro: true,
        business: true,
      },
      {
        feature: "Conversion & real-time analytics",
        free: false,
        pro: false,
        business: true,
      },
    ],
  },
  {
    category: "Directory & reputation",
    rows: [
      {
        feature: "Directory ranking boost",
        free: "Standard",
        pro: "Enhanced",
        business: "Highest",
      },
      {
        feature: "Featured directory listing",
        free: false,
        pro: "Standard",
        business: "Enhanced",
      },
      {
        feature: "Owner review replies",
        free: false,
        pro: true,
        business: true,
      },
    ],
  },
  {
    category: "Team & integrations",
    rows: [
      {
        feature: "Collaborators",
        free: "0",
        pro: "2 per website",
        business: "10 per website",
      },
      {
        feature: "Advanced integrations",
        free: false,
        pro: "Limited",
        business: true,
      },
      {
        feature: "Support",
        free: "Standard",
        pro: "Standard",
        business: "Priority",
      },
    ],
  },
];
