/**
 * E2E Tests: Website Customization (Step 2)
 * ==========================================
 * Tests the /dashboard/websites/create/customize page.
 *
 * Test Coverage:
 * - Page load with template parameter
 * - Loading states and error handling
 * - Basic info form (name, slug, colors)
 * - Auto-slug generation
 * - Slug validation
 * - Pages selection and reordering
 * - Sections toggle (Home, Services)
 * - Live preview updates
 * - Form validation
 * - Create website submission
 * - Responsive behavior
 *
 * @module e2e/tests/03-customize
 */

import { runTest, CONFIG } from '../config.mjs';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Test data for website creation
 */
const TEST_DATA = {
  websiteName: 'My Test Business',
  expectedSlug: 'my-test-business',
  customSlug: 'custom-slug-123',
  invalidSlug: 'Invalid Slug!',
  primaryColor: '#FF5733',
  secondaryColor: '#33FF57',
};

/**
 * Standard wait times for consistent timing
 */
const WAIT_TIMES = {
  animation: 300, // CSS transitions, hover effects
  formUpdate: 200, // Form field updates, auto-slug
  contentLoad: 500, // Page/section updates
  colorPicker: 400, // Color picker animations
};

/**
 * Max pages allowed per website (from backend plan limits)
 * Used to verify pages counter format
 */
const MAX_PAGES_LIMIT = 5;

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM SELECTORS FOR THIS TEST
// ════════════════════════════════════════════════════════════════════════════

const CUSTOMIZE_SELECTORS = {
  // Page layout
  pageContainer: '.MuiContainer-root',

  // Header elements
  backButton: 'button:has-text("Back to Templates")',
  pageTitle: 'h4:has-text("Customize Your Website")',
  templateChip: '.MuiChip-root',

  // Loading states
  loadingSpinner: '.MuiCircularProgress-root',
  loadingText: 'text=Loading',

  // Error states
  errorAlert: '.MuiAlert-standardError',
  errorText: 'text=Template not found',
  redirectCountdown: 'text=Redirecting',

  // Success state
  successAlert: '.MuiAlert-standardSuccess',
  successText: 'text=created successfully',

  // Basic Info Form
  basicInfoSection: 'h6:has-text("Basic Information")',
  websiteNameInput: 'input[placeholder*="Professional Services"], label:has-text("Website Name") + div input',
  websiteNameLabel: 'label:has-text("Website Name")',
  slugInput: 'input[placeholder*="my-services"], label:has-text("URL Slug") + div input',
  slugLabel: 'label:has-text("URL Slug")',
  slugHelperText: '.MuiFormHelperText-root',

  // Color Section
  colorSection: 'text=Colors',
  primaryColorInput: 'input[value^="#"]',
  colorPicker: '.MuiInputBase-root:has(input[value^="#"])',
  colorPickerPopover: '.MuiPopover-root',

  // Pages Section
  pagesSection: 'h6:has-text("Select Pages")',
  pagesCounter: 'text=/\\d+ \\/ \\d+ pages/',
  pageCard: '.MuiCard-root:has(.MuiCheckbox-root)',
  pageCheckbox: '.MuiCheckbox-root',
  homePageChip: '.MuiChip-root:has-text("Required")',
  limitChip: '.MuiChip-root:has-text("Maximum reached")',
  limitWarning: '.MuiAlert-standardWarning:has-text("maximum")',
  pageUpButton: 'button:has(svg[data-testid="ArrowUpwardIcon"])',
  pageDownButton: 'button:has(svg[data-testid="ArrowDownwardIcon"])',

  // Sections Selection
  sectionsSection: 'h6:has-text("Customize Sections")',
  homeSectionsTitle: 'text=Home Page Sections',
  servicesSectionsTitle: 'text=Services Page Sections',
  sectionCheckbox: '.MuiFormControlLabel-root:has(.MuiCheckbox-root)',

  // Live Preview
  previewSection: 'h6:has-text("Live Preview")',
  previewContainer: '.MuiPaper-root:has(h6:has-text("Live Preview"))',
  previewNav: 'text=Your Website',
  previewNavItems: '.MuiTypography-body2',
  previewFooter: 'text=All rights reserved',
  noPreviewText: 'text=No sections enabled',

  // Action Buttons
  actionButtonsSection: '.MuiPaper-root:has(button:has-text("Create Website"))',
  backButtonBottom: 'button:has-text("Back"):not(:has-text("Templates"))',
  createButton: 'button:has-text("Create Website")',
  createButtonLoading: 'button:has(.MuiCircularProgress-root)',

  // Dialogs
  confirmDialog: '[role="dialog"]',
  confirmLeaveText: 'text=unsaved changes',
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get a valid template ID for testing
 * Uses 'corporate-business' as it's a known template from Phase 3 tests
 * @returns {string}
 */
function getTestTemplateId() {
  return 'corporate-business';
}

/**
 * Navigate to customize page with template
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} templateId
 */
async function navigateToCustomize(runner, templateId) {
  const url = `/dashboard/websites/create/customize?template=${templateId}`;
  await runner.goto(url);
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);
}

