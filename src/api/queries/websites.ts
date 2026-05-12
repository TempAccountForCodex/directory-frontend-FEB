import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';
import { useAuthMe } from './auth';

export type WebsiteListParams = {
  page?: number;
  limit?: number;
  search?: string;
  /**
   * Server-side filter. `deleted: true` is the convention referenced in the
   * Phase C plan. The live Websites dashboard trash view uses `status: 'archived'`
   * instead — both are accepted here so every existing trash-view consumer can
   * migrate without changing their URL contract.
   */
  deleted?: boolean;
  status?: string;
};

/**
 * React Query hook for `GET /api/websites`.
 *
 * Replaces the ad-hoc `axios.get('/api/websites')` calls scattered across
 * PermissionContext, Websites dashboard, and Stores dashboard. Different
 * `params` objects produce different cache keys (via `queryKeys.websites.list`),
 * so paginated lists and unpaginated lists live in separate cache entries while
 * callers with identical params share one network request.
 *
 * Gated on `useAuthMe().data` — the query is disabled until the user is
 * loaded, mirroring the prior `useEffect([user])` gating in PermissionContext.
 */
export function useWebsites(params?: WebsiteListParams) {
  const { data: user } = useAuthMe();

  return useQuery({
    queryKey: queryKeys.websites.list(params),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/websites', { params, signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * Invalidate every `/websites`-related cache entry. Call this after any
 * website-level mutation (create, update, delete, publish, restore, logo, etc.)
 * so all three consumer hooks refresh.
 */
export function useInvalidateWebsites() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() });
}

/**
 * React Query hook for `GET /api/websites/:id/approval`.
 *
 * Replaces the manual `setInterval(30s)` polling in `useApprovalWorkflow.js`.
 * Uses `refetchInterval: 30_000` to preserve the polling cadence while letting
 * React Query handle dedupe, AbortController cancellation, and cache sharing.
 * WebSocket-driven updates (APPROVAL_STATE_CHANGED) call
 * `queryClient.setQueryData` / `invalidateQueries` from the hook consumer.
 *
 * Gated on `useAuthMe().data` — the query is disabled until the user is loaded.
 */
