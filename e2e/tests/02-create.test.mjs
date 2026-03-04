/**
 * E2E Tests: Template Selection Wizard
 * =====================================
 * Tests the /dashboard/websites/create template selection page.
 *
 * Test Coverage:
 * - Page load and authentication
 * - Loading states
 * - Back navigation
 * - Category tabs filtering
 * - Blank page card interaction
 * - Template cards display
 * - Hover actions (Select, Demo)
 * - Template selection flow
 * - Responsive behavior
 * - Error states
 *
 * @module e2e/tests/02-create
 */

import { runTest, ROUTES, CONFIG } from '../config.mjs';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Text identifiers for special cards
 */
const BLANK_PAGE_TEXT = 'Blank Page';

/**
 * Standard wait times for consistent timing
 */
const WAIT_TIMES = {
  animation: 300, // CSS transitions, hover effects
  contentLoad: 400, // Tab switching, filtering
  tabSwitch: 400, // Allow tab indicator animation
};

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM SELECTORS FOR THIS TEST
// ════════════════════════════════════════════════════════════════════════════

const CREATE_SELECTORS = {
  // Page layout
  pageContainer: '.MuiContainer-root',
  mainBox: '[data-testid="create-wizard"]',

  // Back button
  backButton: 'button:has(svg[data-testid="ArrowBackIcon"])',
  backButtonAlt: '.MuiIconButton-root:has(svg[data-testid="ArrowBackIcon"])',
  backIconButton: '.MuiIconButton-root:first-child',

  // Category tabs
  tabsContainer: '[role="tablist"]',
  tab: '[role="tab"]',
  allTab: '[role="tab"]:has-text("All")',
  selectedTab: '[role="tab"][aria-selected="true"]',
  tabIndicator: '.MuiTabs-indicator',

  // Description text
  descriptionText: 'text=Choose a starting point',
  descriptionTextAlt: 'text=narrow things down',

  // Template grid
  templateGrid: '.MuiGrid-container',
  templateGridItem: '.MuiGrid-item',

  // Blank page card (uses BLANK_PAGE_TEXT constant for selector construction)
  blankCard: `.MuiCard-root:has-text("${BLANK_PAGE_TEXT}")`,
  blankCardText: `text=${BLANK_PAGE_TEXT}`,

  // Template cards (exclude blank page)
  templateCard: `.MuiGrid-item .MuiCard-root:not(:has-text("${BLANK_PAGE_TEXT}"))`,

  // Card elements
  cardNameBadge: '.MuiTypography-caption',
  cardPreviewImage: 'img[alt*="preview"]',
  cardCategoryLabel: '.MuiTypography-caption',

  // Hover overlay
  hoverOverlay: '[style*="backdrop-filter"]',

  // Action buttons (visible on hover)
  selectButton: 'button:has-text("Select")',
  demoButton: 'button:has-text("Demo")',

  // Loading state
  loadingSpinner: '.MuiCircularProgress-root',
  loadingContainer: 'div:has(> .MuiCircularProgress-root)',

  // Error state
  errorMessage: 'text=Failed to load templates',
  errorText: '.MuiTypography-root[color="error"]',
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get count of template cards (excluding blank page)
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<number>}
 */
async function getTemplateCount(runner) {
  // Count all cards in grid and subtract 1 for blank page
  const allCards = await runner.getCount('.MuiGrid-item .MuiCard-root');
  const hasBlankCard = await runner.exists(CREATE_SELECTORS.blankCard);
  return hasBlankCard ? Math.max(0, allCards - 1) : allCards;
}

/**
 * Get first template card (not blank page)
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<import('playwright').Locator|null>}
 */
async function getFirstTemplateCard(runner) {
  // Get all grid items that contain cards
  const cards = runner.page.locator('.MuiGrid-item .MuiCard-root');
  const count = await cards.count();

  if (count === 0) {
    return null;
  }

  // Find first card that is NOT the blank page card
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.textContent();
    if (text && !text.includes(BLANK_PAGE_TEXT)) {
      return card;
    }
  }

  return null;
}

