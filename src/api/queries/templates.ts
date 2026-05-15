import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys, type TemplateFilters } from "../queryKeys";
import { useAuthMe } from "./auth";
import { normalizeTemplateSummary } from "../../templates/templateApi";

export type { TemplateFilters };

/**
 * Envelope for `GET /api/templates/favorites`. The backend returns
 * `UserTemplateFavorite` records with a nested `template` object; callers can
 * either use the full envelope or pull `data` directly.
 */
export type TemplateFavoriteRecord = {
  id: number | string;
  userId: number | string;
  templateId: string;
  createdAt?: string;
  template?: Record<string, unknown>;
};

export type TemplateFavoritesResponse = {
  success?: boolean;
  data: TemplateFavoriteRecord[];
  pagination?: { total?: number; page?: number; limit?: number };
};

/**
 * Envelope for `GET /api/templates/:id/history` — per-template audit trail.
 */
export type TemplateHistoryEntry = {
  id?: number | string;
  action?: string;
  version?: number;
  changeReason?: string | null;
  createdAt?: string;
  changedBy?: { id?: number | string; name?: string } | null;
  [key: string]: unknown;
};

export type TemplateHistoryResponse = {
  success?: boolean;
  data: TemplateHistoryEntry[];
};

/**
 * Backend envelope shape for `GET /api/templates`:
 *   { success: boolean, data: Template[], pagination?: {...}, count?: number }
 *
 * Some callers need the bare list, others need pagination metadata. The hook
 * returns the full envelope so each consumer can pick what it needs. The thin
 * wrapper in `src/hooks/useTemplates.ts` handles normalization for the public
 * Templates / MyTemplates pages.
 */

/**
 * React Query hook for `GET /api/templates`.
 *
 * `/api/templates` is a public endpoint so this hook is NOT gated on auth —
 * that way any future public template browsing surface can reuse it. The two
 * admin-gated consumers (Communications, ManageTemplates) live behind
 * protected routes anyway, so auth gating would be redundant.
 *
 * Filter params (search/category/type/status/isPublished/page/limit/offset/...)
 * flow directly to axios `params`. Different filter objects produce distinct
 * cache keys, so paginated lists and filtered lists live side-by-side without
 * collisions. Callers with identical params share one network request.
 */
export function useTemplates(
  filters?: TemplateFilters & Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.templates.list(filters as TemplateFilters | undefined),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/templates", {
        params: filters,
        signal,
      });
      const envelope = response.data;
      // Normalize each template so category→type mapping (e.g. ecommerce→store) is applied
      if (envelope?.data && Array.isArray(envelope.data)) {
        envelope.data = envelope.data.map((t: Record<string, unknown>) =>
          normalizeTemplateSummary(t),
        );
      }
      return envelope;
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * React Query hook for `GET /api/templates/:id`.
 *
 * Disabled until an id is provided so `useTemplate(undefined)` is a safe
 * no-op for components that fetch a template only after selection.
 */
export function useTemplate(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.templates.detail(id ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/templates/${id}`, { signal });
      const envelope = response.data;
      // Normalize single template so category→type mapping is applied
      if (
        envelope?.data &&
        typeof envelope.data === "object" &&
        !Array.isArray(envelope.data)
      ) {
        envelope.data = normalizeTemplateSummary(
          envelope.data as Record<string, unknown>,
        );
      }
      return envelope;
    },
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 5 * 60_000,
  });
}

/**
 * Invalidate every `/templates`-related cache entry. Call this after any
 * template-level mutation (create, update, delete, approve, reject, publish,
 * unpublish) so every consumer of `useTemplates` / `useTemplate` refreshes.
 */
export function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.templates.all() });
}

/**
 * React Query hook for `GET /api/templates/favorites`.
 *
 * Returns the full envelope (`{ data: UserTemplateFavorite[], pagination }`)
 * so callers can access both the records and the server-provided count. The
 * thin wrapper in `src/hooks/useTemplateFavorites.ts` maps the records into
 * normalized `TemplateSummary` entries for consumers that don't need the raw
 * record shape.
 *
 * Gated on `useAuthMe().data` — favorites are user-scoped, so there's no point
 * firing the request before the session is established.
 */
export function useTemplateFavorites() {
  const { data: user } = useAuthMe();

  return useQuery<TemplateFavoritesResponse>({
    queryKey: queryKeys.templates.favorites(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/templates/favorites", {
        params: { page: 1, limit: 50 },
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * Toggle a template into the user's favorites.
 *
 * Endpoint: `POST /api/templates/:templateId/favorite` — the backend is a
 * single toggle endpoint, so both `useFavoriteTemplate` and
 * `useUnfavoriteTemplate` call the same route. The separate hooks exist so
 * callers can express intent at the call site, matching the add/remove
 * semantics requested in the migration plan.
 *
 * Cache invalidation is intentionally left to callers: the compatibility
 * wrapper in `src/hooks/useTemplateFavorites.ts` runs optimistic cache writes
 * against `queryKeys.templates.favorites()` and reconciles on error. Firing a
 * blanket invalidate here would race the optimistic state, so callers with
 * different reconciliation needs should invalidate themselves.
 */
export function useFavoriteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiClient.post(
        `/templates/${templateId}/favorite`,
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.favorites(),
      });
    },
  });
}

/**
 * Remove a template from the user's favorites.
 *
 * Endpoint: `POST /api/templates/:templateId/favorite` (toggle — see note on
 * `useFavoriteTemplate`).
 */
export function useUnfavoriteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiClient.post(
        `/templates/${templateId}/favorite`,
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.favorites(),
      });
    },
  });
}

/**
 * React Query hook for `GET /api/templates/:id/history`.
 *
 * Returns the full envelope; consumers pull `data` for the entry list.
 * Disabled until an id is provided so `useTemplateHistory(null)` is a safe
 * no-op for views that only open the history panel on demand.
 */
export function useTemplateHistory(id: string | number | null | undefined) {
  return useQuery<TemplateHistoryResponse>({
    queryKey: queryKeys.templates.history(id ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/templates/${id}/history`, {
        signal,
      });
      return response.data;
    },
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 30_000,
  });
}

/**
 * Admin approve a pending template.
 *
 * Endpoint: `PATCH /api/templates/:id/approve`. Invalidates both the template
 * list and the template detail so any cached view of that template (including
 * the approval queue) re-fetches the new status.
 */
export function useApproveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string | number) => {
      const response = await apiClient.patch(
        `/templates/${templateId}/approve`,
      );
      return response.data;
    },
    onSuccess: (_data, templateId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.detail(templateId),
      });
    },
  });
}

/**
 * Admin reject a pending template with a required reason.
 *
 * Endpoint: `PATCH /api/templates/:id/reject` — body `{ rejectionReason }`.
 * Invalidates both the list and the detail so cached queue views refresh.
 */
export type RejectTemplateVars = {
  templateId: string | number;
  rejectionReason: string;
};

export function useRejectTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, rejectionReason }: RejectTemplateVars) => {
      const response = await apiClient.patch(
        `/templates/${templateId}/reject`,
        {
          rejectionReason,
        },
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.templates.detail(vars.templateId),
      });
    },
  });
}
