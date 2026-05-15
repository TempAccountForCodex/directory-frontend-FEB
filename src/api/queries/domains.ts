import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys } from "../queryKeys";
import { useAuthMe } from "./auth";

/**
 * Domain / subdomain React Query hooks.
 *
 * Backend routes (see backend/routes/domainRoutes.js):
 *   GET    /api/domains/check-availability?subdomain=<v>
 *   PATCH  /api/domains/:id/subdomain
 *   POST   /api/domains/:id/custom-domain
 *   POST   /api/domains/:id/custom-domain/verify
 *   DELETE /api/domains/:id/custom-domain
 *
 * The backend does not currently expose a `GET /api/domains/:id` list endpoint.
 * `useDomains(websiteId)` therefore synthesises the website's domain summary
 * from the existing website detail payload (subdomain, customDomain,
 * domainStatus, verifyToken) so consumers can fetch-and-render domains in the
 * same pattern used elsewhere in the React Query migration. Mutations below
 * invalidate `queryKeys.domains.list(websiteId)` and the corresponding website
 * detail entry so both caches stay in sync.
 */

export type DomainSummary = {
  websiteId: number | string;
  subdomain: string | null;
  customDomain: string | null;
  domainStatus: string | null;
  verifyToken?: string | null;
};

export type SubdomainCheckResponse = {
  available: boolean;
  suggestions?: string[];
};

export type ChangeSubdomainVars = {
  websiteId: number | string;
  subdomain: string;
};

export type AddCustomDomainVars = {
  websiteId: number | string;
  domain: string;
};

export type VerifyDomainVars = {
  websiteId: number | string;
};

export type DeleteDomainVars = {
  websiteId: number | string;
};

/**
 * Read-only summary of domain state for a given website. Reads the existing
 * website detail endpoint (`GET /api/websites/:id`) and projects out the
 * domain-shaped fields. Gated on the authed user and a truthy websiteId.
 */
export function useDomains(websiteId: number | string | null | undefined) {
  const { data: user } = useAuthMe();

  return useQuery<DomainSummary>({
    queryKey: queryKeys.domains.list(websiteId ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/websites/${websiteId}`, {
        signal,
      });
      const data = response.data?.data ?? response.data ?? {};
      return {
        websiteId: websiteId as number | string,
        subdomain: data.subdomain ?? null,
        customDomain: data.customDomain ?? null,
        domainStatus: data.domainStatus ?? null,
        verifyToken: data.verifyToken ?? null,
      };
    },
    enabled: !!user && !!websiteId,
    staleTime: 60_000,
  });
}

/**
 * Subdomain availability check. Debounced server-side via rate limiter
 * (30 req/min/IP). Enabled only when the subdomain string is longer than two
 * characters so idle typing does not issue stray requests.
 */
export function useSubdomainCheck(subdomain: string) {
  const trimmed = (subdomain ?? "").trim();
  return useQuery<SubdomainCheckResponse>({
    queryKey: queryKeys.domains.subdomainCheck(trimmed),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/domains/check-availability", {
        params: { subdomain: trimmed },
        signal,
      });
      return response.data;
    },
    enabled: trimmed.length > 2,
    staleTime: 30_000,
  });
}

/**
 * Change the website subdomain.
 * `PATCH /api/domains/:id/subdomain` — body `{ subdomain }`.
 * Invalidates the domain list entry plus the underlying website detail cache.
 */
export function useChangeSubdomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ websiteId, subdomain }: ChangeSubdomainVars) => {
      const response = await apiClient.patch(
        `/domains/${websiteId}/subdomain`,
        {
          subdomain,
        },
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.list(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}

/**
 * Add (register) a custom domain on a website.
 * `POST /api/domains/:id/custom-domain` — body `{ domain }`.
 * Invalidates the domain list entry plus the website detail cache.
 */
export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ websiteId, domain }: AddCustomDomainVars) => {
      const response = await apiClient.post(
        `/domains/${websiteId}/custom-domain`,
        {
          domain,
        },
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.list(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}

/**
 * Trigger DNS verification for an already-registered custom domain.
 * `POST /api/domains/:id/custom-domain/verify` — no body.
 * Invalidates the domain list entry plus the website detail cache so the
 * updated domainStatus is reflected in any mounted consumer.
 */
export function useVerifyDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ websiteId }: VerifyDomainVars) => {
      const response = await apiClient.post(
        `/domains/${websiteId}/custom-domain/verify`,
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.list(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}

/**
 * Delete the custom domain attached to a website.
 * `DELETE /api/domains/:id/custom-domain`.
 * Invalidates the domain list entry plus the website detail cache.
 */
export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ websiteId }: DeleteDomainVars) => {
      const response = await apiClient.delete(
        `/domains/${websiteId}/custom-domain`,
      );
      return response.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.list(vars.websiteId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websites.detail(vars.websiteId),
      });
    },
  });
}
