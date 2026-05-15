import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { queryKeys } from "../queryKeys";

/**
 * Public docs React Query hooks.
 *
 * Backend routes (see backend/routes/docsRoutes.js):
 *   GET /api/docs/sections
 *   GET /api/docs?category=<slug>&page=<n>&limit=<n>
 *   GET /api/docs/search?q=<query>
 *   GET /api/docs/:slug
 *
 * These endpoints are PUBLIC (no auth required) so the hooks are NOT gated on
 * `useAuthMe()`. Docs content is cached aggressively — articles change rarely
 * and the same content is shared across every user, so we use
 * `staleTime: 10min` and `gcTime: 30min` to minimize refetches while still
 * letting editors see updates within a reasonable window after publishing.
 *
 * All hooks share the `['docs', ...]` key prefix so a single
 * `queryClient.invalidateQueries({ queryKey: queryKeys.docs.all() })` refreshes
 * every docs cache entry (used by ManageDocs after admin publishes an article).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocSection = {
  slug: string;
  title: string;
  description: string;
  articleCount: number;
};

export type DocsSectionsResponse = {
  sections: DocSection[];
};

export type DocArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  views: number;
  updatedAt: string;
  tags: string[];
  isPublished: boolean;
};

export type DocsListResponse = {
  articles: DocArticle[];
  total: number;
  page: number;
  totalPages: number;
};

export type DocsListParams = {
  category?: string;
  page?: number;
  limit?: number;
};

export type DocSearchResult = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
};

export type DocsSearchResponse = {
  articles: DocSearchResult[];
};

export type DocsArticleResponse = {
  article: DocArticle;
};

// ---------------------------------------------------------------------------
// Shared cache config for every public-docs query
// ---------------------------------------------------------------------------

const DOCS_STALE_MS = 10 * 60_000;
const DOCS_GC_MS = 30 * 60_000;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * React Query hook for `GET /api/docs/sections`.
 *
 * Backs the public DocsHome page. Response shape is `{ sections: [...] }` but
 * some legacy paths returned a bare array; the hook returns the raw response
 * so each consumer can normalize (DocsHome falls back to DEFAULT_SECTIONS).
 */
export function useDocsSections() {
  return useQuery<DocsSectionsResponse | DocSection[]>({
    queryKey: [...queryKeys.docs.all(), "sections"] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/docs/sections", { signal });
      return response.data;
    },
    staleTime: DOCS_STALE_MS,
    gcTime: DOCS_GC_MS,
  });
}

/**
 * React Query hook for `GET /api/docs?category=<slug>&page=<n>&limit=<n>`.
 *
 * Backs the public DocsList page. Disabled until a category is provided so
 * `useDocsList({ category: undefined })` is a safe no-op on routes that
 * haven't matched the `:category` param yet.
 */
export function useDocsList(params?: DocsListParams) {
  const category = params?.category;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  return useQuery<DocsListResponse>({
    queryKey: [
      ...queryKeys.docs.all(),
      "list",
      { category, page, limit },
    ] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/docs", {
        params: { category, page, limit },
        signal,
      });
      return response.data;
    },
    enabled: Boolean(category),
    staleTime: DOCS_STALE_MS,
    gcTime: DOCS_GC_MS,
  });
}

/**
 * React Query hook for `GET /api/docs/search?q=<query>`.
 *
 * Backs the DocSearch autocomplete dropdown. The component still owns the
 * 300ms input debounce — the hook's job is to turn a stable query string into
 * a cached request. Disabled when the query is below MIN_QUERY_LENGTH so we
 * never fire an empty-search request. Two consumers with the same `q` share
 * one network call.
 */
export function useDocsSearch(query: string, minLength = 2) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= minLength;

  return useQuery<DocsSearchResponse | DocSearchResult[]>({
    queryKey: [...queryKeys.docs.all(), "search", trimmed] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/docs/search", {
        params: { q: trimmed },
        signal,
      });
      return response.data;
    },
    enabled,
    staleTime: DOCS_STALE_MS,
    gcTime: DOCS_GC_MS,
  });
}

/**
 * React Query hook for `GET /api/docs/:slug`.
 *
 * Backs the public DocsArticle page. Disabled until a slug is provided.
 * `retry: false` so a 404 on a missing slug surfaces immediately — the page
 * uses that signal to render the "Article not found" state.
 */
export function useDocsArticle(slug: string | null | undefined) {
  return useQuery<DocsArticleResponse | DocArticle>({
    queryKey: [...queryKeys.docs.all(), "article", slug ?? ""] as const,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get(`/docs/${slug}`, { signal });
      return response.data;
    },
    enabled: Boolean(slug),
    staleTime: DOCS_STALE_MS,
    gcTime: DOCS_GC_MS,
    retry: false,
  });
}
