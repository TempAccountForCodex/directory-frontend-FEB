import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const RETRYABLE_MAX = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        const status = (error as AxiosError | undefined)?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < RETRYABLE_MAX;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
