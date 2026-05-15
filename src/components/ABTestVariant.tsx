import React, { type ReactNode } from "react";
import { useABTestContext } from "../hooks/useABTest";

interface ABTestVariantProps {
  /**
   * The A/B test ID
   */
  testId: string;

  /**
   * The variant ID to render
   */
  variantId: string;

  /**
   * Content to render for this variant
   */
  children: ReactNode;

  /**
   * Optional fallback content if variant doesn't match
   */
  fallback?: ReactNode;
}

/**
 * ABTestVariant Component
 * Conditionally renders content based on A/B test variant assignment
 *
 * @example
 * ```tsx
 * <ABTestVariant testId="hero_cta" variantId="get_started">
 *   <Button>Get Started</Button>
 * </ABTestVariant>
 *
 * <ABTestVariant testId="hero_cta" variantId="learn_more">
 *   <Button>Learn More</Button>
 * </ABTestVariant>
 * ```
 */
export const ABTestVariant: React.FC<ABTestVariantProps> = ({
  testId,
  variantId,
  children,
  fallback = null,
}) => {
  const { getVariant } = useABTestContext();

  const assignedVariant = getVariant(testId);
  const isMatch = assignedVariant === variantId;

  return <>{isMatch ? children : fallback}</>;
};

/**
 * ABTestSwitch Component
 * Renders different content based on the assigned variant
 *
 * @example
 * ```tsx
 * <ABTestSwitch testId="hero_layout">
 *   {(variant) => {
 *     switch (variant) {
 *       case 'centered':
 *         return <CenteredHero />;
 *       case 'left_aligned':
 *         return <LeftAlignedHero />;
 *       default:
 *         return <DefaultHero />;
 *     }
 *   }}
 * </ABTestSwitch>
 * ```
 */
interface ABTestSwitchProps {
  testId: string;
  children: (variant: string | null) => ReactNode;
}

export const ABTestSwitch: React.FC<ABTestSwitchProps> = ({
  testId,
  children,
}) => {
  const { getVariant } = useABTestContext();
  const variant = getVariant(testId);

  return <>{children(variant)}</>;
};

export default ABTestVariant;