export function useApprovalState(websiteId: number | string | null | undefined) {
  const { data: user } = useAuthMe();

  return useQuery({
    queryKey: queryKeys.websites.approval(websiteId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/${websiteId}/approval`, { signal });
      // Preserve the original hook's unwrap shape: res.data?.data ?? res.data ?? null
      return response.data?.data ?? response.data ?? null;
    },
    enabled: !!user && !!websiteId,
    staleTime: 25_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

/**
 * React Query hook for `GET /api/websites/:id/sections/locks`.
 *
 * Replaces the manual `setInterval(30s)` polling in `useApprovalWorkflow.js`.
 * Uses `refetchInterval: 30_000` to preserve the polling cadence while letting
 * React Query handle dedupe, AbortController cancellation, and cache sharing.
 * WebSocket-driven updates (SECTION_LOCKED / SECTION_UNLOCKED) invalidate the
 * query from the hook consumer.
 *
 * Gated on `useAuthMe().data` — the query is disabled until the user is loaded.
 */
export function useSectionLocks(websiteId: number | string | null | undefined) {
  const { data: user } = useAuthMe();

  return useQuery({
    queryKey: queryKeys.websites.sectionLocks(websiteId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/${websiteId}/sections/locks`, { signal });
      // Preserve the original hook's unwrap shape: res.data?.data ?? res.data ?? []
      return response.data?.data ?? response.data ?? [];
    },
    enabled: !!user && !!websiteId,
    staleTime: 25_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

// ── Pages ───────────────────────────────────────────────────────────────────

/**
 * React Query hook for `GET /api/websites/:id/pages`.
 *
 * Shared across WebsiteEditor (the live editor), PagesTab, and SeoTab — all
 * three consumers reading the same key means only one network call per
 * dashboard session while any of them is mounted.
 *
 * Response unwrap matches the prior ad-hoc shape (`res.data?.data ?? res.data`).
 * Gated on `useAuthMe().data` to mirror the session guard other hooks use.
 */
export function useWebsitePages(websiteId: number | string | null | undefined) {
  const { data: user } = useAuthMe();
  return useQuery({
    queryKey: queryKeys.websites.pages(websiteId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/${websiteId}/pages`, { signal });
      return response.data?.data ?? response.data?.pages ?? response.data ?? [];
    },
    enabled: !!user && !!websiteId,
    staleTime: 60_000,
  });
}

// ── Page blocks ─────────────────────────────────────────────────────────────

/**
 * Module-level ETag store for block updates. Keyed by `${websiteId}:${pageId}`.
 *
 * The autosave PUT reads the stored ETag/updatedAt to populate `If-Match` +
 * `expectedUpdatedAt` on outgoing requests, and writes back the fresh values
 * from successful responses. The store sits outside the React Query cache
 * because these metadata bits drive conditional headers rather than rendered
 * UI — they must survive cache garbage collection windows and must not
 * trigger re-renders on every save.
 *
 * `clearBlockEtags()` is exposed for the signout flow to explicitly wipe the
 * map (queryClient.clear() does not touch module state).
 */
const blockEtagStore = new Map<string, { etag?: string; expectedUpdatedAt?: string }>();
const blockEtagKey = (websiteId: number | string, pageId: number | string) =>
  `${websiteId}:${pageId}`;

export function getBlockEtag(websiteId: number | string, pageId: number | string) {
  return blockEtagStore.get(blockEtagKey(websiteId, pageId));
}

export function setBlockEtag(
  websiteId: number | string,
  pageId: number | string,
  value: { etag?: string; expectedUpdatedAt?: string }
) {
  blockEtagStore.set(blockEtagKey(websiteId, pageId), value);
}

export function clearBlockEtags() {
  blockEtagStore.clear();
}

/**
 * React Query hook for `GET /api/pages/:pageId/blocks`.
 *
 * Captures the response ETag + `updatedAt` into the module-level
 * `blockEtagStore` so the subsequent `useUpdateWebsiteBlocks` mutation can
 * populate `If-Match` + `expectedUpdatedAt` for optimistic concurrency.
 * Gated on `useAuthMe().data` + both ids.
 */
export function useWebsitePageBlocks(
  websiteId: number | string | null | undefined,
  pageId: number | string | null | undefined
) {
  const { data: user } = useAuthMe();
  return useQuery({
    queryKey: queryKeys.websites.blocks(websiteId ?? '', pageId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/pages/${pageId}/blocks`, { signal });
      // Capture ETag + updatedAt for subsequent PUTs.
      const etag = response.headers?.etag ?? response.headers?.ETag;
      const updatedAt = response.data?.updatedAt ?? response.data?.data?.updatedAt;
      if (websiteId && pageId) {
        setBlockEtag(websiteId, pageId, { etag, expectedUpdatedAt: updatedAt });
      }
      return response.data;
    },
    enabled: !!user && !!websiteId && !!pageId,
    staleTime: 30_000,
  });
}

/**
 * Mutation: `PUT /api/websites/:id/pages/:pageId/blocks` with optimistic
 * concurrency control.
 *
 * - Reads the stored ETag + `expectedUpdatedAt` from `blockEtagStore` and
 *   populates `If-Match` header + `expectedUpdatedAt` body field.
 * - On success: writes fresh ETag + `updatedAt` back into the store and
 *   updates the blocks query cache so the next read is hot.
 * - On 412: returns `{ conflict: true, serverData, serverUpdatedAt, error }`
 *   instead of throwing. The caller (autosave) is responsible for surfacing
 *   the conflict via merge/dialog. No cache invalidation on 412 — we do not
 *   want to clobber in-progress local edits.
 * - On other errors: re-throws normally.
 *
 * Shape of the return on success preserves the legacy autosave contract:
 * `{ updatedAt, ... }` — callers that rely on `result.updatedAt` continue to
 * work unchanged.
 */
export function useUpdateWebsiteBlocks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      websiteId: number | string;
      pageId: number | string;
      blocks: unknown[];
    }) => {
      const { websiteId, pageId, blocks } = vars;
      const stored = getBlockEtag(websiteId, pageId);
      const headers: Record<string, string> = {};
      if (stored?.etag) headers['If-Match'] = stored.etag;
      const body: Record<string, unknown> = { blocks };
      if (stored?.expectedUpdatedAt) body.expectedUpdatedAt = stored.expectedUpdatedAt;

      try {
        const response = await apiClient.put(
          `/websites/${websiteId}/pages/${pageId}/blocks`,
          body,
          { headers }
        );
        // Persist fresh ETag + updatedAt for the next PUT.
        const newEtag = response.headers?.etag ?? response.headers?.ETag;
        const newUpdatedAt =
          response.data?.updatedAt ?? response.data?.data?.updatedAt;
        setBlockEtag(websiteId, pageId, {
          etag: newEtag,
          expectedUpdatedAt: newUpdatedAt,
        });
        // Warm the cache so any subsequent GET is instant.
        queryClient.setQueryData(
          queryKeys.websites.blocks(websiteId, pageId),
          response.data
        );
        queryClient.invalidateQueries({
          queryKey: queryKeys.websites.detail(websiteId),
        });
        return {
          ...response.data,
          updatedAt: newUpdatedAt,
        };
      } catch (err: unknown) {
        const error = err as {
          response?: {
            status?: number;
            data?: { serverData?: unknown; serverUpdatedAt?: string };
          };
        };
        if (error?.response?.status === 412) {
          // Conflict — surface to caller without invalidating.
          return {
            conflict: true,
            serverData: error.response.data?.serverData,
            serverUpdatedAt: error.response.data?.serverUpdatedAt,
            error: err,
          };
        }
        throw err;
      }
    },
  });
}

