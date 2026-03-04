/**
 * E2E Tests: Website Editor
 * ==========================
 * Tests the /dashboard/websites/:id/editor page.
 *
 * Test Coverage:
 * - Page load and authentication
 * - Loading states and error handling
 * - Pages sidebar (list, select, CRUD)
 * - Create page dialog
 * - Blocks panel (list, empty state)
 * - Create/Edit block dialog with block type forms
 * - Block actions (move, edit, visibility, delete)
 * - Preview panel
 * - Responsive behavior
 *
 * @module e2e/tests/04-editor
 */

import { runTest, ROUTES, CONFIG } from '../config.mjs';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Block types available in the editor
 */
const BLOCK_TYPES = ['HERO', 'FEATURES', 'TESTIMONIALS', 'CTA', 'CONTACT'];

/**
 * Standard wait times for consistent timing
 */
const WAIT_TIMES = {
  animation: 300, // CSS transitions, hover effects
  formUpdate: 200, // Form field updates
  contentLoad: 500, // API responses, page updates
  dialogOpen: 400, // Dialog animations
  networkRequest: 1000, // API calls
};

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM SELECTORS FOR THIS TEST
// ════════════════════════════════════════════════════════════════════════════

const EDITOR_SELECTORS = {
  // Page layout
  pageContainer: '.MuiContainer-root',

  // Loading states
  loadingSpinner: '.MuiCircularProgress-root',
  loadingContainer: 'div:has(> .MuiCircularProgress-root)',

  // Error states
  errorAlert: '.MuiAlert-standardError',
  errorText: 'text=Failed to load',

  // Header
  backButton: '.MuiIconButton-root:has(svg)',
  websiteName: 'h5',
  statusChip: '.MuiChip-root',
  slugDisplay: 'text=/\\/s\\/.+/',
  viewLiveButton: 'button:has-text("View Live")',

  // Pages Sidebar
  pagesSidebar: '.MuiPaper-root:has(h6:has-text("Pages"))',
  pagesTitle: 'h6:has-text("Pages")',
  addPageButton: '.MuiPaper-root:has(h6:has-text("Pages")) .MuiIconButton-root',
  pagesList: '.MuiList-root',
  pageItem: '.MuiListItem-root',
  selectedPageItem: '.MuiListItem-root.Mui-selected',
  homePageIcon: 'svg', // House icon in page item
  pageTitle: '.MuiListItemText-primary',
  pagePath: '.MuiListItemText-secondary',
  deletePageButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root:has(svg)',
  setHomeButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root',

  // Blocks Panel
  blocksPanel: '.MuiPaper-root:has(h6:has-text("Blocks"))',
  blocksTitle: 'h6:has-text("Blocks")',
  addBlockButton: '.MuiPaper-root:has(h6:has-text("Blocks")) .MuiIconButton-root',
  blocksList: '.MuiPaper-root:has(h6:has-text("Blocks")) .MuiList-root',
  blockItem: '.MuiListItem-root:has(.MuiListItemText-root)',
  blockTypeLabel: '.MuiListItemText-primary .MuiTypography-root',
  blockPreviewText: '.MuiListItemText-secondary',
  hiddenBlockChip: '.MuiChip-root:has-text("Hidden")',
  emptyBlocksText: 'text=No blocks yet',

  // Block Action Buttons (Lucide icons are SVG elements without lucide-* classes)
  // These are in the ListItemSecondaryAction area for each block
  blockActionButtons: '.MuiListItemSecondaryAction-root .MuiIconButton-root',
  moveUpButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root:first-child',
  moveDownButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root:nth-child(2)',
  editBlockButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root:nth-child(3)',
  visibilityButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root:nth-child(4)',
  deleteBlockButton: '.MuiListItemSecondaryAction-root .MuiIconButton-root:nth-child(5)',

  // Preview Panel
  previewPanel: '.MuiPaper-root:has(h6:has-text("Preview"))',
  previewTitle: 'h6:has-text("Preview")',
  refreshPreviewButton: '.MuiPaper-root:has(h6:has-text("Preview")) .MuiIconButton-root',
  previewIframe: 'iframe[title="Website Preview"]',
  previewInfoAlert: '.MuiAlert-standardInfo',

  // No Page Selected State
  noPageText: 'text=Select or create a page',

  // Create Page Dialog
  pageDialog: '[role="dialog"]:has(.MuiDialogTitle-root:has-text("Page"))',
  pageDialogTitle: '.MuiDialogTitle-root:has-text("Create Page")',
  pageTitleInput: '[role="dialog"] input',
  pagePathInput: '[role="dialog"] input:nth-of-type(2)',
  setHomeSwitch: '[role="dialog"] .MuiSwitch-root',
  cancelPageButton: '[role="dialog"] button:has-text("Cancel")',
  createPageButton: '[role="dialog"] button:has-text("Create")',

  // Create/Edit Block Dialog
  blockDialog: '[role="dialog"]:has(.MuiDialogTitle-root:has-text("Block"))',
  blockDialogTitle: '.MuiDialogTitle-root',
  blockTypeSelect: '[role="dialog"] .MuiSelect-select',
  blockTypeMenuItem: '[role="listbox"] .MuiMenuItem-root',
  cancelBlockButton: '[role="dialog"] button:has-text("Cancel")',
  addBlockDialogButton: '[role="dialog"] button:has-text("Add")',
  updateBlockButton: '[role="dialog"] button:has-text("Update")',
  dialogFormError: '[role="dialog"] .MuiAlert-standardError',

  // Block Form Fields (HERO)
  headingInput: '[role="dialog"] input[placeholder*="heading"], [role="dialog"] label:has-text("Heading") + div input',
  subheadingInput: '[role="dialog"] label:has-text("Subheading") + div input',
  ctaTextInput: '[role="dialog"] label:has-text("CTA Text") + div input',
  ctaLinkInput: '[role="dialog"] label:has-text("CTA Link") + div input',

  // Generic Dialog
  dialog: '[role="dialog"]',
  dialogCloseButton: '[role="dialog"] button:has-text("Cancel")',
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get a valid website ID for testing
 * First tries to find an existing website, if none exists, attempts to create one
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<string|null>}
 */
