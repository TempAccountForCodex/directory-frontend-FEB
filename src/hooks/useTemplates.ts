import { useState, useEffect, useCallback } from "react";
import axios, { isAxiosError } from "axios";
import { useDebouncedValue } from "./useDebouncedValue";
import {
  type TemplateSummary,
  normalizeTemplateSummary,
} from "../templates/templateApi";
import type { TemplateFilters } from "../components/Templates/TemplateFilters";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface UseTemplatesReturn {
  templates: TemplateSummary[];
  loading: boolean;
  error: string | null;
  filters: TemplateFilters;
  setFilters: (filters: TemplateFilters) => void;
  refetch: () => void;
}

export const useTemplates = (): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TemplateFilters>({
    search: "",
    category: "",
    type: "",
  });
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filters.category) params.append("category", filters.category);
        if (filters.type) params.append("type", filters.type);

        const response = await axios.get(
          `${API_URL}/templates?${params.toString()}`,
        );

        if (!cancelled) {
          const raw: Record<string, unknown>[] = response.data?.data || [];
          setTemplates(raw.map((t) => normalizeTemplateSummary(t)));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          let message = "Failed to load templates";
          if (isAxiosError(err)) {
            // Prefer server-provided message over generic axios network message
            message =
              (err.response?.data as { message?: string } | undefined)
                ?.message ?? err.message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters.category, filters.type, fetchTrigger]);

  const setFilters = useCallback((newFilters: TemplateFilters) => {
    setFiltersState(newFilters);
  }, []);

  const refetch = useCallback(() => {
    // Incrementing fetchTrigger causes the effect to run; the effect resets loading/error itself.
    setFetchTrigger((prev) => prev + 1);
  }, []);

  return {
    templates,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  };
};

export default useTemplates;
