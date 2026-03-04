import { useState, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface UsePersistentStateOptions {
  /**
   * Scope for the key namespace
   * - 'global': Shared across entire app
   * - 'route': Specific to current route/page
   * @default 'global'
   */
  scope?: "global" | "route";

  /**
   * Enable cross-tab synchronization via storage events
   * @default false
   */
  syncAcrossTabs?: boolean;
}

const NAMESPACE_PREFIX = "ttdir";

/**
 * Hook for persistent state that survives page reloads and optionally syncs across tabs
 *
 * @param key - Unique key for this state (will be namespaced automatically)
 * @param initialValue - Default value if no persisted value exists
 * @param options - Configuration options
 * @returns Tuple of [value, setValue] like useState
 *
 * @example
 * ```ts
 * const [filters, setFilters] = usePersistentState('directory:filters', defaultFilters, {
 *   scope: 'global',
 *   syncAcrossTabs: true
 * });
 * ```
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options: UsePersistentStateOptions = {},
): [T, Dispatch<SetStateAction<T>>] {
  const { scope = "global", syncAcrossTabs = false } = options;

  // Build namespaced key
  const namespacedKey = `${NAMESPACE_PREFIX}:${scope}:${key}`;

  // Initialize state from localStorage or use initialValue
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(namespacedKey);
      if (item) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.warn(
        `Failed to parse localStorage key "${namespacedKey}":`,
        error,
      );
    }
    return initialValue;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(namespacedKey, JSON.stringify(state));
    } catch (error) {
      console.error(
        `Failed to save to localStorage key "${namespacedKey}":`,
        error,
      );
    }
  }, [state, namespacedKey]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      // Only react to changes to our specific key
      if (e.key === namespacedKey && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setState(newValue);
        } catch (error) {
          console.warn(
            `Failed to sync storage event for key "${namespacedKey}":`,
            error,
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [namespacedKey, syncAcrossTabs]);

  // Wrapped setValue that accepts both values and updater functions
  const setValue = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    setState((prevState) => {
      const nextState = value instanceof Function ? value(prevState) : value;
      return nextState;
    });
  }, []);

  return [state, setValue];
}

/**
 * Clear a specific persistent state key
 */
export function clearPersistentState(
  key: string,
  scope: "global" | "route" = "global",
): void {
  const namespacedKey = `${NAMESPACE_PREFIX}:${scope}:${key}`;
  try {
    window.localStorage.removeItem(namespacedKey);
  } catch (error) {
    console.error(
      `Failed to clear localStorage key "${namespacedKey}":`,
      error,
    );
  }
}

/**
 * Clear all persistent state for a given scope or pattern
 */
export function clearPersistentStateByPattern(pattern: string): void {
  try {
    const keys = Object.keys(window.localStorage);
    const matchingKeys = keys.filter(
      (k) => k.startsWith(`${NAMESPACE_PREFIX}:`) && k.includes(pattern),
    );
    matchingKeys.forEach((k) => window.localStorage.removeItem(k));
  } catch (error) {
    console.error(
      `Failed to clear localStorage by pattern "${pattern}":`,
      error,
    );
  }
}