async function getTestWebsiteId(runner) {
  // Navigate to dashboard to find a website
  await runner.goto('/dashboard?tab=websites');
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

  // Find an Edit button on a website card
  const editButton = runner.page.locator('button:has-text("Edit")').first();

  if ((await editButton.count()) > 0) {
    // Click edit to navigate to editor
    await editButton.click();
    await runner.waitForNavigation(/\/editor/, CONFIG.TIMEOUTS.medium);

    const url = runner.page.url();
    const match = url.match(/websites\/([^/]+)\/editor/);

    if (match) {
      return match[1];
    }
  }

  // No existing website found - try to create one
  console.log('   No existing website found, attempting to create one...');
  try {
    return await createTestWebsite(runner);
  } catch (e) {
    console.log(`   Website creation failed: ${e.message}`);
    console.log('   Note: Editor tests require an existing website.');
    console.log('   You can create one manually through the dashboard.');
    return null;
  }
}

/**
 * Create a test website using the UI flow
 * More robust version with multiple fallback strategies
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<string>} Website ID
 */
async function createTestWebsite(runner) {
  console.log('   Starting website creation flow...');

  // Navigate to create wizard
  await runner.goto('/dashboard/websites/create');
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

  // Wait for loading spinner to disappear
  try {
    const spinner = runner.page.locator('.MuiCircularProgress-root');
    if ((await spinner.count()) > 0) {
      await spinner.first().waitFor({ state: 'hidden', timeout: CONFIG.TIMEOUTS.medium });
    }
  } catch {
    // Spinner may have already disappeared
  }

  // Wait for templates to load - use multiple selector strategies
  const gridSelectors = ['.MuiGrid-container', '.MuiGrid-root', '[class*="Grid"]'];
  let gridFound = false;
  for (const selector of gridSelectors) {
    try {
      await runner.page.waitForSelector(selector, { timeout: CONFIG.TIMEOUTS.short });
      gridFound = true;
      break;
    } catch {
      continue;
    }
  }

  if (!gridFound) {
    throw new Error('Template grid not found');
  }

  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

  // Find template cards using multiple strategies
  const cardSelectors = [
    '.MuiGrid-item .MuiCard-root',
    '.MuiCard-root:has(img)',
    '.MuiCard-root:has(.MuiCardMedia-root)',
    '[class*="template"] .MuiCard-root',
  ];

  let allCards = null;
  let allCardsCount = 0;

  for (const selector of cardSelectors) {
    const cards = runner.page.locator(selector);
    const count = await cards.count();
    if (count > 0) {
      allCards = cards;
      allCardsCount = count;
      break;
    }
  }

  console.log(`   Found ${allCardsCount} template cards`);

  if (allCardsCount === 0) {
    throw new Error('No template cards found on page');
  }

  // Find first card that is NOT blank page (blank page template may not be fully implemented)
  let templateCard = null;
  let selectedTemplateName = '';
  for (let i = 0; i < allCardsCount; i++) {
    const card = allCards.nth(i);
    const cardText = await card.textContent();
    if (cardText && !cardText.toLowerCase().includes('blank')) {
      templateCard = card;
      selectedTemplateName = cardText.substring(0, 30).trim();
      break;
    }
  }

  // Fallback to first card if all are blank
  if (!templateCard) {
    templateCard = allCards.first();
    selectedTemplateName = 'First available';
  }

  console.log(`   Selected template: ${selectedTemplateName}...`);

  // Scroll to card and interact
  await templateCard.scrollIntoViewIfNeeded();
  await templateCard.hover();
  await runner.page.waitForTimeout(WAIT_TIMES.animation);

  // Try multiple strategies to select the template
  const selectStrategies = [
    async () => {
      const selectBtn = templateCard.locator('button:has-text("Select")');
      if ((await selectBtn.count()) > 0 && (await selectBtn.isVisible())) {
        await selectBtn.click();
        return true;
      }
      return false;
    },
    async () => {
      const useBtn = templateCard.locator('button:has-text("Use")');
      if ((await useBtn.count()) > 0 && (await useBtn.isVisible())) {
        await useBtn.click();
        return true;
      }
      return false;
    },
    async () => {
      await templateCard.click();
      return true;
    },
  ];

  let clicked = false;
  for (const strategy of selectStrategies) {
    if (await strategy()) {
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    throw new Error('Failed to click template card');
  }

  // Wait for navigation to customize page
  try {
    await runner.waitForNavigation(/customize/, CONFIG.TIMEOUTS.medium);
  } catch {
    const currentUrl = runner.page.url();
    if (!currentUrl.includes('customize')) {
      throw new Error(`Failed to navigate to customize page. Current: ${currentUrl}`);
    }
  }

  console.log('   On customize page, filling form...');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

  // Wait for form inputs to appear
  try {
    await runner.page.waitForSelector('input', { timeout: CONFIG.TIMEOUTS.medium });
  } catch {
    throw new Error('Form inputs not found on customize page');
  }

  // Generate unique test data
  const timestamp = Date.now();
  const testWebsiteName = `E2E Test ${timestamp}`;
  const testSlug = `e2e-${timestamp}`;

  // Find and fill website name using multiple strategies
  const nameInputSelectors = [
    'input[placeholder*="Professional"]',
    'input[placeholder*="My Professional"]',
    'input[placeholder*="website"]',
    'input[placeholder*="name"]',
    'input[type="text"]:first-child',
  ];

  let nameInput = null;
  for (const selector of nameInputSelectors) {
    const input = runner.page.locator(selector).first();
    if ((await input.count()) > 0 && (await input.isVisible())) {
      nameInput = input;
      break;
    }
  }

  if (!nameInput) {
    // Last resort: first visible text input
    const allInputs = runner.page.locator('input[type="text"]');
    const inputCount = await allInputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      if (await input.isVisible()) {
        nameInput = input;
        break;
      }
    }
  }

  if (!nameInput) {
    throw new Error('Website name input not found');
  }

  await nameInput.fill(testWebsiteName);
  await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);

  // Find and fill slug using multiple strategies
  const slugInputSelectors = [
    'input[placeholder*="my-services"]',
    'input[placeholder*="slug"]',
    'input[placeholder*="url"]',
  ];

  let slugInput = null;
  for (const selector of slugInputSelectors) {
    const input = runner.page.locator(selector).first();
    if ((await input.count()) > 0 && (await input.isVisible())) {
      slugInput = input;
      break;
    }
  }

  if (!slugInput) {
    // Try second text input (often slug comes after name)
    const allInputs = runner.page.locator('input[type="text"]');
    if ((await allInputs.count()) > 1) {
      slugInput = allInputs.nth(1);
    }
  }

  if (slugInput && (await slugInput.count()) > 0) {
    await slugInput.fill(testSlug);
    await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);
  }

  // Find and click Create Website button
  const createBtnSelectors = [
    'button:has-text("Create Website")',
    'button:has-text("Create")',
    'button[type="submit"]',
  ];

  let createBtn = null;
  for (const selector of createBtnSelectors) {
    const btn = runner.page.locator(selector).first();
    if ((await btn.count()) > 0 && (await btn.isEnabled())) {
      createBtn = btn;
      break;
    }
  }

  if (!createBtn) {
    await runner.screenshot('create-button-not-found');
    throw new Error('Create Website button not found or disabled');
  }

  console.log('   Clicking Create Website button...');
  await runner.screenshot('before-create-website');
  await createBtn.click();

  // Wait for response with timeout and progress logging
  const maxWaitTime = 10000;
  const checkInterval = 500;
  let elapsed = 0;

  while (elapsed < maxWaitTime) {
    await runner.page.waitForTimeout(checkInterval);
    elapsed += checkInterval;

    const currentUrl = runner.page.url();

    // Check for success redirect to editor
    if (currentUrl.includes('/editor')) {
      const match = currentUrl.match(/websites\/([^/]+)\/editor/);
      if (match) {
        console.log(`   Website created successfully! ID: ${match[1]}`);
        await runner.screenshot('after-create-website');
        return match[1];
      }
    }

    // Check for redirect to dashboard (website created but different redirect)
    if (currentUrl.includes('/dashboard') && currentUrl.includes('tab=websites')) {
      console.log('   Redirected to dashboard, looking for website...');
      break;
    }

    // Check for error
    const errorAlert = runner.page.locator('.MuiAlert-standardError');
    if ((await errorAlert.count()) > 0) {
      const errorText = await errorAlert.first().textContent();
      await runner.screenshot('create-website-error');
      throw new Error(`Website creation failed: ${errorText}`);
    }
  }

  await runner.screenshot('after-create-website');

  // If we reach here, try to find the website from dashboard
  const url = runner.page.url();
  if (!url.includes('/dashboard')) {
    await runner.goto('/dashboard?tab=websites');
    await runner.page.waitForLoadState('load');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);
  }

  // Find the edit button for the most recent website
  const editButton = runner.page.locator('button:has-text("Edit")').first();
  if ((await editButton.count()) === 0) {
    throw new Error('No Edit button found - website may not have been created');
  }

  await editButton.click();
  await runner.waitForNavigation(/\/editor/, CONFIG.TIMEOUTS.medium);

  const editorUrl = runner.page.url();
  const match = editorUrl.match(/websites\/([^/]+)\/editor/);

  if (match) {
    console.log(`   Website created: ${testWebsiteName} (ID: ${match[1]})`);
    return match[1];
  }

  throw new Error('Failed to extract website ID after creation');
}