// ── Website detail / CRUD (Phase H.websites-rest) ──────────────────────────

/**
 * React Query hook for `GET /api/websites/:id`.
 *
 * Replaces the ad-hoc fetch in `WebsiteManagementDashboard.jsx`. Response
 * envelope is normalized at the boundary: unwraps `{ success, data }` and
 * uppercases `status` + `role` to mirror the prior inline fetch logic so
 * downstream consumers keep their casing contract.
 *
 * Gated on `useAuthMe().data` + websiteId. staleTime 60s — a website detail
 * rarely changes mid-session, and mutations explicitly invalidate.
 */
export function useWebsite(websiteId: number | string | null | undefined) {
  const { data: user } = useAuthMe();
  return useQuery({
    queryKey: queryKeys.websites.detail(websiteId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/${websiteId}`, { signal });
      const raw = response.data?.data ?? response.data?.website ?? response.data;
      if (!raw) return null;
      return {
        ...raw,
        status: (raw.status || 'draft').toUpperCase(),
        role: (raw.role || 'VIEWER').toUpperCase(),
      };
    },
    enabled: !!user && !!websiteId,
    staleTime: 60_000,
  });
}

// ── Collaborators ──────────────────────────────────────────────────────────

/**
 * React Query hook for `GET /api/websites/:id/collaborators`.
 *
 * Replaces the ad-hoc fetch in `TeamTab.jsx` and `CollaboratorModal.jsx`.
 * Backend returns a raw array (no envelope) — this hook preserves that
 * shape. Gated on `useAuthMe().data` + websiteId.
 */
export function useWebsiteCollaborators(
  websiteId: number | string | null | undefined
) {
  const { data: user } = useAuthMe();
  return useQuery({
    queryKey: queryKeys.websites.collaborators(websiteId ?? ''),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(
        `/websites/${websiteId}/collaborators`,
        { signal }
      );
      if (Array.isArray(response.data)) return response.data;
      return response.data?.data ?? response.data?.collaborators ?? [];
    },
    enabled: !!user && !!websiteId,
    staleTime: 30_000,
  });
}

/**
 * Mutation: `POST /api/websites/:id/collaborators/invite`.
 *
 * Invite a new collaborator by email. On success, invalidates the
 * collaborators list for the given websiteId so the table refreshes.
 * The detail cache is also refreshed because collaborator counts may
 * surface in the website DTO.
 */
export function useAddCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      websiteId: number | string;
      email: string;
      role: string;
    }) => {
      const { websiteId, email, role } = vars;
      const response = await apiClient.post(
        `/websites/${websiteId}/collaborators/invite`,
        { email, role }
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.collaborators(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}

/**
 * Mutation: `PATCH /api/websites/:id/collaborators/:userId`.
 *
 * Update a collaborator's role. Invalidates the collaborators list on
 * success so every subscriber (TeamTab, CollaboratorModal) re-renders
 * with the new role.
 */
export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      websiteId: number | string;
      userId: number | string;
      role: string;
    }) => {
      const { websiteId, userId, role } = vars;
      const response = await apiClient.patch(
        `/websites/${websiteId}/collaborators/${userId}`,
        { role }
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.collaborators(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}

/**
 * Mutation: `DELETE /api/websites/:id/collaborators/:userId`.
 *
 * Remove a collaborator from the website. Invalidates the collaborators
 * list and website detail on success.
 */
export function useRemoveCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      websiteId: number | string;
      userId: number | string;
    }) => {
      const { websiteId, userId } = vars;
      const response = await apiClient.delete(
        `/websites/${websiteId}/collaborators/${userId}`
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.collaborators(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}

// ── Activity ───────────────────────────────────────────────────────────────

/**
 * React Query hook for `GET /api/websites/:id/activity`.
 *
 * Replaces the ad-hoc fetch in `OverviewTab.jsx` and `ActivityFeedCard.jsx`.
 * Accepts an optional `params` object (limit, offset, types, ...) which
 * participates in the cache key so paginated/filtered callers each get
 * their own cache slot. Plain `useQuery` (not infinite) — current
 * consumers page through with offset rather than cursor pagination.
 *
 * Response unwrap preserves the prior shape: `{ activities, total, hasMore }`
 * is returned from `res.data?.data`, with fallbacks for legacy shapes.
 */
export function useWebsiteActivity(
  websiteId: number | string | null | undefined,
  params?: Record<string, string | number | undefined>
) {
  const { data: user } = useAuthMe();
  return useQuery({
    queryKey: [
      ...queryKeys.websites.activity(websiteId ?? ''),
      params ?? {},
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/${websiteId}/activity`, {
        params,
        signal,
      });
      return response.data?.data ?? response.data ?? { activities: [], total: 0 };
    },
    enabled: !!user && !!websiteId,
    staleTime: 30_000,
  });
}

