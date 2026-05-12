import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Searchbar from '../Listing/Searchbar';
import type { Place } from '../../../types/place';

const theme = createTheme();

function buildSearchProps(overrides: Record<string, unknown> = {}) {
  return {
    searchKeyword: '',
    setSearchKeyword: vi.fn(),
    propertyType: undefined,
    setPropertyType: vi.fn(),
    filteredData: [] as Place[],
    setFilteredData: vi.fn(),
    data: [] as Place[],
    setCategory: vi.fn(),
    category: [] as string[],
    region: '',
    setRegion: vi.fn(),
    city: '',
    setCity: vi.fn(),
    priceRange: '',
    setPriceRange: vi.fn(),
    categoryArray: [
      { value: 'Food', label: 'Food & Dining' },
      { value: 'Tech', label: 'Technology' },
    ],
    area: '',
    setArea: vi.fn(),
    accNTaxService: [] as string[],
    setAccNTaxService: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    error: false,
    setError: vi.fn(),
    items: [] as Place[],
    setItems: vi.fn(),
    setTotalPages: vi.fn(),
    clearFilter: vi.fn(),
    ...overrides,
  };
}

function renderSearchbar(props: Record<string, unknown>) {
  return render(
    React.createElement(
      MemoryRouter,
      {},
      React.createElement(
        ThemeProvider,
        { theme },
        React.createElement(Searchbar, props as unknown as React.ComponentProps<typeof Searchbar>)
      )
    )
  );
}

describe('Searchbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the listing search input', () => {
    renderSearchbar(buildSearchProps());
    // The TextField uses label="Search Keyword", which MUI renders as a label
    expect(screen.getByLabelText('Search Keyword')).toBeInTheDocument();
  });

  it('renders core search controls', () => {
    renderSearchbar(buildSearchProps());
    // The component shows "Advance Filter" toggle and "Services" dropdown label
    expect(screen.getByText('Advance Filter')).toBeInTheDocument();
    // "Services" appears as both a Typography label and an InputLabel
    expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1);
  });

  it('reflects the current search term', () => {
    renderSearchbar(buildSearchProps({ searchKeyword: 'pizza' }));
    expect(screen.getByDisplayValue('pizza')).toBeInTheDocument();
  });

  it('typing in the search input calls setSearchKeyword', () => {
    const setSearchKeyword = vi.fn();
    renderSearchbar(buildSearchProps({ setSearchKeyword }));

    fireEvent.change(screen.getByLabelText('Search Keyword'), {
      target: { value: 'updated query' },
    });

    expect(setSearchKeyword).toHaveBeenCalled();
  });
});