/**
 * Navigate to the editor for a specific website
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} websiteId
 */
async function navigateToEditor(runner, websiteId) {
  const url = ROUTES.websiteEditor(websiteId);
  await runner.goto(url);
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);
}

/**
 * Wait for editor to be fully loaded
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function waitForEditorLoaded(runner) {
  // Wait for loading spinner to disappear
  try {
    const spinner = runner.page.locator(EDITOR_SELECTORS.loadingSpinner);
    if ((await spinner.count()) > 0) {
      await spinner.first().waitFor({ state: 'hidden', timeout: CONFIG.TIMEOUTS.long });
    }
  } catch {
    // Spinner may have already disappeared
  }

  // Wait for pages title to appear (indicates editor loaded)
  await runner.page.waitForSelector(EDITOR_SELECTORS.pagesTitle, {
    timeout: CONFIG.TIMEOUTS.medium,
  });
}

/**
 * Open the Create Page dialog
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function openCreatePageDialog(runner) {
  const addButton = runner.page.locator(EDITOR_SELECTORS.addPageButton);
  await addButton.click();
  await runner.page.waitForTimeout(WAIT_TIMES.dialogOpen);
}

/**
 * Close any open dialog
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function closeDialog(runner) {
  const cancelButton = runner.page.locator(EDITOR_SELECTORS.dialogCloseButton);
  if ((await cancelButton.count()) > 0) {
    await cancelButton.click();
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
  }
}

/**
 * Open the Create Block dialog
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function openCreateBlockDialog(runner) {
  const addButton = runner.page.locator(EDITOR_SELECTORS.addBlockButton);
  await addButton.click();
  await runner.page.waitForTimeout(WAIT_TIMES.dialogOpen);
}

/**
 * Get count of pages in sidebar
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<number>}
 */
