import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys } from "../queryKeys";
import { useAuthMe } from "./auth";

/**
 * Shape of `GET /api/account/delegated-accounts` — list of accounts the
 * current user can delegate into. Matches `DelegatedAccount` in AccountContext,
 * but we decode it loosely here so the query hook doesn't take a compile-time
 * dependency on AccountContext (which consumes this hook).
 */
export type DelegatedAccountsResponse = {
  accounts: Array<{
    id: number;
    ownerUser: { id: number; name: string; email: string };
    role: string;
    serviceScopes: string[];
  }>;
};

/**
 * Shape of `GET /api/account/account-invites/pending` — pending invites where
 * the current user has been invited to become a delegate for someone else's
 * account. See AccountInvitesPage for the full consumer contract.
 */
export type AccountInvitesPendingResponse = {
  invites: Array<{
    id: number;
    ownerUserId: number;
    ownerName?: string;
    ownerEmail?: string;
    role: string;
    serviceScopes: string[];
    status: string;
    token: string;
    expiresAt: string;
    createdAt: string;
  }>;
};

/**
 * List of accounts that have delegated access to the current user.
 *
 * Opts in to `refetchOnWindowFocus: 'always'` to replace the manual
 * `visibilitychange` listener AccountContext used to maintain. The `'always'`
 * variant matches the prior behavior — unconditional refetch on tab focus —
 * whereas plain `true` would skip the call while the query is still fresh.
 * React Query still de-duplicates focus events within a single tick, so this
 * is safer than the previous manual handler.
 *
 * Gated on `useAuthMe().data` — matches the prior `useEffect([user])` gating
 * so the query doesn't fire for signed-out users.
 */
export function useDelegatedAccounts() {
  const { data: user } = useAuthMe();

  return useQuery<DelegatedAccountsResponse>({
    queryKey: queryKeys.account.delegated(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/delegated-accounts", {
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: "always",
  });
}

/**
 * Pending account delegation invites for the current user.
 * Used by Dashboard (sidebar badge count) and AccountInvitesPage (full list).
 */
export function useAccountInvitesPending() {
  const { data: user } = useAuthMe();

  return useQuery<AccountInvitesPendingResponse>({
    queryKey: queryKeys.account.invitesPending(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/account-invites/pending", {
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * Accept an account delegation invite by token.
 *
 * Endpoint path verified from AccountInvitesPage.jsx:
 *   `POST /api/account/delegates/invite/:token/accept`
 *
 * On success, invalidates:
 *   - invitesPending (the accepted invite disappears from the list)
 *   - delegated (a new delegation relationship now exists)
 *   - websites (the new delegation may grant access to additional websites)
 */
export function useAcceptAccountInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post(
        `/account/delegates/invite/${token}/accept`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.invitesPending(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.delegated(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() });
    },
  });
}

/**
 * Decline an account delegation invite by token.
 *
 * Endpoint path verified from AccountInvitesPage.jsx:
 *   `POST /api/account/delegates/invite/:token/decline`
 *
 * On success, invalidates the pending-invites list so the declined invite
 * disappears from the Dashboard badge and AccountInvitesPage.
 */
export function useRejectAccountInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post(
        `/account/delegates/invite/${token}/decline`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.invitesPending(),
      });
    },
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Phase H.account — Billing, payment methods, plan summary/preview, history
// ═════════════════════════════════════════════════════════════════════════════
//
// The hooks below migrate the remaining `/api/account/*` surface (plus the
// legacy `/api/billing/plan-summary` route) used by useBilling.ts,
// usePlanSummary.ts, Settings.jsx, AccountDelegateInviteModal.jsx, and
// LoginHistoryCard.jsx. All reads are gated on `useAuthMe().data` so queries
// don't fire for signed-out users — matches the prior ad-hoc useEffect gating.

/**
 * Loose response shapes. We decode at the edge (see consumers) rather than
 * importing the richer `BillingDetails`/`PaymentMethod` types here to keep
 * this module free of UI-layer dependencies.
 */
export type BillingDetailResponse = {
  billing: {
    currentPlan?: string | null;
    subscriptionStatus?: string | null;
    cancelledAt?: string | null;
    currentPeriodEnd?: string | null;
    [key: string]: unknown;
  } | null;
};

export type PaymentMethodsResponse = {
  paymentMethods: Array<Record<string, unknown>>;
};

export type PlanPreviewResponse = {
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
};