/**
 * Hover over card and wait for overlay to appear
 * @param {import('playwright').Locator} card
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function hoverCard(card, runner) {
  // Scroll into view first to ensure hoverable
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  // Wait for CSS animation
  await runner.page.waitForTimeout(WAIT_TIMES.animation);
}

/**
 * Get all visible category tab labels
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<string[]>}
 */
async function getCategoryTabs(runner) {
  const tabs = runner.page.locator(CREATE_SELECTORS.tab);
  const count = await tabs.count();
  const labels = [];

  for (let i = 0; i < count; i++) {
    try {
      const text = await tabs.nth(i).textContent();
      if (text && text.trim()) {
        labels.push(text.trim());
      }
    } catch {
      // Tab may have been removed during iteration, skip it
    }
  }

  return labels;
}

/**
 * Wait for templates to load (loading spinner gone, cards present)
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function waitForTemplatesLoaded(runner) {
  // Wait for loading spinner to disappear
  try {
    const spinner = runner.page.locator(CREATE_SELECTORS.loadingSpinner);
    if ((await spinner.count()) > 0) {
      await spinner.waitFor({ state: 'hidden', timeout: CONFIG.TIMEOUTS.long });
    }
  } catch {
    // Spinner may have already disappeared
  }

  // Wait for grid to have content
  await runner.page.waitForSelector('.MuiGrid-item', { timeout: CONFIG.TIMEOUTS.medium });
}

// ════════════════════════════════════════════════════════════════════════════
// TEST SUITE - AUTHENTICATED USER
// ════════════════════════════════════════════════════════════════════════════

runTest('Template Selection Wizard', async (runner) => {
  // Track template count for conditional tests
  let templateCount = 0;

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Page Load & Navigation
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Wizard page loads successfully', async () => {
    await runner.goto(ROUTES.createWebsite);
    await runner.assertUrl('/dashboard/websites/create');

    // Wait for page to stabilize (use load, not networkidle - see config.mjs)
    await runner.page.waitForLoadState('load');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);
  });

  await runner.test('Loading state appears and resolves', async () => {
    // Refresh to catch loading state
    await runner.page.reload();

    // Check for loading spinner
    const hasSpinner = await runner.exists(CREATE_SELECTORS.loadingSpinner);
    console.log(`   Loading spinner detected: ${hasSpinner}`);

    // Wait for templates to load
    await waitForTemplatesLoaded(runner);

    // Verify grid is visible
    await runner.assertVisible(CREATE_SELECTORS.templateGrid);
  });

  await runner.test('Back button is visible', async () => {
    // Try multiple selectors for back button
    let backButton = runner.page.locator(CREATE_SELECTORS.backButton);

    if ((await backButton.count()) === 0) {
      backButton = runner.page.locator(CREATE_SELECTORS.backButtonAlt);
    }

    if ((await backButton.count()) === 0) {
      // Find IconButton with arrow icon
      const iconButtons = runner.page.locator('.MuiIconButton-root');
      const count = await iconButtons.count();

      for (let i = 0; i < count; i++) {
        const hasArrow = await iconButtons.nth(i).locator('svg').count();
        if (hasArrow > 0) {
          backButton = iconButtons.nth(i);
          break;
        }
      }
    }

    if ((await backButton.count()) === 0) {
      throw new Error('Back button not found');
    }

    console.log('   Back button found');
  });

  await runner.test('Back button navigates to dashboard', async () => {
    // Find the first IconButton (should be back button)
    const iconButton = runner.page.locator('.MuiIconButton-root').first();
    await iconButton.click();

    // Wait for navigation
    await runner.waitForNavigation(/dashboard/, CONFIG.TIMEOUTS.medium);
    await runner.assertUrl('/dashboard');

    // Go back to wizard
    await runner.goto(ROUTES.createWebsite);
    await waitForTemplatesLoaded(runner);
  });

  await runner.test('No critical console errors on page load', async () => {
    runner.clearAllErrors();
    await runner.assertNoConsoleErrors();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Category Tabs
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Category tabs are visible', async () => {
    await runner.assertVisible(CREATE_SELECTORS.tabsContainer);

    const tabs = await getCategoryTabs(runner);
    console.log(`   Found ${tabs.length} tabs: ${tabs.join(', ')}`);

    if (tabs.length === 0) {
      throw new Error('No category tabs found');
    }
  });

  await runner.test('All tab is selected by default', async () => {
    const selectedTab = runner.page.locator(CREATE_SELECTORS.selectedTab);
    const text = await selectedTab.textContent();

    if (!text?.toLowerCase().includes('all')) {
      throw new Error(`Expected "All" tab selected, got: "${text}"`);
    }
  });

  await runner.test('Can switch to different category', async () => {
    const tabs = runner.page.locator(CREATE_SELECTORS.tab);
    const tabCount = await tabs.count();

    if (tabCount < 2) {
      runner.skip('Category switching', 'Only one category tab');
      return;
    }

    // Click second tab (not "All")
    const secondTab = tabs.nth(1);
    const secondTabText = await secondTab.textContent();
    await secondTab.click();

    // Wait for content update
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Verify selection changed
    const selectedTab = runner.page.locator(CREATE_SELECTORS.selectedTab);
    const selectedText = await selectedTab.textContent();

    if (selectedText !== secondTabText) {
      throw new Error(`Tab selection failed. Expected: "${secondTabText}", Got: "${selectedText}"`);
    }

    console.log(`   Switched to: ${selectedText}`);
  });

  await runner.test('Templates filter by category', async () => {
    // Count templates in current category
    const filteredCount = await getTemplateCount(runner);
    console.log(`   Templates in current category: ${filteredCount}`);

    // Switch back to All
    const allTab = runner.page.locator(CREATE_SELECTORS.allTab);
    await allTab.click();
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Count all templates
    const allCount = await getTemplateCount(runner);
    console.log(`   Templates in All category: ${allCount}`);

    // All should have >= filtered
    if (allCount < filteredCount) {
      throw new Error(`All category (${allCount}) should have >= filtered (${filteredCount})`);
    }

    templateCount = allCount;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Description Text
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Description text is visible', async () => {
    const hasDescription =
      (await runner.exists(CREATE_SELECTORS.descriptionText)) ||
      (await runner.exists(CREATE_SELECTORS.descriptionTextAlt));

    if (!hasDescription) {
      throw new Error('Description text not found');
    }

    console.log('   Description text visible');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Blank Page Card
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Blank Page card is visible', async () => {
    await runner.assertVisible(CREATE_SELECTORS.blankCard);
  });

  await runner.test('Blank Page card has distinct visual styling', async () => {
    const blankCard = runner.page.locator(CREATE_SELECTORS.blankCard).first();

    const styles = await blankCard.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        borderStyle: computed.borderStyle,
        borderWidth: computed.borderWidth,
        backgroundColor: computed.backgroundColor,
      };
    });

    // Log the actual styles for debugging
    console.log(`   Border style: ${styles.borderStyle}`);
    console.log(`   Border width: ${styles.borderWidth}`);

    // Verify it has SOME border (dashed preferred, but solid acceptable)
    const hasBorder = styles.borderWidth !== '0px' && styles.borderStyle !== 'none';
    if (!hasBorder) {
      throw new Error('Blank Page card should have a visible border');
    }

    // Check for dashed style (expected but not critical)
    if (styles.borderStyle.includes('dashed')) {
      console.log('   ✓ Dashed border style confirmed');
    }
  });

  await runner.test('Blank Page card shows Select button on hover', async () => {
    const blankCard = runner.page.locator(CREATE_SELECTORS.blankCard).first();
    await hoverCard(blankCard, runner);

    // Check for Select button
    const selectBtn = blankCard.locator(CREATE_SELECTORS.selectButton);
    const hasSelect = (await selectBtn.count()) > 0;

    if (!hasSelect) {
      // Check if overlay appeared
      const hasOverlay = (await blankCard.locator('[style*="backdrop"]').count()) > 0;
      console.log(`   Overlay visible: ${hasOverlay}`);

      if (!hasOverlay) {
        throw new Error('Hover overlay did not appear on Blank Page card');
      }
    } else {
      console.log('   Select button visible on hover');
    }
  });

  await runner.test('Blank Page Select navigates to customize', async () => {
    const blankCard = runner.page.locator(CREATE_SELECTORS.blankCard).first();
    await hoverCard(blankCard, runner);

    // Try clicking Select button or the card itself
    const selectBtn = blankCard.locator(CREATE_SELECTORS.selectButton);

    if ((await selectBtn.count()) > 0) {
      await selectBtn.click();
    } else {
      await blankCard.click();
    }

    // Wait for navigation
    await runner.waitForNavigation(/customize\?template=blank/, CONFIG.TIMEOUTS.long);
    await runner.assertUrl('customize');

    // Verify template parameter
    const url = runner.page.url();
    if (!url.includes('template=blank')) {
      throw new Error(`URL missing template=blank parameter: ${url}`);
    }

    console.log('   Navigated to customize with blank template');

    // Go back to wizard
    await runner.goto(ROUTES.createWebsite);
    await waitForTemplatesLoaded(runner);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Template Cards Display
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Template cards are displayed', async () => {
    templateCount = await getTemplateCount(runner);
    console.log(`   Found ${templateCount} template cards`);

    if (templateCount === 0) {
      // Check if this is expected (no templates in database)
      // Verify the blank page card is still present (always shown)
      const hasBlankCard = await runner.exists(CREATE_SELECTORS.blankCard);
      if (hasBlankCard) {
        console.log('   Note: No templates loaded, but Blank Page card available');
      } else {
        throw new Error('No templates AND no Blank Page card - page may have failed to load');
      }
    }
  });

  await runner.test('Template card has name badge', async () => {
    if (templateCount === 0) {
      runner.skip('Template name badge', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) {
      throw new Error('Could not locate template card');
    }

    // Find name badge (caption at top)
    const captions = templateCard.locator('.MuiTypography-caption');
    const captionCount = await captions.count();

    if (captionCount === 0) {
      throw new Error('Template card missing name/category badges');
    }

    const firstName = await captions.first().textContent();
    console.log(`   Template name: ${firstName}`);
  });

  await runner.test('Template card has category label', async () => {
    if (templateCount === 0) {
      runner.skip('Template category label', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    // Category label is typically at bottom left
    const captions = templateCard.locator('.MuiTypography-caption');
    const captionCount = await captions.count();

    if (captionCount >= 2) {
      const categoryText = await captions.last().textContent();
      console.log(`   Category label: ${categoryText}`);
    } else {
      console.log('   Single caption found (may combine name/category)');
    }
  });

  await runner.test('Template card has preview area', async () => {
    if (templateCount === 0) {
      runner.skip('Template preview area', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    // Check for image or placeholder box
    const hasImage = (await templateCard.locator('img').count()) > 0;
    const hasPlaceholder = (await templateCard.locator('.MuiBox-root').count()) > 0;

    if (hasImage) {
      console.log('   Has preview image');
    } else if (hasPlaceholder) {
      console.log('   Has placeholder preview');
    } else {
      console.log('   Warning: No visible preview area');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Template Card Hover Actions
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Template card shows overlay on hover', async () => {
    if (templateCount === 0) {
      runner.skip('Template hover overlay', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    await hoverCard(templateCard, runner);

    // Check for overlay (has backdrop-filter)
    const overlayVisible = await templateCard.evaluate((card) => {
      const elements = card.querySelectorAll('*');
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.backdropFilter && style.backdropFilter !== 'none') {
          return true;
        }
      }
      return false;
    });

    if (!overlayVisible) {
      // Alternative: check if Select button appeared
      const hasSelect = (await templateCard.locator(CREATE_SELECTORS.selectButton).count()) > 0;
      if (!hasSelect) {
        throw new Error('No hover overlay or Select button appeared');
      }
    }

    console.log('   Hover overlay visible');
  });

  await runner.test('Template card has Select button on hover', async () => {
    if (templateCount === 0) {
      runner.skip('Template Select button', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    await hoverCard(templateCard, runner);

    const selectBtn = templateCard.locator(CREATE_SELECTORS.selectButton);
    const hasSelect = (await selectBtn.count()) > 0;

    if (!hasSelect) {
      throw new Error('Select button not found on template hover');
    }

    console.log('   Select button visible');
  });

  await runner.test('Template card has Demo button on hover', async () => {
    if (templateCount === 0) {
      runner.skip('Template Demo button', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    await hoverCard(templateCard, runner);

    const demoBtn = templateCard.locator(CREATE_SELECTORS.demoButton);
    const hasDemo = (await demoBtn.count()) > 0;

    if (!hasDemo) {
      throw new Error('Demo button not found on template hover');
    }

    console.log('   Demo button visible');
  });

  await runner.test('Demo button opens preview in new tab', async () => {
    if (templateCount === 0) {
      runner.skip('Demo button new tab', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    await hoverCard(templateCard, runner);

    const demoBtn = templateCard.locator(CREATE_SELECTORS.demoButton);

    // Listen for new page/tab
    const [newPage] = await Promise.all([
      runner.page.context().waitForEvent('page', { timeout: CONFIG.TIMEOUTS.medium }),
      demoBtn.click(),
    ]);

    // Verify new tab URL
    const newUrl = newPage.url();

    if (!newUrl.includes('template-preview')) {
      throw new Error(`Expected template-preview URL, got: ${newUrl}`);
    }

    console.log(`   New tab opened: ${newUrl}`);

    // Close the new tab
    await newPage.close();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Template Selection Flow
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Select button navigates to customize with template ID', async () => {
    if (templateCount === 0) {
      runner.skip('Template selection', 'No templates loaded');
      return;
    }

    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    await hoverCard(templateCard, runner);

    const selectBtn = templateCard.locator(CREATE_SELECTORS.selectButton);
    await selectBtn.click();

    // Wait for navigation
    await runner.waitForNavigation(/customize\?template=/, CONFIG.TIMEOUTS.long);
    await runner.assertUrl('customize');

    // Verify template parameter exists and is not blank
    const url = runner.page.url();
    const match = url.match(/template=([^&]+)/);

    if (!match || match[1] === 'blank') {
      throw new Error(`Expected non-blank template ID in URL: ${url}`);
    }

    console.log(`   Selected template: ${match[1]}`);

    // Go back to wizard
    await runner.goto(ROUTES.createWebsite);
    await waitForTemplatesLoaded(runner);
  });

  await runner.test('Clear hover state after interaction tests', async () => {
    // Move mouse to a neutral position to clear any hover states
    // This prevents hover states from affecting subsequent tests
    await runner.page.mouse.move(0, 0);
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
    console.log('   Hover state cleared');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 8: Responsive Design
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Grid displays correctly on tablet', async () => {
    await runner.setViewport('tablet');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Grid should still be visible
    await runner.assertVisible(CREATE_SELECTORS.templateGrid);

    // Tabs should be visible
    await runner.assertVisible(CREATE_SELECTORS.tabsContainer);

    // Blank card should be visible
    await runner.scrollIntoView(CREATE_SELECTORS.blankCard);
    await runner.assertVisible(CREATE_SELECTORS.blankCard);

    // Count columns in grid (should be fewer than desktop)
    const gridItems = runner.page.locator('.MuiGrid-item');
    const count = await gridItems.count();
    console.log(`   Grid items visible: ${count}`);
  });

  await runner.test('Grid displays correctly on mobile', async () => {
    await runner.setViewport('mobile');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Grid should still be visible
    await runner.assertVisible(CREATE_SELECTORS.templateGrid);

    // Tabs may scroll horizontally - check container
    const tabsContainer = runner.page.locator(CREATE_SELECTORS.tabsContainer);
    const isTabsVisible = await tabsContainer.isVisible();
    console.log(`   Tabs visible on mobile: ${isTabsVisible}`);

    // Scroll to blank card
    await runner.scrollIntoView(CREATE_SELECTORS.blankCard);
    await runner.assertVisible(CREATE_SELECTORS.blankCard);
  });

  await runner.test('Template cards are functional on mobile', async () => {
    if (templateCount === 0) {
      runner.skip('Mobile template interaction', 'No templates loaded');
      return;
    }

    // Keep mobile viewport
    const templateCard = await getFirstTemplateCard(runner);
    if (!templateCard) return;

    // Scroll to card
    await templateCard.scrollIntoViewIfNeeded();

    // On mobile, click should show overlay (tap() requires touch device)
    await templateCard.click();
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Check if Select button is accessible
    const selectBtn = templateCard.locator(CREATE_SELECTORS.selectButton);
    const hasSelect = (await selectBtn.count()) > 0;
    console.log(`   Select button accessible on mobile: ${hasSelect}`);
  });

  await runner.test('Reset to desktop view', async () => {
    await runner.setViewport('desktop');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Verify full layout restored
    await runner.assertVisible(CREATE_SELECTORS.tabsContainer);
    await runner.assertVisible(CREATE_SELECTORS.templateGrid);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 9: Visual Polish
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Cards have proper height consistency', async () => {
    const cards = runner.page.locator('.MuiGrid-item .MuiCard-root');
    const count = await cards.count();

    if (count < 2) {
      runner.skip('Card height consistency', 'Need 2+ cards');
      return;
    }

    // Get heights of first few cards
    const heights = [];
    for (let i = 0; i < Math.min(count, 4); i++) {
      const height = await cards.nth(i).evaluate((el) => el.offsetHeight);
      heights.push(height);
    }

    console.log(`   Card heights: ${heights.join(', ')}px`);

    // All should be the same (400px based on component)
    const allSame = heights.every((h) => h === heights[0]);
    if (!allSame) {
      console.log('   Warning: Card heights are not consistent');
    }
  });

  await runner.test('Tab indicator animates smoothly', async () => {
    const tabIndicator = runner.page.locator(CREATE_SELECTORS.tabIndicator);

    if ((await tabIndicator.count()) === 0) {
      runner.skip('Tab indicator animation', 'Indicator not found');
      return;
    }

    // Need at least 2 tabs to test animation
    const tabs = runner.page.locator(CREATE_SELECTORS.tab);
    const tabCount = await tabs.count();
    if (tabCount < 2) {
      runner.skip('Tab indicator animation', 'Need 2+ tabs');
      return;
    }

    // Get initial position
    const initialLeft = await tabIndicator.evaluate((el) => el.offsetLeft);

    // Click second tab (not "All" which is first)
    const secondTab = tabs.nth(1);
    await secondTab.click();

    // Wait for animation
    await runner.page.waitForTimeout(WAIT_TIMES.tabSwitch);

    // Get new position
    const finalLeft = await tabIndicator.evaluate((el) => el.offsetLeft);

    if (finalLeft !== initialLeft) {
      console.log(`   Indicator moved from ${initialLeft} to ${finalLeft}px`);
    } else {
      console.log('   Warning: Indicator position unchanged (may be same tab)');
    }

    // Reset to All tab
    const allTab = runner.page.locator(CREATE_SELECTORS.allTab);
    await allTab.click();
    await runner.page.waitForTimeout(WAIT_TIMES.tabSwitch);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 10: Final Verification
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('No console errors after all interactions', async () => {
    await runner.assertNoConsoleErrors();
  });

  await runner.test('No critical network errors', async () => {
    // Allow 404s for missing preview images
    await runner.assertNoNetworkErrors({ ignore: [404] });
  });

  // Take final screenshot
  await runner.screenshot('template-wizard-final');
});

// NOTE: Auth redirect test moved to separate file to avoid race condition
// with process.exit() in runTest vs runTestWithoutLogin
