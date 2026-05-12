import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';
import { useAuthMe } from './auth';

/**
 * Admin React Query hooks — gate-kept endpoints under `/api/admin/*` plus the
 * admin-only areas of `/api/users/*` (super-admin user CRUD) and
 * `/api/referral/admin/*` (referral program analytics).
 *
 * Every hook is gated on `useAuthMe()` so unauthenticated renders never fire
 * requests. Mutations invalidate the relevant list + detail keys on success so
 * the dashboards update without manual refetches from consumer components.
 *
 * Phase H.admin — migrates UserManagement, Communications, Finances, and
 * ReferralAnalytics off raw `axios` calls.
 *
 * Endpoint map (backend mount points in app.js):
 *   /api/users               → userRoutes (admin-surface user CRUD)
 *   /api/admin (adminBillingRoutes) → plan-override, credits, invoices/refund
 *   /api/admin/finances      → financeRoutes
 *   /api/admin/broadcasts    → broadcastRoutes
 *   /api/referral/admin      → referralRoutes (admin analytics + code toggle)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminUserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  blocked?: string;
};

export type AdminUsersListResponse = {
  users?: Array<Record<string, unknown>>;
  pagination?: { total?: number; totalPages?: number; page?: number; limit?: number };
};

export type AdminUserStatsResponse = {
  total?: number;
  admins?: number;
  contentCreators?: number;
  blocked?: number;
  trends?: {
    total?: number | null;
    admins?: number | null;
    contentCreators?: number | null;
    blocked?: number | null;
  };
};

export type AdminUserBillingHistoryResponse = {
  data?: {
    user?: Record<string, unknown>;
    planOverrides?: Array<Record<string, unknown>>;
    recentInvoices?: Array<Record<string, unknown>>;
    consentLedger?: Array<Record<string, unknown>>;
  };
};

export type ApplyPlanOverridePayload = {
  userId: number | string;
  planCode: string;
  reason: string;
  expiresAt?: string | null;
};

export type GrantCreditsPayload = {
  userId: number | string;
  amountCents: number;
  reason: string;
};

export type RefundInvoicePayload = {
  invoiceId: number | string;
  reason: string;
  isFull: boolean;
  amountCents?: number;
};

export type AdminUserFormPayload = {
  id?: number | string;
  formData: FormData;
};

export type AdminBroadcastListParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export type AdminBroadcastListResponse = {
  broadcasts?: Array<Record<string, unknown>>;
  pagination?: { total?: number; page?: number; limit?: number };
};

export type BroadcastPreviewCountParams = {
  targetType: string;
  targetValue?: string;
};

export type BroadcastPreviewCountResponse = {
  count?: number;
};

export type CreateBroadcastPayload = {
  title: string;
  message: string;
  targetType: string;
  targetValue?: string | null;
  channels: string[];
  link?: string | null;
  scheduledAt?: string | null;
};

export type CreateBroadcastResponse = {
  broadcast?: { id: number | string } & Record<string, unknown>;
};

export type AdminFinancesMetricsResponse = {
  data?: Record<string, unknown>;
};

export type AdminFinancesRevenueParams = {
  period?: string;
};

export type AdminFinancesRevenueResponse = {
  data?: {
    byPlan?: Array<{ planCode: string; planName: string; revenueCents: number }>;
    mrrTrend?: Array<{ month: string; mrrCents: number }>;
  };
};

export type AdminFinancesSubscriptionsParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export type AdminFinancesSubscriptionsResponse = {
  data?: {
    subscriptions?: Array<Record<string, unknown>>;
    total?: number;
  };
};

export type AdminFinancesTransactionsParams = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type AdminFinancesTransactionsResponse = {
  data?: {
    transactions?: Array<Record<string, unknown>>;
    total?: number;
  };
};

export type AdminFinancesExportPayload = {
  reportType: 'invoices' | 'revenue' | 'tax' | string;
  format: 'csv' | 'json';
  startDate?: string;
  endDate?: string;
};

export type AdminFinancesExportResult = {
  content: string;
  format: 'csv' | 'json';
  reportType: string;
};

export type ReferralAnalyticsResponse = {
  funnel?: { CLICK?: number; SIGNUP?: number; CONVERSION?: number };
  creditLiabilityCents?: number;
  topReferrers?: Array<Record<string, unknown>>;
  rewardLedger?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type UpdateReferralCodePayload = {
  codeId: number | string;
  flagged?: boolean;
  isActive?: boolean;
};

// ---------------------------------------------------------------------------
// Admin user management (/api/users + /api/admin/users/*)
// ---------------------------------------------------------------------------

/**
 * `GET /api/users` — paginated admin user list with search/role/blocked filters.
 *
 * Routed through userRoutes (mounted at `/api/users`); the page that consumes
 * it — UserManagement — is admin-gated via router guards, so this hook is also
 * auth-gated to keep unauthenticated renders from firing the request.
 */
