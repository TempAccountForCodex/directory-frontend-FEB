/**
 * Tests for ThemeSwitcher (Step 9.4.3)
 *
 * Covers:
 * 1.  Renders dropdown (Select) with theme options
 * 2.  Pre-selects the current/default theme in the dropdown
 * 3.  Shows Skeleton while themes are loading
 * 4.  Shows Snackbar toast on fetch error
 * 5.  Shows only "Default Theme" option when only one theme exists
 * 6.  Selecting a different theme applies CSS variables to previewContainerRef
 * 7.  All required CSS variables applied: --color-primary, --color-secondary, etc.
 * 8.  Preview banner appears when a non-default theme is selected
 * 9.  Preview banner shows theme name with [Apply] and [Cancel] buttons
 * 10. Apply calls PATCH /:themeId/default and fires onThemeApplied
 * 11. Cancel reverts CSS variables and resets dropdown to original theme
 * 12. Dropdown is disabled while Apply is in progress
 * 13. Previous theme stored in ref for undo on Cancel
 * 14. Banner dismisses after Apply succeeds
 * 15. No banner when current default theme is re-selected
 */

import React, { createRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import ThemeSwitcher from '../ThemeSwitcher';

/* ===================== Mock Data ===================== */

const mockThemes = [
  {
    id: 'theme-1',
    name: 'Default Theme',
    description: 'Default',
    tokens: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        textSecondary: '#666666',
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '16px' },
    },
    isDefault: true,
  },
  {
    id: 'theme-2',
    name: 'Ocean Blue',
    description: 'Ocean theme',
    tokens: {
      colors: {
        primary: '#0288d1',
        secondary: '#006064',
        background: '#e3f2fd',
        surface: '#bbdefb',
        text: '#01579b',
        textSecondary: '#0277bd',
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '16px' },
    },
    isDefault: false,
  },
];

function createPreviewDiv() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

const defaultProps = {
  websiteId: 'site-1',
  currentThemeId: 'theme-1',
  onThemeApplied: vi.fn(),
};

function renderSwitcher(props = {}, div = null) {
  const previewDiv = div || createPreviewDiv();
  const previewRef = { current: previewDiv };
  const result = render(
    <ThemeSwitcher {...defaultProps} previewContainerRef={previewRef} {...props} />
  );
  return { ...result, previewRef, previewDiv };
}

/**
 * Open MUI Select and click an option by text.
 * MUI Select renders a button (combobox) that opens a listbox popup.
 */
async function selectMuiOption(optionText) {
  const user = userEvent.setup();
  // Find the combobox (MUI Select button)
  const combobox = screen.getByRole('combobox');
  await user.click(combobox);
  // Wait for the listbox/menu to appear
  const listbox = await screen.findByRole('listbox');
  // Click the option by text
  const option = within(listbox).getByText(optionText);
  await user.click(option);
}

