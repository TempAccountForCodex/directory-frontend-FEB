import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { BillingDetails, DisplayPlan, PaymentMethod } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Display plans matching the UI design
export const DISPLAY_PLANS: DisplayPlan[] = [
  {
    code: "website_free",
    displayName: "STARTUP",
    priceMonthly: 0,
    tierLevel: 1,
  },
  {
    code: "website_core",
    displayName: "STANDARD",
    priceMonthly: 14.99,
    tierLevel: 2,
  },
  {
    code: "website_growth",
    displayName: "BUSINESS",
    priceMonthly: 29.99,
    tierLevel: 3,
  },
];

interface AddPaymentMethodParams {
  stripePaymentMethodId: string;
  setAsDefault?: boolean;
}

interface UseBillingReturn {
  billingDetails: BillingDetails | null;
  paymentMethods: PaymentMethod[];
  loading: boolean;
  paymentMethodsLoading: boolean;
  error: string | null;
  updateBillingDetails: (data: Partial<BillingDetails>) => Promise<boolean>;
  updatePlan: (
    planCode: string,
  ) => Promise<{ success: boolean; requiresPaymentMethod?: boolean }>;
  createSetupIntent: () => Promise<string | null>;
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (params: AddPaymentMethodParams) => Promise<boolean>;
  setDefaultPaymentMethod: (id: number) => Promise<boolean>;
  removePaymentMethod: (id: number) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing billing details, payment methods, and plan changes
 */
export function useBilling(): UseBillingReturn {
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(
    null,
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentMethodsLoading, setPaymentMethodsLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/account/billing`);
      setBillingDetails(response.data.billing);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch billing details";
      setError(errorMessage);
      console.error("Failed to fetch billing details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethodsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/account/payment-methods`);
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch payment methods";
      setError(errorMessage);
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingDetails();
    fetchPaymentMethods();
  }, [fetchBillingDetails, fetchPaymentMethods]);

  const updateBillingDetails = useCallback(
    async (data: Partial<BillingDetails>): Promise<boolean> => {
      try {
        setError(null);
        const response = await axios.put(`${API_URL}/account/billing`, data);
        setBillingDetails(response.data.billing);
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to update billing details";
        setError(errorMessage);
        return false;
      }
    },
    [],
  );

  const updatePlan = useCallback(
    async (
      planCode: string,
    ): Promise<{ success: boolean; requiresPaymentMethod?: boolean }> => {
      try {
        setError(null);
        await axios.put(`${API_URL}/account/plan`, { plan: planCode });

        // Refetch to get updated plan
        await fetchBillingDetails();
        return { success: true };
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to update plan";
        const requiresPaymentMethod =
          err.response?.data?.requiresPaymentMethod || false;
        setError(errorMessage);
        return { success: false, requiresPaymentMethod };
      }
    },
    [fetchBillingDetails],
  );

  const createSetupIntent = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/account/setup-intent`);
      return response.data.clientSecret;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to initialize card setup";
      setError(errorMessage);
      return null;
    }
  }, []);

  const addPaymentMethod = useCallback(
    async (params: AddPaymentMethodParams): Promise<boolean> => {
      try {
        setError(null);
        await axios.post(`${API_URL}/account/payment-methods`, params);

        // Refetch payment methods to get the new list
        await fetchPaymentMethods();
        // Also refetch billing details as the default card may have changed
        await fetchBillingDetails();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to add payment method";
        setError(errorMessage);
        return false;
      }
    },
    [fetchPaymentMethods, fetchBillingDetails],
  );

  const setDefaultPaymentMethod = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setError(null);
        await axios.put(`${API_URL}/account/payment-methods/${id}/default`);

        // Refetch payment methods to get updated default status
        await fetchPaymentMethods();
        // Also refetch billing details as the display card has changed
        await fetchBillingDetails();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to set default payment method";
        setError(errorMessage);
        return false;
      }
    },
    [fetchPaymentMethods, fetchBillingDetails],
  );

  const removePaymentMethod = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setError(null);
        await axios.delete(`${API_URL}/account/payment-methods/${id}`);

        // Refetch payment methods
        await fetchPaymentMethods();
        // Also refetch billing details as the display card may have changed
        await fetchBillingDetails();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to remove payment method";
        setError(errorMessage);
        return false;
      }
    },
    [fetchPaymentMethods, fetchBillingDetails],
  );

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await axios.post(`${API_URL}/account/cancel-subscription`);

      // Refetch to get updated plan
      await fetchBillingDetails();
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to cancel subscription";
      setError(errorMessage);
      return false;
    }
  }, [fetchBillingDetails]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchBillingDetails(), fetchPaymentMethods()]);
  }, [fetchBillingDetails, fetchPaymentMethods]);

  return {
    billingDetails,
    paymentMethods,
    loading,
    paymentMethodsLoading,
    error,
    updateBillingDetails,
    updatePlan,
    createSetupIntent,
    fetchPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    cancelSubscription,
    refetch,
  };
}