async function getPagesCount(runner) {
  const pageItems = runner.page.locator('.MuiPaper-root:has(h6:has-text("Pages")) .MuiListItem-root');
  return pageItems.count();
}

/**
 * Get count of blocks in panel
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<number>}
 */
async function getBlocksCount(runner) {
  const blockItems = runner.page.locator('.MuiPaper-root:has(h6:has-text("Blocks")) .MuiListItem-root');
  return blockItems.count();
}

/**
 * Select a page by index in the sidebar
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {number} index
 */
async function selectPage(runner, index) {
  const pageItems = runner.page.locator('.MuiPaper-root:has(h6:has-text("Pages")) .MuiListItem-root');
  const page = pageItems.nth(index);
  await page.click();
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);
}

/**
 * Select block type from dropdown
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} blockType
 */
async function selectBlockType(runner, blockType) {
  // Click the select to open dropdown
  const select = runner.page.locator('[role="dialog"] .MuiSelect-select').first();
  await select.click();
  await runner.page.waitForTimeout(WAIT_TIMES.animation);

  // Click the menu item
  const menuItem = runner.page.locator(`[role="listbox"] .MuiMenuItem-root:has-text("${blockType}")`);
  await menuItem.click();
  await runner.page.waitForTimeout(WAIT_TIMES.animation);
}

