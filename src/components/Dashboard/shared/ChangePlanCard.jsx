import { useState, useCallback, useMemo } from 'react';
import {
  Alert,
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Link,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CreditCard, Pencil, X } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { useBilling, DISPLAY_PLANS } from '../../../hooks/useBilling';
import DashboardCard from './DashboardCard';
import DashboardInput from './DashboardInput';
import DashboardActionButton from './DashboardActionButton';
import DashboardCancelButton from './DashboardCancelButton';
import DashboardConfirmButton from './DashboardConfirmButton';
import CardManagementDialog from './CardManagementDialog';
import BillingPreview from '../../Settings/BillingPreview';
import SubscriptionBanners from '../../Settings/SubscriptionBanners';

/**
 * Layered diamond icon component
 * tierLevel determines how many stacked layers to show (1, 2, or 3)
 */
const PlanIcon = ({ tierLevel = 1 }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const baseGreen = colors.primary;

  // Build layers from bottom to top (reverse order for visual stacking)
  const layerElements = [];
  for (let i = tierLevel - 1; i >= 0; i--) {
    const opacityValue = 1 - i * 0.3;
    layerElements.push(
      <Box
        key={i}
        sx={{
          width: 22,
          height: 22,
          background: `linear-gradient(135deg, ${baseGreen} 0%, ${alpha(baseGreen, 0.65)} 100%)`,
          opacity: opacityValue,
          borderRadius: '5px',
          transform: 'rotate(45deg)',
          boxShadow: `0 2px 8px ${alpha(baseGreen, 0.5)}`,
          marginTop: i < tierLevel - 1 ? '-12px' : 0,
          position: 'relative',
          zIndex: tierLevel - i,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 50,
        justifyContent: 'flex-end',
        pb: 0.5,
      }}
    >
      {layerElements}
    </Box>
  );
};

/**
 * Individual plan selection card
 */
const PlanOptionCard = ({ plan, isSelected, onSelect }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  return (
    <Box
      onClick={() => onSelect(plan.code)}
      sx={{
        position: 'relative',
        p: 3,
        borderRadius: '16px',
        border: isSelected
          ? `2px solid ${colors.primary}`
          : `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        background: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          border: isSelected
            ? `2px solid ${colors.primary}`
            : `1px solid ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2)}`,
          background: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
        },
      }}
    >
      {/* Current badge */}
      {isSelected && (
        <Chip
          label="Current"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: alpha(colors.primary, 0.15),
            color: colors.primary,
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
            border: `1px solid ${alpha(colors.primary, 0.3)}`,
          }}
        />
      )}

      {/* Plan icon */}
      <Box sx={{ mb: 2 }}>
        <PlanIcon tierLevel={plan.tierLevel} />
      </Box>

      {/* Plan name */}
      <Typography
        sx={{
          color: alpha(colors.text, 0.7),
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          mb: 1,
        }}
      >
        {plan.displayName}
      </Typography>

      {/* Price */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography
          sx={{
            color: colors.text,
            fontSize: '1.75rem',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ${plan.priceMonthly.toFixed(2)}
        </Typography>
        <Typography
          sx={{
            color: alpha(colors.text, 0.5),
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          /mo
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Billing details row component - matches reference image styling
 */
const BillingRow = ({ label, value, isLast = false }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 3,
        borderBottom: isLast ? 'none' : `1px solid ${isDark ? alpha('#fff', 0.3) : alpha('#000', 0.1)}`,
        bgcolor: isDark ? alpha('#fff', 0) : alpha('#000', 0.01),
      }}
    >
      <Typography
        sx={{
          color: alpha(colors.text, 0.5),
          fontSize: '0.95rem',
          fontWeight: 500,
          width: 140,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{
          color: colors.text,
          fontSize: '0.95rem',
        }}
      >
        {value || '-'}
      </Typography>
    </Box>
  );
};

/**
 * ChangePlanCard - Main component for plan selection and billing management
 */
const ChangePlanCard = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const {
    billingDetails,
    paymentMethods,
    loading,
    paymentMethodsLoading,
    error: billingError,
    subscriptionStatus,
    cancelledAt,
    currentPeriodEnd,
    updateBillingDetails,
    updatePlan,
    getPlanPreview,
    reactivateSubscription,
    createSetupIntent,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    cancelSubscription,
  } = useBilling();

  // Dialog states
  const [editBillingOpen, setEditBillingOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form states
  const [billingForm, setBillingForm] = useState({
    name: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
  });

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Get current plan code
  const currentPlanCode = billingDetails?.currentPlan || 'website_free';

  // Get default payment method
  const defaultPaymentMethod = useMemo(() => {
    return paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0] || null;
  }, [paymentMethods]);

  // Handle plan selection
  const handleSelectPlan = useCallback((planCode) => {
    setSelectedPlan(planCode);
  }, []);

  // Handle upgrade click — show BillingPreview for paid plan upgrades
  const handleUpgrade = useCallback(async () => {
    if (!selectedPlan || selectedPlan === currentPlanCode) return;

    // For paid plan upgrades, show the preview dialog first
    if (selectedPlan !== 'website_free') {
      setPreviewOpen(true);
      return;
    }

    // Free plan (shouldn't normally reach here due to useCancel guard, but handle gracefully)
    setActionLoading(true);
    const result = await updatePlan(selectedPlan);
    setActionLoading(false);

    if (result.success) {
      setSelectedPlan(null);
    } else if (result.requiresPaymentMethod) {
      setCardDialogOpen(true);
    }
  }, [selectedPlan, currentPlanCode, updatePlan]);

  // Handle confirmed upgrade from BillingPreview dialog
  const handleConfirmUpgrade = useCallback(async () => {
    if (!selectedPlan) return;

    const result = await updatePlan(selectedPlan);

    if (result.success) {
      setSelectedPlan(null);
      setPreviewOpen(false);
    } else if (result.requiresPaymentMethod) {
      setPreviewOpen(false);
      setCardDialogOpen(true);
    }
    // On other errors, BillingPreview stays open — error will show in the card via billingError
  }, [selectedPlan, updatePlan]);

  // Handle edit billing open
  const handleEditBillingOpen = useCallback(() => {
    setBillingForm({
      name: billingDetails?.name || '',
      country: billingDetails?.country || '',
      state: billingDetails?.state || '',
      city: billingDetails?.city || '',
      zipCode: billingDetails?.zipCode || '',
    });
    setEditBillingOpen(true);
  }, [billingDetails]);

  // Handle edit billing save
  const handleEditBillingSave = useCallback(async () => {
    setActionLoading(true);
    const success = await updateBillingDetails(billingForm);
    setActionLoading(false);

    if (success) {
      setEditBillingOpen(false);
    }
  }, [billingForm, updateBillingDetails]);

  // Handle add card
  const handleAddCard = useCallback(async (cardData) => {
    setActionLoading(true);
    const success = await addPaymentMethod(cardData);
    setActionLoading(false);
    return success;
  }, [addPaymentMethod]);

  // Handle set default card
  const handleSetDefault = useCallback(async (cardId) => {
    setActionLoading(true);
    const success = await setDefaultPaymentMethod(cardId);
    setActionLoading(false);
    return success;
  }, [setDefaultPaymentMethod]);

  // Handle remove card
  const handleRemoveCard = useCallback(async (cardId) => {
    setActionLoading(true);
    const success = await removePaymentMethod(cardId);
    setActionLoading(false);
    return success;
  }, [removePaymentMethod]);

  // Handle cancel subscription
  const handleCancelSubscription = useCallback(async () => {
    setActionLoading(true);
    const success = await cancelSubscription();
    setActionLoading(false);

    if (success) {
      setCancelOpen(false);
    }
  }, [cancelSubscription]);

  // Format card display for billing table
  const cardDisplayValue = useMemo(() => {
    if (defaultPaymentMethod) {
      return `${defaultPaymentMethod.cardBrand} **** ${defaultPaymentMethod.cardLast4}`;
    }
    return null;
  }, [defaultPaymentMethod]);

  // Check if user can upgrade (has selected a different plan)
  const canUpgrade = selectedPlan && selectedPlan !== currentPlanCode;

  // Determine effective selected plan (use current if none explicitly selected)
  const effectiveSelectedPlan = selectedPlan || currentPlanCode;

  if (loading) {
    return (
      <DashboardCard
        icon={CreditCard}
        title="Change plan"
        subtitle="You can upgrade and downgrade whenever you want."
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: colors.primary }} />
        </Box>
      </DashboardCard>
    );
  }

  return (
    <>
      <SubscriptionBanners
        subscriptionStatus={subscriptionStatus}
        cancelledAt={cancelledAt}
        currentPeriodEnd={currentPeriodEnd}
        onReactivate={reactivateSubscription}
        onManagePayment={() => setCardDialogOpen(true)}
      />

      <DashboardCard
        icon={CreditCard}
        title="Change plan"
        subtitle="You can upgrade and downgrade whenever you want."
      >
        {/* Plan Selection Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {DISPLAY_PLANS.map((plan) => (
            <PlanOptionCard
              key={plan.code}
              plan={plan}
              isSelected={effectiveSelectedPlan === plan.code}
              onSelect={handleSelectPlan}
            />
          ))}
        </Box>

        {/* Upgrade Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <DashboardActionButton
            // variant="contained"
            onClick={handleUpgrade}
            disabled={!canUpgrade || actionLoading}
            sx={{
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: alpha(colors.primary, 0.85),
                boxShadow: `0 6px 16px ${alpha(colors.primary, 0.4)}`,
              },
              '&:disabled': {
                bgcolor: alpha(colors.primary, 0.4),
                color: alpha('#fff', 0.6),
              },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
            ) : (
              'Upgrade plan'
            )}
          </DashboardActionButton>
        </Box>

        <Divider sx={{ borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08), mb: 3 }} />

        {/* Billing Details Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            sx={{
              color: colors.text,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Billing details
          </Typography>
          <Button
            startIcon={<Pencil size={14} />}
            onClick={handleEditBillingOpen}
            sx={{
              color: colors.text,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
              '&:hover': {
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              },
            }}
          >
            Edit
          </Button>
        </Box>

        {/* Billing Details Table */}
        <Box
          sx={{
            borderRadius: '8px',
            border: `1px solid ${isDark ? alpha('#fff', 0.3) : alpha('#000', 0.1)}`,
            overflow: 'hidden',
            mb: 3,
          }}
        >
          <BillingRow label="Name" value={billingDetails?.name} />
          <BillingRow label="Country" value={billingDetails?.country} />
          <BillingRow label="State" value={billingDetails?.state} />
          <BillingRow label="City" value={billingDetails?.city} />
          <BillingRow label="Zip Code" value={billingDetails?.zipCode} />
          <BillingRow
            label="Card Number"
            isLast
            value={
              cardDisplayValue ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{cardDisplayValue}</span>
                  <Link
                    component="button"
                    onClick={() => setCardDialogOpen(true)}
                    sx={{
                      color: colors.primary,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      border: 'none',
                      background: 'none',
                      p: 0,
                      ml: 1,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Manage
                  </Link>
                </Box>
              ) : (
                <Link
                  component="button"
                  onClick={() => setCardDialogOpen(true)}
                  sx={{
                    color: colors.primary,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    border: 'none',
                    background: 'none',
                    p: 0,
                  }}
                >
                  Add card
                </Link>
              )
            }
          />
        </Box>

        {/* Cancel Subscription - always show */}
        <Typography
          sx={{
            color: alpha(colors.text, 0.6),
            fontSize: '0.875rem',
          }}
        >
          We cannot refund once you purchased a subscription, but you can always{' '}
          <Link
            component="button"
            onClick={() => setCancelOpen(true)}
            sx={{
              color: colors.primary,
              textDecoration: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              p: 0,
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            cancel
          </Link>
        </Typography>
      </DashboardCard>

      {/* Edit Billing Dialog */}
      <Dialog
        open={editBillingOpen}
        onClose={() => setEditBillingOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.panelBg,
            borderRadius: 3,
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Edit Billing Details
          <Button
            onClick={() => setEditBillingOpen(false)}
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: alpha(colors.text, 0.5),
              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05) },
            }}
          >
            <X size={20} />
          </Button>
        </DialogTitle>
        <DialogContent>
          {billingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {billingError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <DashboardInput
              label="Name"
              value={billingForm.name}
              onChange={(e) => setBillingForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <DashboardInput
              label="Country"
              value={billingForm.country}
              onChange={(e) => setBillingForm((prev) => ({ ...prev, country: e.target.value }))}
            />
            <DashboardInput
              label="State"
              value={billingForm.state}
              onChange={(e) => setBillingForm((prev) => ({ ...prev, state: e.target.value }))}
            />
            <DashboardInput
              label="City"
              value={billingForm.city}
              onChange={(e) => setBillingForm((prev) => ({ ...prev, city: e.target.value }))}
            />
            <DashboardInput
              label="Zip Code"
              value={billingForm.zipCode}
              onChange={(e) => setBillingForm((prev) => ({ ...prev, zipCode: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <DashboardCancelButton onClick={() => setEditBillingOpen(false)} disabled={actionLoading}>
            Cancel
          </DashboardCancelButton>
          <DashboardConfirmButton onClick={handleEditBillingSave} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'Save'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>

      {/* Card Management Dialog */}
      <CardManagementDialog
        open={cardDialogOpen}
        onClose={() => setCardDialogOpen(false)}
        paymentMethods={paymentMethods}
        onAddCard={handleAddCard}
        onSetDefault={handleSetDefault}
        onRemoveCard={handleRemoveCard}
        onCreateSetupIntent={createSetupIntent}
        loading={actionLoading || paymentMethodsLoading}
      />

      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.panelBg,
            borderRadius: 3,
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: alpha(colors.text, 0.7), fontSize: '0.9rem' }}>
            Are you sure you want to cancel your subscription? You will be downgraded to the free
            plan and lose access to premium features.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton onClick={() => setCancelOpen(false)} disabled={actionLoading}>
            Keep Subscription
          </DashboardCancelButton>
          <DashboardConfirmButton
            onClick={handleCancelSubscription}
            disabled={actionLoading}
            tone="danger"
          >
            {actionLoading ? (
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
            ) : (
              'Cancel Subscription'
            )}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>

      {/* Billing Preview Dialog — shown before confirming paid plan upgrade */}
      <BillingPreview
        open={previewOpen}
        planCode={selectedPlan}
        planLabel={DISPLAY_PLANS.find((p) => p.code === selectedPlan)?.displayName || selectedPlan}
        onConfirm={handleConfirmUpgrade}
        onCancel={() => setPreviewOpen(false)}
        getPlanPreview={getPlanPreview}
      />
    </>
  );
};

export default ChangePlanCard;
