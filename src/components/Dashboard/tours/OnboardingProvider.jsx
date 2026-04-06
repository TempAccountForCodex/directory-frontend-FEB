/**
 * OnboardingProvider
 *
 * Context provider that manages the global onboarding and feature tour state.
 * Wrap the dashboard layout with this provider to enable:
 *   - Auto-showing OnboardingModal for new users
 *   - showTour(tourId) / dismissTour(tourId) API for feature tours
 *   - Task checklist state derived from API progress
 *
 * Usage:
 *   <OnboardingProvider>
 *     <DashboardLayout />
 *   </OnboardingProvider>
 *
 *   const { showTour, dismissTour, isOnboardingComplete } = useOnboardingContext();
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  memo,
} from 'react';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { useOnboarding } from '../../../hooks/useOnboarding';
import OnboardingModal from './OnboardingModal';
import TourEngine from './TourEngine';
import { ONBOARDING_TASKS } from './tourConfig';

const OnboardingContext = createContext(null);

/**
 * Hook to access the OnboardingContext from child components.
 * @returns {object} Onboarding context value
 */
export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return ctx;
}

const OnboardingProvider = memo(({ children }) => {
  const { progress, loading, tours, trackStep, resetOnboarding: resetOnboardingAPI, trackTour } =
    useOnboarding();

  // Persist whether the onboarding modal has been dismissed
  const [modalDismissed, setModalDismissed] = usePersistentState('onboarding:modal:v1', false, {
    scope: 'global',
  });

  // Which feature tour is currently active (null = none)
  const [activeTourId, setActiveTourId] = useState(null);

  // Whether the onboarding modal is visible
  const [showModal, setShowModal] = useState(false);

  // Auto-show modal for new users once loading is done
  useEffect(() => {
    if (!loading && !modalDismissed && progress.step === 'ACCOUNT_CREATED') {
      setShowModal(true);
    }
  }, [loading, modalDismissed, progress.step]);

  const handleModalComplete = useCallback(() => {
    trackStep('COMPLETE');
    setModalDismissed(true);
    setShowModal(false);
  }, [trackStep, setModalDismissed]);

  const handleModalClose = useCallback(() => {
    setModalDismissed(true);
    setShowModal(false);
  }, [setModalDismissed]);

  /**
   * Programmatically start a feature tour.
   * @param {string} tourId
   */
  const showTour = useCallback((tourId) => {
    setActiveTourId(tourId);
  }, []);

  /**
   * Dismiss the currently active feature tour.
   * @param {string} [tourId] Optionally verify which tour is being dismissed.
   */
  const dismissTour = useCallback(
    (tourId) => {
      if (!tourId || tourId === activeTourId) {
        setActiveTourId(null);
      }
    },
    [activeTourId]
  );

  const handleTourComplete = useCallback(() => {
    setActiveTourId(null);
  }, []);

  const handleTourSkip = useCallback(() => {
    setActiveTourId(null);
  }, []);

  const isOnboardingComplete = useMemo(
    () => progress.step === 'COMPLETE',
    [progress.step]
  );

  const taskChecklist = useMemo(
    () => ({
      tasks: ONBOARDING_TASKS,
      completedTasks: new Set(progress.completedSteps || []),
      completionPercent: progress.completionPercent,
    }),
    [progress.completedSteps, progress.completionPercent]
  );

  const contextValue = useMemo(
    () => ({
      showTour,
      dismissTour,
      isOnboardingComplete,
      taskChecklist,
      progress,
      tours,
      trackStep,
      resetOnboarding: resetOnboardingAPI,
      trackTour,
      activeTourId,
      loading,
    }),
    [
      showTour,
      dismissTour,
      isOnboardingComplete,
      taskChecklist,
      progress,
      tours,
      trackStep,
      resetOnboardingAPI,
      trackTour,
      activeTourId,
      loading,
    ]
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}

      {/* Onboarding Modal — auto-shows for new users */}
      <OnboardingModal
        open={showModal}
        onClose={handleModalClose}
        onComplete={handleModalComplete}
      />

      {/* Active Feature Tour */}
      {activeTourId && (
        <TourEngine
          tourId={activeTourId}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </OnboardingContext.Provider>
  );
});

OnboardingProvider.displayName = 'OnboardingProvider';

export default OnboardingProvider;
