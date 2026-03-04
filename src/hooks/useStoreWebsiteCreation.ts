import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface WebsiteFormData {
  name: string;
  slug: string;
  primaryColor?: string;
  isPublic?: boolean;
}

interface StoreFormData {
  websiteId: number;
  name: string;
  slug: string;
  currency?: string;
}

interface CreatedWebsite {
  id: number;
  name: string;
  slug: string;
  status: string;
  primaryColor: string | null;
  // ... other fields
}

interface CreatedStore {
  id: string;
  name: string;
  slug: string;
  currency: string;
  // ... other fields
}

interface UseStoreWebsiteCreationResult {
  createStoreWebsite: (
    websiteData: WebsiteFormData,
    storeData: Omit<StoreFormData, "websiteId">,
  ) => Promise<{
    website: CreatedWebsite;
    store: CreatedStore;
  }>;
  loading: boolean;
  error: string | null;
  partialError: string | null; // For when website succeeds but store fails
}

/**
 * Hook for creating a "Store Website" - a website with an attached store module.
 *
 * This hook orchestrates a two-step creation process:
 * 1. Creates a Website via POST /api/websites
 * 2. Creates a Store for that website via POST /api/stores
 *
 * TODO: In a future prompt, when we implement the template system, we will
 * enhance this hook to automatically select a store-appropriate template/layout
 * during website creation. For now, it uses the default website configuration.
 *
 * Error handling:
 * - If website creation fails: throws error, no store creation attempted
 * - If store creation fails: sets partialError, website is still created
 */
export const useStoreWebsiteCreation = (): UseStoreWebsiteCreationResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialError, setPartialError] = useState<string | null>(null);

  const createStoreWebsite = async (
    websiteData: WebsiteFormData,
    storeData: Omit<StoreFormData, "websiteId">,
  ) => {
    setLoading(true);
    setError(null);
    setPartialError(null);

    try {
      // Step 1: Create the website
      // TODO: When template system is implemented, add template selection here
      // e.g., templateKey: 'store-default' or layoutType: 'ecommerce'
      const websiteResponse = await axios.post<{ data: CreatedWebsite }>(
        `${API_URL}/websites`,
        websiteData,
        { headers: {} },
      );

      const createdWebsite = websiteResponse.data.data;

      // Step 2: Create the store for this website
      try {
        const storePayload: StoreFormData = {
          websiteId: createdWebsite.id,
          ...storeData,
        };

        const storeResponse = await axios.post<{ data: CreatedStore }>(
          `${API_URL}/stores`,
          storePayload,
          { headers: {} },
        );

        const createdStore = storeResponse.data.data;

        setLoading(false);
        return {
          website: createdWebsite,
          store: createdStore,
        };
      } catch (storeError: any) {
        // Website was created but store creation failed
        console.error(
          "Store creation failed after website creation:",
          storeError,
        );

        const errorMessage =
          storeError.response?.data?.message || "Failed to create store";
        setPartialError(
          `Your website "${createdWebsite.name}" was created successfully, but the store creation failed: ${errorMessage}. You can try adding a store later from the Stores tab.`,
        );

        setLoading(false);

        // Still return the website, just without a store
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("Error creating store website:", err);

      // Check if this is a plan limit error
      if (err.response?.data?.code === "PLAN_LIMIT_REACHED") {
        setError(err.response.data.message);
        throw {
          code: "PLAN_LIMIT_REACHED",
          message: err.response.data.message,
        };
      }

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create store website";
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    createStoreWebsite,
    loading,
    error,
    partialError,
  };
};
