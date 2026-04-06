/**
 * useFeatureGate Hook Tests (Step 10.1a)
 *
 * Covers:
 * 1.  Known feature on free plan returns allowed=false + showUpgrade=true
 * 2.  Known feature on sufficient plan returns allowed=true + showUpgrade=false
 * 3.  Admin user (ADMIN) always gets allowed=true regardless of plan
 * 4.  SUPER_ADMIN user always gets allowed=true regardless of plan
 * 5.  Unknown feature returns allowed=true
 * 6.  Loading state returns loading=true + allowed=false + showUpgrade=false
 * 7.  featureLabel is correct string
 * 8.  requiredPlanLabel is correct string
 * 9.  customDomain requires website_growth (not core)
 * 10. Free plan for customDomain is blocked
 * 11. Core plan for customDomain is still blocked
 * 12. Growth plan for customDomain is allowed
 * 13. showUpgrade is false when loading
 * 14. showUpgrade is true when not loading and not allowed
 * 15. Unknown feature returns empty requiredPlan and requiredPlanLabel
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ── Mock dependencies ─────────────────────────────────────────────────────

let mockPlanSummary = null;
let mockLoading = false;

vi.mock('../usePlanSummary', () => ({
  usePlanSummary: () => ({ planSummary: mockPlanSummary, loading: mockLoading, error: null }),
}));

let mockUser = null;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// ── Import after mocks ────────────────────────────────────────────────────

import { useFeatureGate } from '../useFeatureGate';

// ── Helpers ───────────────────────────────────────────────────────────────

function makePlanSummary(planCode) {
  return {
    websitePlan: { code: planCode, name: planCode },
    websiteUsage: { websitesOwned: 0, pagesByWebsiteId: {}, blocksByPageId: {} },
    storePlan: { code: null },
    storeUsage: { storesOwned: null },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useFeatureGate', () => {
  beforeEach(() => {
    mockPlanSummary = makePlanSummary('website_free');
    mockLoading = false;
    mockUser = null;
  });

  it('1. known feature on free plan returns allowed=false and showUpgrade=true', () => {
    mockPlanSummary = makePlanSummary('website_free');
    const { result } = renderHook(() => useFeatureGate('videoBlocks'));
    expect(result.current.allowed).toBe(false);
    expect(result.current.showUpgrade).toBe(true);
  });

  it('2. known feature on sufficient plan returns allowed=true and showUpgrade=false', () => {
    mockPlanSummary = makePlanSummary('website_core');
    const { result } = renderHook(() => useFeatureGate('videoBlocks'));
    expect(result.current.allowed).toBe(true);
    expect(result.current.showUpgrade).toBe(false);
  });

  it('3. ADMIN user always gets allowed=true regardless of plan (free plan)', () => {
    mockPlanSummary = makePlanSummary('website_free');
    mockUser = { role: 'ADMIN', id: 'admin-1' };
    const { result } = renderHook(() => useFeatureGate('videoBlocks'));
    expect(result.current.allowed).toBe(true);
    expect(result.current.showUpgrade).toBe(false);
  });

  it('4. SUPER_ADMIN user always gets allowed=true regardless of plan (free plan)', () => {
    mockPlanSummary = makePlanSummary('website_free');
    mockUser = { role: 'SUPER_ADMIN', id: 'admin-2' };
    const { result } = renderHook(() => useFeatureGate('customCSS'));
    expect(result.current.allowed).toBe(true);
    expect(result.current.showUpgrade).toBe(false);
  });

  it('5. unknown feature returns allowed=true', () => {
    mockPlanSummary = makePlanSummary('website_free');
    const { result } = renderHook(() => useFeatureGate('unknownFeature_xyz'));
    expect(result.current.allowed).toBe(true);
    expect(result.current.showUpgrade).toBe(false);
  });

  it('6. loading state returns loading=true, allowed=false, showUpgrade=false', () => {
    mockLoading = true;
    mockPlanSummary = null;
    const { result } = renderHook(() => useFeatureGate('videoBlocks'));
    expect(result.current.loading).toBe(true);
    expect(result.current.allowed).toBe(false);
    expect(result.current.showUpgrade).toBe(false);
  });

  it('7. featureLabel is correct string for videoBlocks', () => {
    const { result } = renderHook(() => useFeatureGate('videoBlocks'));
    expect(result.current.featureLabel).toBe('Video Blocks');
  });

  it('8. requiredPlanLabel is correct string for videoBlocks', () => {
    const { result } = renderHook(() => useFeatureGate('videoBlocks'));
    expect(result.current.requiredPlanLabel).toBe('Core');
  });

  it('9. customDomain requires website_growth (requiredPlan=website_growth)', () => {
    mockPlanSummary = makePlanSummary('website_free');
    const { result } = renderHook(() => useFeatureGate('customDomain'));
    expect(result.current.requiredPlan).toBe('website_growth');
  });

  it('10. free plan for customDomain is blocked', () => {
    mockPlanSummary = makePlanSummary('website_free');
    const { result } = renderHook(() => useFeatureGate('customDomain'));
    expect(result.current.allowed).toBe(false);
    expect(result.current.showUpgrade).toBe(true);
  });

  it('11. core plan for customDomain is still blocked', () => {
    mockPlanSummary = makePlanSummary('website_core');
    const { result } = renderHook(() => useFeatureGate('customDomain'));
    expect(result.current.allowed).toBe(false);
    expect(result.current.showUpgrade).toBe(true);
  });

  it('12. growth plan for customDomain is allowed', () => {
    mockPlanSummary = makePlanSummary('website_growth');
    const { result } = renderHook(() => useFeatureGate('customDomain'));
    expect(result.current.allowed).toBe(true);
    expect(result.current.showUpgrade).toBe(false);
  });

  it('13. showUpgrade is false when loading', () => {
    mockLoading = true;
    mockPlanSummary = null;
    const { result } = renderHook(() => useFeatureGate('customCSS'));
    expect(result.current.showUpgrade).toBe(false);
  });

  it('14. showUpgrade is true when not loading and not allowed', () => {
    mockLoading = false;
    mockPlanSummary = makePlanSummary('website_free');
    const { result } = renderHook(() => useFeatureGate('customCSS'));
    expect(result.current.showUpgrade).toBe(true);
    expect(result.current.allowed).toBe(false);
  });

  it('15. unknown feature returns empty requiredPlan and requiredPlanLabel', () => {
    const { result } = renderHook(() => useFeatureGate('completelyUnknown'));
    expect(result.current.requiredPlan).toBe('');
    expect(result.current.requiredPlanLabel).toBe('');
  });
});
