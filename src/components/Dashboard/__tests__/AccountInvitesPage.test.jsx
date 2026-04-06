/**
 * Tests for AccountInvitesPage (Step 7.15.5)
 *
 * Covers:
 * 1.  Renders loading skeleton initially
 * 2.  Displays pending account delegation invites after fetch
 * 3.  Shows empty state when no pending invites
 * 4.  Accept invite calls correct API endpoint (POST /account/delegates/invite/:token/accept)
 * 5.  Accept invite refreshes list on success
 * 6.  Decline invite shows confirmation dialog
 * 7.  Decline invite calls correct API on confirm
 * 8.  Error state displays with retry button
 * 9.  Retry button re-fetches invites
 * 10. Expired invite shows no action buttons
 * 11. Shows role and service scopes on invite card
 * 12. Shows expiry countdown on invite card
 * 13. Handles 404 error on accept (already-processed invite)
 * 14. Prevents double-click on accept/decline buttons (loading state)
 * 15. Decline cancel closes dialog without API call
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark', themeMode: 'dark', changeTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock react-router-dom
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Import component after mocks
// ---------------------------------------------------------------------------
import AccountInvitesPage from '../AccountInvitesPage';

/* ===================== Test Helpers ===================== */

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

const mockInvites = [
  {
    id: 1,
    ownerUserId: 100,
    ownerName: 'Alice Owner',
    ownerEmail: 'alice@example.com',
    email: 'bob@example.com',
    role: 'ACCOUNT_ADMIN',
    serviceScopes: ['websites', 'billing'],
    status: 'PENDING',
    token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    expiresAt: futureDate,
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 2,
    ownerUserId: 200,
    ownerName: 'Charlie Boss',
    ownerEmail: 'charlie@example.com',
    email: 'bob@example.com',
    role: 'ACCOUNT_COLLABORATOR',
    serviceScopes: ['websites'],
    status: 'PENDING',
    token: '11111111-2222-3333-4444-555555555555',
    expiresAt: futureDate,
    createdAt: '2026-03-14T08:00:00Z',
  },
];

const expiredInvite = {
  id: 3,
  ownerUserId: 300,
  ownerName: 'Expired Owner',
  ownerEmail: 'expired@example.com',
  email: 'bob@example.com',
  role: 'ACCOUNT_COLLABORATOR',
  serviceScopes: [],
  status: 'PENDING',
  token: '99999999-8888-7777-6666-555555555555',
  expiresAt: pastDate,
  createdAt: '2026-03-10T00:00:00Z',
};

function renderPage() {
  return render(<AccountInvitesPage />);
}

/* ===================== Tests ===================== */

describe('AccountInvitesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { invites: mockInvites } });
    mockedAxios.post.mockResolvedValue({ data: { delegate: { id: 1 } } });
  });

  // Test 1: Loading skeleton
  it('renders loading skeleton initially', () => {
    // Never resolve so we stay in loading state
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton').getAttribute('aria-busy')).toBe('true');
  });

  // Test 2: Displays pending invites
  it('displays pending account delegation invites after fetch', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });
    const cards = screen.getAllByTestId('account-invite-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    expect(screen.getByText('Charlie Boss')).toBeInTheDocument();
  });

  // Test 3: Empty state
  it('shows empty state when no pending invites', async () => {
    mockedAxios.get.mockResolvedValue({ data: { invites: [] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
    expect(screen.getByText(/no pending account invites/i)).toBeInTheDocument();
  });

  // Test 4: Accept calls correct API
  it('accept invite calls correct API endpoint', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByTestId('accept-btn-1');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/account/delegates/invite/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/accept')
      );
    });
  });

  // Test 5: Accept refreshes list
  it('accept invite refreshes list on success', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByTestId('accept-btn-1');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      // After accept, the invite should be removed from list
      const cards = screen.getAllByTestId('account-invite-card');
      expect(cards).toHaveLength(1);
    });
  });

  // Test 6: Decline shows confirmation dialog
  it('decline invite shows confirmation dialog', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const declineBtn = screen.getByTestId('decline-btn-1');
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(screen.getByText(/decline invite/i)).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  // Test 7: Decline calls correct API on confirm
  it('decline invite calls correct API on confirm', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const declineBtn = screen.getByTestId('decline-btn-1');
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(screen.getByText(/decline invite/i)).toBeInTheDocument();
    });

    // Click the confirm button in the dialog
    const confirmBtn = screen.getByRole('button', { name: /decline/i });
    // There might be multiple "Decline" buttons - find the one in the dialog
    const dialog = screen.getByRole('dialog');
    const dialogConfirmBtn = within(dialog).getByRole('button', { name: /decline/i });
    fireEvent.click(dialogConfirmBtn);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/account/delegates/invite/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/decline')
      );
    });
  });

  // Test 8: Error state
  it('error state displays with retry button', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  // Test 9: Retry re-fetches
  it('retry button re-fetches invites', async () => {
    mockedAxios.get
      .mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })
      .mockResolvedValueOnce({ data: { invites: mockInvites } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  // Test 10: Expired invite shows no action buttons
  it('expired invite shows no action buttons', async () => {
    mockedAxios.get.mockResolvedValue({ data: { invites: [expiredInvite] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });
    // Verify the expired invite card is rendered with the aria-label indicating expired status
    const card = screen.getByTestId('account-invite-card');
    expect(card.getAttribute('aria-label')).toContain('Expired');
    expect(screen.queryByTestId('accept-btn-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('decline-btn-3')).not.toBeInTheDocument();
  });

  // Test 11: Shows role and service scopes
  it('shows role and service scopes on invite card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });
    // ACCOUNT_ADMIN role displayed
    expect(screen.getByText('Account Admin')).toBeInTheDocument();
    // Service scopes displayed - use getAllByText since "websites" appears on both cards
    const websitesChips = screen.getAllByText('websites');
    expect(websitesChips.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('billing')).toBeInTheDocument();
  });

  // Test 12: Shows expiry countdown
  it('shows expiry countdown on invite card', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });
    // Should show "Expires in X days" for future invites
    expect(screen.getAllByText(/expires in/i).length).toBeGreaterThan(0);
  });

  // Test 13: Handles 404 on accept
  it('handles 404 error on accept (already-processed invite)', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { status: 404, data: { message: 'Invite not found or already processed' } },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByTestId('accept-btn-1');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      // Should show error toast with the error message
      expect(screen.getByText('Invite not found or already processed')).toBeInTheDocument();
    });
  });

  // Test 14: Prevents double-click
  it('prevents double-click on accept button (loading state)', async () => {
    // Slow-resolving post
    mockedAxios.post.mockReturnValue(new Promise((resolve) => {
      setTimeout(() => resolve({ data: { delegate: { id: 1 } } }), 2000);
    }));
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByTestId('accept-btn-1');
    fireEvent.click(acceptBtn);

    // Button should be disabled after first click
    await waitFor(() => {
      expect(acceptBtn).toBeDisabled();
    });
  });

  // Test 15: Decline cancel closes dialog
  it('decline cancel closes dialog without API call', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('account-invites-list')).toBeInTheDocument();
    });

    const declineBtn = screen.getByTestId('decline-btn-1');
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(screen.getByText(/decline invite/i)).toBeInTheDocument();
    });

    // Click cancel/keep button in dialog
    const dialog = screen.getByRole('dialog');
    const cancelBtn = within(dialog).getByRole('button', { name: /keep/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    // Post should not have been called
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});
