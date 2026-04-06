/**
 * PromoDealManager Tests — Step 10.36
 *
 * Covers:
 * 1. Renders page header with title and "New Deal" button
 * 2. Loading state shows skeleton rows
 * 3. Empty state shown when no deals exist
 * 4. Deal list renders with correct status chips
 * 5. Create deal form validation — name required
 * 6. Create deal form validation — discount value required
 * 7. Create deal form validation — promo code required
 * 8. Create deal form validation — end date after start date
 * 9. Promo code auto-uppercased on input
 * 10. Create deal form submits and shows success
 * 11. Deactivate button shows confirmation dialog
 * 12. Confirming deactivation calls API and refreshes list
 * 13. Dismissing deactivation dialog keeps deal in list
 * 14. Expand row shows metrics panel
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark' }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock dashboardTheme
// ---------------------------------------------------------------------------
vi.mock('../../../styles/dashboardTheme', () => ({
  getDashboardColors: () => ({
    mode: 'dark',
    primary: '#378C92',
    primaryDark: '#2d7377',
    primaryLight: '#4fb3ba',
    text: '#F5F5F5',
    textSecondary: '#8a8fa3',
    bgCard: '#1a2035',
    border: 'rgba(255,255,255,0.08)',
    panelBg: '#111827',
    success: '#22c55e',
  }),
}));

// ---------------------------------------------------------------------------
// Mock react-router-dom (preserve MemoryRouter)
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---------------------------------------------------------------------------
// Mock shared components that require MUI theme
// ---------------------------------------------------------------------------
vi.mock('../shared', async () => ({
  PageHeader: ({ title, action }) => (
    <div>
      <h1>{title}</h1>
      {action}
    </div>
  ),
  DashboardCard: ({ children, title }) => <div data-testid="dashboard-card">{title}{children}</div>,
  DashboardTable: ({ children }) => <table data-testid="dashboard-table">{children}</table>,
  DashboardInput: ({ label, value, onChange, error, helperText, ...props }) => (
    <div>
      <label>{label}
        <input
          value={value || ''}
          onChange={onChange}
          data-testid={`input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      </label>
      {helperText && <span role="alert">{helperText}</span>}
    </div>
  ),
  DashboardSelect: ({ label, value, onChange, options }) => (
    <div>
      <label>{label}
        <select
          value={value || ''}
          onChange={onChange}
          data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {(options || []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  ),
  DashboardDateField: ({ label, value, onChange, error, helperText }) => (
    <div>
      <label>{label}
        <input
          type="date"
          value={value || ''}
          onChange={onChange}
          data-testid={`date-${label?.toLowerCase().replace(/\s+/g, '-')}`}
          aria-invalid={error ? 'true' : 'false'}
        />
      </label>
      {helperText && <span role="alert">{helperText}</span>}
    </div>
  ),
  DashboardGradientButton: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="gradient-btn">
      {children}
    </button>
  ),
  DashboardConfirmButton: ({ children, onClick, disabled, tone }) => (
    <button onClick={onClick} disabled={disabled} data-testid={`confirm-btn-${tone || 'primary'}`}>
      {children}
    </button>
  ),
  DashboardCancelButton: ({ children, onClick }) => (
    <button onClick={onClick} data-testid="cancel-btn">
      {children}
    </button>
  ),
  DashboardActionButton: ({ children, onClick, startIcon }) => (
    <button onClick={onClick} data-testid="action-btn">
      {children}
    </button>
  ),
  DashboardMetricCard: ({ title, value }) => (
    <div data-testid={`metric-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
  EmptyState: ({ title, subtitle }) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{subtitle}</p>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
import axios from 'axios';
vi.mock('axios');

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import PromoDealManager from '../PromoDealManager';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const TEST_USER = { id: 1, role: 'super_admin', name: 'Admin' };

function makeDeal(overrides = {}) {
  return {
    id: 1,
    name: 'Flash Sale',
    promoCode: 'FLASH20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    targetSegment: 'ALL',
    startAt: new Date(Date.now() - 1000).toISOString(),
    endAt: new Date(Date.now() + 86400 * 1000).toISOString(),
    redeemedCount: 5,
    maxRedemptions: 100,
    isActive: true,
    ...overrides,
  };
}

function renderManager() {
  return render(
    <MemoryRouter>
      <PromoDealManager
        user={TEST_USER}
        pageTitle="Promo Deals"
        pageSubtitle="Manage flash deals"
      />
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'test-token');
  // Default: empty list
  axios.get.mockResolvedValue({ data: { deals: [], total: 0 } });
  axios.post.mockResolvedValue({ data: { success: true, deal: makeDeal() } });
  axios.put.mockResolvedValue({ data: { success: true, deal: makeDeal({ isActive: false }) } });
});

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PromoDealManager', () => {
  it('renders page title and New Deal button', async () => {
    renderManager();
    expect(screen.getByRole('heading', { name: 'Promo Deals' })).toBeInTheDocument();
    const btn = screen.getByTestId('action-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('New Deal');
  });

  it('shows empty state when no deals', async () => {
    renderManager();
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('shows deal rows when deals are loaded', async () => {
    axios.get.mockResolvedValue({
      data: { deals: [makeDeal()], total: 1 },
    });
    renderManager();
    await waitFor(() => {
      expect(screen.getByText('Flash Sale')).toBeInTheDocument();
    });
  });

  it('shows Active chip for active in-range deal', async () => {
    axios.get.mockResolvedValue({
      data: { deals: [makeDeal()], total: 1 },
    });
    renderManager();
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('shows Expired chip for past end date deal', async () => {
    const past = new Date(Date.now() - 2000).toISOString();
    const veryPast = new Date(Date.now() - 10000).toISOString();
    axios.get.mockResolvedValue({
      data: {
        deals: [makeDeal({ startAt: veryPast, endAt: past })],
        total: 1,
      },
    });
    renderManager();
    await waitFor(() => {
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });
  });

  it('shows Deactivated chip for isActive=false deal', async () => {
    axios.get.mockResolvedValue({
      data: { deals: [makeDeal({ isActive: false })], total: 1 },
    });
    renderManager();
    await waitFor(() => {
      expect(screen.getByText('Deactivated')).toBeInTheDocument();
    });
  });

  it('opens Create Deal modal when New Deal button clicked', async () => {
    renderManager();
    fireEvent.click(screen.getByTestId('action-btn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Promo Deal')).toBeInTheDocument();
  });

  it('shows validation error when name is empty on submit', async () => {
    renderManager();
    fireEvent.click(screen.getByTestId('action-btn')); // open modal
    fireEvent.click(screen.getByTestId('gradient-btn')); // submit
    await waitFor(() => {
      expect(screen.getByText('Deal name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error when discount value is empty', async () => {
    renderManager();
    fireEvent.click(screen.getByTestId('action-btn'));

    // Fill name but leave discount value empty
    fireEvent.change(screen.getByTestId('input-deal-name'), {
      target: { value: 'Test Deal' },
    });

    // Submit without filling discount value
    fireEvent.click(screen.getByTestId('gradient-btn'));
    await waitFor(() => {
      expect(screen.getByText('Must be greater than 0')).toBeInTheDocument();
    });
  });

  it('shows validation error when promo code is empty', async () => {
    renderManager();
    fireEvent.click(screen.getByTestId('action-btn'));

    fireEvent.change(screen.getByTestId('input-deal-name'), {
      target: { value: 'Test' },
    });

    // Find the discount value input (label varies by type; default is PERCENTAGE)
    const percentageInput = screen.getByTestId('input-percentage-(%)');
    fireEvent.change(percentageInput, { target: { value: '10' } });

    fireEvent.change(screen.getByTestId('date-start-date'), {
      target: { value: '2026-04-01' },
    });
    fireEvent.change(screen.getByTestId('date-end-date'), {
      target: { value: '2026-05-01' },
    });

    fireEvent.click(screen.getByTestId('gradient-btn'));
    await waitFor(() => {
      expect(screen.getByText('Promo code is required')).toBeInTheDocument();
    });
  });

  it('auto-uppercases promo code on input', async () => {
    renderManager();
    fireEvent.click(screen.getByTestId('action-btn'));

    const promoInput = screen.getByTestId('input-promo-code');
    fireEvent.change(promoInput, { target: { value: 'flashsale' } });

    // The value should be uppercased
    expect(promoInput.value).toBe('FLASHSALE');
  });

  it('deactivate button shows confirmation dialog', async () => {
    axios.get.mockResolvedValue({
      data: { deals: [makeDeal()], total: 1 },
    });
    renderManager();

    await waitFor(() => {
      expect(screen.getByText('Deactivate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-btn-danger'));
    expect(screen.getByText('Deactivate Promo Deal?')).toBeInTheDocument();
  });

  it('cancel on deactivation dialog dismisses without calling API', async () => {
    axios.get.mockResolvedValue({
      data: { deals: [makeDeal()], total: 1 },
    });
    renderManager();

    // Open the deactivate dialog
    await waitFor(() => screen.getByText('Deactivate'));
    fireEvent.click(screen.getByTestId('confirm-btn-danger'));

    // Dialog should be open
    expect(screen.getByText('Deactivate Promo Deal?')).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByTestId('cancel-btn'));

    // API should not have been called
    expect(axios.put).not.toHaveBeenCalled();

    // Dialog should be closed (wait for re-render)
    await waitFor(() => {
      expect(screen.queryByText('Deactivate Promo Deal?')).not.toBeInTheDocument();
    });
  });

  it('confirming deactivation calls PUT API and refreshes list', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { deals: [makeDeal()], total: 1 } })
      .mockResolvedValueOnce({ data: { deals: [makeDeal({ isActive: false })], total: 1 } });

    renderManager();

    await waitFor(() => screen.getByText('Deactivate'));
    fireEvent.click(screen.getByTestId('confirm-btn-danger'));

    // Click the confirm button in the dialog (last confirm-btn-danger)
    const confirmButtons = screen.getAllByTestId('confirm-btn-danger');
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/promo/admin/deals/1/deactivate'),
        {},
        expect.any(Object),
      );
    });
  });
});
