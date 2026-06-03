import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { queryKeys } from "../api/queryKeys";
import {
  useBillingDetail,
  usePaymentMethods,
  useCancelSubscription,
  useReactivateSubscription,
  useCreateSetupIntent,
} from "../api/queries/account";
import type { BillingDetails, DisplayPlan, PaymentMethod } from "../types/user";

// Display plans matching the UI design
export const DISPLAY_PLANS: DisplayPlan[] = [
  {
    code: "website_free",
    displayName: "STARTUP",
    priceMonthly: 0,
    tierLevel: 1,
  },
  {
    code: "website_core",
    displayName: "STANDARD",
    priceMonthly: 14.99,
    tierLevel: 2,
  },
  {
    code: "website_growth",
    displayName: "BUSINESS",
    priceMonthly: 29.99,
    tierLevel: 3,
  },
];

interface AddPaymentMethodParams {
  stripePaymentMethodId: string;
  setAsDefault?: boolean;
}

export interface PlanPreview {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  prorationDate?: number;
  lineItems?: Array<{
    description: string;
    amountCents: number;
    proration: boolean;
    periodStart?: number;
    periodEnd?: number;
  }>;
  estimated?: boolean;
}

export interface BillingHistoryEntry {
  id: string;
  action: string;
  planFrom: string | null;
  planTo: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BillingHistoryResponse {
  entries: BillingHistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CancelSubscriptionOptions {
  reason?: string;
  feedback?: string;
}

interface UseBillingReturn {
  billingDetails: BillingDetails | null;
  paymentMethods: PaymentMethod[];
  loading: boolean;
  paymentMethodsLoading: boolean;
  error: string | null;
  subscriptionStatus: string | null;
  cancelledAt: string | null;
  currentPeriodEnd: string | null;
  updateBillingDetails: (data: Partial<BillingDetails>) => Promise<boolean>;
  updatePlan: (planCode: string) => Promise<{
    success: boolean;
    requiresPaymentMethod?: boolean;
    useCancel?: boolean;
  }>;
  getPlanPreview: (planCode: string) => Promise<PlanPreview>;
  reactivateSubscription: () => Promise<boolean>;
  createSetupIntent: () => Promise<string | null>;
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (params: AddPaymentMethodParams) => Promise<boolean>;
  setDefaultPaymentMethod: (id: number) => Promise<boolean>;
  removePaymentMethod: (id: number) => Promise<boolean>;
  cancelSubscription: (options?: CancelSubscriptionOptions) => Promise<boolean>;
  fetchBillingHistory: (
    page?: number,
    limit?: number,
  ) => Promise<BillingHistoryResponse>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing billing details, payment methods, and plan changes.
 *
 * Phase H.account migration (2026-04-15): now backed by React Query under
 * the hood — `useBillingDetail()` + `usePaymentMethods()` replace the
 * useEffect/useState fetches, and the billing/plan-summary query cache is
 * invalidated on mutations instead of manually refetching. The public return
 * shape is unchanged so existing consumers (Settings.jsx, ChangePlanCard,
 * BillingHistoryCard, etc.) continue to work without modification.
 *
 * Operations that still go through imperative writes because they're
 * one-shot form-scoped mutations (PUT billing, PUT plan, PUT default payment
 * method, DELETE payment method, POST add payment method) now hit
 * `apiClient` and invalidate the relevant React Query keys so other
 * consumers of `useBillingDetail`/`usePaymentMethods` re-fetch automatically.
 */
export function useBilling(): UseBillingReturn {
  const queryClient = useQueryClient();

  // React Query reads
  const billingQuery = useBillingDetail();
  const paymentMethodsQuery = usePaymentMethods();

  // Mutation hooks (cache invalidation is encapsulated in these hooks)
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();
  const setupIntentMutation = useCreateSetupIntent();

  // Local mutation error state. Read errors are merged in below so consumers
  // keep reading `error` without caring about the source.
  const [mutationError, setMutationError] = useState<string | null>(null);

  const readError = useMemo(() => {
    if (billingQuery.error) {
      const err = billingQuery.error as {
        response?: { data?: { message?: string } };
      };
      return err.response?.data?.message || "Failed to fetch billing details";
    }
    if (paymentMethodsQuery.error) {
      const err = paymentMethodsQuery.error as {
        response?: { data?: { message?: string } };
      };
      return err.response?.data?.message || "Failed to fetch payment methods";
    }
    return null;
  }, [billingQuery.error, paymentMethodsQuery.error]);

  const error = mutationError ?? readError;

  // Derive fields from billing response (shape identical to prior behavior).
  const billing = billingQuery.data?.billing ?? null;
  const billingDetails = billing as BillingDetails | null;
  const subscriptionStatus =
    (billing?.subscriptionStatus as string | null | undefined) ?? null;
  const cancelledAt =
    (billing?.cancelledAt as string | null | undefined) ?? null;
  const currentPeriodEnd =
    (billing?.currentPeriodEnd as string | null | undefined) ?? null;

  const paymentMethods = (paymentMethodsQuery.data?.paymentMethods ??
    []) as unknown as PaymentMethod[];

  const fetchPaymentMethods = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.account.paymentMethods(),
    });
  }, [queryClient]);

  const updateBillingDetails = useCallback(
    async (data: Partial<BillingDetails>): Promise<boolean> => {
      try {
        setMutationError(null);
        await apiClient.put("/account/billing", data);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.billing(),
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to update billing details";
        setMutationError(errorMessage);
        return false;
      }
    },
    [queryClient],
  );

  const updatePlan = useCallback(
    async (
      planCode: string,
    ): Promise<{
      success: boolean;
      requiresPaymentMethod?: boolean;
      useCancel?: boolean;
    }> => {
      try {
        setMutationError(null);
        await apiClient.put("/account/plan", { plan: planCode });
        // Plan change ripples through billing detail + plan summary + history.
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.billing(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.planSummary(),
        });
        await queryClient.invalidateQueries({
          queryKey: ["account", "billingHistory"],
        });
        return { success: true };
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to update plan";
        const requiresPaymentMethod =
          err.response?.data?.requiresPaymentMethod || false;
        const useCancel = err.response?.data?.useCancel || false;
        setMutationError(errorMessage);
        return { success: false, requiresPaymentMethod, useCancel };
      }
    },
    [queryClient],
  );

  const getPlanPreview = useCallback(
    async (planCode: string): Promise<PlanPreview> => {
      // Imperative because callers fetch on demand with results consumed once;
      // components that want the cached form can use `usePlanPreview()` from
      // `api/queries/account.ts`.
      const response = await apiClient.get("/account/plan-preview", {
        params: { plan: planCode },
      });
      return response.data as PlanPreview;
    },
    [],
  );

  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setMutationError(null);
      await reactivateMutation.mutateAsync();
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to reactivate subscription";
      setMutationError(errorMessage);
      return false;
    }
  }, [reactivateMutation]);

  const createSetupIntent = useCallback(async (): Promise<string | null> => {
    try {
      setMutationError(null);
      const data = await setupIntentMutation.mutateAsync();
      return data.clientSecret;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to initialize card setup";
      setMutationError(errorMessage);
      return null;
    }
  }, [setupIntentMutation]);

  const addPaymentMethod = useCallback(
    async (params: AddPaymentMethodParams): Promise<boolean> => {
      try {
        setMutationError(null);
        await apiClient.post("/account/payment-methods", params);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.paymentMethods(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.billing(),
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to add payment method";
        setMutationError(errorMessage);
        return false;
      }
    },
    [queryClient],
  );

  const setDefaultPaymentMethod = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setMutationError(null);
        await apiClient.put(`/account/payment-methods/${id}/default`);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.paymentMethods(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.billing(),
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to set default payment method";
        setMutationError(errorMessage);
        return false;
      }
    },
    [queryClient],
  );

  const removePaymentMethod = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setMutationError(null);
        await apiClient.delete(`/account/payment-methods/${id}`);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.paymentMethods(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.account.billing(),
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to remove payment method";
        setMutationError(errorMessage);
        return false;
      }
    },
    [queryClient],
  );

  const cancelSubscription = useCallback(
    async (options?: CancelSubscriptionOptions): Promise<boolean> => {
      try {
        setMutationError(null);
        await cancelMutation.mutateAsync(options ?? {});
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to cancel subscription";
        setMutationError(errorMessage);
        return false;
      }
    },
    [cancelMutation],
  );

  const fetchBillingHistory = useCallback(
    async (page = 1, limit = 20): Promise<BillingHistoryResponse> => {
      // Imperative because BillingHistoryCard passes this as a prop and
      // drives its own pagination state. The dedicated
      // `useBillingHistory({ page, limit })` hook is available for consumers
      // that want the cached form.
      const response = await apiClient.get("/account/billing-history", {
        params: { page, limit },
      });
      return response.data as BillingHistoryResponse;
    },
    [],
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.account.billing() }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.paymentMethods(),
      }),
    ]);
  }, [queryClient]);

  return {
    billingDetails,
    paymentMethods,
    loading: billingQuery.isPending,
    paymentMethodsLoading: paymentMethodsQuery.isPending,
    error,
    subscriptionStatus,
    cancelledAt,
    currentPeriodEnd,
    updateBillingDetails,
    updatePlan,
    getPlanPreview,
    reactivateSubscription,
    createSetupIntent,
    fetchPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    cancelSubscription,
    fetchBillingHistory,
    refetch,
  };
}
