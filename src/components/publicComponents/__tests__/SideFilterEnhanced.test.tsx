import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import SideFilter from "../Listing/SideFilter";

const theme = createTheme();

function buildSideFilterProps(overrides: Record<string, unknown> = {}) {
  return {
    accNTaxService: [] as string[],
    setAccNTaxService: vi.fn(),
    area: [] as string[],
    setArea: vi.fn(),
    setItems: vi.fn(),
    items: [
      { category: "Accounting and Bookkeeping" },
      { category: "Legal Services" },
    ],
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
    expect(screen.getByText("Accounting and Bookkeeping")).toBeInTheDocument();
    expect(screen.getByText("Legal Services")).toBeInTheDocument();
  });

  it("checking a category calls setAccNTaxService", () => {
    const setAccNTaxService = vi.fn();
    renderSideFilter(buildSideFilterProps({ setAccNTaxService }));

    fireEvent.click(screen.getByLabelText("Accounting and Bookkeeping"));

    expect(setAccNTaxService).toHaveBeenCalled();
  });
});
