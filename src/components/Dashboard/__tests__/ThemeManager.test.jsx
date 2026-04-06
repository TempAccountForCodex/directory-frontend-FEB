/**
 * Tests for ThemeManager (Step 9.4.2)
 *
 * Covers:
 * 1.  Shows CircularProgress while fetching themes
 * 2.  Renders theme cards for each fetched theme
 * 3.  Shows EmptyState when only default theme exists (no custom themes)
 * 4.  Shows Alert with retry button on fetch error
 * 5.  Each card shows name, description (truncated to 80 chars), isDefault badge
 * 6.  Each card shows primary color swatch
 * 7.  Delete button is disabled/hidden for default theme
 * 8.  Delete button opens ConfirmationDialog
 * 9.  Confirming delete calls DELETE endpoint and refreshes list
 * 10. Clone button calls POST endpoint with "(Copy)" suffix
 * 11. Set as Default calls PATCH and fires onThemeChange callback
 * 12. Create Theme button opens inline form
 * 13. Form validates name max 100 chars
 * 14. Create Theme submits POST and refreshes list
 * 15. onThemeChange fires after delete
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'light', themeMode: 'light', changeTheme: vi.fn() }),
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
import ThemeManager from '../ThemeManager';

/* ===================== Mock Data ===================== */

const mockThemes = [
  {
    id: 'theme-1',
    name: 'Default Theme',
    description: 'The default theme for the website.',
    tokens: { colors: { primary: '#1976d2' } },
    isDefault: true,
    isPublished: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'theme-2',
    name: 'Ocean Blue',
    description: 'A calming ocean-inspired theme with blue tones and soft gradients for a relaxed feel.',
    tokens: { colors: { primary: '#0288d1' } },
    isDefault: false,
    isPublished: true,
    createdAt: '2026-03-02T00:00:00Z',
    updatedAt: '2026-03-02T00:00:00Z',
  },
  {
    id: 'theme-3',
    name: 'Dark Mode',
    description: 'Dark theme',
    tokens: { colors: { primary: '#90caf9' } },
    isDefault: false,
    isPublished: false,
    createdAt: '2026-03-03T00:00:00Z',
    updatedAt: '2026-03-03T00:00:00Z',
  },
];

const defaultProps = {
  websiteId: 'site-1',
  currentThemeId: 'theme-1',
  onThemeChange: vi.fn(),
};

function renderThemeManager(props = {}) {
  return render(<ThemeManager {...defaultProps} {...props} />);
}

/* ===================== Tests ===================== */

describe('ThemeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockThemes });
    mockedAxios.post.mockResolvedValue({ data: { id: 'theme-new', name: 'New Theme', isDefault: false } });
    mockedAxios.delete.mockResolvedValue({});
    mockedAxios.patch.mockResolvedValue({ data: { ...mockThemes[1], isDefault: true } });
  });

  // Test 1: Loading state
  it('shows CircularProgress while fetching themes', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderThemeManager();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // Test 2: Renders theme cards
  it('renders theme cards for each fetched theme', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  // Test 3: EmptyState for no themes (api returns empty)
  it('shows EmptyState when themes list is empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    renderThemeManager();
    await waitFor(() => {
      // EmptyState subtitle contains this text
      expect(screen.getByText(/no custom themes yet/i)).toBeInTheDocument();
    });
  });

  // Test 4: Error state with retry button
  it('shows Alert with retry button on fetch error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });

  // Test 5: Description truncation and default badge
  it('shows truncated description (max 80 chars) and isDefault badge', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    // Default badge (MUI Chip)
    expect(screen.getByText('Default')).toBeInTheDocument();
    // Ocean Blue description is > 80 chars so should be truncated
    const longDescription = 'A calming ocean-inspired theme with blue tones and soft gradients for a relaxed feel.';
    const truncated = longDescription.slice(0, 80) + '…';
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  // Test 6: Color swatch rendered for each theme
  it('renders primary color swatch for each theme card', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    // Swatches should have background-color style
    const swatches = document.querySelectorAll('[data-testid="color-swatch"]');
    expect(swatches.length).toBe(3);
  });

  // Test 7: Delete disabled for default theme
  it('delete button is hidden/disabled for default theme', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    // Delete button for the default theme should not be present
    expect(screen.queryByLabelText('Delete Default Theme')).not.toBeInTheDocument();
    // But delete should exist for non-default themes
    expect(screen.getByLabelText('Delete Ocean Blue')).toBeInTheDocument();
  });

  // Test 8: Delete opens ConfirmationDialog
  it('clicking Delete opens ConfirmationDialog', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    });
    const deleteBtn = screen.getByLabelText('Delete Ocean Blue');
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  // Test 9: Confirming delete calls DELETE endpoint
  it('confirming delete calls DELETE endpoint and refreshes', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Delete Ocean Blue'));
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    // Click confirm (there could be multiple buttons — find the Delete one)
    const confirmBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/websites/site-1/themes/theme-2')
      );
    });
    // Refresh should have been called
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  // Test 10: Clone calls POST with "(Copy)" suffix
  it('Clone button calls POST with name + " (Copy)"', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    });
    const cloneBtn = screen.getByLabelText('Clone Ocean Blue');
    fireEvent.click(cloneBtn);
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/websites/site-1/themes'),
        expect.objectContaining({ name: 'Ocean Blue (Copy)' })
      );
    });
  });

  // Test 11: Set as Default calls PATCH and fires onThemeChange
  it('Set as Default calls PATCH and fires onThemeChange', async () => {
    const onThemeChange = vi.fn();
    renderThemeManager({ onThemeChange });
    await waitFor(() => {
      expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    });
    const setDefaultBtn = screen.getByLabelText('Set Ocean Blue as default');
    fireEvent.click(setDefaultBtn);
    // Step 9.10 added ConfirmationDialog — must confirm
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    const confirmBtn = screen.getByRole('button', { name: /set as default/i });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/websites/site-1/themes/theme-2/default')
      );
    });
    await waitFor(() => {
      expect(onThemeChange).toHaveBeenCalled();
    });
  });

  // Test 12: Create Theme button opens inline form
  it('Create Theme button opens inline form', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    const createBtn = screen.getByText(/create theme/i);
    fireEvent.click(createBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/theme name/i)).toBeInTheDocument();
    });
  });

  // Test 13: Form validates name max 100 chars
  it('form shows inline error when name exceeds 100 characters', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/create theme/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/theme name/i)).toBeInTheDocument();
    });
    const nameInput = screen.getByPlaceholderText(/theme name/i);
    fireEvent.change(nameInput, { target: { value: 'A'.repeat(101) } });
    // Try submitting
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(/max 100 characters/i)).toBeInTheDocument();
    });
  });

  // Test 14: Create Theme submits POST and refreshes
  it('Create Theme submits POST and refreshes list', async () => {
    renderThemeManager();
    await waitFor(() => {
      expect(screen.getByText('Default Theme')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/create theme/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/theme name/i)).toBeInTheDocument();
    });
    const nameInput = screen.getByPlaceholderText(/theme name/i);
    fireEvent.change(nameInput, { target: { value: 'My New Theme' } });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/websites/site-1/themes'),
        expect.objectContaining({ name: 'My New Theme' })
      );
    });
  });

  // Test 15: onThemeChange fires after delete
  it('onThemeChange fires after successful delete', async () => {
    const onThemeChange = vi.fn();
    renderThemeManager({ onThemeChange });
    await waitFor(() => {
      expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Delete Ocean Blue'));
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    const confirmBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(onThemeChange).toHaveBeenCalled();
    });
  });
});
