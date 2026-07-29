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
export const SITE_COUNT_OPTIONS: SiteCount[] = [
  1, 5, 10, 20, 25, 50, 100, 150, 200, 250,
];
export const SITE_COUNT_MIN = SITE_COUNT_OPTIONS[0];
export const SITE_COUNT_MAX = SITE_COUNT_OPTIONS[SITE_COUNT_OPTIONS.length - 1];
export const SITE_COUNT_STEP_LABEL = SITE_COUNT_OPTIONS.join(" -> ");
export const PLAN_BASE_SITE_COUNT: SiteCount = 1;

// Paid plan prices are monthly price-per-website values.
// Standard prices are the regular renewal/list prices.
export const PLAN_PRICE_PER_WEBSITE: Record<PlanId, number> = {
  free: 0,
  pro: 9,
  business: 17,
};

// Early-bird prices are the current launch display prices.
// These should become Super Admin-managed values before production checkout.
export const EARLY_BIRD_PRICE_PER_WEBSITE: Record<PlanId, number> = {
  free: 0,
  pro: 7,
  business: 15,
};

// Temporary frontend-only discount display.
// Replace or connect to checkout once final promotion rules are approved.
export const PRICING_DISCOUNT_DISPLAY = {
  annualFreeMonths: 2,
  earlyBirdLabel: "Early bird",
  launchPercent: 20,
  launchCode: "LAUNCH20",
  volumeDiscountPercentPerTenSites: 0,
  maxVolumeDiscountPercent: 0,
  showVolumeDiscountChip: false,
};

export const REFERRAL_PROGRAM = {
  code: "REFERRAL20",
  friendDiscountPercent: 20,
  friendDiscountDuration: "once",
  referrerCreditAmount: 5,
  backendMaxBenefitAmount: 20,
  eligiblePlans: ["Pro", "Business"],
  renewalCopy: "regular monthly or annual price",
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
      "1 built-in form · 50 submissions/mo",
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
      "Custom domain",
      "Built in forms · No Limit",
      "Unlimited blog posts",
      "upto 200 MB storage/site",
      "100 AI actions/daily",
      "Custom code & embeds",
      "SEO optimization",
      "Premium templates",
      "Basic analytics",
      "2 collaborators per website",
    ],
  },
  {
    id: "business",
    label: "Business",
    tagline: "Grow and scale",
    positioning: "Scale with maximum directory visibility.",
    cta: "Get Started",
    features: [
      "Everything in Pro, plus:",
      "Priority based directory listing",
      "Advanced integrations",
      "Built in forms · No Limit",
      "Unlimited blog posts",
      "1 GB storage/site",
      "500 AI actions/daily",
      "Custom code, CSS & embeds",
      "SEO optimization",
      "Blog comments & moderation controls",
      "Conversion, funnel & real-time analytics",
      "10 collaborators per website",
      "Custom domains",
      "Priority support",
      "Custom Integrated Shops",
    ],
  },
];

export const getPlanListPrice = (
  planId: PlanId,
  billing: BillingCycle,
  siteCount: SiteCount,
) => {
  if (planId === "free") return 0;

  const monthlyListPrice = PLAN_PRICE_PER_WEBSITE[planId] * siteCount;

  return billing === "annual" ? monthlyListPrice * 12 : monthlyListPrice;
};

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
      EARLY_BIRD_PRICE_PER_WEBSITE[planId] *
        siteCount *
        (12 - PRICING_DISCOUNT_DISPLAY.annualFreeMonths) *
        volumeDiscountMultiplier,
    );
  }

  return Math.round(
    EARLY_BIRD_PRICE_PER_WEBSITE[planId] *
      siteCount *
      volumeDiscountMultiplier,
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
  const earlyBirdListPrice =
    planId === "free"
      ? 0
      : EARLY_BIRD_PRICE_PER_WEBSITE[planId] *
        siteCount *
        (billing === "annual" ? 12 : 1);
  const priceBeforeAnnualSavings = Math.round(
    earlyBirdListPrice * volumeDiscountMultiplier,
  );
  const price = getPlanPrice(planId, billing, siteCount);

  return {
    listPrice,
    price,
    volumeDiscountPercent,
    earlyBirdSavings: listPrice - earlyBirdListPrice,
    volumeSavings: earlyBirdListPrice - priceBeforeAnnualSavings,
    annualSavings:
      billing === "annual" ? priceBeforeAnnualSavings - price : 0,
    totalSavings: listPrice - price,
  };
};

export const getNextSiteCount = (siteCount: SiteCount, direction: -1 | 1) => {
  const currentIndex = SITE_COUNT_OPTIONS.indexOf(siteCount);
  const fallbackIndex = SITE_COUNT_OPTIONS.findIndex(
    (option) => option >= siteCount,
  );
  const startIndex =
    currentIndex >= 0
      ? currentIndex
      : Math.max(
          0,
          fallbackIndex === -1 ? SITE_COUNT_OPTIONS.length - 1 : fallbackIndex,
        );
  const nextIndex = startIndex + direction;

  return SITE_COUNT_OPTIONS[
    Math.max(0, Math.min(SITE_COUNT_OPTIONS.length - 1, nextIndex))
  ];
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
        free: false,
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
    ],
  },
  {
    category: "Forms & leads",
    rows: [
      {
        feature: "Forms",
        free: "1",
        pro: "No limit",
        business: "No limit",
      },
      {
        feature: "Form submissions",
        free: "50/month",
        pro: "No limit",
        business: "No limit",
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
        feature: "Standard price per website",
        free: "$0",
        pro: `$${PLAN_PRICE_PER_WEBSITE.pro}/month`,
        business: `$${PLAN_PRICE_PER_WEBSITE.business}/month`,
      },
      {
        feature: "Early-bird price per website",
        free: false,
        pro: `$${EARLY_BIRD_PRICE_PER_WEBSITE.pro}/month`,
        business: `$${EARLY_BIRD_PRICE_PER_WEBSITE.business}/month`,
      },
      {
        feature: "Annual billing savings",
        free: false,
        pro: `${PRICING_DISCOUNT_DISPLAY.annualFreeMonths} months free`,
        business: `${PRICING_DISCOUNT_DISPLAY.annualFreeMonths} months free`,
      },
      {
        feature: "Launch code",
        free: false,
        pro: PRICING_DISCOUNT_DISPLAY.launchCode,
        business: PRICING_DISCOUNT_DISPLAY.launchCode,
      },
      {
        feature: "Referral code",
        free: false,
        pro: REFERRAL_PROGRAM.code,
        business: REFERRAL_PROGRAM.code,
      },
      {
        feature: "Referral friend discount",
        free: false,
        pro: `${REFERRAL_PROGRAM.friendDiscountPercent}% first payment`,
        business: `${REFERRAL_PROGRAM.friendDiscountPercent}% first payment`,
      },
      {
        feature: "Referrer credit",
        free: false,
        pro: `$${REFERRAL_PROGRAM.referrerCreditAmount}`,
        business: `$${REFERRAL_PROGRAM.referrerCreditAmount}`,
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
        pro: true,
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
        free: false,
        pro: "Standard",
        business: "Enhanced",
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
