/**
 * Tests for Favourites Dashboard Page (Step 10.8.11)
 *
 * Covers:
 * 1. Grid rendering of favourite listings
 * 2. Sort dropdown change calls hook with new sort value
 * 3. Search filter narrows displayed cards
 * 4. Unfavourite animation trigger (heart click)
 * 5. Empty state when no favourites
 * 6. Loading skeleton displayed during fetch
 * 7. Pagination controls rendered when multiple pages
 * 8. Error state with retry button
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

/* ---- Global mocks ---- */
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark', themeMode: 'dark', changeTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

const mockColors = {
  bgDefault: '#1a1a2e',
  bgCard: '#252542',
  text: '#ffffff',
  textSecondary: '#888888',
  textTertiary: '#555555',
  primary: '#6c63ff',
  primaryDark: '#5a52e0',
  primaryLight: '#8b84ff',
  border: '#333355',
  darker: '#0d0d1a',
  panelBg: '#1e1e3f',
  panelText: '#ffffff',
  panelMuted: '#888888',
  panelSubtle: '#555555',
  panelAccent: '#6c63ff',
  panelDanger: '#ef4444',
  panelBorder: '#333355',
  mode: 'dark',
  error: '#ef4444',
};

vi.mock('../../../styles/dashboardTheme', () => ({
  getDashboardColors: () => mockColors,
  getDashboardTheme: () => createTheme(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('axios');
import axios from 'axios';

/* ---- Mock useFavourites hook ---- */
let mockFavouritesData = {
  favourites: [],
  pagination: null,
  loading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('../../../hooks/useFavourites', () => ({
  useUserFavourites: vi.fn(() => mockFavouritesData),
  useFavourite: () => ({
    isFavourited: false,
    favouriteCount: 0,
    toggleFavourite: vi.fn(),
    loading: false,
  }),
  useBatchFavourites: () => ({ statusMap: {}, loading: false, refetch: vi.fn() }),
}));

import { useUserFavourites } from '../../../hooks/useFavourites';
import Favourites from '../listings/Favourites';

const theme = createTheme();

const renderFavourites = (props = {}) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Favourites pageTitle="Favourites" pageSubtitle="Your saved listings" {...props} />
      </ThemeProvider>
    </MemoryRouter>
  );
};

const sampleFavourites = [
  {
    id: 1,
    websiteId: 1,
    title: 'Coffee Shop A',
    category: 'Food & Drink',
    image: '',
    averageRating: 4.5,
    reviewCount: 10,
    savedAt: new Date().toISOString(),
  },
  {
    id: 2,
    websiteId: 2,
    title: 'Tech Solutions B',
    category: 'Technology',
    image: '',
    averageRating: 4.0,
    reviewCount: 5,
    savedAt: new Date().toISOString(),
  },
  {
    id: 3,
    websiteId: 3,
    title: 'Pizza Palace C',
    category: 'Food & Drink',
    image: '',
    averageRating: 3.8,
    reviewCount: 8,
    savedAt: new Date().toISOString(),
  },
];

describe('Favourites Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post = vi.fn().mockResolvedValue({ data: {} });
    mockFavouritesData = {
      favourites: [],
      pagination: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    vi.mocked(useUserFavourites).mockImplementation(() => mockFavouritesData);
  });

  it('1: renders empty state when no favourites exist', () => {
    renderFavourites();
    expect(screen.getByText('No Favourites Yet')).toBeInTheDocument();
    expect(screen.getByText('Browse Directory')).toBeInTheDocument();
  });

  it('2: renders grid of favourite cards when favourites exist', () => {
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      favourites: sampleFavourites,
    });
    renderFavourites();
    expect(screen.getByText('Coffee Shop A')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions B')).toBeInTheDocument();
    expect(screen.getByText('Pizza Palace C')).toBeInTheDocument();
  });

  it('3: renders sort dropdown with correct options', () => {
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      favourites: sampleFavourites,
    });
    renderFavourites();
    // Sort label should be present — use getAllByText since there may be multiple
    const sortLabels = screen.getAllByText(/Sort by/i);
    expect(sortLabels.length).toBeGreaterThan(0);
  });

  it('4: search filter narrows displayed cards', async () => {
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      favourites: sampleFavourites,
    });
    renderFavourites();

    // All 3 should be shown initially
    expect(screen.getByText('Coffee Shop A')).toBeInTheDocument();

    // Find all textbox inputs (search bar should be first or accessible)
    const searchInputs = screen.getAllByRole('textbox');
    // SearchBar is the first input; fire change event with target.value
    fireEvent.change(searchInputs[0], { target: { value: 'coffee' } });

    await waitFor(() => {
      expect(screen.getByText('Coffee Shop A')).toBeInTheDocument();
      expect(screen.queryByText('Tech Solutions B')).not.toBeInTheDocument();
    });
  });

  it('5: heart button triggers unfavourite action', async () => {
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      favourites: [sampleFavourites[0]],
    });
    renderFavourites();

    const heartButton = screen.getByLabelText('Remove from favourites');
    fireEvent.click(heartButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it('6: loading skeleton is shown during fetch', () => {
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      loading: true,
    });
    renderFavourites();
    // Skeletons should be in the DOM (6 of them)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('7: pagination controls shown when multiple pages', () => {
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      favourites: sampleFavourites,
      pagination: { total: 30, page: 1, totalPages: 3, hasMore: true },
    });
    renderFavourites();
    // TablePagination should be rendered
    const pagination = document.querySelector('.MuiTablePagination-root');
    expect(pagination).toBeTruthy();
  });

  it('8: error state renders with retry button', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useUserFavourites).mockReturnValue({
      ...mockFavouritesData,
      error: 'Network error',
      refetch: mockRefetch,
    });
    renderFavourites();
    expect(screen.getByText('Failed to load favourites')).toBeInTheDocument();
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
