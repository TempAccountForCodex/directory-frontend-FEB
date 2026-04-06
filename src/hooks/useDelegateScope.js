/**
 * useDelegateScope Hook (Step 7.15.4)
 *
 * Reads delegation state from AccountContext and provides helper methods
 * to check service scope access for UI enforcement during delegation.
 *
 * Returns:
 *   - canAccess(scope): boolean — whether the current delegation allows scope
 *   - isDelegating: boolean — whether currently in delegation mode
 *   - currentScopes: string[] — active service scopes
 *   - isRestricted(section): boolean — whether a dashboard section is restricted
 *
 * Scope-to-section mapping:
 *   - 'websites' → websites, websites/create, websites/templates, etc.
 *   - 'listings' → listings, listings/modify, listings/favourites, etc.
 *   - 'analytics' → admin-analytics, overview (metrics portions)
 *   - 'templates' → templates (manage templates)
 *   - 'users' → users (user management)
 *   - 'settings' → settings
 *
 * When not delegating, all access is allowed (returns true for everything).
 * Service scope enforcement is defense-in-depth — server enforces too.
 *
 * NOTE: No live consumers currently mount this hook into dashboard navigation
 * or section gating. Mounting into the real navigation path is future Phase 9 work.
 */

import { useMemo, useCallback } from 'react';
import { useAccountContext } from '../context/AccountContext';

/**
 * Maps dashboard section IDs to the required service scopes.
 * A section can require multiple scopes (any match grants access).
 */
const SECTION_SCOPE_MAP = {
  // Overview
  overview: ['websites', 'listings', 'analytics'],

  // Analytics
  'admin-analytics': ['analytics'],

  // Content management
  insights: ['content'],
  templates: ['templates'],

  // Websites
  websites: ['websites'],
  'websites/create': ['websites'],
  'websites/create/customize': ['websites'],
  'websites/create/questionnaire': ['websites'],
  'websites/create-template': ['templates'],
  'websites/templates': ['websites', 'templates'],
  'websites/my-templates': ['websites', 'templates'],
  'websites/recently-deleted': ['websites'],
  'websites/stores': ['websites'],
  'websites/events': ['websites'],
  'websites/blog': ['websites'],

  // Listings
  listings: ['listings'],
  'listings/modify': ['listings'],
  'listings/favourites': ['listings'],
  'listings/archived': ['listings'],

  // Dropdown parents
  'websites-dropdown': ['websites', 'templates'],
  'listings-dropdown': ['listings'],

  // Management
  users: ['users'],
  settings: ['settings'],
};

/**
 * useDelegateScope — React hook for service scope enforcement during delegation.
 *
 * @returns {{
 *   canAccess: (scope: string) => boolean,
 *   isDelegating: boolean,
 *   currentScopes: string[],
 *   isRestricted: (section: string) => boolean,
 * }}
 */
export function useDelegateScope() {
  const { isDelegating, serviceScopes } = useAccountContext();

  // Set of allowed scopes for O(1) lookup
  const scopeSet = useMemo(() => new Set(serviceScopes), [serviceScopes]);

  /**
   * Check if a specific service scope is allowed.
   * When not delegating or when scopes is empty (full access), returns true.
   */
  const canAccess = useCallback(
    (scope) => {
      if (!isDelegating) return true;
      // Empty scopes array means full access (ACCOUNT_ADMIN)
      if (serviceScopes.length === 0) return true;
      return scopeSet.has(scope);
    },
    [isDelegating, serviceScopes, scopeSet]
  );

  /**
   * Check if a dashboard section is restricted (blocked) during delegation.
   * Returns true if the section is restricted, false if accessible.
   * When not delegating, always returns false (not restricted).
   */
  const isRestricted = useCallback(
    (section) => {
      if (!isDelegating) return false;
      // Empty scopes = full access
      if (serviceScopes.length === 0) return false;

      const requiredScopes = SECTION_SCOPE_MAP[section];
      // Unknown section: default to restricted during delegation
      if (!requiredScopes) return true;

      // If any required scope matches a user scope, section is accessible
      return !requiredScopes.some((scope) => scopeSet.has(scope));
    },
    [isDelegating, serviceScopes, scopeSet]
  );

  return useMemo(
    () => ({
      canAccess,
      isDelegating,
      currentScopes: serviceScopes,
      isRestricted,
    }),
    [canAccess, isDelegating, serviceScopes, isRestricted]
  );
}

export { SECTION_SCOPE_MAP };
export default useDelegateScope;
