import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../queryKeys';
import { useAuthMe } from './auth';

/**
 * AI React Query hooks.
 *
 * Backend routes in scope for Phase H.ai:
 *   GET /api/ai/usage — monthly quota + usage counters
 *
 * Out of scope / intentionally NOT migrated:
 *   - `POST /api/ai/generate-content` — a heavy mutation that kicks off a
 *     generation session. Callers drive this with raw axios today; moving it
 *     to a mutation hook is a separate Phase H.account-class task that will
 *     need to think about optimistic updates around the resulting `sessionId`.
 *   - `GET /api/ai/progress/:sessionId` — a long-lived Server-Sent Events
 *     stream. React Query's request/response model doesn't fit a streaming
 *     endpoint (it can't cache partial chunks or surface incremental updates
 *     through `data`). The consumer (AIGenerationProgress) keeps a native
 *     fetch+ReadableStream connection; see the inline note in that component
 *     for the SSE design.
 */

export type AIUsageResponse = {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
};

/**
 * React Query hook for `GET /api/ai/usage`.
 *
 * Backs the "Generate with AI" button in the questionnaire — the button's
 * label and enabled state are derived from the user's plan + remaining quota.
 *
 * Gated on `useAuthMe()`: the questionnaire only renders behind auth, but the
 * gate is belt-and-suspenders for mounts outside the wizard.
 *
 * `staleTime: 60s` keeps the label stable across re-renders of the bottom
 * nav while still picking up quota changes quickly once the user returns
 * from a generation session.
 */
export function useAiUsage() {
  const { data: user } = useAuthMe();

  return useQuery<AIUsageResponse>({
    queryKey: queryKeys.ai.usage(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/ai/usage', { signal });
      return response.data;
    },
    enabled: !!user,
    staleTime: 60_000,
    retry: false,
  });
}
