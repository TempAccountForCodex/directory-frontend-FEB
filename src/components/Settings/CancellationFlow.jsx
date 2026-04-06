/**
 * CancellationFlow
 *
 * 3-step inline cancellation journey for the Settings billing section.
 *
 * Step 1 — Reason Selection (all fields optional — NO dark patterns)
 * Step 2 — Impact Preview (features lost vs features kept)
 * Step 3 — Confirmation (clear cancel date, neutral escape hatch)
 *
 * Design principles:
 * - Reason/feedback are NEVER required
 * - No upsells, no guilt-trips, no urgency indicators
 * - Success message is positive: "You will keep access until [date]"
 * - 'Keep My Plan' is a neutral escape hatch
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Typography,
  Alert,
  MenuItem,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardSelect,
  DashboardInput,
  DashboardActionButton,
  DashboardCancelButton,
  DashboardConfirmButton,
  DashboardCard,
} from '../Dashboard/shared';
import { DISPLAY_PLANS } from '../../hooks/useBilling';

// Plan features visible to users — used for impact preview
const PLAN_FEATURES = {
  website_free: {
    maxSites: 1,
    pagesPerSite: 1,
    customDomain: false,
    analyticsLevel: 'Basic',
    directoryListing: false,
    poweredByBadge: true,
  },
  website_core: {
    maxSites: 1,
    pagesPerSite: 5,
    customDomain: false,
    analyticsLevel: 'Standard',
    directoryListing: true,
    poweredByBadge: false,
  },
  website_growth: {
    maxSites: 3,
    pagesPerSite: 10,
    customDomain: true,
    analyticsLevel: 'Advanced',
    directoryListing: true,
    poweredByBadge: false,
  },
  website_agency: {
    maxSites: 10,
    pagesPerSite: 15,
    customDomain: true,
    analyticsLevel: 'Agency',
    directoryListing: true,
    poweredByBadge: false,
  },
};

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'switching_competitor', label: 'Switching to competitor' },
  { value: 'project_completed', label: 'Project completed' },
  { value: 'other', label: 'Other' },
];

/**
 * Format a date string for display (e.g., "March 31, 2026")
 */
