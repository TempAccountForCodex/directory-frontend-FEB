/**
 * useFeatureGate Hook (Step 10.1a)
 *
 * Checks the current user's plan against a requested feature and returns
 * gating information including whether the feature is allowed, what plan
 * is required, and whether an upgrade prompt should be shown.
 *
 * @example
 * const { allowed, showUpgrade, featureLabel, requiredPlanLabel } = useFeatureGate('videoBlocks');
 * if (showUpgrade) {
 *   return <UpgradePrompt feature={featureLabel} requiredPlan={requiredPlanLabel} />;
 * }
 */

import { useMemo } from 'react';
import { usePlanSummary } from './usePlanSummary';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// Feature Gate Matrix
// Maps feature name -> { requiredPlan, label }
// ============================================================================

const FEATURE_GATES = {
  videoBlocks: { requiredPlan: 'website_core', label: 'Video Blocks' },
  customCSS: { requiredPlan: 'website_core', label: 'Custom CSS' },
  aiGeneration: { requiredPlan: 'website_core', label: 'AI Generation' },
  collaborators: { requiredPlan: 'website_core', label: 'Collaborators' },
  customDomain: { requiredPlan: 'website_growth', label: 'Custom Domain' },
  seo_advanced: { requiredPlan: 'website_core', label: 'Advanced SEO' },
  delegates: { requiredPlan: 'website_core', label: 'Account Delegates' },
};

// ============================================================================
// Plan Tier Order (lowest to highest)
// ============================================================================

const PLAN_TIER_ORDER = ['website_free', 'website_core', 'website_growth', 'website_agency'];

// ============================================================================
// Plan Display Names for labels
// ============================================================================

const PLAN_DISPLAY_NAMES = {
  website_free: 'Free',
  website_core: 'Core',
  website_growth: 'Growth',
  website_agency: 'Agency',
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useFeatureGate — check if the current user's plan allows a specific feature
 *
 * @param {string} featureName - Feature identifier (e.g., 'videoBlocks', 'customCSS')
 * @returns {{ allowed: boolean, requiredPlan: string, requiredPlanLabel: string, featureLabel: string, loading: boolean, showUpgrade: boolean }}
 */
function useFeatureGate(featureName) {
  const { planSummary, loading } = usePlanSummary();

  // Get user from auth context — safe via useAuth (throws if not in AuthProvider)
  // In tests, this should be mocked via vi.mock('../context/AuthContext')
  const { user } = useAuth();

  const result = useMemo(() => {
    const gate = FEATURE_GATES[featureName];

    // Unknown feature — no gate means no restriction
    if (!gate) {
      return {
        allowed: true,
        requiredPlan: '',
        requiredPlanLabel: '',
        featureLabel: featureName,
        loading,
        showUpgrade: false,
      };
    }

    const featureLabel = gate.label;
    const requiredPlan = gate.requiredPlan;
    const requiredPlanLabel = PLAN_DISPLAY_NAMES[requiredPlan] ?? requiredPlan;

    // While loading, show as not allowed but don't show upgrade UI yet
    if (loading) {
      return {
        allowed: false,
        requiredPlan,
        requiredPlanLabel,
        featureLabel,
        loading: true,
        showUpgrade: false,
      };
    }

    // Admin bypass
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    if (isAdmin) {
      return {
        allowed: true,
        requiredPlan,
        requiredPlanLabel,
        featureLabel,
        loading: false,
        showUpgrade: false,
      };
    }

    // Plan tier comparison
    const currentPlanCode = planSummary?.websitePlan?.code ?? 'website_free';
    const userTierIndex = PLAN_TIER_ORDER.indexOf(currentPlanCode);
    const requiredTierIndex = PLAN_TIER_ORDER.indexOf(requiredPlan);

    // If plan code is unknown, treat as tier -1 (blocked)
    const allowed =
      userTierIndex !== -1 && requiredTierIndex !== -1
        ? userTierIndex >= requiredTierIndex
        : false;

    return {
      allowed,
      requiredPlan,
      requiredPlanLabel,
      featureLabel,
      loading: false,
      showUpgrade: !allowed,
    };
  }, [featureName, loading, planSummary, user]);

  return result;
}

export { useFeatureGate };
export default useFeatureGate;
