/**
 * Step 2.2.4 — Debouncing Hook
 * Generic hook that debounces a value by the given delay.
 *
 * Usage:
 *   const debouncedSearch = useDebouncedValue(searchTerm, 400);
 *
 * Returns the debounced value. The returned value only updates after
 * `delay` milliseconds have elapsed with no new input.
 */
import { useState, useEffect } from "react";

/**
 * useDebouncedValue
 *
 * @param value - The value to debounce (any type T)
 * @param delay - Debounce delay in milliseconds (default 300ms)
 * @returns The debounced value — updates only after `delay` ms of inactivity
 */
function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
export { useDebouncedValue };
