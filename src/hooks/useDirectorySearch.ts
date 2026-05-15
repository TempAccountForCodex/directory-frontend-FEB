import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface DirectoryFilters {
  category?: string;
  city?: string;
  region?: string;
  country?: string;
  priceLevel?: string;
  minRating?: number;
  hasReviews?: boolean;
  hasStore?: boolean;
  tags?: string[];
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface MetaCategory {
  value: string;
  label: string;
  count: number;
}

export interface MetaPriceLevel {
  value: string;
  label: string;
}

export interface MetaLocations {
  countries: string[];
  regions: Record<string, string[]>;
  cities: Record<string, string[]>;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface DirectoryMeta {
  categories: MetaCategory[];
  locations: MetaLocations;
  priceLevels: MetaPriceLevel[];
  ratingDistribution: Record<number, number>;
  sortOptions: SortOption[];
  totalListings: number;
}

export interface AutocompleteSuggestion {
  id: string;
  slug: string;
  businessName: string;
  businessCategory: string;
  city: string;
  country: string;
  businessLogo: string;
  averageRating: number;
}

export interface DirectoryResult {
  id: string;
  slug: string;
  businessName?: string;
  title?: string;
  [key: string]: any;
}

const RECENT_SEARCHES_KEY = "tt_recent_searches";
const MAX_RECENT = 5;
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL ?? "";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (!query.trim()) return;
  const existing = loadRecentSearches();
  const updated = [query, ...existing.filter((q) => q !== query)].slice(
    0,
    MAX_RECENT,
  );
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

function removeRecentSearch(query: string): void {
  const existing = loadRecentSearches();
  try {
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(existing.filter((q) => q !== query)),
    );
  } catch {
    // ignore
  }
}

function clearAllRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export interface UseDirectorySearchReturn {
  /* results */
  results: DirectoryResult[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;

  /* query / sort */
  query: string;
  setQuery: (q: string) => void;
  sort: string;
  setSort: (s: string) => void;

  /* filters */
  filters: DirectoryFilters;
  setFilter: (key: keyof DirectoryFilters, value: any) => void;
  removeFilter: (key: keyof DirectoryFilters) => void;
  clearAllFilters: () => void;
  activeFilters: ActiveFilter[];

  /* meta */
  meta: DirectoryMeta | null;

  /* autocomplete */
  suggestions: AutocompleteSuggestion[];
  fetchAutocomplete: (q: string) => void;

  /* recent searches */
  recentSearches: string[];
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;

  /* view mode */
  viewMode: "grid" | "list" | "map";
  setViewMode: (mode: "grid" | "list" | "map") => void;

  /* pagination */
  setPage: (p: number) => void;
}

export function useDirectorySearch(): UseDirectorySearchReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---- Hydrate state from URL on mount ---- */
  const initialQuery = searchParams.get("q") ?? "";
  const initialSort = searchParams.get("sort") ?? "relevance";
  const initialPage = parseInt(searchParams.get("page") ?? "1", 10);
  const initialCategory = searchParams.get("category") ?? undefined;
  const initialCity = searchParams.get("city") ?? undefined;
  const initialRegion = searchParams.get("region") ?? undefined;
  const initialCountry = searchParams.get("country") ?? undefined;
  const initialPriceLevel = searchParams.get("priceLevel") ?? undefined;
  const initialMinRating = searchParams.get("minRating")
    ? parseFloat(searchParams.get("minRating")!)
    : undefined;
  const initialHasReviews =
    searchParams.get("hasReviews") === "true" ? true : undefined;
  const initialHasStore =
    searchParams.get("hasStore") === "true" ? true : undefined;

  /* ---- Core state ---- */
  const [query, setQueryState] = useState<string>(initialQuery);
  const [sort, setSortState] = useState<string>(initialSort);
  const [filters, setFiltersState] = useState<DirectoryFilters>({
    category: initialCategory,
    city: initialCity,
    region: initialRegion,
    country: initialCountry,
    priceLevel: initialPriceLevel,
    minRating: initialMinRating,
    hasReviews: initialHasReviews,
    hasStore: initialHasStore,
  });
  const [page, setPageState] = useState<number>(initialPage);
  const pageSize = 20;
  const [viewMode, setViewModeState] = useState<"grid" | "list" | "map">(
    "grid",
  );

  /* ---- Results state ---- */
  const [results, setResults] = useState<DirectoryResult[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- Meta state ---- */
  const [meta, setMeta] = useState<DirectoryMeta | null>(null);

  /* ---- Autocomplete state ---- */
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);

  /* ---- Recent searches state ---- */
  const [recentSearches, setRecentSearchesState] =
    useState<string[]>(loadRecentSearches);

  /* ---- Debounce refs ---- */
  const fetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* ---- URL sync helper ---- */
  const syncUrl = useCallback(
    (
      newQuery: string,
      newSort: string,
      newFilters: DirectoryFilters,
      newPage: number,
    ) => {
      const params: Record<string, string> = {};
      if (newQuery) params["q"] = newQuery;
      if (newSort && newSort !== "relevance") params["sort"] = newSort;
      if (newPage > 1) params["page"] = String(newPage);
      if (newFilters.category) params["category"] = newFilters.category;
      if (newFilters.city) params["city"] = newFilters.city;
      if (newFilters.region) params["region"] = newFilters.region;
      if (newFilters.country) params["country"] = newFilters.country;
      if (newFilters.priceLevel) params["priceLevel"] = newFilters.priceLevel;
      if (newFilters.minRating !== undefined)
        params["minRating"] = String(newFilters.minRating);
      if (newFilters.hasReviews === true) params["hasReviews"] = "true";
      if (newFilters.hasStore === true) params["hasStore"] = "true";
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  /* ---- Fetch listings ---- */
  const fetchListings = useCallback(
    (q: string, s: string, f: DirectoryFilters, p: number) => {
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      fetchDebounceRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const urlParams = new URLSearchParams();
          if (q) urlParams.set("q", q);
          if (s && s !== "relevance") urlParams.set("sort", s);
          urlParams.set("page", String(p));
          urlParams.set("pageSize", String(pageSize));
          if (f.category) urlParams.set("category", f.category);
          if (f.city) urlParams.set("city", f.city);
          if (f.region) urlParams.set("region", f.region);
          if (f.country) urlParams.set("country", f.country);
          if (f.priceLevel) urlParams.set("priceLevel", f.priceLevel);
          if (f.minRating !== undefined)
            urlParams.set("minRating", String(f.minRating));
          if (f.hasReviews) urlParams.set("hasReviews", "true");
          if (f.hasStore) urlParams.set("hasStore", "true");

          const res = await fetch(
            `${BACKEND_URL}/api/directory/listings?${urlParams.toString()}`,
          );
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const data = await res.json();
          setResults(data.results ?? []);
          setTotal(data.total ?? 0);
        } catch (err: any) {
          setError(err?.message ?? "Failed to load listings");
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ---- Fetch meta on mount ---- */
  useEffect(() => {
    let cancelled = false;
    const fetchMeta = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/directory/meta`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMeta(data);
      } catch {
        // silently ignore meta fetch errors
      }
    };
    fetchMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Fetch listings on state change ---- */
  useEffect(() => {
    fetchListings(query, sort, filters, page);
    syncUrl(query, sort, filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, filters, page]);

  /* ---- Setters ---- */
  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    setPageState(1);
  }, []);

  const setSort = useCallback((s: string) => {
    setSortState(s);
    setPageState(1);
  }, []);

  const setFilter = useCallback((key: keyof DirectoryFilters, value: any) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPageState(1);
  }, []);

  const removeFilter = useCallback((key: keyof DirectoryFilters) => {
    setFiltersState((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPageState(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFiltersState({});
    setQueryState("");
    setSortState("relevance");
    setPageState(1);
  }, []);

  const setPage = useCallback((p: number) => {
    setPageState(p);
  }, []);

  const setViewMode = useCallback((mode: "grid" | "list" | "map") => {
    setViewModeState(mode);
  }, []);

  /* ---- Autocomplete ---- */
  const fetchAutocomplete = useCallback((q: string) => {
    if (autocompleteDebounceRef.current)
      clearTimeout(autocompleteDebounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    autocompleteDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/directory/autocomplete?q=${encodeURIComponent(q)}&limit=5`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 200);
  }, []);

  /* ---- Recent searches ---- */
  const clearRecentSearches = useCallback(() => {
    clearAllRecentSearches();
    setRecentSearchesState([]);
  }, []);

  const removeRecentSearchItem = useCallback((q: string) => {
    removeRecentSearch(q);
    setRecentSearchesState(loadRecentSearches());
  }, []);

  /* ---- Persist recent search when query changes ---- */
  useEffect(() => {
    if (query.trim()) {
      saveRecentSearch(query);
      setRecentSearchesState(loadRecentSearches());
    }
  }, [query]);

  /* ---- Active filters derived array ---- */
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const items: ActiveFilter[] = [];

    const push = (
      key: keyof DirectoryFilters,
      label: string,
      value: string,
    ) => {
      items.push({
        key,
        label,
        value,
        onRemove: () => removeFilter(key),
      });
    };

    if (filters.category)
      push("category", `Category: ${filters.category}`, filters.category);
    if (filters.city) push("city", `City: ${filters.city}`, filters.city);
    if (filters.region)
      push("region", `Region: ${filters.region}`, filters.region);
    if (filters.country)
      push("country", `Country: ${filters.country}`, filters.country);
    if (filters.priceLevel)
      push("priceLevel", `Price: ${filters.priceLevel}`, filters.priceLevel);
    if (filters.minRating !== undefined)
      push(
        "minRating",
        `${filters.minRating}+ stars`,
        String(filters.minRating),
      );
    if (filters.hasReviews) push("hasReviews", "Has Reviews", "true");
    if (filters.hasStore) push("hasStore", "Has Online Store", "true");

    return items;
  }, [filters, removeFilter]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      if (autocompleteDebounceRef.current)
        clearTimeout(autocompleteDebounceRef.current);
    };
  }, []);

  return {
    results,
    total,
    page,
    pageSize,
    loading,
    error,
    query,
    setQuery,
    sort,
    setSort,
    filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    activeFilters,
    meta,
    suggestions,
    fetchAutocomplete,
    recentSearches,
    clearRecentSearches,
    removeRecentSearch: removeRecentSearchItem,
    viewMode,
    setViewMode,
    setPage,
  };
}