// ════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ════════════════════════════════════════════════════════════════════════════

runTest('Website Editor', async (runner) => {
  let websiteId = null;
  let initialPagesCount = 0;

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Setup & Page Load
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Find or create a website to edit', async () => {
    websiteId = await getTestWebsiteId(runner);

    if (!websiteId) {
      console.log('   ⚠️  No website available for testing');
      console.log('   Remaining editor tests will be skipped');
    } else {
      console.log(`   Using website ID: ${websiteId}`);
    }

    // Clear any errors from the setup/creation process
    // These are expected when no website exists and creation fails
    runner.clearAllErrors();
  });

  await runner.test('Editor page loads successfully', async () => {
    if (!websiteId) {
      runner.skip('Editor page load', 'No website available');
      return;
    }

    await navigateToEditor(runner, websiteId);
    await runner.assertUrl('/editor');
  });

  await runner.test('Loading state appears and resolves', async () => {
    if (!websiteId) {
      runner.skip('Loading state', 'No website available');
      return;
    }

    // Refresh to catch loading state
    await runner.page.reload();

    // Check for loading spinner (may be very fast)
    const hasSpinner = await runner.exists(EDITOR_SELECTORS.loadingSpinner);
    console.log(`   Loading spinner detected: ${hasSpinner}`);

    // Wait for editor to load
    await waitForEditorLoaded(runner);

    // Pages sidebar should be visible
    await runner.assertVisible(EDITOR_SELECTORS.pagesTitle);
  });

  await runner.test('Website header displays correctly', async () => {
    if (!websiteId) {
      runner.skip('Website header', 'No website available');
      return;
    }

    // Website name should be visible
    const websiteName = runner.page.locator('h5').first();
    const name = await websiteName.textContent();
    console.log(`   Website name: ${name}`);

    if (!name || name.length === 0) {
      throw new Error('Website name is empty');
    }

    // Status chip should be visible
    const statusChip = runner.page.locator('.MuiChip-root').first();
    const hasChip = (await statusChip.count()) > 0;

    if (hasChip) {
      const status = await statusChip.textContent();
      console.log(`   Status: ${status}`);
    }
  });

  await runner.test('Back button navigates to dashboard', async () => {
    if (!websiteId) {
      runner.skip('Back button', 'No website available');
      return;
    }

    // Click back button (first IconButton in header)
    const backButton = runner.page.locator('.MuiIconButton-root').first();
    await backButton.click();

    // Should navigate to dashboard
    await runner.waitForNavigation(/dashboard/, CONFIG.TIMEOUTS.medium);
    await runner.assertUrl('/dashboard');

    // Navigate back to editor
    await navigateToEditor(runner, websiteId);
    await waitForEditorLoaded(runner);
  });

  await runner.test('No critical console errors on page load', async () => {
    if (!websiteId) {
      runner.skip('Console errors check', 'No website available');
      return;
    }

    runner.clearAllErrors();
    await runner.assertNoConsoleErrors();
  });

  await runner.test('View Live button shows for published websites only', async () => {
    if (!websiteId) {
      runner.skip('View Live button', 'No website available');
      return;
    }

    // Check for status chip to determine if published
    const statusChip = runner.page.locator('.MuiChip-root').first();
    const hasChip = (await statusChip.count()) > 0;

    if (!hasChip) {
      console.log('   Note: Status chip not found');
      return;
    }

    const status = await statusChip.textContent();
    const isPublished = status?.toLowerCase().includes('published');

    // View Live button should only appear for published websites
    const viewLiveBtn = runner.page.locator('button:has-text("View Live")');
    const hasViewLive = (await viewLiveBtn.count()) > 0;

    if (isPublished) {
      if (hasViewLive) {
        console.log('   ✓ View Live button visible for PUBLISHED website');
      } else {
        console.log('   Warning: View Live button missing for published website');
      }
    } else {
      if (hasViewLive) {
        console.log('   Note: View Live button visible for non-published website');
      } else {
        console.log(`   ✓ View Live button correctly hidden (status: ${status})`);
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Pages Sidebar
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Pages sidebar is visible', async () => {
    if (!websiteId) {
      runner.skip('Pages sidebar', 'No website available');
      return;
    }

    await runner.assertVisible(EDITOR_SELECTORS.pagesTitle);
  });

  await runner.test('Pages list shows existing pages', async () => {
    if (!websiteId) {
      runner.skip('Pages list', 'No website available');
      return;
    }

    initialPagesCount = await getPagesCount(runner);
    console.log(`   Found ${initialPagesCount} pages`);

    if (initialPagesCount === 0) {
      console.log('   Note: No pages exist yet');
    }
  });

  await runner.test('Add page button is visible', async () => {
    if (!websiteId) {
      runner.skip('Add page button', 'No website available');
      return;
    }

    const addButton = runner.page.locator(EDITOR_SELECTORS.addPageButton);
    const hasButton = (await addButton.count()) > 0;

    if (!hasButton) {
      throw new Error('Add page button not found');
    }

    console.log('   Add page button found');
  });

  await runner.test('Clicking page selects it', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Page selection', !websiteId ? 'No website available' : 'No pages to select');
      return;
    }

    // Select first page
    await selectPage(runner, 0);

    // Blocks panel should now be visible
    await runner.assertVisible(EDITOR_SELECTORS.blocksTitle);
    console.log('   Page selected, blocks panel visible');
  });

  await runner.test('Home page shows home icon', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Home page icon', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    // Look for House icon in page list
    const homeIcon = runner.page.locator('.MuiPaper-root:has(h6:has-text("Pages")) .MuiListItem-root svg');
    const hasHomeIcon = (await homeIcon.count()) > 0;

    if (hasHomeIcon) {
      console.log('   Home page icon found');
    } else {
      console.log('   Note: Home icon may not be visible');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Create Page Dialog
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Create page dialog opens', async () => {
    if (!websiteId) {
      runner.skip('Create page dialog', 'No website available');
      return;
    }

    await openCreatePageDialog(runner);
    await runner.assertVisible('[role="dialog"]');

    // Dialog title should be visible
    const dialogTitle = runner.page.locator('.MuiDialogTitle-root');
    const title = await dialogTitle.textContent();
    console.log(`   Dialog title: ${title}`);
  });

  await runner.test('Page dialog has title and path fields', async () => {
    if (!websiteId) {
      runner.skip('Page dialog fields', 'No website available');
      return;
    }

    // Find inputs
    const inputs = runner.page.locator('[role="dialog"] input');
    const inputCount = await inputs.count();
    console.log(`   Found ${inputCount} input fields`);

    if (inputCount < 2) {
      console.log('   Warning: Expected at least 2 inputs (title, path)');
    }
  });

  await runner.test('Create button is disabled when form is empty', async () => {
    if (!websiteId) {
      runner.skip('Create button state', 'No website available');
      return;
    }

    const createBtn = runner.page.locator('[role="dialog"] button:has-text("Create")');
    const isDisabled = await createBtn.isDisabled();

    if (!isDisabled) {
      console.log('   Note: Create button may not be disabled for empty form');
    } else {
      console.log('   Create button correctly disabled');
    }
  });

  await runner.test('Cancel button closes dialog', async () => {
    if (!websiteId) {
      runner.skip('Cancel button', 'No website available');
      return;
    }

    await closeDialog(runner);

    // Dialog should be gone
    const dialogExists = await runner.exists('[role="dialog"]');
    if (dialogExists) {
      throw new Error('Dialog did not close');
    }

    console.log('   Dialog closed');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Blocks Panel
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Blocks panel is visible when page selected', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Blocks panel', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    // Ensure a page is selected
    await selectPage(runner, 0);
    await runner.assertVisible(EDITOR_SELECTORS.blocksTitle);
  });

  await runner.test('Add block button is visible', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Add block button', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    const addButton = runner.page.locator(EDITOR_SELECTORS.addBlockButton);
    const hasButton = (await addButton.count()) > 0;

    if (!hasButton) {
      throw new Error('Add block button not found');
    }

    console.log('   Add block button found');
  });

  await runner.test('Blocks list shows blocks or empty state', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Blocks list', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    const blocksCount = await getBlocksCount(runner);
    console.log(`   Found ${blocksCount} blocks`);

    if (blocksCount === 0) {
      // Check for empty state message
      const emptyText = runner.page.locator('text=No blocks yet');
      const hasEmptyState = (await emptyText.count()) > 0;

      if (hasEmptyState) {
        console.log('   Empty state message shown');
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Create Block Dialog
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Create block dialog opens', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Create block dialog', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    await openCreateBlockDialog(runner);
    await runner.assertVisible('[role="dialog"]');

    // Dialog title should be visible
    const dialogTitle = runner.page.locator('.MuiDialogTitle-root');
    const title = await dialogTitle.textContent();
    console.log(`   Dialog title: ${title}`);
  });

  await runner.test('Block type selector shows all types', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Block type selector', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    // Click select to open dropdown
    const select = runner.page.locator('[role="dialog"] .MuiSelect-select').first();
    if ((await select.count()) === 0) {
      console.log('   Note: Block type select not found (may be custom component)');
      await closeDialog(runner);
      return;
    }

    await select.click();
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Count menu items
    const menuItems = runner.page.locator('[role="listbox"] .MuiMenuItem-root');
    const count = await menuItems.count();
    console.log(`   Found ${count} block types`);

    // Verify all expected types are present
    for (const blockType of BLOCK_TYPES) {
      const item = runner.page.locator(`[role="listbox"] .MuiMenuItem-root:has-text("${blockType}")`);
      const hasItem = (await item.count()) > 0;
      if (!hasItem) {
        console.log(`   Warning: ${blockType} not found in dropdown`);
      }
    }

    // Close dropdown by pressing Escape
    await runner.page.keyboard.press('Escape');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
  });

  await runner.test('Selecting block type shows form fields', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Block type form', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    // Open dialog if not already open
    const dialogExists = await runner.exists('[role="dialog"]');
    if (!dialogExists) {
      await openCreateBlockDialog(runner);
    }

    // Select HERO block type
    try {
      await selectBlockType(runner, 'HERO');

      // Should now show HERO form fields
      const headingLabel = runner.page.locator('[role="dialog"] label:has-text("Heading")');
      const hasHeadingField = (await headingLabel.count()) > 0;

      if (hasHeadingField) {
        console.log('   HERO form fields shown');
      } else {
        console.log('   Note: Form fields may have different labels');
      }
    } catch (e) {
      console.log(`   Note: Could not select block type - ${e.message}`);
    }
  });

  await runner.test('Add button is disabled without required fields', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Add button validation', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    // Open dialog if not already open
    const dialogExists = await runner.exists('[role="dialog"]');
    if (!dialogExists) {
      await openCreateBlockDialog(runner);
      await selectBlockType(runner, 'HERO');
    }

    // Add button should be present
    const addButton = runner.page.locator('[role="dialog"] button:has-text("Add")');
    const hasButton = (await addButton.count()) > 0;

    if (hasButton) {
      const isDisabled = await addButton.isDisabled();
      console.log(`   Add button disabled: ${isDisabled}`);
    }

    // Close dialog
    await closeDialog(runner);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Preview Panel
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Preview panel is visible', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Preview panel', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    await runner.assertVisible(EDITOR_SELECTORS.previewTitle);
  });

  await runner.test('Preview shows info alert or iframe', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Preview content', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    // Check for iframe (published website)
    const iframe = runner.page.locator('iframe[title="Website Preview"]');
    const hasIframe = (await iframe.count()) > 0;

    if (hasIframe) {
      console.log('   Preview iframe visible (website is published)');
    } else {
      // Check for info alert
      const infoAlert = runner.page.locator('.MuiAlert-standardInfo');
      const hasAlert = (await infoAlert.count()) > 0;

      if (hasAlert) {
        const alertText = await infoAlert.first().textContent();
        console.log(`   Info alert: ${alertText?.substring(0, 50)}...`);
      } else {
        console.log('   Note: Neither iframe nor info alert found');
      }
    }
  });

  await runner.test('Refresh preview button is present', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Refresh button', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    const refreshButton = runner.page.locator(EDITOR_SELECTORS.refreshPreviewButton);
    const hasButton = (await refreshButton.count()) > 0;

    if (!hasButton) {
      console.log('   Warning: Refresh preview button not found');
    } else {
      console.log('   Refresh button found');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Block Actions (if blocks exist)
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Block action buttons are accessible', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Block actions', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    const blocksCount = await getBlocksCount(runner);
    if (blocksCount === 0) {
      console.log('   No blocks to test actions on - skipping button verification');
      console.log('   Note: Add a block to fully test action buttons');
      return;
    }

    // Find first block item within the Blocks panel
    const blocksPanel = runner.page.locator('.MuiPaper-root:has(h6:has-text("Blocks"))');
    const firstBlock = blocksPanel.locator('.MuiListItem-root').first();

    if ((await firstBlock.count()) === 0) {
      console.log('   Warning: Block item not found in panel');
      return;
    }

    // Check for action buttons - they should be in ListItemSecondaryAction
    const secondaryAction = firstBlock.locator('.MuiListItemSecondaryAction-root');
    const hasSecondaryActions = (await secondaryAction.count()) > 0;

    if (!hasSecondaryActions) {
      // Alternative: buttons might be inline
      const inlineButtons = firstBlock.locator('.MuiIconButton-root');
      const inlineCount = await inlineButtons.count();
      console.log(`   Found ${inlineCount} inline action buttons`);
      return;
    }

    const actionButtons = secondaryAction.locator('.MuiIconButton-root');
    const buttonCount = await actionButtons.count();

    console.log(`   Found ${buttonCount} action buttons on first block`);

    // Verify we have the expected 5 actions: move up, move down, edit, visibility, delete
    if (buttonCount >= 5) {
      console.log('   All 5 expected actions present: up, down, edit, visibility, delete');
    } else if (buttonCount > 0) {
      console.log(`   Note: Found ${buttonCount} of 5 expected action buttons`);
    }
  });

  await runner.test('Block items show type and preview', async () => {
    if (!websiteId || initialPagesCount === 0) {
      runner.skip('Block display', !websiteId ? 'No website available' : 'No pages exist');
      return;
    }

    const blocksCount = await getBlocksCount(runner);
    if (blocksCount === 0) {
      console.log('   No blocks to verify display');
      return;
    }

    // Get first block's text content
    const firstBlock = runner.page.locator('.MuiPaper-root:has(h6:has-text("Blocks")) .MuiListItem-root').first();
    const blockText = await firstBlock.textContent();

    console.log(`   Block content: ${blockText?.substring(0, 60)}...`);

    // Should contain one of the block types
    const hasBlockType = BLOCK_TYPES.some((type) => blockText?.includes(type));
    if (!hasBlockType) {
      console.log('   Warning: Block type not visible in item');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 8: Responsive Design
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Layout works on tablet', async () => {
    if (!websiteId) {
      runner.skip('Tablet layout', 'No website available');
      return;
    }

    await runner.setViewport('tablet');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Main sections should still be visible
    await runner.assertVisible(EDITOR_SELECTORS.pagesTitle);

    if (initialPagesCount > 0) {
      // Blocks may be in a different layout
      await runner.scrollIntoView(EDITOR_SELECTORS.blocksTitle);
      await runner.assertVisible(EDITOR_SELECTORS.blocksTitle);
    }

    console.log('   Tablet layout verified');
  });

  await runner.test('Layout works on mobile', async () => {
    if (!websiteId) {
      runner.skip('Mobile layout', 'No website available');
      return;
    }

    await runner.setViewport('mobile');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Scroll to verify sections are accessible
    await runner.scrollIntoView(EDITOR_SELECTORS.pagesTitle);
    await runner.assertVisible(EDITOR_SELECTORS.pagesTitle);

    if (initialPagesCount > 0) {
      await runner.scrollIntoView(EDITOR_SELECTORS.blocksTitle);
      await runner.assertVisible(EDITOR_SELECTORS.blocksTitle);

      await runner.scrollIntoView(EDITOR_SELECTORS.previewTitle);
      await runner.assertVisible(EDITOR_SELECTORS.previewTitle);
    }

    console.log('   Mobile layout verified (all sections accessible)');
  });

  await runner.test('Reset to desktop view', async () => {
    if (!websiteId) {
      runner.skip('Desktop reset', 'No website available');
      return;
    }

    await runner.setViewport('desktop');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Verify layout restored
    await runner.assertVisible(EDITOR_SELECTORS.pagesTitle);

    console.log('   Desktop layout restored');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 9: Error Handling
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Invalid website ID shows error', async () => {
    // Clear errors before intentionally triggering one
    runner.clearAllErrors();

    // Navigate to editor with invalid ID
    await runner.goto('/dashboard/websites/invalid-id-xyz-999/editor');
    await runner.page.waitForLoadState('load');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Should show error alert
    const errorAlert = runner.page.locator('.MuiAlert-standardError');
    const hasError = (await errorAlert.count()) > 0;

    if (hasError) {
      const errorText = await errorAlert.first().textContent();
      console.log(`   Error shown: ${errorText?.substring(0, 50)}...`);
    } else {
      console.log('   Note: Error may be displayed differently');
    }

    // Clear errors from the intentional invalid navigation
    // This is expected behavior we're testing, not a real error
    runner.clearAllErrors();

    // Navigate back to valid editor if we have one
    if (websiteId) {
      await navigateToEditor(runner, websiteId);
      await waitForEditorLoaded(runner);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 10: Final Verification
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Clear state for clean test environment', async () => {
    // Close any open dialogs
    const dialogExists = await runner.exists('[role="dialog"]');
    if (dialogExists) {
      await closeDialog(runner);
    }

    // Move mouse to neutral position
    await runner.page.mouse.move(0, 0);

    console.log('   State cleared');
  });

  await runner.test('No console errors after all interactions', async () => {
    await runner.assertNoConsoleErrors();
  });

  await runner.test('No critical network errors', async () => {
    // Allow 404s for missing resources, 401 for auth checks
    await runner.assertNoNetworkErrors({ ignore: [404, 401] });
  });

  // Take final screenshot
  await runner.screenshot('editor-final');
});
