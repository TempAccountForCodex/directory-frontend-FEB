import React, { type ReactNode } from "react";
import { FeatureFlagsContext, useFeatureFlags } from "../hooks/useFeatureFlags";
import type { FeatureFlags } from "../hooks/useFeatureFlags";

interface FeatureFlagsProviderProps {
  children: ReactNode;
  defaultFlags?: FeatureFlags;
  source?: "local" | "remote" | "user";
  apiUrl?: string;
  websiteId?: number;
  userId?: number;
}

/**
 * Feature Flags Provider Component
 * Wraps the application and provides feature flags to all child components
 *
 * @example
 * ```tsx
 * <FeatureFlagsProvider defaultFlags={{ analytics_enabled: true }}>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({
  children,
  defaultFlags = {},
  source = "local",
  apiUrl,
  websiteId,
  userId,
}) => {
  const featureFlags = useFeatureFlags({
    source,
    apiUrl,
    websiteId,
    userId,
    defaultFlags,
  });

  return (
    <FeatureFlagsContext.Provider value={featureFlags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export default FeatureFlagsProvider;
