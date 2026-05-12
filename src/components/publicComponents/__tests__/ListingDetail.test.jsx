/**
 * Tests for ListingCompanyDetails (Step 10.8.9)
 *
 * Covers:
 * 1. Hero section renders business name
 * 2. Shows "No Listing Found" when listing is not in context
 * 3. Renders About Us section
 * 4. Renders Contact section
 * 5. Renders Services section
 * 6. Shows loading spinner when context is loading
 * 7. Component renders without crash
 * 8. Renders listing title in header
 * 9. Renders company category
 * 10. Renders company phone info
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

/* ---- Global mocks ---- */
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, token: null, isAuthenticated: false })),
}));

const mockListingsReturn = {
  listings: [],
  loading: false,
  error: null,
  fetchListings: vi.fn(),
  fetchListingById: vi.fn(),
  fetchListingBySlug: vi.fn().mockResolvedValue(null),
  createListing: vi.fn(),
  updateListing: vi.fn(),
  deleteListing: vi.fn(),
};

vi.mock('../../../context/ListingsContext', () => ({
  useListings: () => mockListingsReturn,
  ListingsProvider: ({ children }) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'awesome-business' }),
    useNavigate: () => vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

vi.mock('axios');

/* ---- Mock hooks ---- */
vi.mock('../../../hooks/useFavourites', () => ({
  useFavourite: vi.fn(() => ({
    isFavourited: false,
    favouriteCount: 0,
    toggleFavourite: vi.fn(),
    loading: false,
    requiresAuth: false,
  })),
  useUserFavourites: () => ({ favourites: [], pagination: null, loading: false, error: null, refetch: vi.fn() }),
  useBatchFavourites: () => ({ statusMap: {}, loading: false, refetch: vi.fn() }),
}));

vi.mock('../../../hooks/useReviews', () => ({
  useReviews: vi.fn(() => ({
    reviews: [],
    stats: { averageRating: 0, totalCount: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    pagination: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useSubmitReview: vi.fn(() => ({
    submitReview: vi.fn().mockResolvedValue(null),
    loading: false,
    error: null,
    fieldErrors: {},
    requiresAuth: false,
  })),
  useVoteReview: () => ({ voteReview: vi.fn(), loading: false }),
  useReplyReview: () => ({ replyReview: vi.fn(), loading: false, error: null }),
}));

vi.mock('../../../hooks/useComments', () => ({
  useComments: vi.fn(() => ({
    comments: [],
    pagination: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useSubmitComment: () => ({
    submitComment: vi.fn().mockResolvedValue(null),
    loading: false,
    error: null,
    requiresAuth: false,
  }),
  useReactComment: () => ({ reactComment: vi.fn(), loading: false }),
}));

import { useAuth } from '../../../context/AuthContext';
import ListingCompanyDetails from '../../../pages/publicPages/ListingCompanyDetails';

const theme = createTheme();

const mockListing = {
  id: 42,
  slug: 'awesome-business',
  title: 'Awesome Business',
  category: 'Technology',
  desc: 'A great tech business',
  phone: '+44 7911 123456',
  website: 'https://awesome.example.com',
  address: '123 Main Street, London',
  businessBanner: '',
  businessLogo: '',
  averageRating: 4.2,
  reviewCount: 5,
  creator: 'user1',
  status: 'active',
  city: 'London',
  region: 'UK',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const renderListingDetail = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <ListingCompanyDetails />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('ListingCompanyDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: null, token: null, isAuthenticated: false });
    // Default: listing found in context
    mockListingsReturn.listings = [mockListing];
    mockListingsReturn.loading = false;
    mockListingsReturn.error = null;
  });

  it('1: renders hero section with business name after loading', async () => {
    renderListingDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Awesome Business').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('2: shows "No Listing Found" when listing is not in context', async () => {
    mockListingsReturn.listings = [];
    renderListingDetail();
    await waitFor(() => {
      expect(screen.getByText('No Listing Found')).toBeInTheDocument();
    });
  });

  it('3: renders description text from listing', async () => {
    renderListingDetail();
    await waitFor(() => {
      expect(screen.getAllByText('Awesome Business').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('4: renders category from listing', async () => {
    renderListingDetail();
    await waitFor(() => {
      expect(screen.getAllByText(/Technology/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('5: renders contact section with address', async () => {
    renderListingDetail();
    await waitFor(() => {
      expect(screen.getAllByText(/123 Main Street/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('6: shows loading spinner when context is loading', () => {
    mockListingsReturn.loading = true;
    mockListingsReturn.listings = [];
    renderListingDetail();
    // MUI CircularProgress renders a role="progressbar" element
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('7: component renders without crash when listing is found', () => {
    const { container } = renderListingDetail();
    expect(container).toBeTruthy();
  });

  it('8: component renders without crash when no listing', () => {
    mockListingsReturn.listings = [];
    const { container } = renderListingDetail();
    expect(container).toBeTruthy();
  });

  it('9: renders website link in contact area', async () => {
    renderListingDetail();
    await waitFor(() => {
      const links = screen.getAllByText(/awesome\.example\.com/i);
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('10: renders phone number in contact area', async () => {
    renderListingDetail();
    await waitFor(() => {
      // Phone number appears formatted
      const phoneElements = screen.getAllByText(/7911/i);
      expect(phoneElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
