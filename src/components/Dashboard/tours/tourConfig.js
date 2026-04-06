/**
 * Tour Configuration
 *
 * Defines all feature tours and onboarding tasks for the Techietribe dashboard.
 * Each tour maps to a series of tooltip steps targeting specific DOM elements.
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

/**
 * Tour definitions keyed by tourId.
 * Each step targets a CSS selector and provides contextual help.
 */
export const TOUR_DEFINITIONS = {
  'block-library': {
    id: 'block-library',
    title: 'Block Library',
    description: 'Discover all available content blocks for your website',
    steps: [
      {
        target: '[data-tour="block-library-panel"]',
        title: 'Block Library',
        description: 'Browse and add content blocks to your page from the sidebar.',
        placement: 'right',
      },
      {
        target: '[data-tour="block-search"]',
        title: 'Search Blocks',
        description: 'Quickly find the right block by searching by name or category.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="block-drag-handle"]',
        title: 'Drag & Drop',
        description: 'Drag any block onto your page canvas to add it to your layout.',
        placement: 'right',
      },
    ],
  },
  'theme-manager': {
    id: 'theme-manager',
    title: 'Theme Manager',
    description: 'Customize your website colors, fonts and branding',
    steps: [
      {
        target: '[data-tour="theme-panel"]',
        title: 'Theme Settings',
        description: 'Choose colors, fonts and spacing to match your brand identity.',
        placement: 'right',
      },
      {
        target: '[data-tour="theme-presets"]',
        title: 'Theme Presets',
        description: 'Start from a curated preset and fine-tune to your taste.',
        placement: 'bottom',
      },
    ],
  },
  collaboration: {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Invite teammates and manage permissions',
    steps: [
      {
        target: '[data-tour="collaborators-tab"]',
        title: 'Collaborators',
        description: 'Invite team members to work on your website together.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="invite-button"]',
        title: 'Invite by Email',
        description: 'Send an email invite with a specific role — Editor, Viewer or Admin.',
        placement: 'left',
      },
      {
        target: '[data-tour="permissions-grid"]',
        title: 'Role Permissions',
        description:
          'Each role comes with preset permissions. You can also create custom roles.',
        placement: 'top',
      },
    ],
  },
};

/**
 * Onboarding task checklist — 5 tasks matching the OnboardingStep enum.
 * Used by TaskChecklist component.
 */
export const ONBOARDING_TASKS = [
  {
    id: 'ACCOUNT_CREATED',
    label: 'Create your account',
    description: 'You already completed this step — welcome aboard!',
    checkKey: 'ACCOUNT_CREATED',
  },
  {
    id: 'FIRST_TEMPLATE',
    label: 'Choose a template',
    description: 'Pick a starter template to kick off your website design.',
    checkKey: 'FIRST_TEMPLATE',
  },
  {
    id: 'FIRST_WEBSITE',
    label: 'Create your first website',
    description: 'Build your site by adding and customising content blocks.',
    checkKey: 'FIRST_WEBSITE',
  },
  {
    id: 'FIRST_PUBLISH',
    label: 'Publish your website',
    description: 'Make your website live so the world can find it.',
    checkKey: 'FIRST_PUBLISH',
  },
  {
    id: 'COMPLETE',
    label: 'Complete onboarding',
    description: "Finish the welcome tour to unlock all dashboard features.",
    checkKey: 'COMPLETE',
  },
];
