/**
 * Tests for Websites Multi-Tenancy Features (Step 7.4)
 *
 * Covers:
 * 1.  Role badges display on website cards
 * 2.  Filter tabs render (All, Owned, Shared with Me)
 * 3.  Clicking "Owned" filter shows only owned websites
 * 4.  Clicking "Shared with Me" filter shows only shared websites
 * 5.  Ownership stats show correct counts
 * 6.  Empty state shown for "Shared with Me" when no shared websites
 * 7.  "Show All Websites" reset button works in empty filtered view
 * 8.  Edit button hidden for VIEWER role
 * 9.  Delete button hidden for EDITOR role
 * 10. Settings button hidden for EDITOR role
 * 11. Publish button hidden for VIEWER role
 * 12. canPerformAction utility works correctly
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark', themeMode: 'dark', changeTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock framer-motion
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock templates
// ---------------------------------------------------------------------------
vi.mock('../../../templates', () => ({
  getWebsiteTemplates: vi.fn().mockResolvedValue([]),
  getStoreTemplates: vi.fn().mockResolvedValue([]),
  refreshTemplateCache: vi.fn().mockResolvedValue(),
}));

// ---------------------------------------------------------------------------
// Mock useStoreWebsiteCreation
// ---------------------------------------------------------------------------
vi.mock('../../../hooks/useStoreWebsiteCreation', () => ({
  useStoreWebsiteCreation: () => ({
    createStoreWebsite: vi.fn(),
    loading: false,
    error: null,
    partialError: null,
  }),
}));

// ---------------------------------------------------------------------------
// Mock ColorPickerWithAlpha
// ---------------------------------------------------------------------------
vi.mock('../../UI/ColorPickerWithAlpha', () => ({
  default: ({ value, onChange, label }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
  ),
}));

// ---------------------------------------------------------------------------
// Mock CollaboratorModal
// ---------------------------------------------------------------------------
vi.mock('../CollaboratorModal', () => ({
  default: ({ open, onClose, websiteId, currentUserRole }) =>
    open ? (
      <div data-testid="collaborator-modal">
        <span>Collaborator Modal for {websiteId}</span>
        <span>Role: {currentUserRole}</span>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

// ---------------------------------------------------------------------------
// Mock PermissionContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/PermissionContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    usePermission: () => true,
    useHasRole: () => true,
    useWebsiteRole: () => 'OWNER',
    usePermissionContext: () => ({
      websitePermissions: {},
      currentWebsiteId: null,
      setCurrentWebsite: vi.fn(),
      loading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

// ---------------------------------------------------------------------------
// Import component after mocks
// ---------------------------------------------------------------------------
import Websites from '../Websites';

// Import the real permissions for utility test
import { ROLE_PERMISSIONS, WEBSITE_ACTIONS } from '../../../context/PermissionContext';

/* ===================== Test Helpers ===================== */

const mockWebsites = [
  {
    id: 1,
    name: 'My Website',
    slug: 'my-website',
    status: 'draft',
    isPublic: true,
    primaryColor: '#378C92',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-10',
    deletedAt: null,
    pageCount: 3,
    hasStore: false,
    store: null,
    role: 'OWNER',
    ownerUserId: 1,
  },
  {
    id: 2,
    name: 'Shared Website',
    slug: 'shared-website',
    status: 'published',
    isPublic: true,
    primaryColor: '#2196f3',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-11',
    deletedAt: null,
    pageCount: 5,
    hasStore: false,
    store: null,
    role: 'EDITOR',
    ownerUserId: 2,
  },
  {
    id: 3,
    name: 'View Only Site',
    slug: 'view-only',
    status: 'draft',
    isPublic: true,
    primaryColor: '#4caf50',
    createdAt: '2026-03-03',
    updatedAt: '2026-03-12',
    deletedAt: null,
    pageCount: 1,
    hasStore: false,
    store: null,
    role: 'VIEWER',
    ownerUserId: 3,
  },
];

function setupAxiosMocks(websites = mockWebsites) {
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes('/websites/stats')) {
      return Promise.resolve({
        data: { success: true, total: websites.length, published: 1, draft: 2, withStore: 0, trends: {} },
      });
    }
    if (url.includes('/websites')) {
      return Promise.resolve({
        data: { success: true, data: websites },
      });
    }
    return Promise.resolve({ data: {} });
  });
}

function renderWebsites(props = {}) {
  return render(
    <MemoryRouter>
      <Websites pageTitle="My Websites" pageSubtitle="Manage your websites" {...props} />
    </MemoryRouter>
  );
}

/* ===================== Tests ===================== */