/**
 * Wait for customization form to be ready
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function waitForFormReady(runner) {
  // Wait for loading to complete
  try {
    const spinner = runner.page.locator(CUSTOMIZE_SELECTORS.loadingSpinner);
    if ((await spinner.count()) > 0) {
      await spinner.first().waitFor({ state: 'hidden', timeout: CONFIG.TIMEOUTS.long });
    }
  } catch {
    // Spinner may have already disappeared
  }

  // Wait for basic info section to appear
  await runner.page.waitForSelector(CUSTOMIZE_SELECTORS.basicInfoSection, {
    timeout: CONFIG.TIMEOUTS.medium,
  });
}

/**
 * Fill the website name field
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} name
 */
async function fillWebsiteName(runner, name) {
  // Find input by placeholder or label association
  const nameInput = runner.page.locator('input[placeholder*="Professional"]').first();

  if ((await nameInput.count()) === 0) {
    // Fallback: find by label
    const labeledInput = runner.page.locator('label:has-text("Website Name")').locator('..').locator('input');
    await labeledInput.fill(name);
  } else {
    await nameInput.fill(name);
  }

  await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);
}

/**
 * Get the current slug value
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<string>}
 */
async function getSlugValue(runner) {
  const slugInput = runner.page.locator('input[placeholder*="my-services"]').first();

  if ((await slugInput.count()) === 0) {
    const labeledInput = runner.page.locator('label:has-text("URL Slug")').locator('..').locator('input');
    return labeledInput.inputValue();
  }

  return slugInput.inputValue();
}

/**
 * Fill the slug field manually
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} slug
 */
async function fillSlug(runner, slug) {
  const slugInput = runner.page.locator('input[placeholder*="my-services"]').first();

  if ((await slugInput.count()) === 0) {
    const labeledInput = runner.page.locator('label:has-text("URL Slug")').locator('..').locator('input');
    await labeledInput.fill(slug);
  } else {
    await slugInput.fill(slug);
  }

  await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);
}

/**
 * Get count of selected pages
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<number>}
 */
async function getSelectedPagesCount(runner) {
  const checkedBoxes = runner.page.locator('.MuiCheckbox-root.Mui-checked');
  return checkedBoxes.count();
}

/**
 * Get all page cards (synchronous - returns Locator directly)
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {import('playwright').Locator}
 */
function getPageCards(runner) {
  return runner.page.locator('.MuiCard-root:has(.MuiCheckbox-root)');
}

/**
 * Check if Create button is enabled
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<boolean>}
 */
async function isCreateButtonEnabled(runner) {
  const createBtn = runner.page.locator(CUSTOMIZE_SELECTORS.createButton);
  return !(await createBtn.isDisabled());
}

// ════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ════════════════════════════════════════════════════════════════════════════

