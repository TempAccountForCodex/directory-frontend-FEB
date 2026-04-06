/**
 * useDelegateScope Hook Tests (Step 7.15.4)
 *
 * Covers:
 *  1.  When not delegating, canAccess returns true for any scope
 *  2.  When not delegating, isRestricted returns false for any section
 *  3.  When delegating with empty scopes (full access), canAccess returns true
 *  4.  When delegating with empty scopes (full access), isRestricted returns false
 *  5.  When delegating with specific scopes, canAccess returns true for allowed scopes
 *  6.  When delegating with specific scopes, canAccess returns false for restricted scopes
 *  7.  isRestricted returns true for sections requiring restricted scopes
 *  8.  isRestricted returns false for sections requiring allowed scopes
 *  9.  isDelegating reflects context state
 * 10.  currentScopes reflects context state
 * 11.  Websites section requires 'websites' scope
 * 12.  Listings section requires 'listings' scope
 * 13.  Settings section requires 'settings' scope
 * 14.  Overview section accessible with 'websites' OR 'listings' OR 'analytics'
 * 15.  Unknown section defaults to restricted during delegation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ── Mock AccountContext ──────────────────────────────────────────────────────

let mockContextValue = {
  isDelegating: false,
  serviceScopes: [],
};

vi.mock('../../context/AccountContext', () => ({
  useAccountContext: () => mockContextValue,
}));

// ── Import after mocks ─────────────────────────────────────────────────────

import { useDelegateScope, SECTION_SCOPE_MAP } from '../useDelegateScope';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('useDelegateScope', () => {
  beforeEach(() => {
    mockContextValue = {
      isDelegating: false,
      serviceScopes: [],
    };
  });

  it('1. when not delegating, canAccess returns true for any scope', () => {
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.canAccess('websites')).toBe(true);
    expect(result.current.canAccess('listings')).toBe(true);
    expect(result.current.canAccess('anything')).toBe(true);
  });

  it('2. when not delegating, isRestricted returns false for any section', () => {
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('websites')).toBe(false);
    expect(result.current.isRestricted('listings')).toBe(false);
    expect(result.current.isRestricted('settings')).toBe(false);
    expect(result.current.isRestricted('unknown-section')).toBe(false);
  });

  it('3. when delegating with empty scopes (full access), canAccess returns true', () => {
    mockContextValue = { isDelegating: true, serviceScopes: [] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.canAccess('websites')).toBe(true);
    expect(result.current.canAccess('listings')).toBe(true);
    expect(result.current.canAccess('users')).toBe(true);
  });

  it('4. when delegating with empty scopes (full access), isRestricted returns false', () => {
    mockContextValue = { isDelegating: true, serviceScopes: [] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('websites')).toBe(false);
    expect(result.current.isRestricted('users')).toBe(false);
    expect(result.current.isRestricted('settings')).toBe(false);
  });

  it('5. when delegating with specific scopes, canAccess returns true for allowed', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites', 'listings'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.canAccess('websites')).toBe(true);
    expect(result.current.canAccess('listings')).toBe(true);
  });

  it('6. when delegating with specific scopes, canAccess returns false for restricted', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites', 'listings'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.canAccess('users')).toBe(false);
    expect(result.current.canAccess('analytics')).toBe(false);
    expect(result.current.canAccess('settings')).toBe(false);
  });

  it('7. isRestricted returns true for sections requiring restricted scopes', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites'] };
    const { result } = renderHook(() => useDelegateScope());
    // 'listings' section requires 'listings' scope
    expect(result.current.isRestricted('listings')).toBe(true);
    // 'users' section requires 'users' scope
    expect(result.current.isRestricted('users')).toBe(true);
    // 'settings' section requires 'settings' scope
    expect(result.current.isRestricted('settings')).toBe(true);
  });

  it('8. isRestricted returns false for sections requiring allowed scopes', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('websites')).toBe(false);
    expect(result.current.isRestricted('websites/create')).toBe(false);
    expect(result.current.isRestricted('websites/stores')).toBe(false);
  });

  it('9. isDelegating reflects context state', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isDelegating).toBe(true);
  });

  it('10. currentScopes reflects context state', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites', 'listings'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.currentScopes).toEqual(['websites', 'listings']);
  });

  it('11. websites section requires websites scope', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['analytics'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('websites')).toBe(true);
    expect(result.current.isRestricted('websites/create')).toBe(true);
    expect(result.current.isRestricted('websites/stores')).toBe(true);
  });

  it('12. listings section requires listings scope', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('listings')).toBe(true);
    expect(result.current.isRestricted('listings/modify')).toBe(true);
    expect(result.current.isRestricted('listings/favourites')).toBe(true);
  });

  it('13. settings section requires settings scope', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites', 'listings'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('settings')).toBe(true);
  });

  it('14. overview section accessible with websites OR listings OR analytics', () => {
    // With websites
    mockContextValue = { isDelegating: true, serviceScopes: ['websites'] };
    let { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('overview')).toBe(false);

    // With listings
    mockContextValue = { isDelegating: true, serviceScopes: ['listings'] };
    ({ result } = renderHook(() => useDelegateScope()));
    expect(result.current.isRestricted('overview')).toBe(false);

    // With analytics
    mockContextValue = { isDelegating: true, serviceScopes: ['analytics'] };
    ({ result } = renderHook(() => useDelegateScope()));
    expect(result.current.isRestricted('overview')).toBe(false);

    // With only settings - restricted
    mockContextValue = { isDelegating: true, serviceScopes: ['settings'] };
    ({ result } = renderHook(() => useDelegateScope()));
    expect(result.current.isRestricted('overview')).toBe(true);
  });

  it('15. unknown section defaults to restricted during delegation', () => {
    mockContextValue = { isDelegating: true, serviceScopes: ['websites'] };
    const { result } = renderHook(() => useDelegateScope());
    expect(result.current.isRestricted('completely-unknown-section')).toBe(true);
  });
});
