/**
 * AccountSwitcher Tests (Step 7.15.3)
 *
 * Covers:
 *  1.  Hidden when no delegated accounts and not delegating
 *  2.  Renders switch trigger when user has delegated accounts
 *  3.  Opens account list on trigger click
 *  4.  Shows delegated accounts in the dropdown list
 *  5.  Triggers switchAccount on account selection
 *  6.  Shows delegation banner during delegation
 *  7.  Banner shows owner name
 *  8.  Return to own account button clears delegation
 *  9.  Shows loading skeletons while loading
 * 10.  Shows error alert on error state
 * 11.  Collapsed mode shows compact icon
 * 12.  Collapsed mode shows compact delegation indicator
 * 13.  Closes dropdown on outside click
 * 14.  Closes dropdown on Escape key
 * 15.  Account trigger has correct aria attributes
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── Mock AccountContext ──────────────────────────────────────────────────────

const mockSwitchAccount = vi.fn().mockResolvedValue(true);
const mockClearDelegation = vi.fn().mockResolvedValue(true);
const mockRefreshAccounts = vi.fn();

let contextValue = {
  isDelegating: false,
  delegateAccount: null,
  delegatedAccounts: [],
  isLoading: false,
  isSwitching: false,
  error: null,
  switchAccount: mockSwitchAccount,
  clearDelegation: mockClearDelegation,
  refreshAccounts: mockRefreshAccounts,
  serviceScopes: [],
};

vi.mock('../../../context/AccountContext', () => ({
  useAccountContext: () => contextValue,
}));

// ── Import after mocks ─────────────────────────────────────────────────────

import AccountSwitcher from '../AccountSwitcher';

// ── Test Data ───────────────────────────────────────────────────────────────

const mockAccounts = [
  {
    id: 100,
    ownerUser: { id: 10, name: 'Alice Owner', email: 'alice@test.com' },
    role: 'ACCOUNT_ADMIN',
    serviceScopes: [],
  },
  {
    id: 200,
    ownerUser: { id: 20, name: 'Bob Boss', email: 'bob@test.com' },
    role: 'ACCOUNT_COLLABORATOR',
    serviceScopes: ['websites', 'listings'],
  },
];

const defaultColors = {
  mode: 'dark',
  text: '#fff',
  textSecondary: '#aaa',
  border: 'rgba(255,255,255,0.1)',
  primary: '#378C92',
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('AccountSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contextValue = {
      isDelegating: false,
      delegateAccount: null,
      delegatedAccounts: [],
      isLoading: false,
      isSwitching: false,
      error: null,
      switchAccount: mockSwitchAccount,
      clearDelegation: mockClearDelegation,
      refreshAccounts: mockRefreshAccounts,
      serviceScopes: [],
    };
  });

  it('1. hidden when no delegated accounts and not delegating', () => {
    const { container } = render(<AccountSwitcher colors={defaultColors} />);
    expect(container.firstChild).toBeNull();
  });

  it('2. renders switch trigger when user has delegated accounts', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    expect(screen.getByTestId('account-switcher-trigger')).toBeInTheDocument();
    expect(screen.getByText('Switch Account')).toBeInTheDocument();
  });

  it('3. opens account list on trigger click', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    fireEvent.click(screen.getByTestId('account-switcher-trigger'));
    expect(screen.getByTestId('account-list')).toBeInTheDocument();
  });

  it('4. shows delegated accounts in the dropdown list', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    fireEvent.click(screen.getByTestId('account-switcher-trigger'));
    expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    expect(screen.getByText('Bob Boss')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('5. triggers switchAccount on account selection', async () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    fireEvent.click(screen.getByTestId('account-switcher-trigger'));
    fireEvent.click(screen.getByTestId('account-option-10'));
    expect(mockSwitchAccount).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('6. shows delegation banner during delegation', () => {
    contextValue.isDelegating = true;
    contextValue.delegateAccount = mockAccounts[0];
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    expect(screen.getByTestId('delegation-banner')).toBeInTheDocument();
  });

  it('7. banner shows owner name', () => {
    contextValue.isDelegating = true;
    contextValue.delegateAccount = mockAccounts[0];
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    expect(screen.getByText('Acting as Alice Owner')).toBeInTheDocument();
  });

  it('8. return to own account button clears delegation', () => {
    contextValue.isDelegating = true;
    contextValue.delegateAccount = mockAccounts[0];
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    fireEvent.click(screen.getByTestId('return-to-own-account'));
    expect(mockClearDelegation).toHaveBeenCalled();
  });

  it('9. shows loading skeletons while loading', () => {
    contextValue.delegatedAccounts = mockAccounts;
    contextValue.isLoading = true;
    render(<AccountSwitcher colors={defaultColors} />);
    // Open the dropdown first
    fireEvent.click(screen.getByTestId('account-switcher-trigger'));
    // Should show skeletons (MUI Skeleton renders with MuiSkeleton class)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('10. shows error alert on error state', () => {
    contextValue.delegatedAccounts = mockAccounts;
    contextValue.error = 'Something went wrong';
    render(<AccountSwitcher colors={defaultColors} />);
    expect(screen.getByTestId('account-switcher-error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('11. collapsed mode shows compact icon when accounts available', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher isCollapsed colors={defaultColors} />);
    expect(screen.getByTestId('account-switcher-collapsed')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch account')).toBeInTheDocument();
  });

  it('12. collapsed mode shows compact delegation indicator', () => {
    contextValue.isDelegating = true;
    contextValue.delegateAccount = mockAccounts[0];
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher isCollapsed colors={defaultColors} />);
    expect(screen.getByTestId('delegation-banner-compact')).toBeInTheDocument();
  });

  it('13. closes dropdown on outside click', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <AccountSwitcher colors={defaultColors} />
      </div>
    );
    fireEvent.click(screen.getByTestId('account-switcher-trigger'));
    expect(screen.getByTestId('account-list')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('account-list')).not.toBeInTheDocument();
  });

  it('14. closes dropdown on Escape key', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    fireEvent.click(screen.getByTestId('account-switcher-trigger'));
    expect(screen.getByTestId('account-list')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('account-list')).not.toBeInTheDocument();
  });

  it('15. account trigger has correct aria attributes', () => {
    contextValue.delegatedAccounts = mockAccounts;
    render(<AccountSwitcher colors={defaultColors} />);
    const trigger = screen.getByTestId('account-switcher-trigger');
    expect(trigger).toHaveAttribute('aria-label', 'Switch account');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
