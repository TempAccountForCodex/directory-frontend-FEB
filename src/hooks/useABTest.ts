import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";

export type VariantId = string;

export interface ABTestVariant {
  id: VariantId;
  name: string;
  weight?: number; // Percentage allocation (0-100)
  metadata?: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  enabled?: boolean;
}

export interface ABTestAssignment {
  testId: string;
  variantId: VariantId;
  timestamp: number;
}

interface ABTestContextValue {
  getVariant: (testId: string) => VariantId | null;
  getAllAssignments: () => ABTestAssignment[];
  trackConversion: (
    testId: string,
    conversionName: string,
    value?: number,
  ) => void;
  resetTest: (testId: string) => void;
  resetAllTests: () => void;
}

const ABTestContext = createContext<ABTestContextValue | null>(null);

const STORAGE_KEY = "ab_test_assignments";

/**
 * Get stored AB test assignments from localStorage
 */
const getStoredAssignments = (): Record<string, ABTestAssignment> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("[ABTest] Error reading assignments from storage:", error);
    return {};
  }
};

/**
 * Save AB test assignments to localStorage
 */
const saveAssignments = (
  assignments: Record<string, ABTestAssignment>,
): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error("[ABTest] Error saving assignments to storage:", error);
  }
};

/**
 * Assign a user to a variant based on weights
 */
const assignVariant = (test: ABTest): VariantId => {
  // Calculate total weight
  const totalWeight = test.variants.reduce(
    (sum, v) => sum + (v.weight || 100 / test.variants.length),
    0,
  );

  // Generate random number
  const random = Math.random() * totalWeight;

  // Select variant based on weight
  let cumulative = 0;
  for (const variant of test.variants) {
    cumulative += variant.weight || 100 / test.variants.length;
    if (random <= cumulative) {
      return variant.id;
    }
  }

  // Fallback to first variant
  return test.variants[0]?.id || "default";
};

/**
 * Hook for A/B testing
 */
export const useABTest = (tests: ABTest[] = []) => {
  const [assignments, setAssignments] = useState<
    Record<string, ABTestAssignment>
  >(() => getStoredAssignments());

  useEffect(() => {
    // Ensure all active tests have assignments
    const newAssignments = { ...assignments };
    let changed = false;

    for (const test of tests) {
      if (!test.enabled) continue;

      if (!newAssignments[test.id]) {
        // Assign variant for new test
        const variantId = assignVariant(test);
        newAssignments[test.id] = {
          testId: test.id,
          variantId,
          timestamp: Date.now(),
        };
        changed = true;

        console.log(
          `[ABTest] Assigned variant "${variantId}" for test "${test.id}"`,
        );
      }
    }

    if (changed) {
      setAssignments(newAssignments);
      saveAssignments(newAssignments);
    }
  }, [tests]);

  /**
   * Get the assigned variant for a test
   */
  const getVariant = useCallback(
    (testId: string): VariantId | null => {
      return assignments[testId]?.variantId || null;
    },
    [assignments],
  );

  /**
   * Get all test assignments
   */
  const getAllAssignments = useCallback((): ABTestAssignment[] => {
    return Object.values(assignments);
  }, [assignments]);

  /**
   * Track a conversion event for a test
   */
  const trackConversion = useCallback(
    (testId: string, conversionName: string, value?: number) => {
      const assignment = assignments[testId];
      if (!assignment) {
        console.warn(`[ABTest] No assignment found for test "${testId}"`);
        return;
      }

      console.log("[ABTest] Conversion tracked:", {
        testId,
        variantId: assignment.variantId,
        conversionName,
        value,
      });

      // Send to analytics if available
      if (window.gtag) {
        window.gtag("event", "ab_test_conversion", {
          test_id: testId,
          variant_id: assignment.variantId,
          conversion_name: conversionName,
          value,
        });
      }
    },
    [assignments],
  );

  /**
   * Reset a specific test assignment
   */
  const resetTest = useCallback(
    (testId: string) => {
      const newAssignments = { ...assignments };
      delete newAssignments[testId];
      setAssignments(newAssignments);
      saveAssignments(newAssignments);
      console.log(`[ABTest] Reset test "${testId}"`);
    },
    [assignments],
  );

  /**
   * Reset all test assignments
   */
  const resetAllTests = useCallback(() => {
    setAssignments({});
    localStorage.removeItem(STORAGE_KEY);
    console.log("[ABTest] Reset all tests");
  }, []);

  return {
    getVariant,
    getAllAssignments,
    trackConversion,
    resetTest,
    resetAllTests,
  };
};

/**
 * Context hook for A/B testing
 */
export const useABTestContext = (): ABTestContextValue => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error("useABTestContext must be used within an ABTestProvider");
  }
  return context;
};

export { ABTestContext };

/**
 * Common A/B test configurations
 */
export const AB_TESTS = {
  HERO_CTA_TEXT: {
    id: "hero_cta_text",
    name: "Hero CTA Button Text",
    variants: [
      { id: "get_started", name: "Get Started", weight: 50 },
      { id: "learn_more", name: "Learn More", weight: 50 },
    ],
    enabled: false,
  },
  HERO_LAYOUT: {
    id: "hero_layout",
    name: "Hero Section Layout",
    variants: [
      { id: "centered", name: "Centered", weight: 50 },
      { id: "left_aligned", name: "Left Aligned", weight: 50 },
    ],
    enabled: false,
  },
  CTA_COLOR: {
    id: "cta_color",
    name: "CTA Button Color",
    variants: [
      { id: "primary", name: "Primary Color", weight: 33.33 },
      { id: "secondary", name: "Secondary Color", weight: 33.33 },
      { id: "gradient", name: "Gradient", weight: 33.34 },
    ],
    enabled: false,
  },
  TESTIMONIAL_COUNT: {
    id: "testimonial_count",
    name: "Number of Testimonials",
    variants: [
      {
        id: "two",
        name: "2 Testimonials",
        weight: 33.33,
        metadata: { count: 2 },
      },
      {
        id: "four",
        name: "4 Testimonials",
        weight: 33.33,
        metadata: { count: 4 },
      },
      {
        id: "six",
        name: "6 Testimonials",
        weight: 33.34,
        metadata: { count: 6 },
      },
    ],
    enabled: false,
  },
} as const;

export default useABTest;
