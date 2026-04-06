import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  alpha,
} from "@mui/material";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import StripeProviderWrapper from "../../components/Checkout/StripeProviderWrapper";
import {
  ArrowBack as BackIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Cart item interface
interface CartItem {
  productId: string;
  quantity: number;
}

// Cart storage interface
interface Cart {
  items: CartItem[];
}

// Store interface
interface Store {
  id: string;
  name: string;
  slug: string;
  currency: string;
  platformFeePercent: number;
}

// Checkout response interface
interface CheckoutResponse {
  success: boolean;
  data: {
    orderId: string;
    clientSecret: string;
    totalCents: number;
    currency: string;
  };
}

// Helper function to load cart from localStorage
const loadCartFromLocalStorage = (storeId: string): Cart => {
  try {
    const cartKey = `ttdir:store:cart:${storeId}:v1`;
    const cartData = localStorage.getItem(cartKey);
    if (!cartData) {
      return { items: [] };
    }
    const cart = JSON.parse(cartData);
    // Validate cart structure
    if (!cart.items || !Array.isArray(cart.items)) {
      console.warn("Invalid cart structure in localStorage, resetting cart");
      return { items: [] };
    }
    return cart;
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return { items: [] };
  }
};

// Payment form component (uses Stripe hooks)
const PaymentForm = ({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          // TODO: In Prompt 7, add return_url for redirect-based payment methods
          // return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        setPaymentError(error.message || "Payment failed. Please try again.");
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess();
      } else {
        setPaymentError(
          "Payment is being processed. Please check your email for confirmation.",
        );
      }
    } catch (err: any) {
      console.error("Payment confirmation error:", err);
      setPaymentError(err.message || "An unexpected error occurred.");
      onError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {paymentError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {paymentError}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || !elements || isProcessing}
        sx={{
          mt: 3,
          py: 1.5,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          color: "#fff",
          fontSize: "1.1rem",
          fontWeight: 600,
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
          },
          "&.Mui-disabled": {
            background: colors.border,
            color: colors.textSecondary,
          },
        }}
      >
        {isProcessing ? (
          <>
            <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
};

// Main checkout page component
const CheckoutPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load store and cart on mount
  useEffect(() => {
    if (!storeId) {
      setError("Store ID is required");
      setLoading(false);
      return;
    }

    const loadStoreAndCart = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load cart from localStorage
        const cartData = loadCartFromLocalStorage(storeId);
        setCart(cartData);

        // If cart is empty, no need to load store or create checkout
        if (!cartData.items || cartData.items.length === 0) {
          setLoading(false);
          return;
        }

        // Load store information (optional but nice for display)
        try {
          const storeResponse = await axios.get(`${API_URL}/stores/${storeId}`);
          setStore(storeResponse.data.data);
        } catch (storeErr: any) {
          console.warn("Could not load store info:", storeErr);
          // Continue even if store load fails
        }

        // Create checkout session
        await createCheckoutSession(cartData);
      } catch (err: any) {
        console.error("Error loading checkout:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load checkout. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStoreAndCart();
  }, [storeId]);

  const createCheckoutSession = async (cartData: Cart) => {
    try {
      // Build checkout payload
      const payload = {
        storeId,
        items: cartData.items,
        // TODO: In Prompt 7, add customer info if authenticated
        // customerEmail: user?.email,
        // customerName: user?.name,
      };

      const response = await axios.post<CheckoutResponse>(
        `${API_URL}/checkout/create`,
        payload,
      );

      if (response.data.success && response.data.data.clientSecret) {
        setClientSecret(response.data.data.clientSecret);
        setOrderId(response.data.data.orderId);
      } else {
        throw new Error("Invalid response from checkout API");
      }
    } catch (err: any) {
      console.error("Checkout creation error:", err);
      throw err;
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // TODO: In Prompt 7, clear cart from localStorage after successful payment
    // localStorage.removeItem(`ttdir:store:cart:${storeId}:v1`);
  };

  const handlePaymentError = (message: string) => {
    console.error("Payment error:", message);
  };

  // Format price for display
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress sx={{ color: colors.primary }} size={60} />
          <Typography variant="h6" sx={{ color: colors.text }}>
            Loading checkout...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Checkout Error
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: colors.primary }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // Empty cart state
  if (!cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
          >
            Your cart is empty
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: colors.textSecondary, mb: 3 }}
          >
            Add items to your cart before proceeding to checkout.
          </Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              "&:hover": {
                borderColor: colors.primaryDark,
                background: alpha(colors.primary, 0.1),
              },
            }}
          >
            Continue Shopping
          </Button>
        </Card>
        {/* TODO: In Prompt 7, add navigation to store page */}
      </Container>
    );
  }

  // Payment success state
  if (paymentSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card
          sx={{
            borderRadius: 3,
            border: `2px solid ${colors.success}`,
            p: 4,
            textAlign: "center",
          }}
        >
          <SuccessIcon sx={{ fontSize: 80, color: colors.success, mb: 2 }} />
          <Typography
            variant="h4"
            sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
          >
            Payment Successful!
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: colors.textSecondary, mb: 1 }}
          >
            Thank you for your purchase. Your order has been confirmed.
          </Typography>
          {orderId && (
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                mb: 3,
                fontFamily: "monospace",
              }}
            >
              Order ID: {orderId}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mb: 4 }}
          >
            You will receive a confirmation email shortly.
          </Typography>
          {/* TODO: In Prompt 7, add navigation buttons to store/order history */}
          <Button
            onClick={() => navigate("/")}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              color: "#fff",
              px: 4,
            }}
          >
            Return to Home
          </Button>
        </Card>
      </Container>
    );
  }

  // Checkout form state
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Order Summary (Left Side) */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              p: 3,
              position: "sticky",
              top: 20,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
            >
              Order Summary
            </Typography>

            {store && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.textSecondary }}
                >
                  Store
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: colors.text, fontWeight: 600 }}
                >
                  {store.name}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* TODO: In Prompt 7, show actual cart items with product details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Cart items: {cart.items.length}
              </Typography>
              {cart.items.map((item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: colors.text, ml: 2, my: 1 }}
                >
                  • Product ID: {item.productId} (Qty: {item.quantity})
                </Typography>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, fontStyle: "italic" }}
              >
                Full order details will be displayed here in Prompt 7 when the
                public store frontend is complete.
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Payment Form (Right Side) */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              p: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
            >
              Payment Details
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, mb: 4 }}
            >
              Enter your payment information to complete your purchase.
            </Typography>

            {clientSecret ? (
              <StripeProviderWrapper clientSecret={clientSecret}>
                <PaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProviderWrapper>
            ) : (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress sx={{ color: colors.primary }} />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
