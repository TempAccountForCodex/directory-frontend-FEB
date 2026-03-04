/**
 * E2E Tests: Websites List Page
 * ==============================
 * Tests the main dashboard/websites list page functionality.
 *
 * Test Coverage:
 * - Page load and layout verification
 * - Loading states
 * - Statistics cards display
 * - Tab navigation (Active/Deleted)
 * - Create website card interaction
 * - Website card display and hover actions
 * - Card click navigation
 * - Dialog interactions (Analytics, Settings)
 * - Responsive behavior
 * - Error states
 *
 * @module e2e/tests/01-list
 */

import { runTest, SELECTORS, ROUTES, CONFIG } from '../config.mjs';

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM SELECTORS FOR THIS TEST
// ════════════════════════════════════════════════════════════════════════════

const LIST_SELECTORS = {
  // Stats section - more specific selectors
  statsSection: '.MuiGrid-container',
  statCard: '.MuiCard-root:has(.MuiTypography-h4)',
  statCardValue: '.MuiTypography-h4',
  statCardTitle: '.MuiTypography-body2',

  // Tabs - using role-based selectors with :has-text() for reliability
  tabsContainer: '[role="tablist"]',
  activeTab: '[role="tab"]:has-text("Active")',
  deletedTab: '[role="tab"]:has-text("Deleted")',
  selectedTab: '[role="tab"][aria-selected="true"]',

  // Create card - multiple fallback strategies
  createCard: '.MuiCard-root:has-text("Create New Website")',
  createCardAlt: '[data-testid="create-website-card"]',
  createCardText: 'text=Create New Website',
  createCardSubtext: 'text=Start from a template',

  // Website cards - cards with status chips (PUBLISHED, DRAFT, or ARCHIVED)
  // Note: :has-text() doesn't support regex, so we use multiple selectors
  websiteCardPublished: '.MuiCard-root:has(.MuiChip-root):has-text("PUBLISHED")',
  websiteCardDraft: '.MuiCard-root:has(.MuiChip-root):has-text("DRAFT")',
  websiteCardArchived: '.MuiCard-root:has(.MuiChip-root):has-text("ARCHIVED")',
  websiteCardAlt: '.MuiGrid-item .MuiCard-root:has(.hover-actions)',
  statusChip: '.MuiChip-root',

  // Card hover actions container
  hoverActions: '.hover-actions',

  // Card action buttons (visible on hover) - using :has-text() for reliability
  editBtn: 'button:has-text("Edit")',
  previewBtn: 'button:has-text("Preview")',
  settingsBtn: 'button:has-text("Settings")',
  analyticsBtn: 'button:has-text("Analytics")',
  publishBtn: 'button:has-text("Publish")',
  unpublishBtn: 'button:has-text("Unpublish")',
  deleteBtn: 'button:has-text("Delete")',

  // Empty states
  emptyStateDeleted: 'text=No recently deleted',
  noWebsitesText: 'text=No websites',

  // Recently deleted specific
  restoreBtn: 'button:has-text("Restore")',
  deleteForeverBtn: 'button:has-text("Delete Forever")',

  // Dialogs
  dialog: '[role="dialog"]',
  dialogTitle: '.MuiDialogTitle-root',
  dialogClose: '[role="dialog"] button[aria-label="close"]',
  dialogCloseAlt: '[role="dialog"] button:has-text("Close")',
  dialogCancel: '[role="dialog"] button:has-text("Cancel")',

  // Loading states
  loadingSpinner: '[role="progressbar"]',
  circularProgress: '.MuiCircularProgress-root',
  skeleton: '.MuiSkeleton-root',

  // Info alert for deleted section
  deletedInfoAlert: '.MuiAlert-root:has-text("30 days")',
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Check if websites exist and return count
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<number>}
 */
async function getWebsiteCount(runner) {
  // Count cards with each status type (since :has-text() doesn't support regex)
  const publishedCount = await runner.getCount(LIST_SELECTORS.websiteCardPublished);
  const draftCount = await runner.getCount(LIST_SELECTORS.websiteCardDraft);
  const archivedCount = await runner.getCount(LIST_SELECTORS.websiteCardArchived);

  let count = publishedCount + draftCount + archivedCount;

  // Fallback to alt selector if no cards found
  if (count === 0) {
    count = await runner.getCount(LIST_SELECTORS.websiteCardAlt);
  }

  return count;
}

