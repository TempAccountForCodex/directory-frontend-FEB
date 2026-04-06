import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Globe,
  LayoutDashboard,
  MapPin,
  Store,
  X,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme } from '../../context/ThemeContext';
import { usePersistentState } from '../../hooks/usePersistentState';
import { DashboardActionButton } from './shared';

const WelcomeTour = () => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Persistent tour completion state with versioning
  const [tourCompleted, setTourCompleted] = usePersistentState('tour:welcome:v1', false, {
    scope: 'global',
  });

  // Tour steps updated for our product (Websites, Directory, Stores)
  const tourSteps = [
    {
      title: 'Welcome to Techietribe!',
      description:
        'Build your digital presence with ease. Create websites, get discovered in our directory, and grow your business.',
      icon: <LayoutDashboard size={64} color={colors.primary} />,
      features: [
        'Create professional websites with our builder',
        'Get discovered in the business directory',
        'Open an online store (coming soon)',
        'Track analytics and performance',
      ],
    },
    {
      title: 'Website Builder',
      description: 'Create beautiful, professional websites for your business.',
      icon: <Globe size={48} color={colors.primary} />,
      features: [
        'Drag-and-drop page builder with 5 block types',
        'Publish instantly with public URLs',
        'Upload logos and customize branding',
        'Track page views and CTA clicks',
      ],
    },
    {
      title: 'Business Directory',
      description: 'Get discovered by customers searching for services.',
      icon: <MapPin size={48} color={colors.primary} />,
      features: [
        'Location-based search with map view',
        'Filter by category, price, and tags',
        'Plan-based ranking (higher plans = better visibility)',
        'SEO-optimized directory pages',
      ],
    },
    {
      title: 'Online Stores (Coming Soon)',
      description: 'Sell products online with integrated payments.',
      icon: <Store size={48} color={colors.primary} />,
      features: [
        'Product catalog management',
        'Secure payment processing',
        'Inventory tracking',
        'Order management dashboard',
      ],
    },
  ];

  const currentStep = tourSteps[activeStep];
  const isLastStep = activeStep === tourSteps.length - 1;

  // Check if tour should be shown from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tourParam = searchParams.get('tour');

    if (tourParam === 'welcome') {
      if (!tourCompleted) {
        setOpen(true);
      } else {
        // Tour already completed, remove param from URL
        searchParams.delete('tour');
        navigate({ search: searchParams.toString() }, { replace: true });
      }
    }
  }, [location.search, navigate, tourCompleted]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    setOpen(false);
    markAsCompleted();
    removeUrlParam();
  };

  const handleComplete = () => {
    setOpen(false);
    markAsCompleted();
    removeUrlParam();
  };

  const markAsCompleted = () => {
    setTourCompleted(true);
  };

  const removeUrlParam = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('tour');
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  /**
   * Restart the welcome tour programmatically.
   * Resets the completed state and re-opens the dialog.
   * Called from outside via `restartWelcomeTour()` utility or the
   * OnboardingProvider's reset flow.
   */
  const handleRestartTour = useCallback(() => {
    setTourCompleted(false);
    setActiveStep(0);
    setOpen(true);
  }, [setTourCompleted]);

  const progress = ((activeStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
        },
      }}
    >
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          background: colors.border,
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          },
        }}
      />

      {/* Close Button */}
      <IconButton
        onClick={handleSkip}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: colors.textSecondary,
          zIndex: 1,
          '&:hover': {
            color: colors.text,
            background: alpha(colors.border, 0.5),
          },
        }}
      >
        <X size={18} />
      </IconButton>

      <DialogContent sx={{ p: 4, pt: 5 }}>
        {/* Step Indicator */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {tourSteps.map((step, index) => (
              <Step key={step.title}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: colors.textSecondary,
                      fontSize: '0.75rem',
                      display: { xs: 'none', sm: 'block' },
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: colors.primary,
                      fontWeight: 600,
                    },
                    '& .MuiStepIcon-root': {
                      color: colors.border,
                    },
                    '& .MuiStepIcon-root.Mui-active': {
                      color: colors.primary,
                    },
                    '& .MuiStepIcon-root.Mui-completed': {
                      color: colors.success,
                    },
                  }}
                >
                  {index + 1}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <Box
          sx={{
            textAlign: 'center',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Icon */}
          <Box sx={{ mb: 3 }}>{currentStep.icon}</Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              color: colors.text,
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {currentStep.title}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              color: colors.textSecondary,
              mb: 4,
              fontSize: '1rem',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            {currentStep.description}
          </Typography>

          {/* Features List */}
          <Box
            sx={{
              maxWidth: 500,
              mx: 'auto',
              textAlign: 'left',
            }}
          >
            {currentStep.features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                  p: 2,
                  borderRadius: '12px',
                  background: alpha(colors.primary, 0.05),
                  border: `1px solid ${alpha(colors.border, 0.5)}`,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: colors.primary,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    color: colors.text,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {/* Left: Back Button */}
          <DashboardActionButton
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowLeft size={18} />}
            sx={{
              '&.Mui-disabled': {
                opacity: 0,
              },
            }}
          >
            Back
          </DashboardActionButton>

          {/* Center: Skip Tour */}
          <Button
            onClick={handleSkip}
            sx={{
              color: colors.textSecondary,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                background: 'transparent',
                color: colors.text,
                textDecoration: 'underline',
              },
            }}
          >
            Skip Tour
          </Button>

          {/* Right: Next/Complete Button */}
          <DashboardActionButton
            onClick={handleNext}
            endIcon={isLastStep ? <CircleCheck size={18} /> : <ArrowRight size={18} />}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '10px',
            }}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </DashboardActionButton>
        </Box>

        {/* Step Counter */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography
            sx={{
              color: colors.textTertiary,
              fontSize: '0.75rem',
            }}
          >
            Step {activeStep + 1} of {tourSteps.length}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTour;

/**
 * restartWelcomeTour
 *
 * Utility function that clears the localStorage persistence key used by
 * WelcomeTour so the tour will re-open on the next render cycle.
 *
 * Usage:
 *   import { restartWelcomeTour } from './WelcomeTour';
 *   restartWelcomeTour(); // call before navigating to ?tour=welcome
 */
export function restartWelcomeTour() {
  try {
    // The key mirrors usePersistentState('tour:welcome:v1') with the 'ttdir' namespace prefix
    localStorage.removeItem('ttdir:tour:welcome:v1');
  } catch {
    // localStorage may not be available in SSR or restricted environments
  }
}
