import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys } from "../queryKeys";
import { useAuthMe } from "./auth";

/**
 * Analytics & insights React Query hooks.
 *
 * Backend routes (see backend/controllers/analyticsController.js and
 * backend/routes/websiteRoutes.js + insightRoutes.js):
 *   GET /api/analytics/engagement?period=&startDate=&endDate=&page=
 *   GET /api/analytics/realtime-advanced                 (polling, every 15s)
 *   GET /api/analytics/conversions?period=&startDate=&endDate=
 *   GET /api/analytics/funnel?period=&startDate=&endDate=
 *   GET /api/analytics/web-vitals?period=&startDate=&endDate=&page=
 *   GET /api/analytics/events?limit=&page=
 *   GET /api/websites/:id/analytics/summary
 *   GET /api/insights/public?page=&limit=&sortBy=&sortOrder=&category=&search=
 *   GET /api/insights/public/:id
 *   GET /api/insights/categories
 *
 * All responses follow the standard `{ data: ... }` envelope for dashboard
 * analytics endpoints; `/insights/*` returns the payload at the root of
 * `response.data`. Each hook preserves the exact response projection the
 * previous direct-axios consumer used so existing component code keeps working.
 */

type TimePeriodParams = {
  period?: string;
  startDate?: string;
  endDate?: string;
};

type PageScopedParams = TimePeriodParams & {
  page?: string;
};

type EventsParams = {
  limit?: number;
  page?: string;
};

/* --------------------------------------------------------------------- */
/* Types                                                                  */
/* --------------------------------------------------------------------- */

export type EngagementResponse = {
  scrollDepth?: { avg?: number };
  rageClicks?: number;
  pageEngagement?: Array<{
    page: string;
    avgSessionDuration?: number;
    exitRate?: number | string;
    views?: number;
  }>;
  [key: string]: unknown;
};

export type RealTimeAnalyticsResponse = {
  activeUsers?: number;
  currentPaths?: Array<{ path: string; users: number }>;
  liveGeo?: Array<{ city: string; country: string; users: number }>;
  [key: string]: unknown;
};

export type ConversionMetricsResponse = {
  totalLeads?: { value: number; change: number };
  formSubmissions?: { value: number; change: number };
  ctaClicks?: { value: number; change: number };
  conversionRate?: { value: number; change: number };
  [key: string]: unknown;
};

export type FunnelResponse = {
  stages?: Record<string, { users?: number; dropoff?: number }>;
  [key: string]: unknown;
};

export type WebVitalsResponse = {
  lcp?: { value: number; rating: string; threshold: number };
  fid?: { value: number; rating: string; threshold: number };
  cls?: { value: number; rating: string; threshold: number };
  pageSpeed?: { mobile: number; desktop: number };
  [key: string]: unknown;
};

export type EventsResponse = {
  events?: Array<{
    id?: string | number;
    type?: string;
    page?: string;
    count?: number;
    timestamp?: string;
  }>;
  [key: string]: unknown;
};

export type WebsiteAnalyticsSummaryResponse = {
  totalPageViews: number;
  totalCtaClicks: number;
  pageViewsByPath: Array<{ path: string; count: number }>;
  pageViewsByDay: Array<{ date: string; count: number }>;
  ctaClicksByDay: Array<{ date: string; count: number }>;
  [key: string]: unknown;
};

export type InsightItem = {
  id?: string | number;
  slug?: string;
  legacyId?: string | number;
  title?: string;
  heading?: string;
  content?: string;
  description?: string;
  category?: string;
  image?: string;
  publishedAt?: string;
  [key: string]: unknown;
};

export type InsightsListResponse = {
  insights?: InsightItem[];
  blogs?: InsightItem[];
  pagination?: { totalPages?: number; page?: number; limit?: number };
  [key: string]: unknown;
};

export type InsightDetailResponse = {
  insight?: InsightItem;
  blog?: InsightItem;
  [key: string]: unknown;
};

export type InsightsCategoriesResponse = {
  categories?: Array<{ id?: string | number; name: string; slug?: string }>;
  [key: string]: unknown;
};

export type InsightsListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string | null;
  search?: string;
};

/* --------------------------------------------------------------------- */
/* Helpers                                                                */
/* --------------------------------------------------------------------- */

/**
 * Build a clean params object by dropping empty/undefined/null values. Keeps
 * generated URLs stable for the query cache key and avoids the backend seeing
 * `?category=&search=` noise.
 */
function cleanParams<T extends Record<string, unknown>>(
  input: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    out[key] = value;
  }
  return out;
}

/* --------------------------------------------------------------------- */
/* Dashboard analytics hooks                                              */
/* --------------------------------------------------------------------- */

