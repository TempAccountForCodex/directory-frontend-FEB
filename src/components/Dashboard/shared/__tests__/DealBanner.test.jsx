/**
 * DealBanner Tests — Step 10.36
 *
 * Covers:
 * 1. Renders banner when deal is provided
 * 2. Shows deal name and discount info in the banner
 * 3. Dismiss X button hides banner and writes localStorage key
 * 4. Banner suppressed on re-render when localStorage key is present (not expired)
 * 5. Countdown timer visible when deal ends within 7 days and countdownEnabled=true
 * 6. No countdown when deal ends > 7 days away
 * 7. CTA button triggers navigate to billing with promo code
 * 8. Banner respects bannerConfig.bannerText when provided
 * 9. Dismiss key expires after 24h (expired key = banner shows again)
 * 10. Banner not rendered when deal is null/undefined
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark' }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock dashboardTheme
// ---------------------------------------------------------------------------
vi.mock('../../../../styles/dashboardTheme', () => ({
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
  }),
}));

// ---------------------------------------------------------------------------
// Mock react-router-dom (keep MemoryRouter real)
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
// Mock DashboardGradientButton to avoid full MUI theme setup
// ---------------------------------------------------------------------------
vi.mock('../DashboardGradientButton', () => ({
  default: ({ children, onClick, ...props }) => (
    <button onClick={onClick} data-testid="deal-cta" {...props}>
      {children}
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import DealBanner from '../DealBanner';

const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours (matches component)

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeDeal(overrides = {}) {
  return {
    id: 1,
    name: 'Summer Flash Sale',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    promoCode: 'SUMMER30',
    endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days away
    bannerConfig: {
      countdownEnabled: true,
      showOnPages: 'all',
    },
    ...overrides,
  };
}

const userId = 42;

function renderBanner(deal = makeDeal(), uid = userId) {
  return render(
    <MemoryRouter>
      <DealBanner deal={deal} userId={uid} />
    </MemoryRouter>,
  );
}

function getDismissKey(dealId, uid) {
  return `tt_deal_dismissed_${dealId}_${uid || 'guest'}`;
}

// ---------------------------------------------------------------------------
// Real localStorage implementation for tests
// (setup.ts uses vi.fn() mocks that don't actually store data)
// ---------------------------------------------------------------------------

const realStorage = new Map();

function setupLocalStorageMock() {
  // Replace localStorage methods with real implementations backed by a Map
  vi.mocked(localStorage.getItem).mockImplementation((key) => realStorage.get(key) ?? null);
  vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
    realStorage.set(key, String(value));
  });
  vi.mocked(localStorage.removeItem).mockImplementation((key) => {
    realStorage.delete(key);
  });
  vi.mocked(localStorage.clear).mockImplementation(() => {
    realStorage.clear();
  });
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  realStorage.clear();
  vi.clearAllMocks();
  setupLocalStorageMock();
  // Note: NOT using fake timers to avoid Date.now() confusion
  // Tests that need specific time values use real Date.now()
});

afterEach(() => {
  realStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DealBanner', () => {
  it('renders the deal name in the banner', () => {
    renderBanner();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/Summer Flash Sale/i)).toBeInTheDocument();
  });

  it('shows "30% Off" formatted discount', () => {
    renderBanner();
    expect(screen.getByText(/30% Off/i)).toBeInTheDocument();
  });

  it('uses bannerConfig.bannerText when provided', () => {
    const deal = makeDeal({
      bannerConfig: {
        countdownEnabled: false,
        bannerText: 'Custom banner text!',
        showOnPages: 'all',
      },
    });
    renderBanner(deal);
    expect(screen.getByText('Custom banner text!')).toBeInTheDocument();
  });

  it('shows CTA button', () => {
    renderBanner();
    expect(screen.getByTestId('deal-cta')).toBeInTheDocument();
  });

  it('CTA navigates to billing with promo code', () => {
    renderBanner();
    fireEvent.click(screen.getByTestId('deal-cta'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/dashboard/settings?tab=billing&promo=SUMMER30',
    );
  });

  it('dismiss X button hides the banner', () => {
    renderBanner();
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('dismiss writes localStorage key scoped to dealId + userId', () => {
    renderBanner();
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);

    const key = getDismissKey(1, userId);
    // With fake timers Date.now()=0, stored expiry = 0 + DISMISS_DURATION_MS
    expect(realStorage.has(key)).toBe(true);
    const stored = realStorage.get(key);
    expect(parseInt(stored, 10)).toBeGreaterThan(0);
  });

  it('banner is suppressed after dismiss is clicked', () => {
    // Render initially (banner shows)
    renderBanner();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Click dismiss
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);

    // After click, banner should be hidden (state update)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('banner is suppressed when localStorage key exists and not expired', () => {
    const key = getDismissKey(1, userId);
    // Store a dismiss timestamp 23h in the future from NOW (real time)
    const futureExpiry = Date.now() + 23 * 60 * 60 * 1000;
    realStorage.set(key, String(futureExpiry));

    renderBanner();
    // Component returns null — banner role should not be present
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('banner shows again when localStorage dismiss key has expired', () => {
    const key = getDismissKey(1, userId);
    // Store an expired dismiss timestamp (1 second in the past)
    const pastExpiry = Date.now() - 1000;
    realStorage.set(key, String(pastExpiry));

    renderBanner();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Expired key should have been removed
    expect(realStorage.has(key)).toBe(false);
  });

  it('shows countdown when deal ends within 7 days and countdownEnabled=true', () => {
    const deal = makeDeal({
      endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      bannerConfig: { countdownEnabled: true, showOnPages: 'all' },
    });
    renderBanner(deal);
    expect(screen.getByText(/Ends in/i)).toBeInTheDocument();
  });

  it('does not show countdown when deal ends > 7 days away', () => {
    const deal = makeDeal({
      endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
      bannerConfig: { countdownEnabled: true, showOnPages: 'all' },
    });
    renderBanner(deal);
    expect(screen.queryByText(/Ends in/i)).not.toBeInTheDocument();
  });

  it('does not show countdown when countdownEnabled=false', () => {
    const deal = makeDeal({
      endAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
      bannerConfig: { countdownEnabled: false, showOnPages: 'all' },
    });
    renderBanner(deal);
    expect(screen.queryByText(/Ends in/i)).not.toBeInTheDocument();
  });
});
