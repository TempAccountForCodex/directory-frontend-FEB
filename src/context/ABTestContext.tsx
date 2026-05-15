import React, { type ReactNode } from "react";
import { ABTestContext, useABTest } from "../hooks/useABTest";
import type { ABTest } from "../hooks/useABTest";

interface ABTestProviderProps {
  children: ReactNode;
  tests?: ABTest[];
}

/**
 * A/B Test Provider Component
 * Wraps the application and provides A/B testing functionality
 *
 * @example
 * ```tsx
 * <ABTestProvider tests={[
 *   {
 *     id: 'hero_cta',
 *     name: 'Hero CTA Test',
 *     variants: [
 *       { id: 'variant_a', name: 'Get Started', weight: 50 },
 *       { id: 'variant_b', name: 'Learn More', weight: 50 },
 *     ],
 *     enabled: true,
 *   }
 * ]}>
 *   <App />
 * </ABTestProvider>
 * ```
 */
export const ABTestProvider: React.FC<ABTestProviderProps> = ({
  children,
  tests = [],
}) => {
  const abTest = useABTest(tests);

  return (
    <ABTestContext.Provider value={abTest}>{children}</ABTestContext.Provider>
  );
};

export default ABTestProvider;
