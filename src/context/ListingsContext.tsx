import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  useListings as useListingsQuery,
  useListing as useListingQuery,
  useListingBySlug as useListingBySlugQuery,
  useCreateListing,
  useUpdateListing,
  useDeleteListing,
} from "../api/queries/content";
import { apiClient } from "../api/client";
import { queryKeys } from "../api/queryKeys";

// -------------------- Types --------------------
export interface Place {
  id: string;
  creator: string;
  title: string;
  desc: string;
  address: string;
  slug: string;
  phone: string;
  category: string;
  city: string;
  region: string;
  status: "active" | "pending";
  createdAt: string;
  updatedAt: string;

  // Optional fields
  website?: string | null;
  priceRange?: string | null;
  accountingAndTaxService?: string | null;
  area?: string | null;
  businessLogo?: string | null;
  businessBanner?: string | null;
  image?: string | null;
  image1?: string | null;
  images?: string[] | null;
  intro?: string | null;
  aboutUs?: string | null;
  whyUs?: string | null;
  latestProjectIntro?: string | null;
  ourMission?: string | null;
  contactUsIntro?: string | null;
  mapUrl?: string | null;
  featured?: boolean;

  // Owner ID (returned by GET /api/directory/listings as ownerId)
  ownerId?: string | number | null;

  // Related user
  user?: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  };

  [key: string]: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ListingsContextType {
  listings: Place[];
  loading: boolean;
  error: string | null;

  fetchListings: (
    page?: number,
    limit?: number,
    filters?: Record<string, string>,
  ) => Promise<Pagination | null>;
  fetchListingById: (id: string) => Promise<Place | null>;
  fetchListingBySlug: (slug: string) => Promise<Place | null>;
  createListing: (data: Partial<Place>) => Promise<Place | null>;
  updateListing: (id: string, data: Partial<Place>) => Promise<Place | null>;
  deleteListing: (id: string) => Promise<void>;
}

// -------------------- Context --------------------
const ListingsContext = createContext<ListingsContextType | undefined>(
  undefined,
);

/**
 * Listings provider — thin React Query shim preserving the original context
 * shape (Phase H.content migration).
 *
 * - `listings`, `loading`, `error` are hydrated from a shared `useListings`
 *   query so every consumer reads the same cache.
 * - The imperative helpers (`fetchListings`, `fetchListingById`, ...) are
 *   preserved for API compatibility. Each delegates to `queryClient.fetch...`
 *   or a mutation under the hood and returns the legacy-shaped promise.
 */
export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const listQuery = useListingsQuery();

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();
  const deleteMutation = useDeleteListing();

  const [error, setError] = useState<string | null>(null);

  const rawData = listQuery.data as
    | { data?: Place[]; pagination?: Pagination }
    | Place[]
    | undefined;
  const listings: Place[] = Array.isArray(rawData)
    ? rawData
    : (rawData?.data ?? []);

  const queryErrMessage =
    (listQuery.error as AxiosError<{ message?: string }> | null)?.response?.data
      ?.message ??
    (listQuery.error as Error | null)?.message ??
    null;

  const fetchListings = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      filters: Record<string, string> = {},
    ): Promise<Pagination | null> => {
      try {
        setError(null);
        const params = { page, limit, ...filters };
        const result = await queryClient.fetchQuery<{
          data?: Place[];
          pagination?: Pagination;
        }>({
          queryKey: queryKeys.content.listings(params),
          queryFn: async ({ signal }) => {
            const response = await apiClient.get("/places", { params, signal });
            return (
              response.data?.data ??
              response.data ?? { data: [], pagination: null }
            );
          },
          staleTime: 5 * 60_000,
        });
        return (
          result?.pagination ?? {
            page,
            limit,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr?.response?.data?.message ||
            (err as Error)?.message ||
            "Failed to load listings",
        );
        return null;
      }
    },
    [queryClient],
  );

  const fetchListingById = useCallback(
    async (id: string): Promise<Place | null> => {
      try {
        setError(null);
        const data = await queryClient.fetchQuery<Place | null>({
          queryKey: queryKeys.content.listing(id),
          queryFn: async ({ signal }) => {
            const response = await apiClient.get(`/places/${id}`, { signal });
            return response.data?.data ?? response.data ?? null;
          },
          staleTime: 5 * 60_000,
        });
        return data ?? null;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr?.response?.data?.message ||
            (err as Error)?.message ||
            "Failed to load listing",
        );
        return null;
      }
    },
    [queryClient],
  );

  const fetchListingBySlug = useCallback(
    async (slug: string): Promise<Place | null> => {
      try {
        setError(null);
        const data = await queryClient.fetchQuery<Place | null>({
          queryKey: ["content", "listingBySlug", slug] as const,
          queryFn: async ({ signal }) => {
            const response = await apiClient.get(`/places/slug/${slug}`, {
              signal,
            });
            return response.data?.data ?? response.data ?? null;
          },
          staleTime: 5 * 60_000,
        });
        return data ?? null;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr?.response?.data?.message ||
            (err as Error)?.message ||
            "Failed to load listing",
        );
        return null;
      }
    },
    [queryClient],
  );

  const createListing = useCallback(
    async (data: Partial<Place>): Promise<Place | null> => {
      try {
        setError(null);
        const place = await createMutation.mutateAsync(
          data as Record<string, unknown>,
        );
        return (place as Place) ?? null;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr?.response?.data?.message ||
            (err as Error)?.message ||
            "Failed to create listing",
        );
        return null;
      }
    },
    [createMutation],
  );

  const updateListing = useCallback(
    async (id: string, data: Partial<Place>): Promise<Place | null> => {
      try {
        setError(null);
        const place = await updateMutation.mutateAsync({
          id,
          payload: data as Record<string, unknown>,
        });
        return (place as Place) ?? null;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr?.response?.data?.message ||
            (err as Error)?.message ||
            "Failed to update listing",
        );
        return null;
      }
    },
    [updateMutation],
  );

  const deleteListing = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr?.response?.data?.message ||
            (err as Error)?.message ||
            "Failed to delete listing",
        );
      }
    },
    [deleteMutation],
  );

  const loading =
    listQuery.isFetching ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const value = useMemo<ListingsContextType>(
    () => ({
      listings,
      loading,
      error: error ?? queryErrMessage,
      fetchListings,
      fetchListingById,
      fetchListingBySlug,
      createListing,
      updateListing,
      deleteListing,
    }),
    [
      listings,
      loading,
      error,
      queryErrMessage,
      fetchListings,
      fetchListingById,
      fetchListingBySlug,
      createListing,
      updateListing,
      deleteListing,
    ],
  );

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};

// -------------------- Hooks --------------------
export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error("useListings must be used within ListingsProvider");
  }
  return context;
};

// Direct React Query hook access for callers who don't need the context shape.
export { useListingQuery, useListingBySlugQuery };
