/**
 * CancellationFlow Component Tests (step 10.27)
 *
 * Tests:
 * - Step 1: Renders reason dropdown and feedback textarea
 * - Step 2: Shows impact preview with lost features and kept features
 * - Step 3: Renders confirmation with cancel date and buttons
 * - Navigation: forward and backward through steps
 * - Submission: calls onCancel with reason/feedback
 * - Escape hatch: 'Keep My Plan' calls onClose
 * - Success state: shows success alert after cancellation
 * - Step indicator: shows correct step number
 * - NO dark patterns: reason is optional, user can proceed without selecting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'light' }),
}));

// ---------------------------------------------------------------------------
// Mock dashboardTheme
// ---------------------------------------------------------------------------
vi.mock('../../../styles/dashboardTheme', () => ({
  getDashboardColors: () => ({
    mode: 'light',
    primary: '#6366f1',
    text: '#1e293b',
    textSecondary: '#64748b',
    error: '#dc2626',
    success: '#16a34a',
    panelBg: '#ffffff',
    panelBorder: '#e2e8f0',
    panelText: '#1e293b',
    panelAccent: '#6366f1',
    panelMuted: '#9ca3af',
    panelSubtle: '#d1d5db',
    panelIcon: '#6b7280',
    panelDanger: '#dc2626',
    border: '#e2e8f0',
  }),
}));

// ---------------------------------------------------------------------------
// Mock shared Dashboard components — use simple native HTML for test compatibility
// ---------------------------------------------------------------------------
vi.mock('../../Dashboard/shared', () => ({
  DashboardSelect: ({ children, label, value, onChange }) => (
    <div data-testid="dashboard-select">
      <label>{label}</label>
      <select data-testid="reason-select" value={value} onChange={(e) => onChange && onChange(e)}>
        <option value="">Select a reason (optional)</option>
        <option value="too_expensive">Too expensive</option>
        <option value="missing_features">Missing features I need</option>
        <option value="switching_competitor">Switching to competitor</option>
        <option value="project_completed">Project completed</option>
        <option value="other">Other</option>
      </select>
    </div>
  ),
  DashboardInput: ({ label, value, onChange, multiline, placeholder }) => (
    <div data-testid="dashboard-input">
      <label>{label}</label>
      {multiline ? (
        <textarea
          data-testid="feedback-input"
          value={value}
          onChange={(e) => onChange && onChange(e)}
          placeholder={placeholder}
        />
      ) : (
        <input value={value} onChange={(e) => onChange && onChange(e)} placeholder={placeholder} />
      )}
    </div>
  ),
  DashboardActionButton: ({ children, onClick }) => (
    <button data-testid="action-button" onClick={onClick}>
      {children}
    </button>
  ),
  DashboardCancelButton: ({ children, onClick, disabled }) => (
    <button data-testid="cancel-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  DashboardConfirmButton: ({ children, onClick, disabled }) => (
    <button data-testid="confirm-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  DashboardCard: ({ children, title, subtitle }) => (
    <div data-testid="dashboard-card">
      <h2>{title}</h2>
      {subtitle && <p data-testid="step-indicator">{subtitle}</p>}
      {children}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock useBilling DISPLAY_PLANS export
// ---------------------------------------------------------------------------
vi.mock('../../../hooks/useBilling', () => ({
  DISPLAY_PLANS: [
    { code: 'website_free', displayName: 'STARTUP', priceMonthly: 0, tierLevel: 1 },
    { code: 'website_core', displayName: 'STANDARD', priceMonthly: 14.99, tierLevel: 2 },
    { code: 'website_growth', displayName: 'BUSINESS', priceMonthly: 29.99, tierLevel: 3 },
  ],
  useBilling: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Import component after mocks
// ---------------------------------------------------------------------------
import CancellationFlow from '../CancellationFlow';

// ---------------------------------------------------------------------------
// Default props
// ---------------------------------------------------------------------------
const DEFAULT_PROPS = {
  currentPlan: 'website_core',
  currentPeriodEnd: '2026-04-30T00:00:00.000Z',
  onCancel: vi.fn().mockResolvedValue(true),
  onClose: vi.fn(),
  accountCreditCents: null,
};

describe('CancellationFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DEFAULT_PROPS.onCancel.mockResolvedValue(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Reason Selection
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 1 — Reason Selection', () => {
    it('renders step 1 with reason dropdown and feedback textarea', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);

      // DashboardCard with title
      expect(screen.getByText('Cancel Subscription')).toBeInTheDocument();

      // Step indicator
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 1 of 3');

      // Reason select
      expect(screen.getByTestId('dashboard-select')).toBeInTheDocument();

      // Feedback textarea
      expect(screen.getByTestId('feedback-input')).toBeInTheDocument();

      // Continue button
      const continueBtn = screen.getByTestId('action-button');
      expect(continueBtn).toHaveTextContent('Continue');
    });

    it('allows user to proceed to step 2 without selecting a reason (NO dark patterns)', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);

      // Click Continue without selecting any reason
      fireEvent.click(screen.getByTestId('action-button'));

      // Should advance to step 2
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 2 of 3');
    });

    it('captures reason selection when user selects a reason', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);

      const select = screen.getByTestId('reason-select');
      fireEvent.change(select, { target: { value: 'too_expensive' } });

      // Advance to step 2 — should still work
      fireEvent.click(screen.getByTestId('action-button'));
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 2 of 3');
    });

    it('captures feedback text input', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);

      const textarea = screen.getByTestId('feedback-input');
      fireEvent.change(textarea, { target: { value: 'Too costly for my budget' } });

      // Should not affect ability to advance
      fireEvent.click(screen.getByTestId('action-button'));
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 2 of 3');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — Impact Preview
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 2 — Impact Preview', () => {
    function renderAndAdvanceToStep2() {
      render(<CancellationFlow {...DEFAULT_PROPS} />);
      fireEvent.click(screen.getByTestId('action-button')); // Step 1 → 2
    }

    it('shows step 2 with impact preview content', () => {
      renderAndAdvanceToStep2();

      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 2 of 3');
    });

    it('shows features lost section', () => {
      renderAndAdvanceToStep2();

      expect(screen.getByText(/you will lose access to:/i)).toBeInTheDocument();
    });

    it('shows features kept section', () => {
      renderAndAdvanceToStep2();

      expect(screen.getByText(/you will keep:/i)).toBeInTheDocument();
      expect(screen.getByText(/all your websites and content are preserved/i)).toBeInTheDocument();
    });

    it('shows account credit balance when provided', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} accountCreditCents={1999} />);
      fireEvent.click(screen.getByTestId('action-button')); // → step 2

      expect(screen.getByText(/\$19.99/)).toBeInTheDocument();
    });

    it('does not show credit section when accountCreditCents is null', () => {
      renderAndAdvanceToStep2();
      expect(screen.queryByText(/in account credit/i)).not.toBeInTheDocument();
    });

    it('has Back button that returns to step 1', () => {
      renderAndAdvanceToStep2();

      // Cancel buttons — find "Back"
      const cancelBtns = screen.getAllByTestId('cancel-button');
      const backBtn = cancelBtns.find((b) => /^back$/i.test(b.textContent));
      expect(backBtn).toBeDefined();

      fireEvent.click(backBtn);
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 1 of 3');
    });

    it('has Continue button that advances to step 3', () => {
      renderAndAdvanceToStep2();

      // Action buttons — find "Continue to Confirm"
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      expect(continueBtn).toBeDefined();

      fireEvent.click(continueBtn);
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 3 of 3');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3 — Confirmation
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 3 — Confirmation', () => {
    function renderAndAdvanceToStep3() {
      render(<CancellationFlow {...DEFAULT_PROPS} />);
      fireEvent.click(screen.getByTestId('action-button')); // Step 1 → 2

      // Find "Continue to Confirm" button on step 2
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // Step 2 → 3
    }

    it('renders step 3 with Cancel Subscription confirm button', () => {
      renderAndAdvanceToStep3();

      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 3 of 3');
      const confirmBtn = screen.getByTestId('confirm-button');
      expect(confirmBtn).toHaveTextContent('Cancel Subscription');
    });

    it('shows Keep My Plan escape hatch button', () => {
      renderAndAdvanceToStep3();

      const cancelBtns = screen.getAllByTestId('cancel-button');
      const keepBtn = cancelBtns.find((b) => /keep my plan/i.test(b.textContent));
      expect(keepBtn).toBeDefined();
    });

    it('calls onClose when Keep My Plan is clicked', () => {
      const onClose = vi.fn();
      render(<CancellationFlow {...DEFAULT_PROPS} onClose={onClose} />);

      fireEvent.click(screen.getByTestId('action-button')); // → step 2
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // → step 3

      const cancelBtns = screen.getAllByTestId('cancel-button');
      const keepBtn = cancelBtns.find((b) => /keep my plan/i.test(b.textContent));
      fireEvent.click(keepBtn);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel with reason and feedback on confirm', async () => {
      const onCancel = vi.fn().mockResolvedValue(true);
      render(<CancellationFlow {...DEFAULT_PROPS} onCancel={onCancel} />);

      // Step 1: set reason and feedback
      fireEvent.change(screen.getByTestId('reason-select'), {
        target: { value: 'too_expensive' },
      });
      fireEvent.change(screen.getByTestId('feedback-input'), {
        target: { value: 'Great product but too expensive' },
      });

      // Advance to step 2 → step 3
      fireEvent.click(screen.getByTestId('action-button')); // → 2
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // → 3

      // Confirm
      fireEvent.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledWith({
          reason: 'too_expensive',
          feedback: 'Great product but too expensive',
        });
      });
    });

    it('calls onCancel with empty options when no reason/feedback provided', async () => {
      const onCancel = vi.fn().mockResolvedValue(true);
      render(<CancellationFlow {...DEFAULT_PROPS} onCancel={onCancel} />);

      // Skip everything, just advance
      fireEvent.click(screen.getByTestId('action-button')); // → 2
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // → 3

      fireEvent.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        // No reason or feedback set, options should be empty
        expect(onCancel).toHaveBeenCalledWith({});
      });
    });

    it('disables confirm button during loading', async () => {
      let resolveCancel;
      const pendingOnCancel = vi.fn().mockReturnValue(
        new Promise((res) => {
          resolveCancel = res;
        })
      );

      render(<CancellationFlow {...DEFAULT_PROPS} onCancel={pendingOnCancel} />);

      fireEvent.click(screen.getByTestId('action-button')); // → 2
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // → 3

      const confirmBtn = screen.getByTestId('confirm-button');

      // Start cancellation
      fireEvent.click(confirmBtn);

      // Button should be disabled during loading
      await waitFor(() => {
        expect(screen.getByTestId('confirm-button')).toBeDisabled();
      });

      // Clean up: resolve the pending promise
      await act(async () => {
        resolveCancel(true);
      });
    });

    it('has Back button to return to step 2', () => {
      renderAndAdvanceToStep3();

      const cancelBtns = screen.getAllByTestId('cancel-button');
      const backBtn = cancelBtns.find((b) => /^back$/i.test(b.textContent));
      expect(backBtn).toBeDefined();

      fireEvent.click(backBtn);
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 2 of 3');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Success State
  // ─────────────────────────────────────────────────────────────────────────

  describe('Success State', () => {
    it('shows success alert after successful cancellation', async () => {
      const onCancel = vi.fn().mockResolvedValue(true);
      const onClose = vi.fn();

      render(<CancellationFlow {...DEFAULT_PROPS} onCancel={onCancel} onClose={onClose} />);

      // Navigate to step 3
      fireEvent.click(screen.getByTestId('action-button')); // → 2
      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // → 3

      // Confirm cancellation
      fireEvent.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        expect(screen.getByText(/cancellation scheduled/i)).toBeInTheDocument();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Step Progress Indicator
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step Progress Indicator', () => {
    it('shows "Step 1 of 3" initially', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 1 of 3');
    });

    it('shows "Step 2 of 3" after advancing from step 1', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);
      fireEvent.click(screen.getByTestId('action-button'));
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 2 of 3');
    });

    it('shows "Step 3 of 3" after advancing from step 2', () => {
      render(<CancellationFlow {...DEFAULT_PROPS} />);
      fireEvent.click(screen.getByTestId('action-button')); // → 2

      const actionBtns = screen.getAllByTestId('action-button');
      const continueBtn = actionBtns.find((b) => /continue to confirm/i.test(b.textContent));
      fireEvent.click(continueBtn); // → 3

      expect(screen.getByTestId('step-indicator')).toHaveTextContent('Step 3 of 3');
    });
  });
});