export type BillingHistoryResponse = {
  entries: Array<{
    id: string;
    action: string;
    planFrom: string | null;
    planTo: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type LoginHistoryParams = { page?: number; limit?: number };

export type LoginHistoryResponse = {
  loginHistory: Array<{
    id: string | number;
    loginType: string;
    ipAddress?: string;
    browser?: string;
    os?: string;
    createdAt: string;
  }>;
  pagination?: { totalCount?: number };
};

export type PlanSummaryResponse = {
  planSummary: {
    websitePlan: Record<string, unknown>;
    websiteUsage: Record<string, unknown>;
    storePlan: Record<string, unknown>;
    storeUsage: Record<string, unknown>;
  };
};

/**
 * `GET /api/account/billing` — current user's billing details (plan code,
 * billing address, subscription lifecycle). Moderate staleTime since billing
 * details rarely change; mutations invalidate explicitly.
 */
export function useBillingDetail() {
  const { data: user } = useAuthMe();

  return useQuery<BillingDetailResponse>({
    queryKey: queryKeys.account.billing(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/billing", { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/account/payment-methods` — user's saved Stripe payment methods.
 */
export function usePaymentMethods() {
  const { data: user } = useAuthMe();

  return useQuery<PaymentMethodsResponse>({
    queryKey: queryKeys.account.paymentMethods(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/payment-methods", {
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/billing/plan-summary` — current plan limits and usage. Endpoint
 * lives under `/billing/*` (see backend/routes/planRoutes.js), but cached
 * under the `account` bucket because consumers (useFeatureGate, Settings,
 * Stores) treat it as account-scoped state.
 */
export function usePlanSummaryQuery() {
  const { data: user } = useAuthMe();

  return useQuery<PlanSummaryResponse>({
    queryKey: queryKeys.account.planSummary(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/billing/plan-summary", { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/account/plan-preview?plan={planCode}` — proration preview for a
 * pending plan change. Disabled until `planCode` is truthy so opening the
 * BillingPreview dialog without a selection doesn't hit the API.
 *
 * Note: backend uses `plan` as the query param (not `planCode`), confirmed
 * in useBilling.ts:207 and BillingPreview.jsx.
 */
export function usePlanPreview(planCode: string | null | undefined) {
  const { data: user } = useAuthMe();

  return useQuery<PlanPreviewResponse>({
    queryKey: queryKeys.account.planPreview(planCode ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/plan-preview", {
        params: { plan: planCode },
        signal,
      });
      return response.data;
    },
    enabled: !!user && !!planCode,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/account/billing-history?page=&limit=` — paginated audit of plan
 * changes. `params` is part of the query key so each page caches separately.
 */
export function useBillingHistory(
  params: { page?: number; limit?: number } = {},
) {
  const { data: user } = useAuthMe();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery<BillingHistoryResponse>({
    queryKey: queryKeys.account.billingHistory({ page, limit }),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/billing-history", {
        params: { page, limit },
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/account/login-history?page=&limit=` — recent login entries.
 * Longer staleTime (5min) since login history rarely changes within a
 * single session.
 */
export function useLoginHistory(params: LoginHistoryParams = {}) {
  const { data: user } = useAuthMe();
  const page = params.page ?? 1;
  const limit = params.limit ?? 5;

  return useQuery<LoginHistoryResponse>({
    queryKey: [...queryKeys.account.loginHistory(), { page, limit }] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/login-history", {
        params: { page, limit },
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}

/**
 * `GET /api/account/delegates` — delegates the current owner has invited.
 * Separate from `useDelegatedAccounts()` (Phase D) which lists accounts the
 * user can act on behalf of — opposite direction of the delegation graph.
 */
export type DelegatesResponse = {
  delegates: Array<{
    id: number;
    delegateUserId: number;
    role: string;
    serviceScopes: string[];
    createdAt: string;
    delegateUser: { id: number; name: string; email: string };
  }>;
};

export function useDelegates() {
  const { data: user } = useAuthMe();

  return useQuery<DelegatesResponse>({
    queryKey: queryKeys.account.delegates(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/account/delegates", { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/account/delegates/invites/pending` — pending *outbound* invites
 * the current owner has sent (distinct from `useAccountInvitesPending()` in
 * Phase D which returns inbound invites to the current user).
 */
export type DelegateInvitesPendingResponse = {
  invites: Array<{
    id: number;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
};

export function useDelegateInvitesPending() {
  const { data: user } = useAuthMe();

  return useQuery<DelegateInvitesPendingResponse>({
    queryKey: queryKeys.account.delegateInvitesPending(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(
        "/account/delegates/invites/pending",
        { signal },
      );
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `POST /api/account/delegates/invite` — send a delegation invite.
 * Invalidates both `delegates` and `delegateInvitesPending` since a new
 * invite could be auto-accepted (user already exists) or remain pending.
 */
export type InviteDelegatePayload = {
  email: string;
  role: string;
  serviceScopes?: string[];
};

export function useInviteDelegate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InviteDelegatePayload) => {
      const response = await apiClient.post(
        "/account/delegates/invite",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.delegates(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.delegateInvitesPending(),
      });
    },
  });
}

/**
 * `DELETE /api/account/delegates/:id` — revoke an existing delegation.
 */
export function useDeleteDelegate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/account/delegates/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.delegates(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.delegateInvitesPending(),
      });
    },
  });
}

/**
 * `POST /api/account/cancel-subscription` — start the cancellation flow.
 * Optional `reason`/`feedback` captured for retention analytics. Invalidates
 * billing detail + plan summary since both reflect subscription status.
 */
export type CancelSubscriptionPayload = {
  reason?: string;
  feedback?: string;
};

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: CancelSubscriptionPayload = {}) => {
      const body: Record<string, string> = {};
      if (options.reason) body.reason = options.reason;
      if (options.feedback) body.feedback = options.feedback;
      const response = await apiClient.post(
        "/account/cancel-subscription",
        body,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account.billing() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.planSummary(),
      });
    },
  });
}

/**
 * `POST /api/account/reactivate-subscription` — undo a pending cancellation.
 */
export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/account/reactivate-subscription");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account.billing() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.planSummary(),
      });
    },
  });
}

/**
 * `POST /api/account/setup-intent` — create a Stripe SetupIntent for adding
 * a card. No cache to update: the returned `clientSecret` is consumed once
 * by Stripe.js and saved payment methods are refetched post-confirmation.
 */
export function useCreateSetupIntent() {
  return useMutation<{ clientSecret: string }, unknown, void>({
    mutationFn: async () => {
      const response = await apiClient.post("/account/setup-intent");
      return response.data;
    },
  });
}
