import { useState, useEffect, createContext, useContext } from "react";

export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

interface FeatureFlagsContextValue {
  flags: FeatureFlags;
  isEnabled: (flagName: string) => boolean;
  getFlagValue: <T = any>(flagName: string, defaultValue?: T) => T;
  setFlag: (flagName: string, value: boolean | string | number) => void;
  loading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(
  null,
);

/**
 * Feature flag sources - can be extended to support remote configs
 */
type FeatureFlagSource = "local" | "remote" | "user";

interface FeatureFlagConfig {
  source?: FeatureFlagSource;
  apiUrl?: string;
  websiteId?: number;
  userId?: number;
  defaultFlags?: FeatureFlags;
}

/**
 * Fetch feature flags from remote source (API)
 */
const fetchRemoteFlags = async (
  apiUrl: string,
  websiteId?: number,
  userId?: number,
): Promise<FeatureFlags> => {
  try {
    const params = new URLSearchParams();
    if (websiteId) params.append("websiteId", websiteId.toString());
    if (userId) params.append("userId", userId.toString());

    const response = await fetch(
      `${apiUrl}/feature-flags?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch feature flags");
    }

    const data = await response.json();
    return data.flags || {};
  } catch (error) {
    console.error("[FeatureFlags] Error fetching remote flags:", error);
    return {};
  }
};

/**
 * Get feature flags from local storage
 */
const getLocalFlags = (key: string = "featureFlags"): FeatureFlags => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("[FeatureFlags] Error reading from local storage:", error);
    return {};
  }
};

/**
 * Save feature flags to local storage
 */
const saveLocalFlags = (
  flags: FeatureFlags,
  key: string = "featureFlags",
): void => {
  try {
    localStorage.setItem(key, JSON.stringify(flags));
  } catch (error) {
    console.error("[FeatureFlags] Error saving to local storage:", error);
  }
};

/**
 * React hook for feature flags
 */
export const useFeatureFlags = (config: FeatureFlagConfig = {}) => {
  const {
    source = "local",
    apiUrl,
    websiteId,
    userId,
    defaultFlags = {},
  } = config;

  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFlags = async () => {
      setLoading(true);

      let loadedFlags: FeatureFlags = { ...defaultFlags };

      if (source === "remote" && apiUrl) {
        // Fetch from remote API
        const remoteFlags = await fetchRemoteFlags(apiUrl, websiteId, userId);
        loadedFlags = { ...loadedFlags, ...remoteFlags };
      } else if (source === "local") {
        // Load from local storage
        const localFlags = getLocalFlags();
        loadedFlags = { ...loadedFlags, ...localFlags };
      }

      setFlags(loadedFlags);
      setLoading(false);
    };

    loadFlags();
  }, [source, apiUrl, websiteId, userId]);

  /**
   * Check if a feature flag is enabled (boolean flags)
   */
  const isEnabled = (flagName: string): boolean => {
    const value = flags[flagName];
    return value === true || value === "true";
  };

  /**
   * Get the value of a feature flag (supports any type)
   */
  const getFlagValue = <T = any>(flagName: string, defaultValue?: T): T => {
    const value = flags[flagName];
    return (value !== undefined ? value : defaultValue) as T;
  };

  /**
   * Set a feature flag (local only, persists to storage)
   */
  const setFlag = (flagName: string, value: boolean | string | number) => {
    const newFlags = { ...flags, [flagName]: value };
    setFlags(newFlags);
    saveLocalFlags(newFlags);
  };

  return {
    flags,
    isEnabled,
    getFlagValue,
    setFlag,
    loading,
  };
};

/**
 * Feature Flags Context Hook
 */
export const useFeatureFlagsContext = (): FeatureFlagsContextValue => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsContext must be used within a FeatureFlagsProvider",
    );
  }
  return context;
};

export { FeatureFlagsContext };

/**
 * Common feature flag keys - keeps flags consistent across the app
 */
export const FEATURE_FLAGS = {
  // Website Features
  ANALYTICS_ENABLED: "analytics_enabled",
  CONTACT_FORM_ENABLED: "contact_form_enabled",
  SOCIAL_SHARING: "social_sharing",
  COOKIE_BANNER: "cookie_banner",
  LIVE_CHAT: "live_chat",
  NEWSLETTER_SIGNUP: "newsletter_signup",

  // Experimental Features
  NEW_EDITOR: "new_editor",
  BETA_FEATURES: "beta_features",
  DEBUG_MODE: "debug_mode",

  // A/B Testing
  AB_TEST_HERO_VARIANT: "ab_test_hero_variant",
  AB_TEST_CTA_VARIANT: "ab_test_cta_variant",

  // Performance
  LAZY_LOAD_IMAGES: "lazy_load_images",
  PREFETCH_PAGES: "prefetch_pages",

  // Access Control
  MAINTENANCE_MODE: "maintenance_mode",
  BETA_ACCESS: "beta_access",
} as const;

export default useFeatureFlags;