/**
 * `GET /api/analytics/engagement`. Used by EngagementTracking and (for page
 * discovery) PageSelector. Scoped by period/date range/optional page filter.
 */
export function useEngagementAnalytics(params: PageScopedParams = {}) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params);

  return useQuery<EngagementResponse>({
    queryKey: ["analytics", "engagement", "global", cleaned] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/analytics/engagement", {
        params: cleaned,
        signal,
      });
      return response.data?.data ?? {};
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/analytics/realtime-advanced`. Live user panel. Polls every 15s
 * while the tab is foregrounded so the dashboard stays reasonably fresh
 * without hammering the backend from hidden tabs.
 */
export function useRealtimeAnalytics() {
  const { data: user } = useAuthMe();

  return useQuery<RealTimeAnalyticsResponse>({
    queryKey: ["analytics", "realtime", "global"] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/analytics/realtime-advanced", {
        signal,
      });
      return response.data?.data ?? {};
    },
    enabled: !!user,
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

/**
 * `GET /api/analytics/conversions`. Lead / submission / CTA / rate KPIs for
 * ConversionMetrics.
 */
export function useConversionMetrics(params: TimePeriodParams = {}) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params);

  return useQuery<ConversionMetricsResponse>({
    queryKey: queryKeys.analytics.conversions(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/analytics/conversions", {
        params: cleaned,
        signal,
      });
      return response.data?.data ?? {};
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/analytics/funnel`. Stage-by-stage user journey counts used by
 * UserJourneyFunnel.
 */
export function useFunnelAnalytics(params: TimePeriodParams = {}) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params);

  return useQuery<FunnelResponse>({
    queryKey: queryKeys.analytics.funnel(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/analytics/funnel", {
        params: cleaned,
        signal,
      });
      return response.data?.data ?? {};
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/analytics/web-vitals`. Core Web Vitals (LCP/FID/CLS) + PageSpeed
 * mobile/desktop scores for CoreWebVitals.
 */
export function useWebVitals(params: PageScopedParams = {}) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params);

  return useQuery<WebVitalsResponse>({
    queryKey: queryKeys.analytics.webVitals(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/analytics/web-vitals", {
        params: cleaned,
        signal,
      });
      return response.data?.data ?? {};
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/analytics/events`. Recent event feed for EventTimeline. Uses a
 * 60s poll cadence — this is a live feed, but not as hot as realtime.
 */
export function useAnalyticsEvents(params: EventsParams = {}) {
  const { data: user } = useAuthMe();
  const cleaned = cleanParams(params);

  return useQuery<EventsResponse>({
    queryKey: queryKeys.analytics.events(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/analytics/events", {
        params: cleaned,
        signal,
      });
      return response.data?.data ?? {};
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

/**
 * `GET /api/websites/:id/analytics/summary`. Per-website 30-day summary
 * consumed by WebsiteAnalytics. Disabled until `websiteId` is provided so the
 * hook is safe to mount before a website is selected.
 */
export function useWebsiteAnalyticsSummary(
  websiteId: number | string | null | undefined,
) {
  const { data: user } = useAuthMe();

  return useQuery<WebsiteAnalyticsSummaryResponse>({
    queryKey: queryKeys.analytics.websiteSummary(websiteId ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(
        `/websites/${websiteId}/analytics/summary`,
        {
          signal,
        },
      );
      return response.data?.data ?? response.data ?? {};
    },
    enabled: !!user && !!websiteId,
    staleTime: 60_000,
  });
}

/* --------------------------------------------------------------------- */
/* Public insights hooks                                                  */
/* --------------------------------------------------------------------- */

/**
 * `GET /api/insights/public`. Paginated list of published insights. Used by
 * the public Insights page (`InsightCardsLayout`). Does NOT require auth.
 */
export function useInsights(params: InsightsListParams = {}) {
  const cleaned = cleanParams({
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    category: params.category,
    search: params.search,
  });

  return useQuery<InsightsListResponse>({
    queryKey: queryKeys.insights.publicList(cleaned),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/insights/public", {
        params: cleaned,
        signal,
      });
      return response.data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * `GET /api/insights/public/:id`. Single insight by id or slug for the public
 * blog detail page.
 */
export function useInsightDetail(id: string | number | null | undefined) {
  return useQuery<InsightDetailResponse>({
    queryKey: queryKeys.insights.publicDetail(id ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/insights/public/${id}`, {
        signal,
      });
      return response.data;
    },
    enabled: !!id,
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * `GET /api/insights/categories`. Category chips for the public insights page.
 * Cached a bit longer — categories change rarely.
 */
export function useInsightsCategories(options?: { enabled?: boolean }) {
  return useQuery<InsightsCategoriesResponse>({
    queryKey: queryKeys.insights.categories(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/insights/categories", { signal });
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
