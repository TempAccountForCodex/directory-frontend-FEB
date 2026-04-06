/**
 * Tests for Account Delegate Team Tab (Step 7.15.1 + 7.15.2)
 *
 * Covers:
 *  1. Settings team tab renders delegate list after fetch
 *  2. Settings team tab shows loading skeleton while fetching
 *  3. Settings team tab shows empty state when no delegates
 *  4. Invite button opens AccountDelegateInviteModal
 *  5. Invite modal closes on cancel
 *  6. Invite modal validates empty email
 *  7. Invite modal validates invalid email format
 *  8. Invite modal submits successfully and refreshes list
 *  9. Invite modal handles 429 rate limit error
 * 10. Invite modal handles generic API error
 * 11. Revoke delegate shows confirmation dialog
 * 12. Revoke delegate calls API on confirm
 * 13. Plan-gating displays for free users
 * 14. Delegate row shows name, email, role chip
 * 15. Invite modal role selection between ACCOUNT_ADMIN and ACCOUNT_COLLABORATOR
 * 16. Invite modal shows service scope checkboxes for ACCOUNT_COLLABORATOR
 * 17. Invite modal hides service scope checkboxes for ACCOUNT_ADMIN
 * 18. Pending invites section is displayed
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
// Mock AuthContext
// ---------------------------------------------------------------------------
const mockAuthUser = {
  id: 1,
  name: 'Test Owner',
  email: 'owner@test.com',
  plan: 'pro',
};

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: mockAuthUser,
    updateUser: vi.fn(),
    resendVerification: vi.fn(),
    verifyEmail: vi.fn(),
    requestEmailChange: vi.fn(),
    confirmEmailChange: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    unlinkGoogle: vi.fn(),
    deleteAccount: vi.fn(),
    changePassword: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// Mock usePlanSummary
// ---------------------------------------------------------------------------
const mockPlanSummary = {
  websitePlan: {
    code: 'pro',
    name: 'Pro',
    priceMonthlyUsd: 19,
    maxSites: 10,
    maxPagesPerSite: 50,
    maxBlocksPerPage: 30,
    analyticsLevel: 'advanced',
    listedInDirectory: true,
  },
  websiteUsage: { websitesOwned: 2, pagesByWebsiteId: {}, blocksByPageId: {} },
  storePlan: { code: null, name: null, priceMonthlyUsd: null, maxStores: null, maxProductsPerStore: null, platformFeePercent: null, analyticsLevel: null },
  storeUsage: { storesOwned: null, productsByStoreId: null },
};

const mockFreePlanSummary = {
  websitePlan: {
    code: 'free',
    name: 'Free',
    priceMonthlyUsd: 0,
    maxSites: 1,
    maxPagesPerSite: 5,
    maxBlocksPerPage: 10,
    analyticsLevel: 'basic',
    listedInDirectory: false,
  },
  websiteUsage: { websitesOwned: 1, pagesByWebsiteId: {}, blocksByPageId: {} },
  storePlan: { code: null, name: null, priceMonthlyUsd: null, maxStores: null, maxProductsPerStore: null, platformFeePercent: null, analyticsLevel: null },
  storeUsage: { storesOwned: null, productsByStoreId: null },
};

let currentPlanSummary = mockPlanSummary;

vi.mock('../../../hooks/usePlanSummary', () => ({
  usePlanSummary: () => ({
    planSummary: currentPlanSummary,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Mock react-router-dom
// ---------------------------------------------------------------------------
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard/settings/team' }),
}));

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Import components after mocks
// ---------------------------------------------------------------------------
import Settings from '../Settings';

/* ===================== Test Fixtures ===================== */

const mockDelegates = [
  {
    id: 1,
    delegateUserId: 10,
    role: 'ACCOUNT_ADMIN',
    serviceScopes: [],
    createdAt: '2026-03-15T00:00:00Z',
    delegateUser: { id: 10, name: 'Alice Admin', email: 'alice@test.com' },
  },
  {
    id: 2,
    delegateUserId: 20,
    role: 'ACCOUNT_COLLABORATOR',
    serviceScopes: ['websites', 'insights'],
    createdAt: '2026-03-16T00:00:00Z',
    delegateUser: { id: 20, name: 'Bob Collab', email: 'bob@test.com' },
  },
];

