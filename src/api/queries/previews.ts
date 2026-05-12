import { useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';
import { useAuthMe } from './auth';

/**
 * Preview token React Query hook.
 *
 * Backend route:
 *   POST /api/previews/websites/:websiteId/pages/:pageId/token
 *
 * The endpoint issues a short-lived JWT (default ~5 min) that the iframe
 * appends to its `src` as a query param for authentication. Unlike the other
 * queries in this phase, this is a POST (not a GET) because the backend
 * treats token minting as a state-changing operation.
 *
 * Gating: depends on a signed-in user. `usePreviewIframe` consumers always
 * live behind protected routes, so `useAuthMe()` gating is belt-and-suspenders.
 *
 * Caching: `staleTime: 4min` — slightly below the 5-minute JWT lifetime so
 * unrelated mounts of the same iframe share one minted token without the
 * cache serving stale/expired values. Refetches happen naturally when a
 * consumer calls `refresh()` (imperative) or when React Query determines
 * staleness.
 */

export type PreviewTokenResponse = {
  previewToken: string;
  expiresAt?: string | null;
};

type PreviewTokenEnvelope = {
  data?: PreviewTokenResponse;
} & Partial<PreviewTokenResponse>;

/**
 * Imperative fetcher for preview tokens. Exposed alongside the hook so the
 * auto-refresh `setInterval` inside `usePreviewIframe` can re-use the same
 * request shape without having to re-render the parent. Accepts an optional
 * Axios config so callers can thread through an abort signal.
 */
export async function fetchPreviewToken(
  websiteId: string | number,
  pageId: string | number,
  config?: AxiosRequestConfig
): Promise<PreviewTokenResponse> {
  const response = await apiClient.post<PreviewTokenEnvelope>(
    `/previews/websites/${websiteId}/pages/${pageId}/token`,
    null,
    config
  );
  const body = response.data ?? {};
  const previewToken = body.data?.previewToken ?? body.previewToken;
  if (!previewToken) {
    throw new Error('No token returned');
  }
  const expiresAt = body.data?.expiresAt ?? body.expiresAt ?? null;
  return { previewToken, expiresAt };
}

/**
 * React Query hook wrapper around `fetchPreviewToken`. Disabled until both
 * `websiteId` and `pageId` are provided — the iframe mounts before a page is
 * selected in some flows. Gated on `useAuthMe()` so unauthenticated renders
 * never hit the endpoint.
 */
export function usePreviewToken(
  websiteId: string | number | null | undefined,
  pageId: string | number | null | undefined
) {
  const { data: user } = useAuthMe();

  return useQuery<PreviewTokenResponse>({
    queryKey: queryKeys.previews.token(websiteId ?? '', pageId ?? ''),
    queryFn: ({ signal }) => fetchPreviewToken(websiteId!, pageId!, { signal }),
    enabled: Boolean(user && websiteId && pageId),
    staleTime: 4 * 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}
