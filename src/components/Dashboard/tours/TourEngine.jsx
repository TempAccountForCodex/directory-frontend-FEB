/**
 * TourEngine
 *
 * Orchestrates a feature tour: manages current step state, persists progress
 * to localStorage, and fires a fire-and-forget API call on each step change.
 * Renders TourHighlight + TourTooltip for the active step.
 *
 * Props:
 *   tourId     {string}    Tour identifier (must match a key in TOUR_DEFINITIONS)
 *   onComplete {function}  Called when the tour finishes (all steps done or Done pressed)
 *   onSkip     {function}  Called when the user explicitly skips the tour
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { TOUR_DEFINITIONS } from './tourConfig';
import TourHighlight from './TourHighlight';
import TourTooltip from './TourTooltip';

/**
 * Fire-and-forget API call to record tour progress on the server.
 * Errors are intentionally swallowed — the tour must not break if the API fails.
 */
async function fireTourTrack(tourId, currentStep, isCompleted) {
  try {
    await fetch(`/api/onboarding/tours/${encodeURIComponent(tourId)}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentStep, isCompleted }),
    });
  } catch {
    // Intentionally swallowed
  }
}

const TourEngine = memo(({ tourId, onComplete, onSkip }) => {
  const tourDef = TOUR_DEFINITIONS[tourId];

  const [persistedStep, setPersistedStep] = usePersistentState(`tour:${tourId}:v1`, 0, {
    scope: 'global',
  });

  const [currentStep, setCurrentStep] = useState(() =>
    typeof persistedStep === 'number' ? persistedStep : 0
  );

  // Check if target element exists; auto-close if it doesn't
  useEffect(() => {
    if (!tourDef) {
      onSkip?.();
      return;
    }
    const step = tourDef.steps[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      // Target not in DOM — skip this step or close tour
      if (currentStep < tourDef.steps.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        handleComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, currentStep]);

  const handleNext = useCallback(() => {
    if (!tourDef) return;
    const next = currentStep + 1;

    if (next >= tourDef.steps.length) {
      handleComplete();
      return;
    }

    setCurrentStep(next);
    setPersistedStep(next);
    fireTourTrack(tourId, next, false);
  }, [tourId, tourDef, currentStep, setPersistedStep]);

  const handleBack = useCallback(() => {
    const prev = Math.max(0, currentStep - 1);
    setCurrentStep(prev);
    setPersistedStep(prev);
    fireTourTrack(tourId, prev, false);
  }, [tourId, currentStep, setPersistedStep]);

  const handleSkip = useCallback(() => {
    fireTourTrack(tourId, currentStep, false);
    onSkip?.();
  }, [tourId, currentStep, onSkip]);

  const handleComplete = useCallback(() => {
    fireTourTrack(tourId, tourDef?.steps?.length ?? 0, true);
    setPersistedStep(0); // reset for next time
    onComplete?.();
  }, [tourId, tourDef, setPersistedStep, onComplete]);

  if (!tourDef) return null;

  const step = tourDef.steps[currentStep];
  if (!step) return null;

  return (
    <>
      <TourHighlight targetSelector={step.target} active />
      <TourTooltip
        targetSelector={step.target}
        title={step.title}
        description={step.description}
        stepIndex={currentStep}
        totalSteps={tourDef.steps.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
        placement={step.placement || 'bottom'}
      />
    </>
  );
});

TourEngine.displayName = 'TourEngine';

export default TourEngine;