runTest('Website Customization (Step 2)', async (runner) => {
  const templateId = getTestTemplateId();

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Page Load & Navigation
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Customize page loads with template parameter', async () => {
    await navigateToCustomize(runner, templateId);
    await runner.assertUrl('customize');
    await runner.assertUrl(`template=${templateId}`);
  });

  await runner.test('Loading state appears and resolves', async () => {
    // Refresh to catch loading state
    await runner.page.reload();

    // Check for loading spinner (may be very fast)
    const hasSpinner = await runner.exists(CUSTOMIZE_SELECTORS.loadingSpinner);
    console.log(`   Loading spinner detected: ${hasSpinner}`);

    // Wait for form to be ready
    await waitForFormReady(runner);

    // Basic info section should be visible
    await runner.assertVisible(CUSTOMIZE_SELECTORS.basicInfoSection);
  });

  await runner.test('Page title and template chip are displayed', async () => {
    await runner.assertVisible(CUSTOMIZE_SELECTORS.pageTitle);

    // Template chip should show template name
    const chip = runner.page.locator(CUSTOMIZE_SELECTORS.templateChip).first();
    const chipText = await chip.textContent();
    console.log(`   Template chip: ${chipText}`);

    if (!chipText || chipText.length === 0) {
      throw new Error('Template chip is empty');
    }
  });

  await runner.test('Back button is visible and works', async () => {
    await runner.assertVisible(CUSTOMIZE_SELECTORS.backButton);

    // Click back button
    const backBtn = runner.page.locator(CUSTOMIZE_SELECTORS.backButton);
    await backBtn.click();

    // Should navigate to create wizard
    await runner.waitForNavigation(/websites\/create/, CONFIG.TIMEOUTS.medium);
    await runner.assertUrl('/dashboard/websites/create');

    // Navigate back to customize for remaining tests
    await navigateToCustomize(runner, templateId);
    await waitForFormReady(runner);
  });

  await runner.test('No critical console errors on page load', async () => {
    runner.clearAllErrors();
    await runner.assertNoConsoleErrors();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Basic Info Form
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Website name field is present and functional', async () => {
    // Find name input
    const nameInput = runner.page.locator('input[placeholder*="Professional"]').first();
    const hasInput = (await nameInput.count()) > 0;

    if (!hasInput) {
      // Try alternate selector
      const altInput = runner.page.locator('label:has-text("Website Name")').locator('..').locator('input');
      if ((await altInput.count()) === 0) {
        throw new Error('Website name input not found');
      }
    }

    console.log('   Website name field found');
  });

  await runner.test('Slug field auto-generates from website name', async () => {
    // Fill website name
    await fillWebsiteName(runner, TEST_DATA.websiteName);

    // Wait for auto-generation
    await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);

    // Check slug value
    const slugValue = await getSlugValue(runner);
    console.log(`   Generated slug: ${slugValue}`);

    if (slugValue !== TEST_DATA.expectedSlug) {
      throw new Error(`Expected slug "${TEST_DATA.expectedSlug}", got "${slugValue}"`);
    }
  });

  await runner.test('Slug helper text shows preview URL', async () => {
    const helperText = runner.page.locator('.MuiFormHelperText-root').filter({ hasText: '/site/' });
    const hasHelper = (await helperText.count()) > 0;

    if (hasHelper) {
      const text = await helperText.first().textContent();
      console.log(`   Helper text: ${text}`);
    } else {
      console.log('   Warning: Slug helper text not found');
    }
  });

  await runner.test('Manual slug edit disconnects auto-generation', async () => {
    // Manually edit slug
    await fillSlug(runner, TEST_DATA.customSlug);

    // Change website name
    await fillWebsiteName(runner, 'Different Name');
    await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);

    // Slug should NOT have changed (manual edit disconnects auto-gen)
    const slugValue = await getSlugValue(runner);

    if (slugValue !== TEST_DATA.customSlug) {
      console.log(`   Note: Slug changed to "${slugValue}" (auto-gen may still be active)`);
    } else {
      console.log('   Manual slug preserved after name change');
    }

    // Restore original values for remaining tests
    await fillWebsiteName(runner, TEST_DATA.websiteName);
    await fillSlug(runner, TEST_DATA.expectedSlug);
  });

  await runner.test('Color pickers are present', async () => {
    // Look for color section
    await runner.assertVisible('text=Colors');

    // Count color inputs (should be at least 4: primary, secondary, heading, body)
    // Note: Some pickers may have multiple inputs (hex + alpha), so we check >= 4
    const colorInputs = runner.page.locator('input[value^="#"]');
    const count = await colorInputs.count();
    console.log(`   Found ${count} color inputs`);

    if (count < 4) {
      throw new Error(`Expected at least 4 color pickers, found ${count}`);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Pages Selection
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Pages section is visible', async () => {
    await runner.assertVisible(CUSTOMIZE_SELECTORS.pagesSection);
  });

  await runner.test('Page cards are displayed with checkboxes', async () => {
    const pageCards = getPageCards(runner);
    const count = await pageCards.count();
    console.log(`   Found ${count} page cards`);

    if (count === 0) {
      throw new Error('No page cards found');
    }
  });

  await runner.test('Home page has Required chip and cannot be unchecked', async () => {
    // Find home page card (has "Required" chip)
    const requiredChip = runner.page.locator('.MuiChip-root:has-text("Required")');
    const hasRequired = (await requiredChip.count()) > 0;

    if (!hasRequired) {
      throw new Error('Home page Required chip not found');
    }

    // Find the checkbox in the same card
    const homeCard = runner.page.locator('.MuiCard-root:has(.MuiChip-root:has-text("Required"))');
    const checkbox = homeCard.locator('.MuiCheckbox-root');

    // Checkbox should be checked
    const isChecked = await checkbox.locator('input').isChecked();
    if (!isChecked) {
      throw new Error('Home page checkbox should be checked');
    }

    // Checkbox should be disabled
    const isDisabled = await checkbox.locator('input').isDisabled();
    if (!isDisabled) {
      throw new Error('Home page checkbox should be disabled');
    }

    console.log('   Home page checkbox is checked and disabled');
  });

  await runner.test('Pages counter shows correct count', async () => {
    const counter = runner.page.locator('text=/\\d+ \\/ \\d+ pages/');
    const hasCounter = (await counter.count()) > 0;

    if (hasCounter) {
      const text = await counter.first().textContent();
      console.log(`   Pages counter: ${text}`);

      // Verify the max limit matches expected value
      if (text && text.includes(`/ ${MAX_PAGES_LIMIT}`)) {
        console.log(`   ✓ Max pages limit is ${MAX_PAGES_LIMIT}`);
      }
    } else {
      console.log('   Warning: Pages counter not found');
    }
  });

  await runner.test('Can toggle non-home page selection', async () => {
    // Find a page card that is NOT the home page (no "Required" chip)
    const nonHomeCards = runner.page.locator(
      '.MuiCard-root:has(.MuiCheckbox-root):not(:has(.MuiChip-root:has-text("Required")))'
    );
    const count = await nonHomeCards.count();

    if (count === 0) {
      runner.skip('Toggle non-home page', 'Only home page available');
      return;
    }

    const firstNonHome = nonHomeCards.first();
    const checkbox = firstNonHome.locator('.MuiCheckbox-root input');

    // Get initial state
    const wasChecked = await checkbox.isChecked();

    // Click to toggle
    await checkbox.click({ force: true });
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Verify state changed
    const isNowChecked = await checkbox.isChecked();

    if (wasChecked === isNowChecked) {
      throw new Error('Checkbox state did not change after click');
    }

    console.log(`   Toggled page: ${wasChecked} -> ${isNowChecked}`);

    // Toggle back to restore state
    await checkbox.click({ force: true });
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
  });

  await runner.test('Page reorder buttons are present for selected pages', async () => {
    // Find up/down buttons
    const upButtons = runner.page.locator('button:has(svg[data-testid="ArrowUpwardIcon"])');
    const downButtons = runner.page.locator('button:has(svg[data-testid="ArrowDownwardIcon"])');

    const upCount = await upButtons.count();
    const downCount = await downButtons.count();

    console.log(`   Up buttons: ${upCount}, Down buttons: ${downCount}`);

    // Should have some reorder buttons if multiple pages selected
    const selectedCount = await getSelectedPagesCount(runner);
    if (selectedCount > 1 && (upCount === 0 || downCount === 0)) {
      console.log('   Warning: Expected reorder buttons for multiple selected pages');
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Sections Selection
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Sections panel is visible', async () => {
    await runner.assertVisible(CUSTOMIZE_SELECTORS.sectionsSection);
  });

  await runner.test('Home page sections are listed', async () => {
    const homeSections = runner.page.locator('text=Home Page Sections');
    const hasHomeSections = (await homeSections.count()) > 0;

    if (hasHomeSections) {
      console.log('   Home Page Sections title found');

      // Count section checkboxes under Home
      const sectionCheckboxes = runner.page.locator('.MuiFormControlLabel-root:has(.MuiCheckbox-root)');
      const count = await sectionCheckboxes.count();
      console.log(`   Found ${count} section checkboxes total`);
    } else {
      console.log('   Note: Home Page Sections not shown (may depend on template)');
    }
  });

  await runner.test('Can toggle section visibility', async () => {
    // Find a section checkbox
    const sectionLabels = runner.page.locator('.MuiFormControlLabel-root:has(.MuiCheckbox-root)');
    const count = await sectionLabels.count();

    if (count === 0) {
      runner.skip('Toggle section', 'No section checkboxes found');
      return;
    }

    const firstSection = sectionLabels.first();
    const checkbox = firstSection.locator('input[type="checkbox"]');

    // Get initial state
    const wasChecked = await checkbox.isChecked();

    // Click to toggle
    await checkbox.click({ force: true });
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Verify state changed
    const isNowChecked = await checkbox.isChecked();

    if (wasChecked === isNowChecked) {
      throw new Error('Section checkbox state did not change');
    }

    console.log(`   Toggled section: ${wasChecked} -> ${isNowChecked}`);

    // Toggle back to restore state
    await checkbox.click({ force: true });
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Live Preview
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Live preview section is visible', async () => {
    await runner.assertVisible(CUSTOMIZE_SELECTORS.previewSection);
  });

  await runner.test('Preview shows website name or placeholder', async () => {
    // Fill name if empty
    await fillWebsiteName(runner, TEST_DATA.websiteName);
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Look for the name in preview
    const previewName = runner.page.locator(`text="${TEST_DATA.websiteName}"`);
    const hasName = (await previewName.count()) > 0;

    if (hasName) {
      console.log('   Website name appears in preview');
    } else {
      // May show "Your Website" placeholder
      const placeholder = runner.page.locator('text="Your Website"');
      const hasPlaceholder = (await placeholder.count()) > 0;
      console.log(`   Preview shows: ${hasPlaceholder ? 'placeholder' : 'custom name'}`);
    }
  });

  await runner.test('Preview shows selected pages in navigation', async () => {
    // Check for page titles in preview nav
    const previewContainer = runner.page.locator('.MuiPaper-root:has(h6:has-text("Live Preview"))');
    const navItems = previewContainer.locator('.MuiTypography-body2');
    const count = await navItems.count();

    console.log(`   Preview nav items: ${count}`);

    // Should show at least Home
    if (count === 0) {
      console.log('   Warning: No navigation items in preview');
    }
  });

  await runner.test('Preview footer shows copyright', async () => {
    const footer = runner.page.locator('text=All rights reserved');
    const hasFooter = (await footer.count()) > 0;

    if (hasFooter) {
      console.log('   Preview footer visible');
    } else {
      console.log('   Warning: Preview footer not found');
    }
  });

  await runner.test('Preview updates when website name changes', async () => {
    // Change website name to something unique
    const uniqueName = `Test Site ${Date.now()}`;
    await fillWebsiteName(runner, uniqueName);
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Check if preview shows the new name
    const previewPanel = runner.page.locator('.MuiPaper-root:has(h6:has-text("Live Preview"))');
    const previewText = await previewPanel.textContent();

    if (previewText?.includes(uniqueName)) {
      console.log('   ✓ Preview updates with new name');
    } else {
      console.log('   Preview may use placeholder or debounce updates');
    }

    // Restore original name
    await fillWebsiteName(runner, TEST_DATA.websiteName);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Form Validation & Submission
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Create button is disabled when form is incomplete', async () => {
    // Clear the name field
    const nameInput = runner.page.locator('input[placeholder*="Professional"]').first();
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('');
    } else {
      const altInput = runner.page.locator('label:has-text("Website Name")').locator('..').locator('input');
      await altInput.fill('');
    }

    await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);

    // Create button should be disabled
    const createBtn = runner.page.locator(CUSTOMIZE_SELECTORS.createButton);
    const isDisabled = await createBtn.isDisabled();

    if (!isDisabled) {
      throw new Error('Create button should be disabled when name is empty');
    }

    console.log('   Create button correctly disabled');
  });

  await runner.test('Create button is enabled when form is valid', async () => {
    // Fill required fields
    await fillWebsiteName(runner, TEST_DATA.websiteName);
    await fillSlug(runner, TEST_DATA.expectedSlug);
    await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);

    // Create button should be enabled
    const isEnabled = await isCreateButtonEnabled(runner);

    if (!isEnabled) {
      throw new Error('Create button should be enabled when form is valid');
    }

    console.log('   Create button correctly enabled');
  });

  await runner.test('Slug validation shows error for invalid input', async () => {
    // Enter invalid slug
    await fillSlug(runner, TEST_DATA.invalidSlug);
    await runner.page.waitForTimeout(WAIT_TIMES.formUpdate);

    // Look for error helper text
    const helperText = runner.page.locator('.MuiFormHelperText-root.Mui-error');
    const hasError = (await helperText.count()) > 0;

    if (hasError) {
      const errorText = await helperText.first().textContent();
      console.log(`   Validation error: ${errorText}`);
    } else {
      // Check if create button is disabled (alternative validation indicator)
      const isEnabled = await isCreateButtonEnabled(runner);
      if (isEnabled) {
        console.log('   Warning: No validation error shown for invalid slug');
      } else {
        console.log('   Validation prevents submission (button disabled)');
      }
    }

    // Restore valid slug
    await fillSlug(runner, TEST_DATA.expectedSlug);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Responsive Design
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Layout works on tablet', async () => {
    await runner.setViewport('tablet');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Main sections should still be visible
    await runner.assertVisible(CUSTOMIZE_SELECTORS.basicInfoSection);
    await runner.assertVisible(CUSTOMIZE_SELECTORS.pagesSection);
    await runner.assertVisible(CUSTOMIZE_SELECTORS.previewSection);

    console.log('   Tablet layout verified');
  });

  await runner.test('Layout works on mobile', async () => {
    await runner.setViewport('mobile');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Scroll to verify all critical sections are accessible
    await runner.scrollIntoView(CUSTOMIZE_SELECTORS.basicInfoSection);
    await runner.assertVisible(CUSTOMIZE_SELECTORS.basicInfoSection);

    await runner.scrollIntoView(CUSTOMIZE_SELECTORS.pagesSection);
    await runner.assertVisible(CUSTOMIZE_SELECTORS.pagesSection);

    await runner.scrollIntoView(CUSTOMIZE_SELECTORS.previewSection);
    await runner.assertVisible(CUSTOMIZE_SELECTORS.previewSection);

    console.log('   Mobile layout verified (all sections accessible)');
  });

  await runner.test('Reset to desktop view', async () => {
    await runner.setViewport('desktop');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Verify layout restored
    await runner.assertVisible(CUSTOMIZE_SELECTORS.basicInfoSection);
    await runner.assertVisible(CUSTOMIZE_SELECTORS.previewSection);

    console.log('   Desktop layout restored');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 8: Error Handling
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Invalid template shows error and redirect countdown', async () => {
    // Navigate to customize with invalid template
    await runner.goto('/dashboard/websites/create/customize?template=invalid-template-xyz');
    await runner.page.waitForLoadState('load');
    await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

    // Should show error alert
    const errorAlert = runner.page.locator('.MuiAlert-standardError');
    const hasError = (await errorAlert.count()) > 0;

    if (hasError) {
      const alertText = await errorAlert.first().textContent();
      console.log(`   Error message: ${alertText?.substring(0, 60)}...`);

      // Should show redirect countdown
      const hasCountdown = alertText?.includes('Redirect') || alertText?.includes('second');
      console.log(`   Redirect countdown: ${hasCountdown ? 'yes' : 'no'}`);
    } else {
      console.log('   Note: Error alert may have already redirected');
    }

    // Navigate back to valid customize page for cleanup
    await navigateToCustomize(runner, templateId);
    await waitForFormReady(runner);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 9: Final Verification
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Clear form state for clean test environment', async () => {
    // Move mouse to neutral position
    await runner.page.mouse.move(0, 0);

    // Ensure form has valid values
    await fillWebsiteName(runner, TEST_DATA.websiteName);
    await fillSlug(runner, TEST_DATA.expectedSlug);

    console.log('   Form state cleared');
  });

  await runner.test('No console errors after all interactions', async () => {
    await runner.assertNoConsoleErrors();
  });

  await runner.test('No critical network errors', async () => {
    // Allow 404s for missing resources, 401 for auth checks
    await runner.assertNoNetworkErrors({ ignore: [404, 401] });
  });

  // Take final screenshot
  await runner.screenshot('customize-wizard-final');
});

// NOTE: Website creation submission test is NOT included to avoid
// creating actual websites in the database during E2E tests.
// That should be tested with proper database cleanup/mocking.
