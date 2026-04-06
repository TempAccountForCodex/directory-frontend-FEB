import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme();

/* ------------------------------------------------------------------ */
/*  Mock useDirectorySearch                                             */
/* ------------------------------------------------------------------ */

const mockSearchState = {
  results: [] as Array<{ id: string; slug: string; businessName: string }>,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null as string | null,
  query: "",
  setQuery: vi.fn(),
  sort: "relevance",
  setSort: vi.fn(),
  filters: {},
  setFilter: vi.fn(),
  removeFilter: vi.fn(),
  clearAllFilters: vi.fn(),
  activeFilters: [],
  meta: {
    categories: [{ value: "Food", label: "Food & Dining", count: 24 }],
    locations: { countries: ["USA"], regions: {}, cities: {} },
    priceLevels: [{ value: "$", label: "$" }],
    ratingDistribution: {},
    sortOptions: [{ value: "relevance", label: "Relevance" }],
    totalListings: 100,
  },
  suggestions: [],
  fetchAutocomplete: vi.fn(),
  recentSearches: [],
  clearRecentSearches: vi.fn(),
  removeRecentSearch: vi.fn(),
  viewMode: "grid" as const,
  setViewMode: vi.fn(),
  setPage: vi.fn(),
};

let currentMockState = { ...mockSearchState };

vi.mock("../../hooks/useDirectorySearch", () => ({
  useDirectorySearch: () => currentMockState,
}));

// Mock StyledHeader
vi.mock("../../components/publicComponents/Home/StyledHeader", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "styled-header" }, "Header"),
}));

// Mock Searchbar (avoids context deps)
vi.mock("../../components/publicComponents/Listing/Searchbar", () => ({
  default: React.memo(({ searchState }: any) =>
    React.createElement(
      "div",
      { "data-testid": "searchbar" },
      `Searchbar: ${searchState.query}`,
    ),
  ),
}));

// Mock SideFilter
vi.mock("../../components/publicComponents/Listing/SideFilter", () => ({
  default: React.memo(({ searchState }: any) =>
    React.createElement("div", { "data-testid": "sidefilter" }, "SideFilter"),
  ),
}));

// Mock PropertyCard (avoids useBatchFavourites and PropertyCardItem context deps)
vi.mock("../../components/publicComponents/Listing/PropertyCard", () => ({
  default: React.memo(({ items, viewMode }: any) =>
    React.createElement(
      "div",
      { "data-testid": "property-card" },
      `${items.length} items (${viewMode ?? "grid"})`,
    ),
  ),
}));

// Mock DirectoryMapView
vi.mock("../../components/publicComponents/Listing/DirectoryMapView", () => ({
  default: React.memo(({ results }: any) =>
    React.createElement(
      "div",
      { "data-testid": "map-view" },
      `Map: ${results.length} markers`,
    ),
  ),
}));

import Listings from "../publicPages/Listings";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function renderListings(isDashboard = false) {
  return render(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(
        ThemeProvider,
        { theme },
        React.createElement(Listings, { isDashboard }),
      ),
    ),
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("Listings (Enhanced)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockState = { ...mockSearchState };
  });

  /* ---- 1. Loading skeleton ---- */
  it("renders loading skeleton cards when loading is true", () => {
    currentMockState = { ...mockSearchState, loading: true };
    renderListings();

    // Should render 8 skeleton cards (Skeleton variant="rectangular")
    const skeletons = document.querySelectorAll(".MuiSkeleton-rectangular");
    expect(skeletons.length).toBe(8);
  });

  /* ---- 2. Results count header ---- */
  it("shows results count header when results are loaded", () => {
    currentMockState = {
      ...mockSearchState,
      results: [
        { id: "1", slug: "biz-1", businessName: "Biz 1" },
        { id: "2", slug: "biz-2", businessName: "Biz 2" },
      ],
      total: 42,
    };
    renderListings();

    expect(screen.getByText(/42 businesses found/i)).toBeInTheDocument();
  });

  /* ---- 3. No results state ---- */
  it("shows no results state when total is 0 and not loading", () => {
    currentMockState = {
      ...mockSearchState,
      results: [],
      total: 0,
      loading: false,
    };
    renderListings();

    expect(screen.getByText("No businesses found")).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
  });

  /* ---- 4. View toggle ---- */
  it("renders view toggle buttons for grid, list, and map", () => {
    currentMockState = {
      ...mockSearchState,
      results: [{ id: "1", slug: "biz", businessName: "Biz" }],
      total: 1,
    };
    renderListings();

    expect(screen.getByLabelText("Grid view")).toBeInTheDocument();
    expect(screen.getByLabelText("List view")).toBeInTheDocument();
    expect(screen.getByLabelText("Map view")).toBeInTheDocument();
  });

  /* ---- 5. StyledHeader shown when not dashboard ---- */
  it("shows StyledHeader when isDashboard is false", () => {
    renderListings(false);
    expect(screen.getByTestId("styled-header")).toBeInTheDocument();
  });

  /* ---- 6. Error state ---- */
  it("shows error alert when error is set", () => {
    currentMockState = {
      ...mockSearchState,
      error: "Failed to fetch listings",
    };
    renderListings();

    expect(screen.getByText("Failed to fetch listings")).toBeInTheDocument();
  });
});