export function useAdminUsers(params?: AdminUserListParams) {
  const { data: user } = useAuthMe();

  return useQuery<AdminUsersListResponse>({
    queryKey: queryKeys.admin.users.list(params as Record<string, unknown> | undefined),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/users', { params, signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/users/stats` — aggregate counts + trend deltas for the four user
 * role buckets (total, admins, content creators, blocked).
 */
export function useAdminUserStats() {
  const { data: user } = useAuthMe();

  return useQuery<AdminUserStatsResponse>({
    queryKey: queryKeys.admin.users.stats(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/users/stats', { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/admin/users/:id/billing-history` — plan overrides + invoices +
 * consent ledger for a single user, rendered inside the billing tab of the
 * user edit dialog. Disabled until a `userId` is provided.
 */
export function useAdminUserBillingHistory(userId: number | string | null | undefined) {
  const { data: user } = useAuthMe();

  return useQuery<AdminUserBillingHistoryResponse>({
    queryKey: queryKeys.admin.users.billingHistory(userId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/admin/users/${userId}/billing-history`, {
        signal,
      });
      return response.data;
    },
    enabled: !!user && userId !== undefined && userId !== null && userId !== '',
    staleTime: 30_000,
  });
}

/**
 * `POST /api/users` (multipart) — create a new user. Consumer sends a
 * FormData body (email, password, name, role, blocked, optional displayImage).
 */
export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    },
  });
}

/**
 * `PUT /api/users/:id` (multipart) — update an existing user with the same
 * multipart payload as create. Both list + detail caches refresh on success.
 */
export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number | string; formData: FormData }) => {
      const response = await apiClient.put(`/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(vars.id) });
    },
  });
}

/**
 * `PATCH /api/users/:id/block` — toggle the blocked flag on a user.
 */
export function useToggleAdminUserBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      blocked,
    }: {
      userId: number | string;
      blocked: boolean;
    }) => {
      const response = await apiClient.patch(`/users/${userId}/block`, { blocked });
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.detail(vars.userId) });
    },
  });
}

/**
 * `DELETE /api/users/:id` — hard-delete a user (admin-gated on the backend).
 */
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number | string) => {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    },
  });
}

/**
 * `POST /api/admin/users/:id/plan-override` — apply a paid-tier plan override
 * for a user with a required reason + optional expiry. On success both the
 * user-detail billing history and the broader users list refresh so the UI
 * reflects the new plan state immediately.
 */
export function useApplyPlanOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...body }: ApplyPlanOverridePayload) => {
      const response = await apiClient.post(`/admin/users/${userId}/plan-override`, body);
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.billingHistory(vars.userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    },
  });
}

/**
 * `DELETE /api/admin/users/:id/plan-override` — revoke the active plan
 * override. Same cache invalidation semantics as apply.
 */
export function useRevokePlanOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number | string) => {
      const response = await apiClient.delete(`/admin/users/${userId}/plan-override`);
      return response.data;
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.billingHistory(userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
    },
  });
}

/**
 * `POST /api/admin/users/:id/credits` — grant account credits (in cents) with
 * a required reason. Invalidates the user's billing history so the new credit
 * balance shows without a manual refetch.
 */
export function useGrantUserCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...body }: GrantCreditsPayload) => {
      const response = await apiClient.post(`/admin/users/${userId}/credits`, body);
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.billingHistory(vars.userId),
      });
    },
  });
}

/**
 * `POST /api/admin/invoices/:id/refund` — full or partial refund of an
 * invoice. Caller supplies the userId context via the mutation variables so
 * we can target invalidation at the user's billing history; if no userId is
 * provided we fall back to the admin-users umbrella key so anything cached
 * downstream still refreshes.
 */
export function useRefundInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invoiceId,
      userId: _userId, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...body
    }: RefundInvoicePayload & { userId?: number | string }) => {
      const response = await apiClient.post(`/admin/invoices/${invoiceId}/refund`, body);
      return response.data;
    },
    onSuccess: (_data, vars) => {
      if (vars.userId !== undefined && vars.userId !== null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.users.billingHistory(vars.userId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Admin broadcasts (/api/admin/broadcasts/*)
// ---------------------------------------------------------------------------

/**
 * `GET /api/admin/broadcasts` — paginated list of broadcast communications
 * (drafts, scheduled, sent). Status filter and pagination flow through the
 * cache key so switching filters keeps prior pages cached.
 */
export function useAdminBroadcasts(params?: AdminBroadcastListParams) {
  const { data: user } = useAuthMe();

  return useQuery<AdminBroadcastListResponse>({
    queryKey: queryKeys.admin.broadcasts.list(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/admin/broadcasts', { params, signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/admin/broadcasts/preview-count` — estimated recipient count for a
 * targeting configuration. Consumer debounces upstream (400ms) before
 * providing new params, so `staleTime` here is a short buffer: repeated
 * identical keys within the window are served from cache.
 *
 * Disabled when `targetType` is missing, or when a type that requires a
 * `targetValue` doesn't have one.
 */
export function useBroadcastPreviewCount(params?: BroadcastPreviewCountParams) {
  const { data: user } = useAuthMe();

  const needsValue =
    !!params?.targetType &&
    ['role', 'plan', 'activity', 'template_users'].includes(params.targetType);
  const enabled =
    !!user && !!params?.targetType && (!needsValue || !!params?.targetValue);

  return useQuery<BroadcastPreviewCountResponse>({
    queryKey: queryKeys.admin.broadcasts.previewCount(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/admin/broadcasts/preview-count', {
        params,
        signal,
      });
      return response.data;
    },
    enabled,
    staleTime: 15_000,
  });
}

/**
 * `POST /api/admin/broadcasts` — create a broadcast (draft or scheduled).
 * Invalidates the broadcast list so the history tab reflects the new entry.
 */
export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation<CreateBroadcastResponse, Error, CreateBroadcastPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/admin/broadcasts', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.broadcasts.all() });
    },
  });
}

/**
 * `POST /api/admin/broadcasts/:id/send` — trigger delivery of a previously
 * created broadcast. Invalidates the list so status flips from draft → sending
 * → sent without a manual refetch.
 */
export function useSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (broadcastId: number | string) => {
      const response = await apiClient.post(`/admin/broadcasts/${broadcastId}/send`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.broadcasts.all() });
    },
  });
}

