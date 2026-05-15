import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme();

/* ------------------------------------------------------------------ */
/*  Mock useListings from ListingsContext                               */
/* ------------------------------------------------------------------ */

const mockListingsContext = {
  listings: [] as Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    creator: string;
    desc: string;
    address: string;
    phone: string;
    city: string;
    region: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>,
  loading: false,
  error: null as string | null,
  fetchListings: vi.fn(),
  fetchListingById: vi.fn(),
  fetchListingBySlug: vi.fn(),
  createListing: vi.fn(),
  updateListing: vi.fn(),
  deleteListing: vi.fn(),
};

let currentMockContext = { ...mockListingsContext };

vi.mock("../../context/ListingsContext", () => ({
  useListings: () => currentMockContext,
  ListingsProvider: ({ children }: any) => children,
}));

// Mock Hero (the component uses Hero, not StyledHeader)
vi.mock("../../components/publicComponents/Listing/Hero", () => ({
  default: () => React.createElement("div", { "data-testid": "hero" }, "Hero"),
}));

// Mock Searchbar (avoids API + context deps)
vi.mock("../../components/publicComponents/Listing/Searchbar", () => ({
  default: React.memo((props: any) =>
    React.createElement(
      "div",
      { "data-testid": "searchbar" },
      `Searchbar: ${props.searchKeyword}`,
    ),
  ),
}));

// Mock SideFilter
vi.mock("../../components/publicComponents/Listing/SideFilter", () => ({
  default: React.memo(() =>
    React.createElement("div", { "data-testid": "sidefilter" }, "SideFilter"),
  ),
}));

// Mock PropertyCard
vi.mock("../../components/publicComponents/Listing/PropertyCard", () => ({
  default: React.memo(({ items }: any) =>
    React.createElement(
      "div",
      { "data-testid": "property-card" },
      `${items.length} items`,
    ),
  ),
}));

// Mock ListingsData
vi.mock("../../utils/data/Listings", () => ({
  ListingsData: { title: "Listings", subtitle: "Browse" },
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
/*  Tests — async because Searchbar/SideFilter/PropertyCard are lazy   */
/* ------------------------------------------------------------------ */

describe("Listings (Enhanced)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockContext = { ...mockListingsContext };
  });

  /* ---- 1. Loading state shows CircularProgress ---- */
  it("renders loading spinner when loading is true", async () => {
    currentMockContext = { ...mockListingsContext, loading: true };
    renderListings();

    // Wait for lazy Suspense to resolve, then check for spinner
    await waitFor(() => {
      const spinner = document.querySelector(".MuiCircularProgress-root");
      expect(spinner).toBeTruthy();
    });
  });

  /* ---- 2. Listings rendered via PropertyCard ---- */
  it("renders PropertyCard with listing items when data is loaded", async () => {
    currentMockContext = {
      ...mockListingsContext,
      listings: [
        {
          id: "1",
          slug: "biz-1",
          title: "Biz 1",
          category: "Food",
          creator: "u1",
          desc: "",
          address: "",
          phone: "",
          city: "",
          region: "",
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          slug: "biz-2",
          title: "Biz 2",
          category: "Tech",
          creator: "u2",
          desc: "",
          address: "",
          phone: "",
          city: "",
          region: "",
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
      ],
    };
    renderListings();

    expect(await screen.findByTestId("property-card")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  /* ---- 3. No listings state ---- */
  it('shows "No listings found." when listings array is empty and not loading', async () => {
    currentMockContext = {
      ...mockListingsContext,
      listings: [],
      loading: false,
      error: null,
    };
    renderListings();

    expect(await screen.findByText("No listings found.")).toBeInTheDocument();
  });

  /* ---- 4. Error state ---- */
  it("shows error message when error is set", async () => {
    currentMockContext = {
      ...mockListingsContext,
      error: "Failed to fetch listings",
    };
    renderListings();

    expect(
      await screen.findByText("Failed to fetch listings"),
    ).toBeInTheDocument();
  });

  /* ---- 5. Directory header shown when not dashboard ---- */
  it('shows "Explore Our Directory" heading when isDashboard is false', async () => {
    currentMockContext = {
      ...mockListingsContext,
      listings: [
        {
          id: "1",
          slug: "b",
          title: "B",
          category: "C",
          creator: "u",
          desc: "",
          address: "",
          phone: "",
          city: "",
          region: "",
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
      ],
    };
    renderListings(false);

    expect(
      await screen.findByText("Explore Our Directory"),
    ).toBeInTheDocument();
  });

  /* ---- 6. Hero is rendered ---- */
  it("renders Hero component", () => {
    renderListings(false);
    expect(screen.getByTestId("hero")).toBeInTheDocument();
  });

  /* ---- 7. Searchbar receives searchKeyword prop ---- */
  it("renders Searchbar component", async () => {
    renderListings();
    expect(await screen.findByTestId("searchbar")).toBeInTheDocument();
  });

  /* ---- 8. SideFilter is rendered ---- */
  it("renders SideFilter component", async () => {
    renderListings();
    expect(await screen.findByTestId("sidefilter")).toBeInTheDocument();
  });
});
