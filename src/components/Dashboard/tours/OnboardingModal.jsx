/**
 * OnboardingModal
 *
 * A multi-step full-screen (mobile) / md-width (desktop) modal that walks
 * new users through the 5 onboarding milestones:
 *   1. Welcome
 *   2. Template Selection
 *   3. Customisation
 *   4. Content Editing
 *   5. Publish
 *
 * On completion it calls trackStep('COMPLETE') and persists the dismissed state
 * to localStorage so the modal never auto-shows again.
 *
 * Props:
 *   open       {boolean}   Controlled open state
 *   onClose    {function}  Called when the modal closes (skip or complete)
 *   onComplete {function}  Called after successful completion (before close)
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  LayoutTemplate,
  Paintbrush,
  FileEdit,
  Globe,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { DashboardGradientButton, DashboardCancelButton } from '../shared';

const STEPS = [
  {
    label: 'Welcome',
    title: 'Welcome to Techietribe!',
    description:
      'Build a professional online presence in minutes. Follow these quick steps to get your first website live.',
    icon: Rocket,
  },
  {
    label: 'Template',
    title: 'Choose a template',
    description:
      'Start from a professionally designed template. Pick one that matches your brand and industry.',
    icon: LayoutTemplate,
  },
  {
    label: 'Customise',
    title: 'Make it yours',
    description:
      'Adjust colors, fonts and layout to match your brand. Every element is fully customisable.',
    icon: Paintbrush,
  },
  {
    label: 'Content',
    title: 'Add your content',
    description:
      'Drop in your text, images and videos using our intuitive block editor. No coding required.',
    icon: FileEdit,
  },
  {
    label: 'Publish',
    title: 'Go live!',
    description:
      'Publish your website to your custom domain or a free Techietribe subdomain — ready in one click.',
    icon: Globe,
  },
];

const SlideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const OnboardingModal = memo(({ open, onClose, onComplete }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLast = activeStep === STEPS.length - 1;
  const progress = ((activeStep + 1) / STEPS.length) * 100;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete?.();
      onClose?.();
      return;
    }
    setDirection(1);
    setActiveStep((s) => s + 1);
  }, [isLast, onComplete, onClose]);

  const handleBack = useCallback(() => {
    if (activeStep === 0) return;
    setDirection(-1);
    setActiveStep((s) => s - 1);
  }, [activeStep]);

  const handleSkip = useCallback(() => {
    onComplete?.();
    onClose?.();
  }, [onComplete, onClose]);

  const step = STEPS[activeStep];
  const StepIcon = step.icon;

  const stepLabels = useMemo(() => STEPS.map((s) => s.label), []);

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth={!isMobile}
      aria-labelledby="onboarding-modal-title"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          overflow: 'hidden',
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
        },
      }}
    >
      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label={`Onboarding progress: step ${activeStep + 1} of ${STEPS.length}`}
        sx={{
          height: 4,
          background: colors.border,
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${
              colors.primaryLight || colors.primary
            } 100%)`,
          },
        }}
      />

      <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, overflowX: 'hidden' }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isMobile}
          sx={{ mb: 3, display: { xs: 'none', sm: 'flex' } }}
        >
          {stepLabels.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: colors.textSecondary,
                    fontSize: '0.75rem',
                  },
                  '& .Mui-active .MuiStepLabel-label': { color: colors.text },
                  '& .Mui-completed .MuiStepLabel-label': { color: colors.primary },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step counter (mobile) */}
        <Typography
          variant="caption"
          sx={{
            display: { xs: 'block', sm: 'none' },
            color: colors.textSecondary,
            mb: 2,
          }}
        >
          Step {activeStep + 1} of {STEPS.length}
        </Typography>

        {/* Animated step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeStep}
            custom={direction}
            variants={SlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {/* Illustration area */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: { xs: 3, sm: 5 },
                mb: 3,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.primary}18 0%, ${
                  colors.primaryLight || colors.primary
                }10 100%)`,
                border: `1px solid ${colors.border}`,
              }}
              aria-hidden="true"
            >
              <StepIcon size={64} color={colors.primary} strokeWidth={1.5} />
            </Box>

            {/* Title and description */}
            <Typography
              id="onboarding-modal-title"
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.text,
                textAlign: 'center',
                mb: 1.5,
              }}
            >
              {step.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 1.65,
                maxWidth: 480,
                mx: 'auto',
                mb: 4,
              }}
            >
              {step.description}
            </Typography>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <DashboardCancelButton
            onClick={handleSkip}
            aria-label="Skip onboarding"
            sx={{ minHeight: 44 }}
          >
            Skip
          </DashboardCancelButton>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep > 0 && (
              <DashboardCancelButton
                onClick={handleBack}
                aria-label="Go back"
                sx={{ minHeight: 44 }}
              >
                Back
              </DashboardCancelButton>
            )}
            <DashboardGradientButton
              onClick={handleNext}
              aria-label={isLast ? 'Complete onboarding' : 'Next step'}
              sx={{ minHeight: 44 }}
            >
              {isLast ? "Let's go!" : 'Next'}
            </DashboardGradientButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});

OnboardingModal.displayName = 'OnboardingModal';

export default OnboardingModal;