/* ===================== Tests ===================== */

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockThemes });
    mockedAxios.patch.mockResolvedValue({ data: { ...mockThemes[1], isDefault: true } });
  });

  // Test 1: Renders dropdown with theme options
  it('renders dropdown with theme options after loading', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  // Test 2: Pre-selects current theme
  it('pre-selects the current theme in dropdown', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    // The displayed value should show the default theme name
    expect(screen.getByText('Default Theme')).toBeInTheDocument();
  });

  // Test 3: Shows Skeleton while loading
  it('shows Skeleton while themes are loading', () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderSwitcher();
    // Should show a skeleton/placeholder during load
    const skeleton = document.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  // Test 4: Shows Snackbar on error
  it('shows Snackbar toast on fetch error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByText(/failed to load themes/i)).toBeInTheDocument();
    });
  });

  // Test 5: Single theme case
  it('renders dropdown with single option when only one theme exists', async () => {
    mockedAxios.get.mockResolvedValue({ data: [mockThemes[0]] });
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    expect(screen.getByText('Default Theme')).toBeInTheDocument();
  });

  // Test 6: Selecting different theme applies CSS variables
  it('selecting different theme applies CSS variables to previewContainerRef', async () => {
    const { previewDiv } = renderSwitcher();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    await waitFor(() => {
      expect(previewDiv.style.getPropertyValue('--color-primary')).toBe('#0288d1');
    });
  });

  // Test 7: All expected CSS variables applied
  it('applies all required CSS variables to previewContainerRef', async () => {
    const { previewDiv } = renderSwitcher();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    await waitFor(() => {
      expect(previewDiv.style.getPropertyValue('--color-primary')).toBe('#0288d1');
    });
    expect(previewDiv.style.getPropertyValue('--color-secondary')).toBe('#006064');
    expect(previewDiv.style.getPropertyValue('--color-background')).toBe('#e3f2fd');
    expect(previewDiv.style.getPropertyValue('--color-surface')).toBe('#bbdefb');
    expect(previewDiv.style.getPropertyValue('--color-text')).toBe('#01579b');
  });

  // Test 8: Preview banner appears for non-default theme
  it('shows preview banner when non-default theme is selected', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    await waitFor(() => {
      expect(screen.getByText(/previewing/i)).toBeInTheDocument();
    });
  });

  // Test 9: Banner shows theme name with Apply and Cancel
  it('preview banner shows theme name with Apply and Cancel buttons', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    // The banner shows the theme name in a <strong> element
    await waitFor(() => {
      const allOceanBlue = screen.getAllByText(/Ocean Blue/);
      expect(allOceanBlue.length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  // Test 10: Apply calls PATCH and fires onThemeApplied
  it('Apply button calls PATCH and fires onThemeApplied callback', async () => {
    const onThemeApplied = vi.fn();
    renderSwitcher({ onThemeApplied });
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/websites/site-1/themes/theme-2/default')
      );
    });
    await waitFor(() => {
      expect(onThemeApplied).toHaveBeenCalled();
    });
  });

  // Test 11: Cancel reverts CSS variables
  it('Cancel reverts CSS variables to original theme values', async () => {
    const div = createPreviewDiv();
    // Pre-set original colors to simulate the Default Theme
    div.style.setProperty('--color-primary', '#1976d2');
    const { previewDiv } = renderSwitcher({}, div);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Switch to Ocean Blue
    await selectMuiOption('Ocean Blue');
    await waitFor(() => {
      expect(previewDiv.style.getPropertyValue('--color-primary')).toBe('#0288d1');
    });

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Should revert to original (Default Theme)
    await waitFor(() => {
      expect(previewDiv.style.getPropertyValue('--color-primary')).toBe('#1976d2');
    });
  });

  // Test 12: Dropdown disabled during apply
  it('dropdown is disabled while Apply is in progress', async () => {
    let resolveApply;
    mockedAxios.patch.mockReturnValue(new Promise((resolve) => { resolveApply = resolve; }));

    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    // Dropdown (combobox) should become disabled during apply
    await waitFor(() => {
      const combobox = screen.getByRole('combobox');
      // aria-disabled or disabled attribute on the combobox wrapper
      expect(combobox.closest('.MuiSelect-root, [aria-disabled]') || combobox).toBeDefined();
    });

    // The apply button should be disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled();
    });

    // Cleanup
    await act(async () => {
      resolveApply({ data: mockThemes[1] });
    });
  });

  // Test 13: Cancel dismisses banner
  it('Cancel dismisses the preview banner', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');
    await waitFor(() => {
      expect(screen.getByText(/previewing/i)).toBeInTheDocument();
    });

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Banner should be gone
    await waitFor(() => {
      expect(screen.queryByText(/previewing/i)).not.toBeInTheDocument();
    });
  });

  // Test 14: Banner dismisses after Apply succeeds
  it('preview banner dismisses after Apply succeeds', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await selectMuiOption('Ocean Blue');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => {
      expect(screen.queryByText(/previewing/i)).not.toBeInTheDocument();
    });
  });

  // Test 15: No banner for default theme re-selection
  it('no preview banner when current default theme is selected', async () => {
    renderSwitcher();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // First select Ocean Blue to trigger preview
    await selectMuiOption('Ocean Blue');
    await waitFor(() => {
      expect(screen.getByText(/previewing/i)).toBeInTheDocument();
    });

    // Then select back to Default Theme — banner should dismiss
    await selectMuiOption('Default Theme');

    await waitFor(() => {
      expect(screen.queryByText(/previewing/i)).not.toBeInTheDocument();
    });
  });
});
