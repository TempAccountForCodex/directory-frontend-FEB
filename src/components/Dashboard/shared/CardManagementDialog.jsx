import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CreditCard, Trash2, Star, Plus, X, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCancelButton from './DashboardCancelButton';
import DashboardConfirmButton from './DashboardConfirmButton';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

/**
 * Card brand icons using SVG paths
 */
const CardBrandIcon = ({ brand, size = 32 }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const brandColors = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    discover: '#FF6000',
    default: colors.text,
  };

  const color = brandColors[brand?.toLowerCase()] || brandColors.default;

  return (
    <Box
      sx={{
        width: size,
        height: size * 0.65,
        borderRadius: '4px',
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        sx={{
          color: color,
          fontSize: size * 0.3,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
        }}
      >
        {brand?.slice(0, 4) || 'CARD'}
      </Typography>
    </Box>
  );
};

/**
 * Individual payment card display
 */
const PaymentCardItem = ({ card, isDefault, onSetDefault, onRemove, loading }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const expiryFormatted = useMemo(() => {
    const month = String(card.cardExpMonth).padStart(2, '0');
    const year = String(card.cardExpYear).slice(-2);
    return `${month}/${year}`;
  }, [card.cardExpMonth, card.cardExpYear]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '12px',
        border: isDefault
          ? `2px solid ${colors.primary}`
          : `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        bgcolor: isDefault
          ? alpha(colors.primary, 0.05)
          : isDark
          ? alpha('#fff', 0.02)
          : alpha('#000', 0.01),
        transition: 'all 0.2s ease',
      }}
    >
      {/* Card brand icon */}
      <CardBrandIcon brand={card.cardBrand} />

      {/* Card details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              color: colors.text,
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            {card.cardBrand} ending in {card.cardLast4}
          </Typography>
          {isDefault && (
            <Chip
              label="Default"
              size="small"
              icon={<Star size={12} />}
              sx={{
                height: 22,
                bgcolor: alpha(colors.primary, 0.15),
                color: colors.primary,
                fontWeight: 600,
                fontSize: '0.7rem',
                '& .MuiChip-icon': {
                  color: colors.primary,
                  marginLeft: '4px',
                },
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              color: alpha(colors.text, 0.6),
              fontSize: '0.8rem',
            }}
          >
            Expires {expiryFormatted}
          </Typography>
          {card.cardholderName && (
            <Typography
              sx={{
                color: alpha(colors.text, 0.5),
                fontSize: '0.8rem',
              }}
            >
              {card.cardholderName}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!isDefault && (
          <Button
            size="small"
            onClick={() => onSetDefault(card.id)}
            disabled={loading}
            sx={{
              color: colors.primary,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              minWidth: 'auto',
              px: 1.5,
              '&:hover': {
                bgcolor: alpha(colors.primary, 0.1),
              },
            }}
          >
            Set default
          </Button>
        )}
        <IconButton
          size="small"
          onClick={() => onRemove(card.id)}
          disabled={loading}
          sx={{
            color: alpha(colors.text, 0.4),
            '&:hover': {
              color: colors.error || '#f44336',
              bgcolor: alpha(colors.error || '#f44336', 0.1),
            },
          }}
        >
          <Trash2 size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};

/**
 * Stripe Card Form using Stripe Elements
 */
const StripeCardForm = ({ clientSecret, onSuccess, onCancel, loading: externalLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const loading = externalLoading || processing;

  // Stripe CardElement styles
  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: '16px',
          color: colors.text,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          '::placeholder': {
            color: alpha(colors.text, 0.4),
          },
          iconColor: colors.primary,
        },
        invalid: {
          color: colors.error || '#f44336',
          iconColor: colors.error || '#f44336',
        },
      },
      hidePostalCode: true,
    }),
    [colors]
  );

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm the SetupIntent with the card details
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (setupIntent && setupIntent.payment_method) {
        // Call the success handler with the payment method ID
        await onSuccess(setupIntent.payment_method);
      }
    } catch (err) {
      setError(err.message || 'Failed to add card. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, clientSecret, onSuccess]);

  const handleCardChange = useCallback((event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  }, []);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: '12px',
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Plus size={18} color={colors.primary} />
        <Typography
          sx={{
            color: colors.text,
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          Add new card
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Lock size={14} color={alpha(colors.text, 0.5)} />
          <Typography sx={{ color: alpha(colors.text, 0.5), fontSize: '0.75rem' }}>
            Secured by Stripe
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Stripe Card Element */}
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            border: `1px solid ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
            bgcolor: isDark ? alpha('#fff', 0.03) : '#fff',
            '&:focus-within': {
              borderColor: colors.primary,
              boxShadow: `0 0 0 1px ${colors.primary}`,
            },
          }}
        >
          <CardElement options={cardElementOptions} onChange={handleCardChange} />
        </Box>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ py: 0.5 }}>
            {error}
          </Alert>
        )}

        {/* Security note */}
        <Typography sx={{ color: alpha(colors.text, 0.5), fontSize: '0.75rem' }}>
          Your card details are securely processed by Stripe. We never store your full card number.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
          <DashboardCancelButton onClick={onCancel} disabled={loading}>
            Cancel
          </DashboardCancelButton>
          <DashboardConfirmButton onClick={handleSubmit} disabled={loading || !cardComplete || !stripe}>
            {processing ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Add Card'}
          </DashboardConfirmButton>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Wrapper for Stripe Elements provider with loading and error states
 */
const AddCardForm = ({ clientSecret, onSuccess, onCancel, loading, error, onRetry }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  // Stripe Elements appearance configuration
  const appearance = useMemo(
    () => ({
      theme: actualTheme === 'dark' ? 'night' : 'stripe',
      variables: {
        colorPrimary: colors.primary,
        colorBackground: actualTheme === 'dark' ? '#1a1a1a' : '#ffffff',
        colorText: colors.text,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        borderRadius: '8px',
      },
    }),
    [actualTheme, colors]
  );

  const options = useMemo(
    () => ({
      clientSecret,
      appearance,
    }),
    [clientSecret, appearance]
  );

  // Error state with retry option
  if (error) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: '12px',
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
          textAlign: 'center',
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <DashboardCancelButton onClick={onCancel}>Cancel</DashboardCancelButton>
          <DashboardConfirmButton onClick={onRetry}>Try Again</DashboardConfirmButton>
        </Box>
      </Box>
    );
  }

  // Loading state
  if (!clientSecret) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: '12px',
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
          textAlign: 'center',
          py: 4,
        }}
      >
        <CircularProgress size={28} sx={{ color: colors.primary }} />
        <Typography sx={{ color: colors.text, mt: 2, fontSize: '0.9rem' }}>
          Initializing secure form...
        </Typography>
        <Typography sx={{ color: alpha(colors.text, 0.5), mt: 0.5, fontSize: '0.8rem' }}>
          Setting up Stripe payment
        </Typography>
        <Box sx={{ mt: 2 }}>
          <DashboardCancelButton onClick={onCancel} size="small">
            Cancel
          </DashboardCancelButton>
        </Box>
      </Box>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeCardForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onCancel={onCancel}
        loading={loading}
      />
    </Elements>
  );
};

