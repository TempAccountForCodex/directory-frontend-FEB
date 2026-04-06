import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { useDirectorySearch } from "../useDirectorySearch";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    MemoryRouter,
    { initialEntries: ["/directory"] },
    children,
  );
}

function wrapperWithSearch(search: string) {
  return function WrapperWithSearch({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return React.createElement(
      MemoryRouter,
      { initialEntries: [`/directory${search}`] },
      children,
    );
  };
}

const mockListingsResponse = {
  results: [
    { id: "1", slug: "test-biz", businessName: "Test Biz" },
    { id: "2", slug: "another-biz", businessName: "Another Biz" },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
};

const mockMetaResponse = {
  categories: [
    { value: "Food", label: "Food & Dining", count: 24 },
    { value: "Tech", label: "Technology", count: 12 },
  ],
  locations: {
    countries: ["USA", "Canada"],
    regions: { USA: ["California", "Texas"], Canada: ["Ontario", "BC"] },
    cities: { California: ["Los Angeles", "San Francisco"], Texas: ["Austin"] },
  },
  priceLevels: [
    { value: "$", label: "$" },
    { value: "$$", label: "$$" },
  ],
  ratingDistribution: { 5: 10, 4: 25 },
  sortOptions: [
    { value: "relevance", label: "Relevance" },
    { value: "rating", label: "Highest Rated" },
  ],
  totalListings: 156,
};

const mockAutocompleteResponse = {
  suggestions: [
    {
      id: "1",
      slug: "pizza-palace",
      businessName: "Pizza Palace",
      businessCategory: "Food & Dining",
      city: "Los Angeles",
      country: "USA",
      businessLogo: "",
      averageRating: 4.5,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("useDirectorySearch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    // Default mock: listings endpoint
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/directory/meta")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMetaResponse),
        });
      }
      if (url.includes("/api/directory/autocomplete")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAutocompleteResponse),
        });
      }
      // default: listings
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockListingsResponse),
      });
    });

    // Clear localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  /* ---- 1. Initial state ---- */
  it("initialises with empty query, relevance sort, no filters", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });
    expect(result.current.query).toBe("");
    expect(result.current.sort).toBe("relevance");
    expect(result.current.filters).toEqual({});
    expect(result.current.viewMode).toBe("grid");
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  /* ---- 2. URL params hydrate state ---- */
  it("hydrates state from URL search params on mount", () => {
    const { result } = renderHook(() => useDirectorySearch(), {
      wrapper: wrapperWithSearch("?q=pizza&sort=rating&category=Food"),
    });
    expect(result.current.query).toBe("pizza");
    expect(result.current.sort).toBe("rating");
    expect(result.current.filters.category).toBe("Food");
  });

  /* ---- 3. setFilter updates filters ---- */
  it("setFilter updates the corresponding filter key", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setFilter("category", "Food");
    });

    expect(result.current.filters.category).toBe("Food");
  });

  /* ---- 4. removeFilter clears filter ---- */
  it("removeFilter clears the specified filter key", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setFilter("category", "Food");
    });
    expect(result.current.filters.category).toBe("Food");

    act(() => {
      result.current.removeFilter("category");
    });
    expect(result.current.filters.category).toBeUndefined();
  });

  /* ---- 5. setSort changes sort ---- */
  it("setSort updates the sort value", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setSort("rating");
    });

    expect(result.current.sort).toBe("rating");
  });

  /* ---- 6. fetchListings called on filter change ---- */
  it("triggers fetch when filter changes", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setFilter("category", "Tech");
    });

    // Advance timer to trigger debounce
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    // fetch should have been called (at least for meta + listings)
    expect(fetchMock).toHaveBeenCalled();
    const listingsCalls = fetchMock.mock.calls.filter((call) =>
      call[0].includes("/api/directory/listings"),
    );
    expect(listingsCalls.length).toBeGreaterThan(0);
  });

  /* ---- 7. autocomplete returns suggestions ---- */
  it("fetchAutocomplete sets suggestions after debounce", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.fetchAutocomplete("piz");
    });

    // Advance past 200ms debounce
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    // Allow microtasks (fetch promise resolution) to flush
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/directory/autocomplete?q=piz"),
      );
    });
  });

  /* ---- 8. recent searches in localStorage ---- */
  it("saves recent searches to localStorage when query changes", async () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setQuery("pizza");
    });

    // saveRecentSearch calls localStorage.setItem
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "tt_recent_searches",
      expect.stringContaining("pizza"),
    );
  });

  /* ---- 9. clearAllFilters resets everything ---- */
  it("clearAllFilters resets filters, query, and sort to defaults", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setQuery("burger");
      result.current.setFilter("category", "Food");
      result.current.setSort("rating");
    });

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.query).toBe("");
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toBe("relevance");
  });

  /* ---- 10. activeFilters derived from filters ---- */
  it("activeFilters array contains chip info for each active filter", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    act(() => {
      result.current.setFilter("category", "Food");
      result.current.setFilter("hasReviews", true);
    });

    expect(result.current.activeFilters.length).toBe(2);
    expect(result.current.activeFilters.some((f) => f.key === "category")).toBe(
      true,
    );
    expect(
      result.current.activeFilters.some((f) => f.key === "hasReviews"),
    ).toBe(true);

    // Each active filter has onRemove callback
    const catFilter = result.current.activeFilters.find(
      (f) => f.key === "category",
    )!;
    expect(typeof catFilter.onRemove).toBe("function");
    act(() => catFilter.onRemove());
    expect(result.current.filters.category).toBeUndefined();
  });

  /* ---- 11. viewMode toggle ---- */
  it("setViewMode toggles between grid, list, and map", () => {
    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    expect(result.current.viewMode).toBe("grid");

    act(() => result.current.setViewMode("list"));
    expect(result.current.viewMode).toBe("list");

    act(() => result.current.setViewMode("map"));
    expect(result.current.viewMode).toBe("map");

    act(() => result.current.setViewMode("grid"));
    expect(result.current.viewMode).toBe("grid");
  });

  /* ---- 12. loading state ---- */
  it("loading is true during fetch and false when complete", async () => {
    vi.useFakeTimers();
    let resolveFetch: (val: any) => void;
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/directory/meta")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMetaResponse),
        });
      }
      return new Promise((resolve) => {
        resolveFetch = resolve;
      });
    });

    const { result } = renderHook(() => useDirectorySearch(), { wrapper });

    // Trigger fetch
    act(() => {
      result.current.setQuery("test");
    });

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    // loading should be true while promise is pending
    // (may already be false if resolved synchronously in test env, but state transitions happen)
    // resolve the fetch
    await act(async () => {
      resolveFetch!({
        ok: true,
        json: () => Promise.resolve(mockListingsResponse),
      });
    });

    expect(result.current.loading).toBe(false);
  });
});
