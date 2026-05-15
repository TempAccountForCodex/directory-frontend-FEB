import { useMemo } from "react";
import type { ReactNode } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Alert, Box, Typography } from "@mui/material";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";

interface StripeProviderWrapperProps {
  children: ReactNode;
  clientSecret?: string | null;
}

const StripeProviderWrapper = ({
  children,
  clientSecret,
}: StripeProviderWrapperProps) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Load Stripe publishable key from environment
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  // Create Stripe promise (memoized to avoid recreation)
  const stripePromise = useMemo(() => {
    if (
      !stripePublishableKey ||
      stripePublishableKey === "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX"
    ) {
      console.warn(
        "VITE_STRIPE_PUBLISHABLE_KEY is not configured. Stripe functionality will not work.",
      );
      return null;
    }
    return loadStripe(stripePublishableKey);
  }, [stripePublishableKey]);

  // If Stripe is not configured, show error message
  if (!stripePromise) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Stripe Not Configured
          </Typography>
          <Typography variant="body2">
            The Stripe publishable key is not configured. Please set
            VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            For development: Add your test publishable key (pk_test_...) to the
            .env file.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Create Elements options
  const options = useMemo(() => {
    const baseOptions: any = {
      appearance: {
        theme: actualTheme === "dark" ? "night" : "stripe",
        variables: {
          colorPrimary: colors.primary,
          colorBackground:
            colors.cardBg || (actualTheme === "dark" ? "#1a1a1a" : "#ffffff"),
          colorText: colors.text,
          colorDanger: colors.error,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          borderRadius: "8px",
        },
        rules: {
          ".Input": {
            border: `1px solid ${colors.border}`,
            boxShadow: "none",
          },
          ".Input:focus": {
            border: `2px solid ${colors.primary}`,
            boxShadow: `0 0 0 1px ${colors.primary}`,
          },
          ".Label": {
            color: colors.textSecondary,
            fontWeight: "500",
          },
        },
      },
    };

    // Only add clientSecret if it's provided and valid
    if (clientSecret && clientSecret !== "") {
      baseOptions.clientSecret = clientSecret;
    }

    return baseOptions;
  }, [clientSecret, actualTheme, colors]);

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProviderWrapper;
