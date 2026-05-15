import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys } from "../queryKeys";

/**
 * Public promo React Query hooks.
 *
 * Backend route:
 *   GET /api/promo/active
 *
 * This endpoint is PUBLIC (no auth required) so the hook is NOT gated on
 * `useAuthMe()`. The active-deal banner shows to every visitor, so a single
 * cache entry serves every consumer. We use `staleTime: 10min` and
 * `gcTime: 30min` because promo deals change infrequently — the prior ad-hoc
 * `sessionStorage` cache in Dashboard.jsx used a 5-minute window, and we want
 * to be at least as aggressive now that React Query replaces it.
 *
 * Failures are non-fatal (the banner simply doesn't render) so we suppress
 * retries: one failed request on mount should not kick off a retry storm.
 */

export type ActiveDeal = {
  id: number | string;
  title: string;
  description?: string;
  discountPercentage?: number;
  [key: string]: unknown;
};

export type ActivePromoResponse = {
  deals?: ActiveDeal[];
};

/**
 * React Query hook for `GET /api/promo/active`.
 *
 * Backs the DealBanner on the Dashboard. The response envelope is
 * `{ deals: [...] }`; the first entry is the banner we show. This hook
 * returns the raw response so consumers can pick the first deal themselves —
 * keeps the hook reusable if future surfaces want to iterate deals.
 */
export function useActivePromo() {
  return useQuery<ActivePromoResponse>({
    queryKey: queryKeys.promo.active(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/promo/active", { signal });
      return response.data;
    },
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}