function formatDate(dateStr) {
  if (!dateStr) return 'end of billing period';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format cents as a dollar string (e.g., 1999 => "$19.99")
 */
function formatCredit(cents) {
  if (!cents || cents <= 0) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Step 1 — Reason Selection
// ---------------------------------------------------------------------------
const StepReasonSelection = memo(function StepReasonSelection({
  reason,
  feedback,
  onReasonChange,
  onFeedbackChange,
  onContinue,
  colors,
}) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ color: colors.textSecondary, mb: 2, lineHeight: 1.6 }}
      >
        Help us improve — tell us why you are leaving (optional).
      </Typography>

      <Stack spacing={2}>
        <DashboardSelect
          label="Reason for cancelling (optional)"
          value={reason}
          onChange={onReasonChange}
          displayEmpty
        >
          <MenuItem value="">
            <em>Select a reason (optional)</em>
          </MenuItem>
          {CANCELLATION_REASONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>

        <DashboardInput
          label="Additional feedback (optional)"
          value={feedback}
          onChange={onFeedbackChange}
          multiline
          rows={3}
          placeholder="Anything else you would like to share..."
          inputProps={{ maxLength: 500 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DashboardActionButton onClick={onContinue}>
            Continue
          </DashboardActionButton>
        </Box>
      </Stack>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Step 2 — Impact Preview
// ---------------------------------------------------------------------------
const StepImpactPreview = memo(function StepImpactPreview({
  currentPlan,
  currentPeriodEnd,
  accountCreditCents,
  onContinue,
  onBack,
  colors,
}) {
  const currentFeatures = useMemo(
    () => PLAN_FEATURES[currentPlan] || PLAN_FEATURES.website_free,
    [currentPlan]
  );
  const freeFeatures = PLAN_FEATURES.website_free;

  const lostFeatures = useMemo(() => {
    const lost = [];
    if (currentFeatures.maxSites > freeFeatures.maxSites) {
      lost.push(`Multiple websites (${currentFeatures.maxSites} → 1)`);
    }
    if (currentFeatures.pagesPerSite > freeFeatures.pagesPerSite) {
      lost.push(`Up to ${currentFeatures.pagesPerSite} pages per site (free plan: 1 page)`);
    }
    if (currentFeatures.customDomain && !freeFeatures.customDomain) {
      lost.push('Custom domain connection');
    }
    if (currentFeatures.directoryListing && !freeFeatures.directoryListing) {
      lost.push('Directory listing visibility');
    }
    if (!currentFeatures.poweredByBadge && freeFeatures.poweredByBadge) {
      lost.push('"Powered by Techietribe" badge will be re-added');
    }
    if (currentFeatures.analyticsLevel !== freeFeatures.analyticsLevel) {
      lost.push(`${currentFeatures.analyticsLevel} analytics (free plan: basic counters only)`);
    }
    return lost;
  }, [currentFeatures, freeFeatures]);

  const keptFeatures = useMemo(
    () => [
      'All your websites and content are preserved',
      'Pages become read-only (not deleted)',
      'Free plan features remain available',
      'All blog posts and forms are preserved',
    ],
    []
  );

  const endDateStr = useMemo(() => formatDate(currentPeriodEnd), [currentPeriodEnd]);
  const creditStr = useMemo(() => formatCredit(accountCreditCents), [accountCreditCents]);

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ color: colors.textSecondary, mb: 2, lineHeight: 1.6 }}
      >
        After <strong>{endDateStr}</strong>, your account will move to the free plan.
      </Typography>

      <Stack spacing={2}>
        {lostFeatures.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: colors.error || '#dc2626',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                mb: 1,
              }}
            >
              You will lose access to:
            </Typography>
            <Stack spacing={0.5}>
              {lostFeatures.map((feat) => (
                <Box key={feat} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <XCircle size={14} color={colors.error || '#dc2626'} style={{ marginTop: 3, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.5 }}>
                    {feat}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography
            variant="caption"
            sx={{
              color: colors.success || '#16a34a',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1,
            }}
          >
            You will keep:
          </Typography>
          <Stack spacing={0.5}>
            {keptFeatures.map((feat) => (
              <Box key={feat} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle size={14} color={colors.success || '#16a34a'} style={{ marginTop: 3, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.5 }}>
                  {feat}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {creditStr && (
          <Alert
            severity="info"
            icon={<AlertCircle size={16} />}
            sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.85rem' } }}
          >
            You have <strong>{creditStr}</strong> in account credit. This credit will remain on
            your account and apply to future upgrades.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <DashboardCancelButton onClick={onBack} size="small">
            Back
          </DashboardCancelButton>
          <DashboardActionButton onClick={onContinue}>
            Continue to Confirm
          </DashboardActionButton>
        </Box>
      </Stack>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Step 3 — Confirmation
// ---------------------------------------------------------------------------
const StepConfirmation = memo(function StepConfirmation({
  currentPlan,
  currentPeriodEnd,
  onConfirm,
  onBack,
  onClose,
  loading,
  colors,
}) {
  const planDisplay = useMemo(() => {
    const plan = DISPLAY_PLANS.find((p) => p.code === currentPlan);
    return plan?.displayName || currentPlan;
  }, [currentPlan]);

  const endDateStr = useMemo(() => formatDate(currentPeriodEnd), [currentPeriodEnd]);

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ color: colors.text, mb: 1, lineHeight: 1.6 }}
      >
        You will keep access to all{' '}
        <Chip
          label={planDisplay}
          size="small"
          sx={{
            bgcolor: alpha(colors.primary || '#6366f1', 0.1),
            color: colors.primary || '#6366f1',
            fontWeight: 600,
            height: 20,
            fontSize: '0.75rem',
          }}
        />{' '}
        features until <strong>{endDateStr}</strong>.
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: colors.textSecondary, mb: 3, lineHeight: 1.6, fontSize: '0.82rem' }}
      >
        After that date, your account will move to the free plan. Your websites and content will
        be preserved and accessible.
      </Typography>

      <Stack spacing={1.5}>
        <DashboardConfirmButton
          onClick={onConfirm}
          disabled={loading}
          fullWidth
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Processing...
            </Box>
          ) : (
            'Cancel Subscription'
          )}
        </DashboardConfirmButton>

        <DashboardCancelButton
          onClick={onClose}
          disabled={loading}
          fullWidth
        >
          Keep My Plan
        </DashboardCancelButton>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <DashboardCancelButton onClick={onBack} size="small" disabled={loading}>
            Back
          </DashboardCancelButton>
        </Box>
      </Stack>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Main CancellationFlow
// ---------------------------------------------------------------------------

/**
 * CancellationFlow — 3-step inline cancellation journey.
 *
 * @param {object} props
 * @param {string} props.currentPlan - Current plan code (e.g., 'website_core')
 * @param {string|null} props.currentPeriodEnd - ISO date string of period end
 * @param {Function} props.onCancel - Async function({ reason, feedback }) => boolean
 * @param {Function} props.onClose - Function to close/hide the flow
 * @param {number|null} props.accountCreditCents - Account credit balance in cents
 */
const CancellationFlow = memo(function CancellationFlow({
  currentPlan,
  currentPeriodEnd,
  onCancel,
  onClose,
  accountCreditCents = null,
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleReasonChange = useCallback((e) => {
    setReason(e.target.value);
  }, []);

  const handleFeedbackChange = useCallback((e) => {
    setFeedback(e.target.value);
  }, []);

  const handleStep1Continue = useCallback(() => {
    setStep(2);
  }, []);

  const handleStep2Continue = useCallback(() => {
    setStep(3);
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const options = {};
      if (reason) options.reason = reason;
      if (feedback.trim()) options.feedback = feedback.trim();

      const success = await onCancel(options);

      if (success) {
        setSuccess(true);
        // Close the flow after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError('Cancellation could not be completed. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, reason, feedback, onCancel, onClose]);

  const stepLabel = useMemo(() => `Step ${step} of 3`, [step]);

  if (success) {
    const endDateStr = formatDate(currentPeriodEnd);
    return (
      <Alert
        severity="success"
        icon={<CheckCircle size={20} />}
        sx={{ borderRadius: 2 }}
      >
        <Typography variant="body2" fontWeight={600}>
          Cancellation scheduled
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          You will keep access to all features until <strong>{endDateStr}</strong>. Your content
          is preserved.
        </Typography>
      </Alert>
    );
  }

  return (
    <DashboardCard
      title="Cancel Subscription"
      subtitle={stepLabel}
      sx={{ mt: 2 }}
    >
      {/* Step progress dots */}
      <Box sx={{ display: 'flex', gap: 0.75, mb: 3 }}>
        {[1, 2, 3].map((s) => (
          <Box
            key={s}
            sx={{
              width: s === step ? 20 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor:
                s < step
                  ? colors.success || '#16a34a'
                  : s === step
                  ? colors.primary || '#6366f1'
                  : alpha(colors.textSecondary || '#9ca3af', 0.3),
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {step === 1 && (
        <StepReasonSelection
          reason={reason}
          feedback={feedback}
          onReasonChange={handleReasonChange}
          onFeedbackChange={handleFeedbackChange}
          onContinue={handleStep1Continue}
          colors={colors}
        />
      )}

      {step === 2 && (
        <StepImpactPreview
          currentPlan={currentPlan}
          currentPeriodEnd={currentPeriodEnd}
          accountCreditCents={accountCreditCents}
          onContinue={handleStep2Continue}
          onBack={handleBack}
          colors={colors}
        />
      )}

      {step === 3 && (
        <StepConfirmation
          currentPlan={currentPlan}
          currentPeriodEnd={currentPeriodEnd}
          onConfirm={handleConfirm}
          onBack={handleBack}
          onClose={onClose}
          loading={loading}
          colors={colors}
        />
      )}
    </DashboardCard>
  );
});

export default CancellationFlow;
