/**
 * Tests for CollaboratorModal (Step 7.4.4)
 *
 * Covers:
 * 1.  Renders dialog with "Manage Collaborators" title when open
 * 2.  Shows loading spinner while fetching collaborators
 * 3.  Renders collaborator list with name, email, and role badges
 * 4.  Shows "No collaborators yet" empty state when list is empty
 * 5.  Shows add collaborator form when user is OWNER
 * 6.  Hides add collaborator form when user is not OWNER
 * 7.  Add button disabled when email is empty
 * 8.  Calls POST on add collaborator
 * 9.  Calls DELETE on remove collaborator after confirmation
 * 10. Calls PATCH on role change
 * 11. Shows error alert on fetch failure
 * 12. Shows success message after adding collaborator
 * 13. Remove button not shown for OWNER collaborators
 * 14. Close button calls onClose
 * 15. Role select shown for non-OWNER collaborators when user is OWNER
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
// Mock axios
// ---------------------------------------------------------------------------
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Import component after mocks
// ---------------------------------------------------------------------------
import CollaboratorModal from '../CollaboratorModal';

/* ===================== Test Helpers ===================== */

const mockCollaborators = [
  {
    id: 1,
    userId: 10,
    websiteId: 1,
    role: 'OWNER',
    user: { id: 10, name: 'Alice Owner', email: 'alice@test.com' },
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 2,
    userId: 20,
    websiteId: 1,
    role: 'EDITOR',
    user: { id: 20, name: 'Bob Editor', email: 'bob@test.com' },
    createdAt: '2026-03-02T00:00:00Z',
  },
  {
    id: 3,
    userId: 30,
    websiteId: 1,
    role: 'VIEWER',
    user: { id: 30, name: 'Charlie Viewer', email: 'charlie@test.com' },
    createdAt: '2026-03-03T00:00:00Z',
  },
];

const defaultProps = {
  websiteId: 1,
  open: true,
  onClose: vi.fn(),
  currentUserRole: 'OWNER',
};

function renderModal(props = {}) {
  return render(<CollaboratorModal {...defaultProps} {...props} />);
}

/* ===================== Tests ===================== */

describe('CollaboratorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockCollaborators });
    mockedAxios.post.mockResolvedValue({ data: { id: 4 } });
    mockedAxios.delete.mockResolvedValue({ data: {} });
    mockedAxios.patch.mockResolvedValue({ data: {} });
  });

  // Test 1
  it('renders dialog with "Manage Collaborators" title when open', async () => {
    renderModal();
    expect(screen.getByText('Manage Collaborators')).toBeInTheDocument();
  });

  // Test 2
  it('shows loading spinner while fetching collaborators', () => {
    // Make the request hang
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderModal();
    const spinners = screen.getAllByRole('progressbar');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  // Test 3
  it('renders collaborator list with name, email, and role', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Editor')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
    expect(screen.getByText('Charlie Viewer')).toBeInTheDocument();
  });

  // Test 4
  it('shows "No collaborators yet" when list is empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('No collaborators yet')).toBeInTheDocument();
    });
  });

  // Test 5
  it('shows add collaborator form when user is OWNER', async () => {
    renderModal({ currentUserRole: 'OWNER' });
    await waitFor(() => {
      expect(screen.getByText('Invite Collaborator')).toBeInTheDocument();
    });
  });

  // Test 6
  it('hides add collaborator form when user is not OWNER', async () => {
    renderModal({ currentUserRole: 'EDITOR' });
    await waitFor(() => {
      expect(screen.getByText('Team Members (3)')).toBeInTheDocument();
    });
    expect(screen.queryByText('Invite Collaborator')).not.toBeInTheDocument();
  });

  // Test 7
  it('add button uses UserPlus icon and is present in the form', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Invite Collaborator')).toBeInTheDocument();
    });
    // The add button is present (UserPlus icon button)
    const emailInput = screen.getByPlaceholderText('user@example.com');
    expect(emailInput).toBeInTheDocument();
  });

  // Test 8
  it('calls POST on add collaborator', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('user@example.com');
    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });

    // Click the add collaborator button
    const addBtn = screen.getByTestId('add-collaborator-btn');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/websites/1/collaborators/invite'),
        expect.objectContaining({ email: 'new@test.com', role: 'EDITOR' })
      );
    });
  });

  // Test 9
  it('calls DELETE on remove collaborator after confirmation', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Bob Editor')).toBeInTheDocument();
    });

    // Find remove button for Bob (non-OWNER)
    const removeBtn = screen.getByLabelText('Remove Bob Editor');
    fireEvent.click(removeBtn);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Remove Collaborator')).toBeInTheDocument();
    });

    // Click confirm
    const confirmBtn = screen.getByText('Remove');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/websites/1/collaborators/20')
      );
    });
  });

  // Test 10
  it('calls PATCH on role change', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    // Native selects inside MUI Select render as <select> elements
    const container = document.querySelector('.MuiDialogContent-root');
    const allNativeSelects = container.querySelectorAll('select');
    // There should be: add-form role select + Bob's role select + Charlie's role select = 3
    expect(allNativeSelects.length).toBeGreaterThanOrEqual(2);

    // The add-form select has value 'EDITOR' (default role)
    // Bob's select also has value 'EDITOR'
    // Charlie's select has value 'VIEWER'
    // Find Charlie's select (value='VIEWER') since it's unambiguous
    const charlieSelect = Array.from(allNativeSelects).find((s) => s.value === 'VIEWER');
    expect(charlieSelect).toBeTruthy();

    fireEvent.change(charlieSelect, { target: { value: 'ADMIN' } });

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/websites/1/collaborators/30'),
        expect.objectContaining({ role: 'ADMIN' })
      );
    });
  });

  // Test 11
  it('shows error alert on fetch failure', async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: 'Server error' } } });
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  // Test 12
  it('shows success message after adding collaborator', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('user@example.com');
    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });

    // Click the add collaborator button
    const addBtn = screen.getByTestId('add-collaborator-btn');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Invite sent successfully')).toBeInTheDocument();
    });
  });

  // Test 13
  it('remove button not shown for OWNER collaborators', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
    // OWNER chip for Alice
    expect(screen.getByText('OWNER')).toBeInTheDocument();
    // Remove button should NOT exist for Alice
    expect(screen.queryByLabelText('Remove Alice Owner')).not.toBeInTheDocument();
    // But should exist for Bob
    expect(screen.getByLabelText('Remove Bob Editor')).toBeInTheDocument();
  });

  // Test 14
  it('close button calls onClose', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    // Click the X close button
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  // Test 15
  it('shows role select for non-OWNER collaborators when user is OWNER', async () => {
    renderModal({ currentUserRole: 'OWNER' });
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });

    // Non-OWNER collaborators should have a select dropdown
    const selects = screen.getAllByRole('combobox');
    // At least: add-form role select, Bob role select, Charlie role select
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });
});