/**
 * Professional card management dialog with Stripe integration
 */
const CardManagementDialog = ({
  open,
  onClose,
  paymentMethods,
  onAddCard,
  onSetDefault,
  onRemoveCard,
  onCreateSetupIntent,
  loading,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [setupError, setSetupError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Find default card
  const defaultCard = useMemo(() => {
    return paymentMethods.find((c) => c.isDefault);
  }, [paymentMethods]);

  // Function to initialize SetupIntent
  const initializeSetupIntent = useCallback(async () => {
    setSetupError(null);
    setIsInitializing(true);
    try {
      const secret = await onCreateSetupIntent();
      if (secret) {
        setClientSecret(secret);
      } else {
        setSetupError('Failed to initialize card setup. Please try again.');
      }
    } catch (err) {
      setSetupError(err.message || 'Failed to initialize card setup. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  }, [onCreateSetupIntent]);

  // Initialize SetupIntent when showing add form
  useEffect(() => {
    if (showAddForm && !clientSecret && !setupError && !isInitializing) {
      initializeSetupIntent();
    }
  }, [showAddForm, clientSecret, setupError, isInitializing, initializeSetupIntent]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setClientSecret(null);
    setSetupError(null);
    initializeSetupIntent();
  }, [initializeSetupIntent]);

  // Handle successful card addition
  const handleAddSuccess = useCallback(
    async (stripePaymentMethodId) => {
      const success = await onAddCard({ stripePaymentMethodId, setAsDefault: true });
      if (success) {
        setShowAddForm(false);
        setClientSecret(null);
      }
    },
    [onAddCard]
  );

  // Handle remove card with confirmation
  const handleRemoveClick = useCallback((cardId) => {
    setConfirmDelete(cardId);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (confirmDelete !== null) {
      await onRemoveCard(confirmDelete);
      setConfirmDelete(null);
    }
  }, [confirmDelete, onRemoveCard]);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setShowAddForm(false);
    setConfirmDelete(null);
    setClientSecret(null);
    setSetupError(null);
    onClose();
  }, [onClose]);

  // Handle cancel add form
  const handleCancelAdd = useCallback(() => {
    setShowAddForm(false);
    setClientSecret(null);
    setSetupError(null);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: colors.panelBg,
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          maxHeight: '80vh',
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
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CreditCard size={22} color={colors.primary} />
          Manage Payment Methods
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: alpha(colors.text, 0.5),
            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05) },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Card count summary */}
        <Typography
          sx={{
            color: alpha(colors.text, 0.6),
            fontSize: '0.85rem',
            mb: 2,
          }}
        >
          {paymentMethods.length === 0
            ? 'No payment methods added yet.'
            : `${paymentMethods.length} payment method${paymentMethods.length > 1 ? 's' : ''} on file`}
        </Typography>

        {/* Existing cards list */}
        {paymentMethods.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            {paymentMethods.map((card) => (
              <PaymentCardItem
                key={card.id}
                card={card}
                isDefault={card.isDefault}
                onSetDefault={onSetDefault}
                onRemove={handleRemoveClick}
                loading={loading}
              />
            ))}
          </Box>
        )}

        {/* Divider before add form */}
        {paymentMethods.length > 0 && !showAddForm && (
          <Divider sx={{ my: 2, borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08) }} />
        )}

        {/* Add card button or form */}
        {showAddForm ? (
          <AddCardForm
            clientSecret={clientSecret}
            onSuccess={handleAddSuccess}
            onCancel={handleCancelAdd}
            loading={loading}
            error={setupError}
            onRetry={handleRetry}
          />
        ) : (
          <Button
            fullWidth
            startIcon={<Plus size={18} />}
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            sx={{
              color: colors.primary,
              borderColor: alpha(colors.primary, 0.3),
              border: `1px dashed ${alpha(colors.primary, 0.5)}`,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              borderRadius: '12px',
              '&:hover': {
                bgcolor: alpha(colors.primary, 0.05),
                borderColor: colors.primary,
              },
            }}
          >
            Add new card
          </Button>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <DashboardCancelButton onClick={handleClose} disabled={loading}>
          Close
        </DashboardCancelButton>
      </DialogActions>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
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
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>Remove Card?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: alpha(colors.text, 0.7), fontSize: '0.9rem' }}>
            Are you sure you want to remove this payment method? This action cannot be undone.
          </Typography>
          {confirmDelete === defaultCard?.id && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This is your default payment method. Another card will be set as default if available.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton onClick={() => setConfirmDelete(null)} disabled={loading}>
            Cancel
          </DashboardCancelButton>
          <DashboardConfirmButton onClick={handleConfirmRemove} disabled={loading} tone="danger">
            {loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Remove'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CardManagementDialog;
