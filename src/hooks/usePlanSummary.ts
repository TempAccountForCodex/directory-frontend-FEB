import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api";

export interface WebsitePlan {
  code: string;
  name: string;
  priceMonthlyUsd: number;
  maxSites: number;
  maxPagesPerSite: number;
  maxBlocksPerPage: number;
  analyticsLevel: string;
  listedInDirectory: boolean;
}

export interface WebsiteUsage {
  websitesOwned: number;
  pagesByWebsiteId: { [websiteId: string]: number };
  blocksByPageId: { [pageId: string]: number };
}

export interface StorePlan {
  code: string | null;
  name: string | null;
  priceMonthlyUsd: number | null;
  maxStores: number | null;
  maxProductsPerStore: number | null;
  platformFeePercent: number | null;
  analyticsLevel: string | null;
}

export interface StoreUsage {
  storesOwned: number | null;
  productsByStoreId: { [storeId: string]: number } | null;
}

export interface PlanSummary {
  websitePlan: WebsitePlan;
  websiteUsage: WebsiteUsage;
  storePlan: StorePlan;
  storeUsage: StoreUsage;
}

interface UsePlanSummaryReturn {
  planSummary: PlanSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing the current user's plan summary
 *
 * Fetches plan limits and current usage for both website and store plans.
 * Automatically fetches on mount and provides a refetch function for manual refresh.
 *
 * @returns {UsePlanSummaryReturn} Object containing planSummary, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { planSummary, loading, error, refetch } = usePlanSummary();
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <h2>{planSummary.websitePlan.name}</h2>
 *     <p>Websites: {planSummary.websiteUsage.websitesOwned} / {planSummary.websitePlan.maxSites}</p>
 *     <button onClick={refetch}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export function usePlanSummary(): UsePlanSummaryReturn {
  const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/billing/plan-summary`);

      setPlanSummary(response.data.planSummary);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch plan summary";
      setError(errorMessage);
      console.error("Failed to fetch plan summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch plan summary on mount
  useEffect(() => {
    fetchPlanSummary();
  }, [fetchPlanSummary]);

  return {
    planSummary,
    loading,
    error,
    refetch: fetchPlanSummary,
  };
}
