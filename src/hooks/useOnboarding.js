/**
 * useOnboarding Hook
 *
 * Fetches and manages the user's onboarding progress via the backend API.
 * Exposes memoized handlers for tracking steps, resetting progress, and
 * tracking feature tour progress.
 *
 * Usage:
 *   const { progress, loading, trackStep, resetOnboarding, tours, trackTour } = useOnboarding();
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = '/api/onboarding';

/**
 * Default progress state used while loading or on error.
 */
const DEFAULT_PROGRESS = {
  step: 'ACCOUNT_CREATED',
  completedSteps: [],
  completionPercent: 0,
  completedAt: null,
};

/**
 * @typedef {Object} OnboardingProgress
 * @property {string}   step             Current onboarding step enum value
 * @property {string[]} completedSteps   Array of completed step names
 * @property {number}   completionPercent 0–100 percent complete
 * @property {Date|null} completedAt     When onboarding was completed, or null
 */

/**
 * @returns {{
 *   progress: OnboardingProgress,
 *   loading: boolean,
 *   error: string|null,
 *   trackStep: (step: string) => Promise<void>,
 *   resetOnboarding: () => Promise<void>,
 *   tours: Array,
 *   trackTour: (tourId: string, currentStep: number, isCompleted?: boolean) => Promise<void>,
 * }}
 */
export function useOnboarding() {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch progress and tours on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [progressRes, toursRes] = await Promise.all([
          fetch(`${BASE_URL}/`, { credentials: 'include' }),
          fetch(`${BASE_URL}/tours`, { credentials: 'include' }),
        ]);

        if (!cancelled) {
          if (progressRes.ok) {
            const data = await progressRes.json();
            setProgress(data.data || DEFAULT_PROGRESS);
          }

          if (toursRes.ok) {
            const data = await toursRes.json();
            setTours(data.data || []);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useOnboarding] Failed to fetch onboarding data:', err.message);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Track an onboarding step. Updates local state optimistically.
   */
  const trackStep = useCallback(async (step) => {
    // Optimistic update
    setProgress((prev) => {
      const completedSteps = prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step];
      const completionPercent = Math.round((completedSteps.length / 5) * 100);
      return {
        ...prev,
        step,
        completedSteps,
        completionPercent,
      };
    });

    try {
      const res = await fetch(`${BASE_URL}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ step }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const completedSteps = Array.isArray(data.data.completedSteps)
            ? data.data.completedSteps
            : [];
          setProgress({
            step: data.data.step,
            completedSteps,
            completionPercent: Math.round((completedSteps.length / 5) * 100),
            completedAt: data.data.completedAt || null,
          });
        }
      }
    } catch (err) {
      console.warn('[useOnboarding] Failed to track step:', err.message);
    }
  }, []);

  /**
   * Reset onboarding progress to initial state.
   */
  const resetOnboarding = useCallback(async () => {
    // Optimistic reset
    setProgress(DEFAULT_PROGRESS);
    setTours((prev) => prev.map((t) => ({ ...t, currentStep: 0, isCompleted: false })));

    try {
      await fetch(`${BASE_URL}/reset`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('[useOnboarding] Failed to reset onboarding:', err.message);
    }
  }, []);

  /**
   * Track progress for a specific feature tour.
   */
  const trackTour = useCallback(async (tourId, currentStep, isCompleted = false) => {
    // Optimistic update
    setTours((prev) =>
      prev.map((t) =>
        t.id === tourId
          ? { ...t, currentStep, isCompleted, lastViewedAt: new Date().toISOString() }
          : t
      )
    );

    try {
      await fetch(`${BASE_URL}/tours/${encodeURIComponent(tourId)}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentStep, isCompleted }),
      });
    } catch (err) {
      console.warn('[useOnboarding] Failed to track tour:', err.message);
    }
  }, []);

  return {
    progress,
    loading,
    error,
    trackStep,
    resetOnboarding,
    tours,
    trackTour,
  };
}

export default useOnboarding;
