/**
 * TourHighlight
 *
 * Renders a full-screen dark overlay with a transparent "spotlight" cutout
 * around the targeted DOM element. Uses the CSS box-shadow technique —
 * no SVG clipping required.
 *
 * Props:
 *   targetSelector {string}  CSS selector for the element to highlight
 *   active         {boolean} Whether the highlight is visible
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box } from '@mui/material';

const PADDING = 8; // px padding around the spotlight cutout
const SPREAD = 9999; // large enough to cover any screen

/**
 * Returns the bounding rect of the first element matching the selector,
 * or null if the element is not in the DOM.
 */
function getElementRect(selector) {
  if (!selector) return null;
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect();
  } catch {
    return null;
  }
}

const TourHighlight = memo(({ targetSelector, active }) => {
  const [rect, setRect] = useState(null);

  const updateRect = useCallback(() => {
    const r = getElementRect(targetSelector);
    setRect(r);
  }, [targetSelector]);

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }

    updateRect();

    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [active, updateRect]);

  if (!active || !rect) return null;

  // Spotlight uses box-shadow spread to create an overlay that "cuts out" the target
  const spotlightStyle = {
    position: 'fixed',
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
    borderRadius: 6,
    boxShadow: `0 0 0 ${SPREAD}px rgba(0, 0, 0, 0.55)`,
    zIndex: 1299,
    pointerEvents: 'none',
  };

  return (
    <Box
      aria-hidden="true"
      sx={spotlightStyle}
    />
  );
});

TourHighlight.displayName = 'TourHighlight';

export default TourHighlight;
