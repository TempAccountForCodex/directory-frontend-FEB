import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import SideFilter from "../Listing/SideFilter";

const theme = createTheme();

function buildSideFilterProps(overrides: Record<string, unknown> = {}) {
  const data = [
    { category: "Accounting and Bookkeeping" },
    { category: "Legal Services" },
  ];

  return {
    searchKeyword: "",
    setSearchKeyword: vi.fn(),
    propertyType: undefined,
    setPropertyType: vi.fn(),
    category: [] as string[],
    setCategory: vi.fn(),
    categoryArray: data.map((item) => ({
      value: item.category,
      label: item.category,
    })),
    accNTaxService: [] as string[],
    setAccNTaxService: vi.fn(),
    region: "",
    setRegion: vi.fn(),
    city: "",
    setCity: vi.fn(),
    priceRange: "",
    setPriceRange: vi.fn(),
    area: "",
    setArea: vi.fn(),
    data,
    setFilteredData: vi.fn(),
    setTotalPages: vi.fn(),
    loading: false,
    clearFilter: vi.fn(),
    setItems: vi.fn(),
    ...overrides,
  };
}

function renderSideFilter(props: Record<string, unknown>) {
  return render(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(
        ThemeProvider,
        { theme },
        React.createElement(
          SideFilter,
          props as unknown as React.ComponentProps<typeof SideFilter>,
        ),
      ),
    ),
  );
}

describe("SideFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the category list", () => {
    renderSideFilter(buildSideFilterProps());
    expect(screen.getByText("Categories")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Categories"));
    expect(screen.getByText("Accounting and Bookkeeping")).toBeInTheDocument();
    expect(screen.getByText("Legal Services")).toBeInTheDocument();
  });

  it("checking a category calls setAccNTaxService", () => {
    const setAccNTaxService = vi.fn();
    renderSideFilter(buildSideFilterProps({ setAccNTaxService }));

    fireEvent.click(screen.getByText("Categories"));
    fireEvent.click(screen.getByText("Accounting and Bookkeeping"));

    expect(setAccNTaxService).toHaveBeenCalled();
  });
});
