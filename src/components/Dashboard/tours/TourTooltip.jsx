/**
 * TourTooltip
 *
 * Positioned tooltip that attaches to a target DOM element and guides the user
 * through a feature tour. Includes prev/next navigation, a skip button, and a
 * step counter.
 *
 * Props:
 *   targetSelector {string}   CSS selector for the anchor element
 *   title          {string}   Step title
 *   description    {string}   Step description
 *   stepIndex      {number}   0-based current step index
 *   totalSteps     {number}   Total number of steps in the tour
 *   onNext         {function} Called when Next is clicked
 *   onBack         {function} Called when Back is clicked
 *   onSkip         {function} Called when Skip is clicked
 *   placement      {string}   Preferred placement: 'top'|'right'|'bottom'|'left'
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { DashboardActionButton, DashboardCancelButton } from '../shared';

const TOOLTIP_WIDTH = 320;
const TOOLTIP_OFFSET = 12; // px gap between element and tooltip

/**
 * Compute the tooltip position given a target rect and preferred placement.
 * Falls back to alternate placements if the tooltip would go off-screen.
 */
function computePosition(rect, placement) {
  if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const vpW = window.innerWidth;
  const vpH = window.innerHeight;

  const positions = {
    right: {
      top: rect.top + rect.height / 2,
      left: rect.right + TOOLTIP_OFFSET,
      transform: 'translateY(-50%)',
    },
    left: {
      top: rect.top + rect.height / 2,
      left: rect.left - TOOLTIP_WIDTH - TOOLTIP_OFFSET,
      transform: 'translateY(-50%)',
    },
    bottom: {
      top: rect.bottom + TOOLTIP_OFFSET,
      left: rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
      transform: 'none',
    },
    top: {
      top: rect.top - TOOLTIP_OFFSET,
      left: rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
      transform: 'translateY(-100%)',
    },
  };

  const preferred = positions[placement] || positions.bottom;

  // Clamp to viewport with 16px margin
  const top = Math.max(16, Math.min(preferred.top, vpH - 200));
  const left = Math.max(16, Math.min(preferred.left, vpW - TOOLTIP_WIDTH - 16));

  return { top, left, transform: preferred.transform };
}

const TourTooltip = memo(
  ({
    targetSelector,
    title,
    description,
    stepIndex,
    totalSteps,
    onNext,
    onBack,
    onSkip,
    placement = 'bottom',
  }) => {
    const { actualTheme } = useTheme();
    const colors = getDashboardColors(actualTheme);
    const [pos, setPos] = useState(null);

    const updatePosition = useCallback(() => {
      if (!targetSelector) {
        setPos(null);
        return;
      }
      try {
        const el = document.querySelector(targetSelector);
        if (!el) {
          setPos(null);
          return;
        }
        const rect = el.getBoundingClientRect();
        setPos(computePosition(rect, placement));
      } catch {
        setPos(null);
      }
    }, [targetSelector, placement]);

    useEffect(() => {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [updatePosition]);

    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;

    const style = pos
      ? {
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          transform: pos.transform,
          zIndex: 1300,
          width: TOOLTIP_WIDTH,
        }
      : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1300,
          width: TOOLTIP_WIDTH,
        };

    return (
      <AnimatePresence>
        <motion.div
          key={`tour-tooltip-${stepIndex}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.18 }}
          style={style}
          role="dialog"
          aria-modal="true"
          aria-label={`Tour step ${stepIndex + 1} of ${totalSteps}: ${title}`}
        >
          <Box
            sx={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              p: 2.5,
              minHeight: 44,
            }}
          >
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, fontWeight: 600, letterSpacing: 0.5 }}
              >
                Step {stepIndex + 1} of {totalSteps}
              </Typography>
              <IconButton
                size="small"
                onClick={onSkip}
                aria-label="Skip tour"
                sx={{ color: colors.textSecondary, minWidth: 44, minHeight: 44 }}
              >
                <X size={16} />
              </IconButton>
            </Box>

            {/* Title */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: colors.text, mb: 0.75 }}
            >
              {title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, lineHeight: 1.55, mb: 2 }}
            >
              {description}
            </Typography>

            {/* Navigation */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              {!isFirst && (
                <DashboardCancelButton
                  onClick={onBack}
                  aria-label="Previous step"
                  startIcon={<ChevronLeft size={16} />}
                  sx={{ minHeight: 44 }}
                >
                  Back
                </DashboardCancelButton>
              )}
              <DashboardActionButton
                onClick={onNext}
                aria-label={isLast ? 'Complete tour' : 'Next step'}
                endIcon={!isLast ? <ChevronRight size={16} /> : undefined}
                sx={{ minHeight: 44 }}
              >
                {isLast ? 'Done' : 'Next'}
              </DashboardActionButton>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    );
  }
);

TourTooltip.displayName = 'TourTooltip';

export default TourTooltip;
