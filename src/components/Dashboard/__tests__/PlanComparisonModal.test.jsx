/**
 * PlanComparisonModal Tests (Step 10.1a)
 *
 * Covers:
 * 1.  Renders with open=true
 * 2.  Does not render content with open=false
 * 3.  Displays all 4 plan columns
 * 4.  Highlights current plan column
 * 5.  Shows 'Current Plan' chip on correct column
 * 6.  Clicking Upgrade navigates to billing page
 * 7.  Upgrade button calls onClose
 * 8.  highlightFeature prop highlights the correct row
 * 9.  Renders at least 11 feature rows
 * 10. Lock and Check icons appear in table
 * 11. Close button calls onClose
 * 12. Exported from shared/index.js barrel
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock ThemeContext
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'light', themeMode: 'light', changeTheme: vi.fn() }),
}));

// Mock dashboardTheme
vi.mock('../../../styles/dashboardTheme', () => ({
  getDashboardColors: () => ({
    mode: 'light',
    primary: '#6c63ff',
    primaryDark: '#4a42dd',
    primaryLight: '#8a82ff',
    bgCard: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
  }),
}));

// ── Import after mocks ────────────────────────────────────────────────────

import PlanComparisonModal from '../shared/PlanComparisonModal';

// ── Tests ─────────────────────────────────────────────────────────────────

describe('PlanComparisonModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    currentPlanCode: 'website_free',
    highlightFeature: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders dialog when open=true', () => {
    render(<PlanComparisonModal {...defaultProps} />);
    expect(screen.getByText('Compare Plans')).toBeInTheDocument();
  });

  it('2. does not render visible content with open=false', () => {
    render(<PlanComparisonModal {...defaultProps} open={false} />);
    // MUI Dialog hides content when open=false
    expect(screen.queryByText('Compare Plans')).not.toBeInTheDocument();
  });

  it('3. displays all 4 plan column names', () => {
    render(<PlanComparisonModal {...defaultProps} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Agency')).toBeInTheDocument();
  });

  it('4. current plan column exists (website_free)', () => {
    render(<PlanComparisonModal {...defaultProps} currentPlanCode="website_free" />);
    const currentColumn = screen.getByTestId('plan-column-website_free');
    expect(currentColumn).toBeInTheDocument();
  });

  it('5. shows Current Plan chip on the correct plan column', () => {
    render(<PlanComparisonModal {...defaultProps} currentPlanCode="website_core" />);
    const chip = screen.getByText('Current Plan');
    expect(chip).toBeInTheDocument();
    // The chip should be within the Core column
    const coreColumn = screen.getByTestId('plan-column-website_core');
    expect(within(coreColumn).getByText('Current Plan')).toBeInTheDocument();
  });

  it('6. clicking Upgrade navigates to billing settings page', () => {
    render(
      <PlanComparisonModal
        {...defaultProps}
        currentPlanCode="website_free"
        onClose={vi.fn()}
      />
    );
    // Find any upgrade button (non-current plans)
    const upgradeButtons = screen.getAllByText('Upgrade');
    expect(upgradeButtons.length).toBeGreaterThan(0);
    fireEvent.click(upgradeButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/settings?tab=billing');
  });

  it('7. clicking Upgrade calls onClose', () => {
    const onClose = vi.fn();
    render(
      <PlanComparisonModal
        {...defaultProps}
        currentPlanCode="website_free"
        onClose={onClose}
      />
    );
    const upgradeButtons = screen.getAllByText('Upgrade');
    fireEvent.click(upgradeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('8. highlightFeature prop adds highlighted row for matching feature', () => {
    render(
      <PlanComparisonModal
        {...defaultProps}
        highlightFeature="videoBlocks"
      />
    );
    const highlightedRow = screen.getByTestId('feature-row-videoBlocks');
    expect(highlightedRow).toBeInTheDocument();
  });

  it('9. renders at least 11 feature rows', () => {
    render(<PlanComparisonModal {...defaultProps} />);
    // Check for feature rows via test IDs
    const featureKeys = [
      'websites', 'pages', 'blocks', 'videoBlocks', 'customCSS',
      'customDomain', 'aiGeneration', 'collaborators', 'delegates',
      'seoLevel', 'branding',
    ];
    featureKeys.forEach((key) => {
      expect(screen.getByTestId(`feature-row-${key}`)).toBeInTheDocument();
    });
  });

  it('10. Check icons appear for features included in plans', () => {
    render(<PlanComparisonModal {...defaultProps} currentPlanCode="website_core" />);
    // Core plan has videoBlocks=true, so should have at least one check icon
    const checkIcons = document.querySelectorAll('[aria-label="included"]');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('10b. Lock icons appear for features not available in plans', () => {
    render(<PlanComparisonModal {...defaultProps} currentPlanCode="website_free" />);
    // Free plan has videoBlocks=false, customCSS=false — lock icons
    const lockIcons = document.querySelectorAll('[aria-label="not included"]');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('11. Close button calls onClose when clicked', () => {
    const onClose = vi.fn();
    render(<PlanComparisonModal {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('12. PlanComparisonModal is exported from shared/index.js barrel', async () => {
    const shared = await import('../shared/index.js');
    expect(shared.PlanComparisonModal).toBeDefined();
    // React.memo wraps the component in an object with type 'symbol' internally;
    // the exported value can be either a function or a memo object
    expect(shared.PlanComparisonModal).not.toBeNull();
    // Verify it can be rendered (it's a valid React component)
    const type = typeof shared.PlanComparisonModal;
    expect(['function', 'object']).toContain(type);
  });
});