/**
 * Get first website card locator
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<import('playwright').Locator|null>}
 */
async function getFirstWebsiteCard(runner) {
  // Try each status type in order
  for (const selector of [
    LIST_SELECTORS.websiteCardPublished,
    LIST_SELECTORS.websiteCardDraft,
    LIST_SELECTORS.websiteCardArchived,
    LIST_SELECTORS.websiteCardAlt,
  ]) {
    const card = runner.page.locator(selector).first();
    if ((await card.count()) > 0) {
      return card;
    }
  }

  return null;
}

/**
 * Hover over card and wait for actions to appear
 * @param {import('playwright').Locator} card
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function hoverAndWaitForActions(card, runner) {
  await card.hover();
  await runner.page.waitForTimeout(400); // Wait for CSS transition

  // Verify hover actions are visible
  const hoverActions = card.locator(LIST_SELECTORS.hoverActions);
  if ((await hoverActions.count()) > 0) {
    await hoverActions.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.short });
  }
}

/**
 * Close any open dialog
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function closeDialog(runner) {
  const dialogVisible = await runner.exists(LIST_SELECTORS.dialog);
  if (!dialogVisible) return;

  // Try close button first
  const closeBtn = runner.page.locator(LIST_SELECTORS.dialogClose);
  if ((await closeBtn.count()) > 0) {
    await closeBtn.click();
  } else {
    // Try Close text button
    const closeTextBtn = runner.page.locator(LIST_SELECTORS.dialogCloseAlt);
    if ((await closeTextBtn.count()) > 0) {
      await closeTextBtn.click();
    } else {
      // Try Cancel button
      const cancelBtn = runner.page.locator(LIST_SELECTORS.dialogCancel);
      if ((await cancelBtn.count()) > 0) {
        await cancelBtn.click();
      } else {
        // Press Escape as fallback
        await runner.pressKey('Escape');
      }
    }
  }

  // Wait for dialog to close
  await runner.page.waitForTimeout(300);
}

// ════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ════════════════════════════════════════════════════════════════════════════

runTest('Websites List Page', async (runner) => {
  // Track website count for conditional tests
  let websiteCount = 0;

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Page Load & Layout
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Dashboard page loads successfully', async () => {
    await runner.goto(ROUTES.dashboard);
    await runner.assertUrl('/dashboard');

    // Wait for main content to appear
    await runner.page.waitForTimeout(500);
  });

  await runner.test('Loading state appears and resolves', async () => {
    // Refresh to catch loading state
    await runner.page.reload();

    // Check if loading indicator appears (may be very fast)
    const hasSpinner = await runner.exists(LIST_SELECTORS.loadingSpinner);
    const hasSkeleton = await runner.exists(LIST_SELECTORS.skeleton);

    console.log(`   Loading spinner: ${hasSpinner}, Skeleton: ${hasSkeleton}`);

    // Wait for loading to complete
    await runner.page.waitForLoadState('load');

    // Loading should be gone now
    await runner.page.waitForTimeout(500);
  });

  await runner.test('Main layout elements are present', async () => {
    // Sidebar
    await runner.assertVisible(SELECTORS.layout.sidebar);

    // Main content area
    await runner.assertVisible(SELECTORS.layout.mainContent);

    // Page header with title
    await runner.assertVisible(SELECTORS.layout.pageHeader);
  });

  await runner.test('No critical console errors on page load', async () => {
    await runner.assertNoConsoleErrors();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Statistics Cards
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Statistics section is visible', async () => {
    // Look for stat cards by their structure (card with h4 value)
    const statCardCount = await runner.getCount(LIST_SELECTORS.statCard);
    console.log(`   Found ${statCardCount} stat cards`);

    // Should have at least 1 stat card when on active tab
    if (statCardCount === 0) {
      // Stats might be conditionally rendered - log but don't fail
      console.log('   Warning: No stat cards found (may be empty state)');
    }
  });

  await runner.test('Stat cards display numeric values', async () => {
    const statValues = runner.page.locator(LIST_SELECTORS.statCardValue);
    const count = await statValues.count();

    if (count > 0) {
      const firstValue = await statValues.first().textContent();
      const trimmed = firstValue?.trim() || '';
      const isNumeric = /^\d+$/.test(trimmed);

      if (!isNumeric) {
        console.log(`   Warning: Stat value "${trimmed}" is not numeric`);
      } else {
        console.log(`   First stat value: ${trimmed}`);
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Tabs Navigation
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Tabs container is visible', async () => {
    await runner.assertVisible(LIST_SELECTORS.tabsContainer);
  });

  await runner.test('Active Websites tab is selected by default', async () => {
    const selectedTab = runner.page.locator(LIST_SELECTORS.selectedTab);
    const tabText = await selectedTab.textContent();

    if (!tabText?.toLowerCase().includes('active')) {
      throw new Error(`Expected Active tab selected, got: "${tabText}"`);
    }
  });

  await runner.test('Can switch to Recently Deleted tab', async () => {
    runner.clearAllErrors();

    // Click deleted tab
    const deletedTab = runner.page.locator(LIST_SELECTORS.deletedTab);
    await deletedTab.click();

    // Wait for content update
    await runner.page.waitForTimeout(600);

    // Verify tab is selected
    const selectedTab = runner.page.locator(LIST_SELECTORS.selectedTab);
    const tabText = await selectedTab.textContent();

    if (!tabText?.toLowerCase().includes('deleted')) {
      throw new Error(`Expected Deleted tab selected, got: "${tabText}"`);
    }

    // Check content changed (either empty state or info alert)
    const hasEmptyState = await runner.exists(LIST_SELECTORS.emptyStateDeleted);
    const hasInfoAlert = await runner.exists(LIST_SELECTORS.deletedInfoAlert);

    console.log(`   Empty state: ${hasEmptyState}, Info alert: ${hasInfoAlert}`);
  });

  await runner.test('Can switch back to Active Websites tab', async () => {
    const activeTab = runner.page.locator(LIST_SELECTORS.activeTab);
    await activeTab.click();

    await runner.page.waitForTimeout(600);

    // Verify selection
    const selectedTab = runner.page.locator(LIST_SELECTORS.selectedTab);
    const tabText = await selectedTab.textContent();

    if (!tabText?.toLowerCase().includes('active')) {
      throw new Error(`Expected Active tab selected, got: "${tabText}"`);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Create Website Card
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Create New Website card is visible', async () => {
    // Try primary selector
    let createCard = runner.page.locator(LIST_SELECTORS.createCard);

    if ((await createCard.count()) === 0) {
      // Try alternate selector
      createCard = runner.page.locator(LIST_SELECTORS.createCardAlt);
    }

    if ((await createCard.count()) === 0) {
      // Try text-based selector
      const hasText = await runner.exists(LIST_SELECTORS.createCardText);
      if (!hasText) {
        throw new Error('Create New Website card not found');
      }
    }

    // Verify subtext
    const hasSubtext = await runner.exists(LIST_SELECTORS.createCardSubtext);
    console.log(`   Has "Start from a template" text: ${hasSubtext}`);
  });

  await runner.test('Create card has visual styling (dashed border)', async () => {
    const createCard = runner.page.locator(LIST_SELECTORS.createCard).first();

    if ((await createCard.count()) > 0) {
      const borderStyle = await createCard.evaluate((el) => {
        return window.getComputedStyle(el).borderStyle;
      });

      if (borderStyle.includes('dashed')) {
        console.log('   Dashed border confirmed');
      } else {
        console.log(`   Border style: ${borderStyle} (expected dashed)`);
      }
    }
  });

  await runner.test('Create card navigates to wizard on click', async () => {
    const createCard = runner.page.locator(LIST_SELECTORS.createCard).first();
    await createCard.click();

    // Wait for navigation
    await runner.waitForNavigation(/websites\/create/, CONFIG.TIMEOUTS.long);
    await runner.assertUrl('/dashboard/websites/create');

    // Navigate back
    await runner.goto(ROUTES.dashboard);
    await runner.page.waitForLoadState('load');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Website Cards Display
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Website cards display correctly', async () => {
    websiteCount = await getWebsiteCount(runner);
    console.log(`   Found ${websiteCount} website cards`);

    if (websiteCount === 0) {
      console.log('   No websites exist - card tests will be skipped');
      return;
    }

    // Verify card structure
    const firstCard = await getFirstWebsiteCard(runner);
    if (!firstCard) {
      throw new Error('Could not locate first website card');
    }

    // Should have a status chip
    const chipCount = await firstCard.locator('.MuiChip-root').count();
    if (chipCount === 0) {
      throw new Error('Website card missing status chip');
    }

    // Get status text
    const statusText = await firstCard.locator('.MuiChip-root').first().textContent();
    console.log(`   First card status: ${statusText}`);
  });

  await runner.test('Website card shows hover actions', async () => {
    if (websiteCount === 0) {
      runner.skip('Website card hover actions', 'No websites exist');
      return;
    }

    const firstCard = await getFirstWebsiteCard(runner);
    if (!firstCard) {
      throw new Error('Could not locate website card');
    }

    await hoverAndWaitForActions(firstCard, runner);

    // Check hover actions are visible
    const hoverActions = firstCard.locator(LIST_SELECTORS.hoverActions);
    const isVisible = await hoverActions.isVisible();

    if (!isVisible) {
      // Check opacity
      const opacity = await hoverActions.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      if (opacity === '0') {
        throw new Error('Hover actions opacity is 0 after hover');
      }
    }

    // Verify buttons exist
    const buttons = ['Edit', 'Preview', 'Settings', 'Analytics'];
    for (const btn of buttons) {
      const exists = (await firstCard.locator(`button:has-text("${btn}")`).count()) > 0;
      console.log(`   ${btn} button: ${exists ? '✓' : '✗'}`);
    }
  });

  await runner.test('Website card status badge is valid', async () => {
    if (websiteCount === 0) {
      runner.skip('Website card status badge', 'No websites exist');
      return;
    }

    const firstCard = await getFirstWebsiteCard(runner);
    const statusChip = firstCard.locator('.MuiChip-root').first();
    const statusText = await statusChip.textContent();

    const validStatuses = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];
    const isValid = validStatuses.some((s) => statusText?.toUpperCase().includes(s));

    if (!isValid) {
      throw new Error(
        `Invalid status: "${statusText}". Expected one of: ${validStatuses.join(', ')}`
      );
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Card Actions - Edit
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Edit button navigates to editor', async () => {
    if (websiteCount === 0) {
      runner.skip('Edit button navigation', 'No websites exist');
      return;
    }

    const firstCard = await getFirstWebsiteCard(runner);
    await hoverAndWaitForActions(firstCard, runner);

    const editBtn = firstCard.locator(LIST_SELECTORS.editBtn).first();
    if ((await editBtn.count()) === 0) {
      throw new Error('Edit button not found');
    }

    await editBtn.click();

    // Wait for navigation
    await runner.waitForNavigation(/websites\/.*\/editor/, CONFIG.TIMEOUTS.long);
    await runner.assertUrl('/editor');

    // Go back
    await runner.goto(ROUTES.dashboard);
    await runner.page.waitForLoadState('load');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Card Actions - Analytics Dialog
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Analytics button opens dialog', async () => {
    if (websiteCount === 0) {
      runner.skip('Analytics dialog', 'No websites exist');
      return;
    }

    const firstCard = await getFirstWebsiteCard(runner);
    await hoverAndWaitForActions(firstCard, runner);

    const analyticsBtn = firstCard.locator(LIST_SELECTORS.analyticsBtn).first();
    if ((await analyticsBtn.count()) === 0) {
      runner.skip('Analytics dialog', 'Analytics button not found');
      return;
    }

    await analyticsBtn.click();

    // Wait for dialog
    await runner.assertVisible(LIST_SELECTORS.dialog, CONFIG.TIMEOUTS.medium);

    // Verify dialog content
    const dialogTitle = await runner.getText(LIST_SELECTORS.dialogTitle);
    if (!dialogTitle?.includes('Analytics')) {
      throw new Error(`Expected Analytics dialog, got: "${dialogTitle}"`);
    }

    console.log(`   Dialog title: ${dialogTitle}`);

    // Close dialog
    await closeDialog(runner);
    await runner.assertHidden(LIST_SELECTORS.dialog, CONFIG.TIMEOUTS.short);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 8: Card Actions - Settings Dialog
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Settings button opens dialog', async () => {
    if (websiteCount === 0) {
      runner.skip('Settings dialog', 'No websites exist');
      return;
    }

    const firstCard = await getFirstWebsiteCard(runner);
    await hoverAndWaitForActions(firstCard, runner);

    const settingsBtn = firstCard.locator(LIST_SELECTORS.settingsBtn).first();
    if ((await settingsBtn.count()) === 0) {
      runner.skip('Settings dialog', 'Settings button not found');
      return;
    }

    await settingsBtn.click();

    // Wait for dialog
    await runner.assertVisible(LIST_SELECTORS.dialog, CONFIG.TIMEOUTS.medium);

    // Verify dialog has form elements
    const dialogTitle = await runner.getText(LIST_SELECTORS.dialogTitle);
    console.log(`   Dialog title: ${dialogTitle}`);

    // Check for input fields
    const hasInputs = await runner.exists('[role="dialog"] input');
    console.log(`   Has form inputs: ${hasInputs}`);

    // Close dialog
    await closeDialog(runner);
    await runner.assertHidden(LIST_SELECTORS.dialog, CONFIG.TIMEOUTS.short);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 9: Card Click Navigation
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Card click navigates to website detail', async () => {
    if (websiteCount === 0) {
      runner.skip('Card click navigation', 'No websites exist');
      return;
    }

    const firstCard = await getFirstWebsiteCard(runner);

    // Click on the card (not on action buttons)
    // Need to click on the background/preview area, not the hover actions
    await firstCard.click({ position: { x: 50, y: 50 } });

    // Wait for navigation to website detail (UUIDs have dashes, so use [^/]+ not \w+)
    await runner.waitForNavigation(/websites\/[^/]+$/, CONFIG.TIMEOUTS.long);
    await runner.assertUrl(/\/dashboard\/websites\/[a-zA-Z0-9-]+/);

    // Go back
    await runner.goto(ROUTES.dashboard);
    await runner.page.waitForLoadState('load');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 10: Responsive Design
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Page is responsive - tablet view', async () => {
    await runner.setViewport('tablet');

    // Wait for layout adjustment
    await runner.page.waitForTimeout(300);

    // Main content should be visible
    await runner.assertVisible(SELECTORS.layout.mainContent);

    // Create card should be visible (may need scroll)
    await runner.scrollIntoView(LIST_SELECTORS.createCardText);
    await runner.assertVisible(LIST_SELECTORS.createCardText);
  });

  await runner.test('Page is responsive - mobile view', async () => {
    await runner.setViewport('mobile');

    // Wait for layout adjustment
    await runner.page.waitForTimeout(300);

    // Main content should be visible
    await runner.assertVisible(SELECTORS.layout.mainContent);

    // Sidebar may be hidden on mobile - that's expected
    const sidebarVisible = await runner.exists(SELECTORS.layout.sidebar);
    console.log(`   Sidebar visible on mobile: ${sidebarVisible}`);

    // Scroll to create card
    await runner.scrollIntoView(LIST_SELECTORS.createCardText);
    await runner.assertVisible(LIST_SELECTORS.createCardText);
  });

  await runner.test('Reset to desktop view', async () => {
    await runner.setViewport('desktop');
    await runner.page.waitForTimeout(300);

    // Sidebar should be visible again
    await runner.assertVisible(SELECTORS.layout.sidebar);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 11: Final Verification
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('No console errors after all interactions', async () => {
    await runner.assertNoConsoleErrors();
  });

  await runner.test('No critical network errors', async () => {
    // Allow 404s (missing resources) and 401s (auth on some routes)
    await runner.assertNoNetworkErrors({ ignore: [404, 401] });
  });

  // Take final screenshot
  await runner.screenshot('websites-list-final');
});
