import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys, type AuditLogFilters } from "../queryKeys";
import { useAuthMe } from "./auth";

/**
 * Infrastructure React Query hooks — admin-only dashboards that read from
 * `/api/metrics/*` and `/api/audit/*`.
 *
 * Backend routes:
 *   GET  /api/metrics/health               — current system health snapshot
 *   GET  /api/metrics/history?duration=... — historical metrics aggregates
 *   GET  /api/audit/admin/logs             — paginated audit log listing
 *   GET  /api/audit/admin/logs/export      — CSV/JSON export (blob download)
 *
 * All endpoints require an authenticated admin; the hooks are gated on
 * `useAuthMe()` so unauthenticated renders never fire a request. The client
 * already forwards cookies + Authorization headers via `apiClient`, so no
 * token plumbing is needed (unlike the prior page-level `axios.get` that
 * manually attached `Authorization: Bearer ${token}`).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HealthMetricsResponse = {
  services?: {
    database?: { responseTime?: number } & Record<string, unknown>;
    redis?: { hitRate?: number } & Record<string, unknown>;
    cache?: {
      hitRate?: number;
      slowQueries?: Array<Record<string, unknown>>;
    } & Record<string, unknown>;
    indexes?: {
      supported?: boolean;
      unused?: number;
      bloated?: number;
      message?: string;
    };
  };
  memory?: {
    heapUsed?: number;
    heapTotal?: number;
  };
  performance?: {
    requestRate?: number;
    errorRate?: number;
  };
  [key: string]: unknown;
};

export type MetricsHistoryHourly = {
  hour: number | string;
  api_avgResponseTime?: number;
  redis_hitRate?: number;
  memory_heapUsed?: number;
  api_requestRate?: number;
  database_responseTime?: number;
  [key: string]: unknown;
};

export type MetricsHistoryResponse = {
  averages?: {
    hourly?: MetricsHistoryHourly[];
  };
  [key: string]: unknown;
};

export type AuditLogEntry = {
  id: number | string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId?: number | string | null;
  user?: { name?: string; email?: string } | null;
  [key: string]: unknown;
};

export type AuditLogsResponse = {
  data?: {
    logs?: AuditLogEntry[];
    total?: number;
  };
};

export type AuditExportPayload = {
  format?: "csv" | "json";
} & Omit<AuditLogFilters, "limit" | "offset">;

export type AuditExportResult = {
  blob: Blob;
  filename: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Per the Phase H.infrastructure plan: health polls at 60s and does NOT keep
 * polling when the tab is backgrounded. The page still wires a WebSocket for
 * live pushes — this polling interval is the fallback when the socket drops.
 */
const HEALTH_POLL_MS = 60_000;

// ---------------------------------------------------------------------------
// Metrics hooks
// ---------------------------------------------------------------------------

/**
 * React Query hook for `GET /api/metrics/health`.
 *
 * Backs the admin Performance Monitoring page. The page also subscribes to a
 * WebSocket for live pushes; this hook provides the initial load and the 60s
 * polling fallback. `refetchIntervalInBackground: false` avoids burning cycles
 * on hidden tabs — the page manually refetches via `refetch()` on tab focus
 * if needed.
 */
export function useHealthMetrics() {
  const { data: user } = useAuthMe();

  return useQuery<HealthMetricsResponse>({
    queryKey: queryKeys.infrastructure.health(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/metrics/health", { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: HEALTH_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

/**
 * React Query hook for `GET /api/metrics/history?duration=24h`.
 *
 * Backs the four line charts on the Performance Monitoring page. History data
 * changes at most once per hour (hourly aggregates), so we cache generously:
 * `staleTime: 5min` keeps the charts from refetching on every re-render while
 * still picking up new datapoints a few minutes after they land.
 */
export function useMetricsHistory(duration: string = "24h") {
  const { data: user } = useAuthMe();

  return useQuery<MetricsHistoryResponse>({
    queryKey: [...queryKeys.infrastructure.metricsHistory(), duration] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/metrics/history", {
        params: { duration },
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
}

// ---------------------------------------------------------------------------
// Audit hooks
// ---------------------------------------------------------------------------

/**
 * React Query hook for `GET /api/audit/admin/logs`.
 *
 * Backs the admin AuditLogCard. Filters (action, entityType, dateFrom, dateTo)
 * plus pagination (limit, offset) are keyed into the cache, so switching
 * filters or pages hits the network once and subsequent identical requests
 * are served from cache. `staleTime: 30s` — audit events land continuously,
 * so we want fresh-ish data without hammering the endpoint.
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  const { data: user } = useAuthMe();

  return useQuery<AuditLogsResponse>({
    queryKey: queryKeys.audit.logs(filters),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/audit/admin/logs", {
        params: filters,
        signal,
      });
      return response.data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

/**
 * Mutation for `GET /api/audit/admin/logs/export` (returns a blob).
 *
 * Though the endpoint is a GET, exporting is a user-initiated action with a
 * side effect (triggers a file download) so it's modelled as a mutation — the
 * caller drives it imperatively via `mutateAsync(filters)`. The mutation
 * returns the blob + parsed filename; the consumer component performs the
 * `URL.createObjectURL` + anchor-click dance so we don't touch the DOM here.
 */
export function useExportAuditLogs() {
  return useMutation<AuditExportResult, Error, AuditExportPayload | undefined>({
    mutationFn: async (payload) => {
      const params = { format: "csv", ...(payload ?? {}) };
      const response = await apiClient.get("/audit/admin/logs/export", {
        params,
        responseType: "blob",
      });

      const disposition = response.headers?.["content-disposition"] as
        | string
        | undefined;
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "audit-logs.csv";

      return { blob: response.data as Blob, filename };
    },
  });
}