// ── Ownership transfer ─────────────────────────────────────────────────────

/**
 * Mutation: `POST /api/websites/:id/transfer-ownership`.
 *
 * Transfer full ownership of a website to another collaborator. Invalidates
 * the website detail (role flip), the list (ownership shown in table), the
 * collaborators (roles shift), and `auth.me` because the current user loses
 * OWNER privileges and downstream permission checks must re-evaluate.
 */
export function useTransferOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      websiteId: number | string;
      newOwnerId: number | string;
    }) => {
      const { websiteId, newOwnerId } = vars;
      const response = await apiClient.post(
        `/websites/${websiteId}/transfer-ownership`,
        { newOwnerId }
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.collaborators(vars.websiteId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

// ── Permanent delete ───────────────────────────────────────────────────────

/**
 * Mutation: `DELETE /api/websites/:id/permanent`.
 *
 * Permanently deletes a (previously soft-deleted) website from the trash.
 * Invalidates the website list (trash view and active view are separate
 * cache entries but share the `websites` prefix) and stats.
 */
export function usePermanentDeleteWebsite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (websiteId: number | string) => {
      const response = await apiClient.delete(`/websites/${websiteId}/permanent`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.stats() });
    },
  });
}

// ── Public by slug ─────────────────────────────────────────────────────────

/**
 * React Query hook for `GET /api/websites/slug/:slug`.
 *
 * Public endpoint — no auth gate. Used by `PublicWebsite.tsx` to hydrate
 * the viewer when visiting a subdomain or /site/:slug path. staleTime 5min
 * because public site content is far less volatile than editor state.
 */
export function useWebsiteBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['websites', 'slug', slug ?? ''] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/slug/${slug}`, { signal });
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });
}

// ── Create from template ───────────────────────────────────────────────────

/**
 * Mutation: `POST /api/websites/from-template`.
 *
 * Creates a new website from a DB template. On success, invalidates the
 * website list and stats so the new row appears immediately on the
 * dashboard. Payload is passed through verbatim so callers control
 * optional fields (subdomain, customization, ...).
 */
export function useCreateWebsiteFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await apiClient.post('/websites/from-template', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.websites.stats() });
    },
  });
}
