/**
 * PlanComparisonModal (Step 10.1a)
 *
 * Modal dialog showing the plan feature comparison matrix with upgrade CTAs.
 * Displays 4 plan columns and rows for key features.
 */

import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Box,
  Typography,
  Button,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { DashboardGradientButton } from '.';

// ============================================================================
// Plan definitions for the comparison table
// ============================================================================

const PLANS = [
  { code: 'website_free', name: 'Free', price: '$0/mo' },
  { code: 'website_core', name: 'Core', price: '$19/mo' },
  { code: 'website_growth', name: 'Growth', price: '$49/mo' },
  { code: 'website_agency', name: 'Agency', price: '$149/mo' },
];

// ============================================================================
// Feature rows for comparison
// ============================================================================

const FEATURE_ROWS = [
  {
    key: 'websites',
    label: 'Websites',
    values: { website_free: '1', website_core: '1', website_growth: '3', website_agency: '10' },
  },
  {
    key: 'pages',
    label: 'Pages / site',
    values: { website_free: '1', website_core: '5', website_growth: '10', website_agency: '15' },
  },
  {
    key: 'blocks',
    label: 'Blocks / page',
    values: { website_free: '10', website_core: '20', website_growth: '25', website_agency: '30' },
  },
  {
    key: 'videoBlocks',
    label: 'Video Blocks',
    values: {
      website_free: false,
      website_core: true,
      website_growth: true,
      website_agency: true,
    },
  },
  {
    key: 'customCSS',
    label: 'Custom CSS',
    values: {
      website_free: false,
      website_core: true,
      website_growth: true,
      website_agency: true,
    },
  },
  {
    key: 'customDomain',
    label: 'Custom Domain',
    values: {
      website_free: false,
      website_core: false,
      website_growth: true,
      website_agency: true,
    },
  },
  {
    key: 'aiGeneration',
    label: 'AI Generations/mo',
    values: {
      website_free: '0',
      website_core: '3',
      website_growth: '10',
      website_agency: 'Unlimited',
    },
  },
  {
    key: 'collaborators',
    label: 'Collaborators',
    values: { website_free: '0', website_core: '2', website_growth: '5', website_agency: '15' },
  },
  {
    key: 'delegates',
    label: 'Delegates',
    values: { website_free: '0', website_core: '1', website_growth: '3', website_agency: '10' },
  },
  {
    key: 'seoLevel',
    label: 'SEO Level',
    values: {
      website_free: 'Basic',
      website_core: 'Standard',
      website_growth: 'Advanced',
      website_agency: 'Advanced',
    },
  },
  {
    key: 'branding',
    label: 'Branding',
    values: {
      website_free: 'Powered by badge',
      website_core: 'No badge',
      website_growth: 'No badge',
      website_agency: 'No badge',
    },
  },
];

// ============================================================================
// Component
// ============================================================================

/**
 * PlanComparisonModal
 *
 * @param {object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {() => void} props.onClose - Callback to close the modal
 * @param {string} props.currentPlanCode - The user's current plan code
 * @param {string} [props.highlightFeature] - Optional feature key to highlight
 */
const PlanComparisonModal = memo(function PlanComparisonModal({
  open,
  onClose,
  currentPlanCode,
  highlightFeature,
  activeDeal,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    const promoParam = activeDeal?.promoCode ? `&promo=${activeDeal.promoCode}` : '';
    navigate(`/dashboard/settings?tab=billing${promoParam}`);
    onClose();
  };

  const showDealCallout = activeDeal?.bannerConfig?.showOnFeatureGate === true;

  const renderCellValue = (value, planCode) => {
    if (value === true) {
      return (
        <Check
          size={18}
          color={theme.palette.success.main}
          aria-label="included"
        />
      );
    }
    if (value === false) {
      return (
        <Lock
          size={18}
          color={theme.palette.text.disabled}
          aria-label="not included"
        />
      );
    }
    return (
      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
        {value}
      </Typography>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="plan-comparison-title"
    >
      <DialogTitle id="plan-comparison-title">
        <Typography variant="h6" component="span" fontWeight={700}>
          Compare Plans
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowX: 'auto' }}>
        <Table stickyHeader aria-label="plan comparison table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  minWidth: 140,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                Feature
              </TableCell>
              {PLANS.map((plan) => {
                const isCurrent = plan.code === currentPlanCode;
                return (
                  <TableCell
                    key={plan.code}
                    align="center"
                    data-testid={`plan-column-${plan.code}`}
                    sx={{
                      fontWeight: 700,
                      minWidth: 120,
                      backgroundColor: isCurrent
                        ? alpha(theme.palette.primary.main, 0.08)
                        : theme.palette.background.paper,
                      borderBottom: isCurrent
                        ? `2px solid ${theme.palette.primary.main}`
                        : undefined,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plan.price}
                      </Typography>
                      {isCurrent && (
                        <Chip
                          label="Current Plan"
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {FEATURE_ROWS.map((row) => {
              const isHighlighted = row.key === highlightFeature;
              return (
                <TableRow
                  key={row.key}
                  data-testid={`feature-row-${row.key}`}
                  sx={{
                    backgroundColor: isHighlighted
                      ? alpha(theme.palette.warning.light, 0.15)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isHighlighted
                        ? alpha(theme.palette.warning.light, 0.22)
                        : alpha(theme.palette.action.hover, 0.04),
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                    {row.label}
                  </TableCell>
                  {PLANS.map((plan) => {
                    const isCurrent = plan.code === currentPlanCode;
                    return (
                      <TableCell
                        key={plan.code}
                        align="center"
                        sx={{
                          backgroundColor: isCurrent
                            ? alpha(theme.palette.primary.main, 0.04)
                            : 'transparent',
                        }}
                      >
                        {renderCellValue(row.values[plan.code], plan.code)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}

            {/* Upgrade CTA row */}
            <TableRow>
              <TableCell />
              {PLANS.map((plan) => {
                const isCurrent = plan.code === currentPlanCode;
                return (
                  <TableCell
                    key={plan.code}
                    align="center"
                    sx={{
                      py: 2,
                      backgroundColor: isCurrent
                        ? alpha(theme.palette.primary.main, 0.04)
                        : 'transparent',
                    }}
                  >
                    {!isCurrent && (
                      <DashboardGradientButton
                        size="small"
                        onClick={handleUpgrade}
                        data-testid={`upgrade-btn-${plan.code}`}
                        sx={{ fontSize: '0.75rem', px: 2, py: 0.75 }}
                      >
                        Upgrade
                      </DashboardGradientButton>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>

      {showDealCallout && (
        <Box
          sx={{
            mx: 3,
            mt: 1,
            p: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, ${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)})`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
          data-testid="deal-callout"
        >
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
            Limited time: upgrade now and save{' '}
            {activeDeal.discountType === 'PERCENTAGE'
              ? `${activeDeal.discountValue}%`
              : activeDeal.discountType === 'FREE_MONTH'
                ? '1 month free'
                : `$${activeDeal.discountValue}`}
            {activeDeal.endAt && ` — offer ends ${new Date(activeDeal.endAt).toLocaleDateString()}`}
          </Typography>
          <DashboardGradientButton
            size="small"
            onClick={handleUpgrade}
            data-testid="deal-upgrade-btn"
            sx={{ fontSize: '0.75rem', px: 2, py: 0.5 }}
          >
            Claim Deal
          </DashboardGradientButton>
        </Box>
      )}

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default PlanComparisonModal;