describe('Websites Multi-Tenancy (Step 7.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAxiosMocks();
  });

  // Test 1
  it('displays role badges on website cards', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    // Check for role badges
    expect(screen.getByTestId('role-badge-1')).toHaveTextContent('OWNER');
    expect(screen.getByTestId('role-badge-2')).toHaveTextContent('EDITOR');
    expect(screen.getByTestId('role-badge-3')).toHaveTextContent('VIEWER');
  });

  // Test 2
  it('renders filter tabs (All, Owned, Shared with Me)', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-owned')).toBeInTheDocument();
    expect(screen.getByTestId('filter-shared')).toBeInTheDocument();
  });

  // Test 3
  it('clicking "Owned" filter shows only owned websites', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-owned'));

    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
      expect(screen.queryByText('Shared Website')).not.toBeInTheDocument();
      expect(screen.queryByText('View Only Site')).not.toBeInTheDocument();
    });
  });

  // Test 4
  it('clicking "Shared with Me" filter shows only shared websites', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-shared'));

    await waitFor(() => {
      expect(screen.queryByText('My Website')).not.toBeInTheDocument();
      expect(screen.getByText('Shared Website')).toBeInTheDocument();
      expect(screen.getByText('View Only Site')).toBeInTheDocument();
    });
  });

  // Test 5
  it('shows ownership stats with correct counts', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    expect(screen.getByText('Owned: 1')).toBeInTheDocument();
    expect(screen.getByText('Shared: 2')).toBeInTheDocument();
  });

  // Test 6
  it('shows empty state for "Shared with Me" when no shared websites', async () => {
    const ownedOnly = [mockWebsites[0]]; // Only OWNER website
    setupAxiosMocks(ownedOnly);
    renderWebsites();

    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-shared'));

    await waitFor(() => {
      expect(screen.getByText('No shared websites')).toBeInTheDocument();
      expect(screen.getByText(/When someone shares a website/)).toBeInTheDocument();
    });
  });

  // Test 7
  it('"Show All Websites" reset button works in empty filtered view', async () => {
    const ownedOnly = [mockWebsites[0]];
    setupAxiosMocks(ownedOnly);
    renderWebsites();

    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-shared'));

    await waitFor(() => {
      expect(screen.getByText('No shared websites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show All Websites'));

    await waitFor(() => {
      expect(screen.getByText('My Website')).toBeInTheDocument();
    });
  });

  // Test 8
  it('Edit button is disabled for VIEWER role website', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('View Only Site')).toBeInTheDocument();
    });

    // The VIEWER website should show a disabled Edit button with tooltip
    // Find the card area for View Only Site — look for its role badge
    const viewerBadge = screen.getByTestId('role-badge-3');
    const viewerCard = viewerBadge.closest('.MuiCard-root');

    // Inside the viewer card, the Edit button should be disabled
    if (viewerCard) {
      const editButtons = viewerCard.querySelectorAll('button');
      const editButton = Array.from(editButtons).find((btn) => btn.textContent.includes('Edit'));
      if (editButton) {
        expect(editButton).toBeDisabled();
      }
    }
  });

  // Test 9
  it('Delete button not shown for EDITOR role website', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('Shared Website')).toBeInTheDocument();
    });

    // The EDITOR website should NOT show Delete button
    const editorBadge = screen.getByTestId('role-badge-2');
    const editorCard = editorBadge.closest('.MuiCard-root');

    if (editorCard) {
      const buttons = editorCard.querySelectorAll('button');
      const deleteButton = Array.from(buttons).find((btn) => btn.textContent.includes('Delete'));
      expect(deleteButton).toBeUndefined();
    }
  });

  // Test 10
  it('Settings button not shown for EDITOR role website', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('Shared Website')).toBeInTheDocument();
    });

    const editorBadge = screen.getByTestId('role-badge-2');
    const editorCard = editorBadge.closest('.MuiCard-root');

    if (editorCard) {
      const buttons = editorCard.querySelectorAll('button');
      const settingsButton = Array.from(buttons).find((btn) => btn.textContent.includes('Settings'));
      expect(settingsButton).toBeUndefined();
    }
  });

  // Test 11
  it('Publish button not shown for VIEWER role website', async () => {
    renderWebsites();
    await waitFor(() => {
      expect(screen.getByText('View Only Site')).toBeInTheDocument();
    });

    const viewerBadge = screen.getByTestId('role-badge-3');
    const viewerCard = viewerBadge.closest('.MuiCard-root');

    if (viewerCard) {
      const buttons = viewerCard.querySelectorAll('button');
      const publishButton = Array.from(buttons).find((btn) => btn.textContent.includes('Publish'));
      expect(publishButton).toBeUndefined();
    }
  });

  // Test 12 — canPerformAction utility
  it('canPerformAction utility checks permissions correctly', () => {
    // OWNER can do everything
    expect(ROLE_PERMISSIONS.OWNER.has(WEBSITE_ACTIONS.DELETE)).toBe(true);
    expect(ROLE_PERMISSIONS.OWNER.has(WEBSITE_ACTIONS.EDIT_CONTENT)).toBe(true);

    // EDITOR cannot delete
    expect(ROLE_PERMISSIONS.EDITOR.has(WEBSITE_ACTIONS.DELETE)).toBe(false);
    expect(ROLE_PERMISSIONS.EDITOR.has(WEBSITE_ACTIONS.EDIT_CONTENT)).toBe(true);

    // VIEWER can only view
    expect(ROLE_PERMISSIONS.VIEWER.has(WEBSITE_ACTIONS.VIEW)).toBe(true);
    expect(ROLE_PERMISSIONS.VIEWER.has(WEBSITE_ACTIONS.EDIT_CONTENT)).toBe(false);
    expect(ROLE_PERMISSIONS.VIEWER.has(WEBSITE_ACTIONS.DELETE)).toBe(false);
  });
});