const mockPendingInvites = [
  {
    id: 100,
    email: 'pending@test.com',
    role: 'ACCOUNT_COLLABORATOR',
    status: 'PENDING',
    createdAt: '2026-03-17T00:00:00Z',
  },
];

function setupAxiosMocks(delegates = mockDelegates, pendingInvites = mockPendingInvites) {
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes('/account/delegates/invites/pending')) {
      return Promise.resolve({ data: { invites: pendingInvites } });
    }
    if (url.includes('/account/delegates')) {
      return Promise.resolve({ data: { delegates } });
    }
    // Plan summary or any other GET
    return Promise.resolve({ data: {} });
  });
  mockedAxios.post.mockResolvedValue({ data: { invite: { id: 999 } } });
  mockedAxios.delete.mockResolvedValue({ data: { message: 'Delegate access revoked' } });
  mockedAxios.put.mockResolvedValue({ data: { delegate: {} } });
}

function renderSettings(props = {}) {
  return render(<Settings subtab="team" pageTitle="Settings" pageSubtitle="Manage your account" {...props} />);
}

/** Helper: open the invite modal after waiting for delegate list to load */
async function openInviteModal() {
  await waitFor(() => {
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole('button', { name: /invite delegate/i }));
  await waitFor(() => {
    expect(screen.getByText(/invite a delegate/i)).toBeInTheDocument();
  });
}

/** Helper: find the email input inside the invite modal by placeholder */
function getEmailInput() {
  return screen.getByPlaceholderText('delegate@example.com');
}

/* ===================== Tests ===================== */

describe('AccountDelegateTeamTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPlanSummary = mockPlanSummary;
    setupAxiosMocks();
  });

  // Test 1: Renders delegate list
  it('renders delegate list after fetch', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Collab')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  // Test 2: Shows loading skeleton
  it('shows loading skeleton while fetching delegates', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // never resolves
    renderSettings();
    const loadingRegion = screen.getByLabelText('Loading delegates');
    expect(loadingRegion).toBeInTheDocument();
    expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
  });

  // Test 3: Shows empty state
  it('shows empty state when no delegates exist', async () => {
    setupAxiosMocks([], []);
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText(/no delegates yet/i)).toBeInTheDocument();
    });
  });

  // Test 4: Invite button opens modal
  it('invite button opens AccountDelegateInviteModal', async () => {
    renderSettings();
    await openInviteModal();
    // Modal is visible
    expect(screen.getByText(/invite a delegate/i)).toBeInTheDocument();
  });

  // Test 5: Modal closes on cancel
  it('invite modal closes on cancel', async () => {
    renderSettings();
    await openInviteModal();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText(/invite a delegate/i)).not.toBeInTheDocument();
    });
  });

  // Test 6: Validates empty email
  it('invite modal validates empty email on submit', async () => {
    renderSettings();
    await openInviteModal();
    const sendBtn = screen.getByRole('button', { name: /send invite/i });
    fireEvent.click(sendBtn);
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  // Test 7: Validates invalid email
  it('invite modal validates invalid email format', async () => {
    renderSettings();
    await openInviteModal();
    const emailInput = getEmailInput();
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  // Test 8: Successful invite submission
  it('invite modal submits successfully and refreshes delegate list', async () => {
    renderSettings();
    await openInviteModal();
    const emailInput = getEmailInput();
    fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/account/delegates/invite'),
        expect.objectContaining({ email: 'newuser@test.com' })
      );
    });
    // Modal should close after success
    await waitFor(() => {
      expect(screen.queryByText(/invite a delegate/i)).not.toBeInTheDocument();
    });
  });

  // Test 9: Handles rate limit error
  it('invite modal handles 429 rate limit error', async () => {
    renderSettings();
    await openInviteModal();
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { message: 'Too many delegation invites. Try again in 1 hour.', retryAfter: 3600 },
      },
    });
    const emailInput = getEmailInput();
    fireEvent.change(emailInput, { target: { value: 'ratelimit@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    await waitFor(() => {
      expect(screen.getByText(/too many/i)).toBeInTheDocument();
    });
  });

  // Test 10: Handles generic API error
  it('invite modal handles generic API error', async () => {
    renderSettings();
    await openInviteModal();
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Internal server error' } },
    });
    const emailInput = getEmailInput();
    fireEvent.change(emailInput, { target: { value: 'error@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
    });
  });

  // Test 11: Revoke shows confirmation dialog
  it('revoke delegate shows confirmation dialog', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });
    const revokeButtons = screen.getAllByLabelText(/revoke/i);
    fireEvent.click(revokeButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  // Test 12: Revoke calls API on confirm
  it('revoke delegate calls DELETE API on confirm', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });
    const revokeButtons = screen.getAllByLabelText(/revoke/i);
    fireEvent.click(revokeButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
    // Click the Revoke confirmation button
    const confirmBtn = screen.getByRole('button', { name: /^Revoke$/i });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/account/delegates/')
      );
    });
  });

  // Test 13: Plan-gating for free users
  it('shows plan upgrade prompt for free-tier users', async () => {
    currentPlanSummary = mockFreePlanSummary;
    setupAxiosMocks([], []);
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText(/upgrade to invite delegates/i)).toBeInTheDocument();
    });
    // The gradient "Invite Delegate" button should NOT exist for free plans
    const allButtons = screen.queryAllByRole('button');
    const inviteDelegateBtn = allButtons.find(
      (btn) => btn.textContent === 'Invite Delegate'
    );
    expect(inviteDelegateBtn).toBeUndefined();
  });

  // Test 14: Delegate row shows name, email, role chip
  it('delegate row shows name, email, and role chip', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    // Role chip text - use getAllByText since the role may appear in delegate row AND pending invites
    expect(screen.getByText('Account Admin')).toBeInTheDocument();
    const collabChips = screen.getAllByText('Account Collaborator');
    expect(collabChips.length).toBeGreaterThanOrEqual(1);
  });

  // Test 15: Role selection in invite modal
  it('invite modal allows role selection between ACCOUNT_ADMIN and ACCOUNT_COLLABORATOR', async () => {
    renderSettings();
    await openInviteModal();
    const radioGroup = screen.getByRole('radiogroup', { name: /select delegate role/i });
    expect(radioGroup).toBeInTheDocument();
    // Check for radio buttons within the group
    const radios = within(radioGroup).getAllByRole('radio');
    expect(radios.length).toBe(2);
  });

  // Test 16: Service scope checkboxes for collaborator role
  it('invite modal shows service scope checkboxes for ACCOUNT_COLLABORATOR role', async () => {
    renderSettings();
    await openInviteModal();
    // Select ACCOUNT_COLLABORATOR role by clicking the radio
    const radioGroup = screen.getByRole('radiogroup', { name: /select delegate role/i });
    const radios = within(radioGroup).getAllByRole('radio');
    // Second radio is ACCOUNT_COLLABORATOR
    fireEvent.click(radios[1]);
    // Should show scope checkboxes
    await waitFor(() => {
      expect(screen.getByText('Websites')).toBeInTheDocument();
      expect(screen.getByText('Insights')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
    });
  });

  // Test 17: Service scope checkboxes hidden for admin role
  it('invite modal hides service scope checkboxes for ACCOUNT_ADMIN role', async () => {
    renderSettings();
    await openInviteModal();
    // ACCOUNT_ADMIN is the default selected role
    // Service scopes should NOT be visible
    expect(screen.queryByText('Service Scopes')).not.toBeInTheDocument();
  });

  // Test 18: Pending invites displayed
  it('shows pending invites section', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('pending@test.com')).toBeInTheDocument();
    });
  });
});
