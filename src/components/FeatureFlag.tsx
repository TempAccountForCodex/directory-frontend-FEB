import React, { type ReactNode } from "react";
import { useFeatureFlagsContext } from "../hooks/useFeatureFlags";

interface FeatureFlagProps {
  /**
   * The feature flag name to check
   */
  flag: string;

  /**
   * Content to render when the flag is enabled
   */
  children: ReactNode;

  /**
   * Optional content to render when the flag is disabled
   */
  fallback?: ReactNode;

  /**
   * For non-boolean flags, specify the expected value
   */
  value?: any;

  /**
   * Render children only if flag is disabled (inverted logic)
   */
  not?: boolean;
}

/**
 * FeatureFlag Component
 * Conditionally renders content based on feature flag state
 *
 * @example
 * ```tsx
 * // Render only if flag is enabled
 * <FeatureFlag flag="analytics_enabled">
 *   <AnalyticsComponent />
 * </FeatureFlag>
 *
 * // Render with fallback
 * <FeatureFlag
 *   flag="new_editor"
 *   fallback={<OldEditor />}
 * >
 *   <NewEditor />
 * </FeatureFlag>
 *
 * // Check for specific value
 * <FeatureFlag flag="theme" value="dark">
 *   <DarkTheme />
 * </FeatureFlag>
 *
 * // Inverted logic (render if disabled)
 * <FeatureFlag flag="maintenance_mode" not>
 *   <MainContent />
 * </FeatureFlag>
 * ```
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  children,
  fallback = null,
  value,
  not = false,
}) => {
  const { isEnabled, getFlagValue } = useFeatureFlagsContext();

  let shouldRender: boolean;

  if (value !== undefined) {
    // Check for specific value
    const flagValue = getFlagValue(flag);
    shouldRender = flagValue === value;
  } else {
    // Check if enabled (boolean)
    shouldRender = isEnabled(flag);
  }

  // Apply NOT logic if specified
  if (not) {
    shouldRender = !shouldRender;
  }

  return <>{shouldRender ? children : fallback}</>;
};

export default FeatureFlag;