/**
 * `DELETE /api/admin/broadcasts/:id` — delete a draft broadcast. Only drafts
 * are deletable on the backend; invalidation removes the row from the cached
 * list.
 */
export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (broadcastId: number | string) => {
      const response = await apiClient.delete(`/admin/broadcasts/${broadcastId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.broadcasts.all() });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin finances (/api/admin/finances/*)
// ---------------------------------------------------------------------------

/**
 * `GET /api/admin/finances/metrics` — overview KPIs (MRR, ARR, churn, active
 * paid subs, platform fees). Cached 60s since these move slowly.
 */
export function useAdminFinancesMetrics() {
  const { data: user } = useAuthMe();

  return useQuery<AdminFinancesMetricsResponse>({
    queryKey: queryKeys.admin.finances.metrics(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/admin/finances/metrics', { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/admin/finances/revenue` — revenue breakdown by plan and the MRR
 * trend series. Period string (e.g. `12m`) flows through the cache key so
 * switching windows doesn't thrash the cache.
 */
export function useAdminFinancesRevenue(params?: AdminFinancesRevenueParams) {
  const { data: user } = useAuthMe();

  return useQuery<AdminFinancesRevenueResponse>({
    queryKey: queryKeys.admin.finances.revenue(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/admin/finances/revenue', {
        params,
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/admin/finances/subscriptions` — paginated subscriber table with
 * status filter + free-text search.
 */
export function useAdminFinancesSubscriptions(
  params?: AdminFinancesSubscriptionsParams,
) {
  const { data: user } = useAuthMe();

  return useQuery<AdminFinancesSubscriptionsResponse>({
    queryKey: queryKeys.admin.finances.subscriptions(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/admin/finances/subscriptions', {
        params,
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/admin/finances/transactions` — unified transaction timeline
 * (invoices, orders, refunds, credits) with type/status/date filters.
 */
export function useAdminFinancesTransactions(
  params?: AdminFinancesTransactionsParams,
) {
  const { data: user } = useAuthMe();

  return useQuery<AdminFinancesTransactionsResponse>({
    queryKey: queryKeys.admin.finances.transactions(
      params as Record<string, unknown> | undefined,
    ),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/admin/finances/transactions', {
        params,
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `GET /api/admin/finances/reports/export` — CSV or JSON report download.
 *
 * Modelled as a mutation because the consumer initiates the download
 * imperatively (anchor-click side effect). Returns the raw content + format
 * so the caller can mint its own Blob and filename.
 */
export function useExportAdminFinancesReport() {
  return useMutation<AdminFinancesExportResult, Error, AdminFinancesExportPayload>({
    mutationFn: async ({ reportType, format, startDate, endDate }) => {
      const params: Record<string, string> = { reportType, format };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get('/admin/finances/reports/export', {
        params,
        responseType: format === 'csv' ? 'text' : 'json',
      });
      const content =
        format === 'csv'
          ? (response.data as string)
          : JSON.stringify((response.data as { data?: unknown })?.data ?? response.data, null, 2);
      return { content, format, reportType };
    },
  });
}

// ---------------------------------------------------------------------------
// Admin referral program (/api/referral/admin/*)
// ---------------------------------------------------------------------------

/**
 * `GET /api/referral/admin/analytics?period=...` — admin-only funnel +
 * top-referrers + reward-ledger payload.
 */
export function useAdminReferralAnalytics(period: string = '30d') {
  const { data: user } = useAuthMe();

  return useQuery<ReferralAnalyticsResponse>({
    queryKey: queryKeys.admin.referrals.analytics(period),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/referral/admin/analytics', {
        params: { period },
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * `PUT /api/referral/admin/codes/:id` — flag/unflag or enable/disable a
 * referral code. Invalidates all referral-analytics caches so the admin view
 * reflects the new state across every period window.
 */
export function useUpdateReferralCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ codeId, ...body }: UpdateReferralCodePayload) => {
      const response = await apiClient.put(`/referral/admin/codes/${codeId}`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.referrals.all() });
    },
  });
}
