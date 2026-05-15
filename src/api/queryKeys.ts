/**
 * Central query-key factory. All `useQuery` and `invalidateQueries` callers
 * import from here — never construct arrays inline, never use string literals.
 * Hierarchy implies invalidation scope: invalidating `['websites']` invalidates
 * everything under `['websites', ...]`.
 */

export type WebsiteListParams = {
  page?: number;
  limit?: number;
  search?: string;
  deleted?: boolean;
};

export type TemplateFilters = {
  search?: string;
  category?: string;
  type?: string;
  page?: number;
  limit?: number;
};

export type AuditLogFilters = {
  limit?: number;
  offset?: number;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const queryKeys = {
  auth: {
    all: () => ["auth"] as const,
    me: () => ["auth", "me"] as const,
    superAdmin: () => ["auth", "superAdmin"] as const,
  },
  websites: {
    all: () => ["websites"] as const,
    list: (params?: WebsiteListParams) =>
      ["websites", "list", params ?? {}] as const,
    stats: () => ["websites", "stats"] as const,
    detail: (id: number | string) => ["websites", "detail", id] as const,
    pages: (id: number | string) =>
      ["websites", "detail", id, "pages"] as const,
    pageDetail: (id: number | string, pageId: number | string) =>
      ["websites", "detail", id, "pages", pageId] as const,
    blocks: (id: number | string, pageId: number | string) =>
      ["websites", "detail", id, "pages", pageId, "blocks"] as const,
    approval: (id: number | string) =>
      ["websites", "detail", id, "approval"] as const,
    sectionLocks: (id: number | string) =>
      ["websites", "detail", id, "sectionLocks"] as const,
    collaborators: (id: number | string) =>
      ["websites", "detail", id, "collaborators"] as const,
    activity: (id: number | string) =>
      ["websites", "detail", id, "activity"] as const,
    analytics: (id: number | string) =>
      ["websites", "detail", id, "analytics"] as const,
  },
  stores: {
    all: () => ["stores"] as const,
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      ["stores", "list", params ?? {}] as const,
    detail: (id: number | string) => ["stores", "detail", id] as const,
    products: (id: number | string) =>
      ["stores", "detail", id, "products"] as const,
    orders: (id: number | string) =>
      ["stores", "detail", id, "orders"] as const,
  },
  templates: {
    all: () => ["templates"] as const,
    list: (filters?: TemplateFilters) =>
      ["templates", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["templates", "detail", id] as const,
    favorites: () => ["templates", "favorites"] as const,
    history: (id: string | number) =>
      ["templates", "detail", id, "history"] as const,
  },
  account: {
    all: () => ["account"] as const,
    billing: () => ["account", "billing"] as const,
    billingHistory: (params?: { page?: number; limit?: number }) =>
      ["account", "billingHistory", params ?? {}] as const,
    paymentMethods: () => ["account", "paymentMethods"] as const,
    planSummary: () => ["account", "planSummary"] as const,
    planPreview: (planCode: string) =>
      ["account", "planPreview", planCode] as const,
    loginHistory: () => ["account", "loginHistory"] as const,
    delegated: () => ["account", "delegated"] as const,
    delegates: () => ["account", "delegates"] as const,
    delegateInvitesPending: () =>
      ["account", "delegateInvitesPending"] as const,
    invitesPending: () => ["account", "invitesPending"] as const,
  },
  onboarding: {
    all: () => ["onboarding"] as const,
    status: () => ["onboarding", "status"] as const,
    tours: () => ["onboarding", "tours"] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  domains: {
    all: () => ["domains"] as const,
    list: (websiteId: number | string) => ["domains", websiteId] as const,
    subdomainCheck: (subdomain: string) =>
      ["domains", "subdomainCheck", subdomain] as const,
  },
  analytics: {
    all: () => ["analytics"] as const,
    engagement: (
      websiteId: number | string,
      params?: Record<string, unknown>,
    ) => ["analytics", "engagement", websiteId, params ?? {}] as const,
    realtime: (websiteId: number | string) =>
      ["analytics", "realtime", websiteId] as const,
    conversions: (params?: Record<string, unknown>) =>
      ["analytics", "conversions", params ?? {}] as const,
    funnel: (params?: Record<string, unknown>) =>
      ["analytics", "funnel", params ?? {}] as const,
    webVitals: (params?: Record<string, unknown>) =>
      ["analytics", "web-vitals", params ?? {}] as const,
    events: (params?: Record<string, unknown>) =>
      ["analytics", "events", params ?? {}] as const,
    websiteSummary: (websiteId: number | string) =>
      ["analytics", "website-summary", websiteId] as const,
  },
  insights: {
    all: () => ["insights"] as const,
    publicList: (params?: Record<string, unknown>) =>
      ["insights", "publicList", params ?? {}] as const,
    publicDetail: (id: string | number) =>
      ["insights", "publicDetail", id] as const,
    categories: () => ["insights", "categories"] as const,
  },
  content: {
    listings: (params?: Record<string, unknown>) =>
      ["content", "listings", params ?? {}] as const,
    listing: (id: number | string) => ["content", "listing", id] as const,
    reviews: (listingId: number | string) =>
      ["content", "reviews", listingId] as const,
    comments: (listingId: number | string) =>
      ["content", "comments", listingId] as const,
    favourites: () => ["content", "favourites"] as const,
  },
  ai: {
    usage: () => ["ai", "usage"] as const,
  },
  docs: {
    all: () => ["docs"] as const,
  },
  promo: {
    active: () => ["promo", "active"] as const,
  },
  previews: {
    token: (websiteId: number | string, pageId: number | string) =>
      ["previews", "token", websiteId, pageId] as const,
  },
  infrastructure: {
    health: () => ["infrastructure", "health"] as const,
    metricsHistory: () => ["infrastructure", "metricsHistory"] as const,
  },
  audit: {
    all: () => ["audit"] as const,
    logs: (filters?: AuditLogFilters) =>
      ["audit", "logs", filters ?? {}] as const,
  },
  admin: {
    all: () => ["admin"] as const,
    users: {
      all: () => ["admin", "users"] as const,
      list: (params?: Record<string, unknown>) =>
        ["admin", "users", "list", params ?? {}] as const,
      stats: () => ["admin", "users", "stats"] as const,
      detail: (id: number | string) =>
        ["admin", "users", "detail", id] as const,
      billingHistory: (id: number | string) =>
        ["admin", "users", "detail", id, "billingHistory"] as const,
    },
    broadcasts: {
      all: () => ["admin", "broadcasts"] as const,
      list: (params?: Record<string, unknown>) =>
        ["admin", "broadcasts", "list", params ?? {}] as const,
      previewCount: (params?: Record<string, unknown>) =>
        ["admin", "broadcasts", "previewCount", params ?? {}] as const,
    },
    finances: {
      all: () => ["admin", "finances"] as const,
      metrics: () => ["admin", "finances", "metrics"] as const,
      revenue: (params?: Record<string, unknown>) =>
        ["admin", "finances", "revenue", params ?? {}] as const,
      subscriptions: (params?: Record<string, unknown>) =>
        ["admin", "finances", "subscriptions", params ?? {}] as const,
      transactions: (params?: Record<string, unknown>) =>
        ["admin", "finances", "transactions", params ?? {}] as const,
    },
    referrals: {
      all: () => ["admin", "referrals"] as const,
      analytics: (period?: string) =>
        ["admin", "referrals", "analytics", period ?? "all"] as const,
    },
  },
} as const;

export type QueryKeys = typeof queryKeys;
