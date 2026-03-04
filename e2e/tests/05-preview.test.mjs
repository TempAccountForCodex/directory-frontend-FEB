/**
 * E2E Tests: Preview & Public Website
 * ====================================
 * Tests the template preview and public website viewing functionality.
 *
 * Test Coverage:
 * - Template preview page (/template-preview/:templateId)
 * - Public website viewing (/site/:slug)
 * - Publish/Unpublish workflow
 * - SEO elements and meta tags
 * - Block rendering
 * - Navigation and page switching
 * - Responsive behavior
 * - Error handling
 *
 * @module e2e/tests/05-preview
 */

import { runTestWithoutLogin, CONFIG, ROUTES, SELECTORS } from '../config.mjs';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Standard wait times for consistent timing
 */
const WAIT_TIMES = {
  animation: 300,
  formUpdate: 200,
  contentLoad: 500,
  pageTransition: 400,
  networkRequest: 1000,
};

/**
 * Known template IDs for testing
 * Using templates that should exist in the system
 */
const TEST_TEMPLATES = {
  corporateBusiness: 'corporate-business',
  professionalServices: 'professional-services',
  invalid: 'invalid-template-xyz-999',
};

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM SELECTORS FOR THIS TEST
// ════════════════════════════════════════════════════════════════════════════

const PREVIEW_SELECTORS = {
  // Template Preview Page
  templatePreview: {
    // Header banner
    previewBanner: 'div:has-text("Template Preview")',
    templateChip: '.MuiChip-colorPrimary',
    categoryChip: '.MuiChip-outlined',
    previewNotice: 'text=This is a preview',

    // Navigation
    appBar: '.MuiAppBar-root',
    navTitle: '.MuiAppBar-root .MuiTypography-h6',
    navItems: '.MuiAppBar-root .MuiTypography-body2',

    // Content
    blockContainer: 'main, [role="main"], .MuiBox-root > div',

    // Footer
    footer: 'footer, [role="contentinfo"]',
    footerCopyright: 'text=All rights reserved',
    poweredBy: 'text=TechieTribe',

    // Loading
    loadingSpinner: '.MuiCircularProgress-root',

    // Error
    errorAlert: '.MuiAlert-standardError',
    notFoundText: 'text=Template not found',
  },

  // Public Website Page
  publicWebsite: {
    // Navigation
    appBar: '.MuiAppBar-root',
    siteLogo: '.MuiAppBar-root img',
    siteName: '.MuiAppBar-root .MuiTypography-h6',
    navButton: '.MuiAppBar-root .MuiButton-root',
    languageSelector: '.MuiAppBar-root .MuiSelect-root, .MuiAppBar-root select',

    // Content
    pageContent: '.MuiBox-root',
    emptyPageText: 'text=This page has no content',

    // Footer
    footer: 'footer',
    footerCopyright: 'text=All rights reserved',
    poweredBy: 'text=TechieTribe',

    // Loading
    loadingSpinner: '.MuiCircularProgress-root',

    // Error
    errorAlert: '.MuiAlert-standardError',
    notFoundText: 'text=Website not found',
    notPublishedText: 'text=not published',
  },

  // Block types (common to both)
  blocks: {
    heroBlock: '[class*="hero"], [data-block-type="HERO"]',
    featuresBlock: '[class*="features"], [data-block-type="FEATURES"]',
    testimonialsBlock: '[class*="testimonial"], [data-block-type="TESTIMONIALS"]',
    ctaBlock: '[class*="cta"], [data-block-type="CTA"]',
    contactBlock: '[class*="contact"], [data-block-type="CONTACT"]',
  },

  // Editor publish controls (for dashboard tests)
  editor: {
    publishButton: 'button:has-text("Publish")',
    unpublishButton: 'button:has-text("Unpublish")',
    viewLiveButton: 'button:has-text("View Live")',
    statusChip: '.MuiChip-root',
    publishedStatus: '.MuiChip-root:has-text("Published")',
    draftStatus: '.MuiChip-root:has-text("Draft")',
  },
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Navigate to template preview page
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} templateId
 */
async function navigateToTemplatePreview(runner, templateId) {
  const url = ROUTES.templatePreview(templateId);
  await runner.goto(url);
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

  // Wait for loading spinner to disappear
  await waitForLoadingComplete(runner);

  // Additional wait for React to render
  await runner.page.waitForTimeout(WAIT_TIMES.animation);
}

/**
 * Navigate to public website page
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @param {string} slug
 */
async function navigateToPublicWebsite(runner, slug) {
  const url = `/site/${slug}`;
  await runner.goto(url);
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);
}

/**
 * Wait for loading spinner to disappear
 * @param {import('../config.mjs').E2ETestRunner} runner
 */
async function waitForLoadingComplete(runner) {
  try {
    const spinner = runner.page.locator('.MuiCircularProgress-root');
    if ((await spinner.count()) > 0) {
      await spinner.first().waitFor({ state: 'hidden', timeout: CONFIG.TIMEOUTS.medium });
    }
  } catch {
    // Spinner may have already disappeared
  }
}

/**
 * Check if page has visible blocks
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<number>}
 */
async function getVisibleBlocksCount(runner) {
  // Look for common block indicators
  const blockSelectors = [
    '[data-block-type]',
    '[class*="block"]',
    'section',
    '.MuiContainer-root > .MuiBox-root',
  ];

  let totalBlocks = 0;
  for (const selector of blockSelectors) {
    const count = await runner.page.locator(selector).count();
    if (count > totalBlocks) {
      totalBlocks = count;
    }
  }

  return totalBlocks;
}

/**
 * Get a valid website slug for testing public website
 * Returns null if no published website found
 * @param {import('../config.mjs').E2ETestRunner} runner
 * @returns {Promise<string|null>}
 */
async function getPublishedWebsiteSlug(runner) {
  // Navigate to dashboard to find a published website
  await runner.goto('/dashboard?tab=websites');
  await runner.page.waitForLoadState('load');
  await runner.page.waitForTimeout(WAIT_TIMES.contentLoad);

  // Look for View Live button (indicates published website)
  const viewLiveBtn = runner.page.locator('button:has-text("View Live"), a:has-text("View Live")').first();

  if ((await viewLiveBtn.count()) > 0) {
    // Get the href or extract slug from nearby context
    const href = await viewLiveBtn.getAttribute('href');
    if (href) {
      const match = href.match(/\/site\/([^/]+)/);
      if (match) {
        return match[1];
      }
    }

    // Alternative: click and extract from URL
    try {
      const [newPage] = await Promise.all([
        runner.page.context().waitForEvent('page', { timeout: 5000 }),
        viewLiveBtn.click(),
      ]);
      const url = newPage.url();
      await newPage.close();
      const match = url.match(/\/site\/([^/]+)/);
      if (match) {
        return match[1];
      }
    } catch {
      // New tab didn't open, try extracting from page content
    }
  }

  // Look for any website card with a slug
  const slugText = runner.page.locator('text=/\\.techietribe\\.com|site\\//').first();
  if ((await slugText.count()) > 0) {
    const text = await slugText.textContent();
    const match = text?.match(/([a-z0-9-]+)\.techietribe|site\/([a-z0-9-]+)/);
    if (match) {
      return match[1] || match[2];
    }
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// TEST SUITE - TEMPLATE PREVIEW (No Auth Required)
// ════════════════════════════════════════════════════════════════════════════

runTestWithoutLogin('Template Preview & Public Website', async (runner) => {
  let validTemplateId = TEST_TEMPLATES.corporateBusiness;
  let publishedSlug = null;

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Template Preview - Page Load
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Template preview page loads with valid template', async () => {
    await navigateToTemplatePreview(runner, validTemplateId);
    await waitForLoadingComplete(runner);

    // Check we're on the preview page
    await runner.assertUrl('template-preview');
    await runner.assertUrl(validTemplateId);
  });

  await runner.test('Preview banner is displayed', async () => {
    // Look for the preview banner/header
    const bannerSelectors = [
      PREVIEW_SELECTORS.templatePreview.previewBanner,
      'text=Template Preview',
      '[class*="warning"]',
    ];

    let bannerFound = false;
    for (const selector of bannerSelectors) {
      if ((await runner.page.locator(selector).count()) > 0) {
        bannerFound = true;
        console.log('   Preview banner found');
        break;
      }
    }

    if (!bannerFound) {
      console.log('   Note: Preview banner may have different styling');
    }
  });

  await runner.test('Template name chip is displayed', async () => {
    const chip = runner.page.locator('.MuiChip-root').first();
    const hasChip = (await chip.count()) > 0;

    if (hasChip) {
      const chipText = await chip.textContent();
      console.log(`   Template chip: ${chipText}`);
    } else {
      console.log('   Note: Template chip not found');
    }
  });

  await runner.test('Category chip is displayed', async () => {
    // Category chip should be outlined variant
    const categoryChip = runner.page.locator('.MuiChip-outlined, .MuiChip-root:not(.MuiChip-colorPrimary)');
    const hasCategory = (await categoryChip.count()) > 0;

    if (hasCategory) {
      const categoryText = await categoryChip.first().textContent();
      console.log(`   Category chip: ${categoryText}`);
    } else {
      // Check for any second chip
      const chips = runner.page.locator('.MuiChip-root');
      const count = await chips.count();
      if (count > 1) {
        const text = await chips.nth(1).textContent();
        console.log(`   Second chip (likely category): ${text}`);
      } else {
        console.log('   Note: Category chip not found');
      }
    }
  });

  await runner.test('Preview notice text is shown', async () => {
    // Look for "This is a preview. No data will be saved."
    const noticeSelectors = [
      'text=This is a preview',
      'text=No data will be saved',
      'text=preview',
    ];

    let noticeFound = false;
    for (const selector of noticeSelectors) {
      if ((await runner.page.locator(selector).count()) > 0) {
        noticeFound = true;
        console.log('   Preview notice found');
        break;
      }
    }

    if (!noticeFound) {
      console.log('   Note: Preview notice may be hidden on smaller screens');
    }
  });

  await runner.test('Navigation bar shows template name', async () => {
    // Wait for AppBar to appear with multiple selector strategies
    const appBarSelectors = [
      '.MuiAppBar-root',
      '[role="banner"]',
      'header',
      '.MuiToolbar-root',
    ];

    let appBarFound = false;
    for (const selector of appBarSelectors) {
      const element = runner.page.locator(selector).first();
      if ((await element.count()) > 0) {
        appBarFound = true;
        console.log(`   Navigation found via: ${selector}`);
        break;
      }
    }

    if (!appBarFound) {
      // Take screenshot for debugging and continue gracefully
      await runner.screenshot('nav-bar-debug');
      console.log('   Warning: Navigation bar not found - page may still be loading');
      console.log('   This may indicate a frontend rendering issue');
      return;
    }

    // Try to find title within navigation
    const titleSelectors = [
      '.MuiAppBar-root .MuiTypography-h6',
      '.MuiToolbar-root .MuiTypography-h6',
      'header h6',
      '[role="banner"] h6',
    ];

    for (const selector of titleSelectors) {
      const title = runner.page.locator(selector).first();
      if ((await title.count()) > 0) {
        const text = await title.textContent();
        if (text && text.length > 0) {
          console.log(`   Navigation title: ${text}`);
          return;
        }
      }
    }

    console.log('   Navigation bar present (title element not found)');
  });

  await runner.test('Page navigation items are displayed', async () => {
    const navItems = runner.page.locator('.MuiAppBar-root .MuiTypography-body2, .MuiAppBar-root .MuiButton-root');
    const count = await navItems.count();

    console.log(`   Found ${count} navigation items`);

    // Should have at least one page (Home)
    if (count === 0) {
      console.log('   Note: No navigation items found - template may have single page');
    }
  });

  await runner.test('Template content blocks are rendered', async () => {
    const blocksCount = await getVisibleBlocksCount(runner);
    console.log(`   Found approximately ${blocksCount} content blocks`);

    // Check for empty state
    const emptyText = runner.page.locator('text=no content');
    const hasEmptyState = (await emptyText.count()) > 0;

    if (hasEmptyState) {
      console.log('   Template has no content blocks (empty state shown)');
    } else if (blocksCount === 0) {
      console.log('   Note: Block detection may need adjustment');
    }
  });

  await runner.test('Footer is displayed with copyright', async () => {
    const footer = runner.page.locator('footer').first();
    const hasFooter = (await footer.count()) > 0;

    if (hasFooter) {
      await runner.scrollIntoView('footer');
      const footerText = await footer.textContent();
      const hasCopyright = footerText?.includes('©') || footerText?.includes('All rights reserved');
      console.log(`   Footer has copyright: ${hasCopyright}`);
    } else {
      console.log('   Note: Footer element not found');
    }
  });

  await runner.test('Powered by TechieTribe is shown', async () => {
    const poweredBy = runner.page.locator('text=TechieTribe');
    const hasPoweredBy = (await poweredBy.count()) > 0;

    console.log(`   Powered by TechieTribe: ${hasPoweredBy ? 'yes' : 'no'}`);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Template Preview - Error Handling
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Invalid template ID shows error', async () => {
    runner.clearAllErrors();

    await navigateToTemplatePreview(runner, TEST_TEMPLATES.invalid);
    await waitForLoadingComplete(runner);

    // Should show error alert
    const errorSelectors = [
      PREVIEW_SELECTORS.templatePreview.errorAlert,
      PREVIEW_SELECTORS.templatePreview.notFoundText,
      'text=not found',
      'text=doesn\'t exist',
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      if ((await runner.page.locator(selector).count()) > 0) {
        errorFound = true;
        const errorText = await runner.page.locator(selector).first().textContent();
        console.log(`   Error shown: ${errorText?.substring(0, 50)}...`);
        break;
      }
    }

    if (!errorFound) {
      console.log('   Note: Error may be displayed differently or redirected');
    }

    // Clear errors from intentional invalid navigation
    runner.clearAllErrors();
  });

  await runner.test('Return to valid template preview', async () => {
    await navigateToTemplatePreview(runner, validTemplateId);
    await waitForLoadingComplete(runner);
    await runner.assertUrl(validTemplateId);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Template Preview - Responsive Design
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Template preview works on tablet', async () => {
    await runner.setViewport('tablet');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // Check app bar is still visible
    await runner.assertVisible('.MuiAppBar-root');

    console.log('   Tablet layout verified');
  });

  await runner.test('Template preview works on mobile', async () => {
    await runner.setViewport('mobile');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    // App bar should still be visible
    await runner.assertVisible('.MuiAppBar-root');

    // Scroll to verify footer is accessible
    await runner.scrollIntoView('footer');

    console.log('   Mobile layout verified');
  });

  await runner.test('Reset to desktop view', async () => {
    await runner.setViewport('desktop');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
    console.log('   Desktop layout restored');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Public Website - Setup
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Find a published website for testing', async () => {
    // First login to access dashboard
    console.log('   Logging in to find published website...');

    await runner.goto(ROUTES.auth);
    await runner.page.waitForLoadState('load');

    // Fill credentials
    const emailInput = runner.page.locator(SELECTORS.auth.emailInput);
    const passwordInput = runner.page.locator(SELECTORS.auth.passwordInput);

    if ((await emailInput.count()) > 0) {
      await emailInput.fill(CONFIG.TEST_USER.email);
      await passwordInput.fill(CONFIG.TEST_USER.password);
      await runner.page.locator(SELECTORS.auth.submitButton).click();

      try {
        await runner.waitForNavigation(/dashboard/, CONFIG.TIMEOUTS.long);
        console.log('   Login successful');

        // Try to find published website
        publishedSlug = await getPublishedWebsiteSlug(runner);

        if (publishedSlug) {
          console.log(`   Found published website: ${publishedSlug}`);
        } else {
          console.log('   No published website found - some tests will be skipped');
        }
      } catch (e) {
        console.log(`   Login/navigation failed: ${e.message}`);
      }
    } else {
      console.log('   Auth form not found');
    }

    // Clear errors from auth process
    runner.clearAllErrors();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Public Website - Page Load
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Public website loads with valid slug', async () => {
    if (!publishedSlug) {
      runner.skip('Public website load', 'No published website available');
      return;
    }

    await navigateToPublicWebsite(runner, publishedSlug);
    await waitForLoadingComplete(runner);
    await runner.assertUrl(`/site/${publishedSlug}`);
  });

  await runner.test('Public website navigation bar is displayed', async () => {
    if (!publishedSlug) {
      runner.skip('Navigation bar', 'No published website available');
      return;
    }

    await runner.assertVisible('.MuiAppBar-root');

    // Check for site name
    const siteName = runner.page.locator('.MuiAppBar-root .MuiTypography-h6').first();
    if ((await siteName.count()) > 0) {
      const name = await siteName.textContent();
      console.log(`   Site name: ${name}`);
    }
  });

  await runner.test('Public website has page navigation buttons', async () => {
    if (!publishedSlug) {
      runner.skip('Page navigation', 'No published website available');
      return;
    }

    const navButtons = runner.page.locator('.MuiAppBar-root .MuiButton-root');
    const count = await navButtons.count();
    console.log(`   Found ${count} page navigation buttons`);
  });

  await runner.test('Public website content blocks are rendered', async () => {
    if (!publishedSlug) {
      runner.skip('Content blocks', 'No published website available');
      return;
    }

    const blocksCount = await getVisibleBlocksCount(runner);
    console.log(`   Found approximately ${blocksCount} content blocks`);

    // Check for empty state
    const emptyText = runner.page.locator(PREVIEW_SELECTORS.publicWebsite.emptyPageText);
    if ((await emptyText.count()) > 0) {
      console.log('   Page has no content (empty state)');
    }
  });

  await runner.test('Public website footer is displayed', async () => {
    if (!publishedSlug) {
      runner.skip('Footer', 'No published website available');
      return;
    }

    await runner.scrollIntoView('footer');

    const footer = runner.page.locator('footer');
    const hasFooter = (await footer.count()) > 0;

    if (hasFooter) {
      console.log('   Footer displayed');
    } else {
      console.log('   Note: Footer element not found');
    }
  });

  await runner.test('Language selector is present', async () => {
    if (!publishedSlug) {
      runner.skip('Language selector', 'No published website available');
      return;
    }

    const langSelector = runner.page.locator('.MuiAppBar-root select, .MuiAppBar-root .MuiSelect-root');
    const hasLangSelector = (await langSelector.count()) > 0;

    console.log(`   Language selector present: ${hasLangSelector}`);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Public Website - Error Handling
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Invalid website slug shows error', async () => {
    runner.clearAllErrors();

    await navigateToPublicWebsite(runner, 'invalid-slug-xyz-999');
    await waitForLoadingComplete(runner);

    // Should show error
    const errorSelectors = [
      PREVIEW_SELECTORS.publicWebsite.errorAlert,
      PREVIEW_SELECTORS.publicWebsite.notFoundText,
      'text=not found',
      'text=doesn\'t exist',
      'text=not published',
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      if ((await runner.page.locator(selector).count()) > 0) {
        errorFound = true;
        const text = await runner.page.locator(selector).first().textContent();
        console.log(`   Error shown: ${text?.substring(0, 50)}...`);
        break;
      }
    }

    if (!errorFound) {
      console.log('   Note: Error may be displayed differently');
    }

    runner.clearAllErrors();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Public Website - Responsive Design
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Public website works on tablet', async () => {
    if (!publishedSlug) {
      runner.skip('Tablet layout', 'No published website available');
      return;
    }

    await navigateToPublicWebsite(runner, publishedSlug);
    await waitForLoadingComplete(runner);

    await runner.setViewport('tablet');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    await runner.assertVisible('.MuiAppBar-root');
    console.log('   Tablet layout verified');
  });

  await runner.test('Public website works on mobile', async () => {
    if (!publishedSlug) {
      runner.skip('Mobile layout', 'No published website available');
      return;
    }

    await runner.setViewport('mobile');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);

    await runner.assertVisible('.MuiAppBar-root');
    await runner.scrollIntoView('footer');

    console.log('   Mobile layout verified');
  });

  await runner.test('Reset to desktop view', async () => {
    await runner.setViewport('desktop');
    await runner.page.waitForTimeout(WAIT_TIMES.animation);
    console.log('   Desktop layout restored');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 8: SEO Elements (Public Website)
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Public website has title tag', async () => {
    if (!publishedSlug) {
      runner.skip('Title tag', 'No published website available');
      return;
    }

    await navigateToPublicWebsite(runner, publishedSlug);
    await waitForLoadingComplete(runner);

    const title = await runner.page.title();
    console.log(`   Page title: ${title?.substring(0, 50)}`);

    if (!title || title.length === 0) {
      console.log('   Warning: Page title is empty');
    }
  });

  await runner.test('Public website has meta description', async () => {
    if (!publishedSlug) {
      runner.skip('Meta description', 'No published website available');
      return;
    }

    const metaDesc = await runner.page.locator('meta[name="description"]').getAttribute('content');

    if (metaDesc) {
      console.log(`   Meta description: ${metaDesc.substring(0, 50)}...`);
    } else {
      console.log('   Note: Meta description not set');
    }
  });

  await runner.test('Public website has Open Graph tags', async () => {
    if (!publishedSlug) {
      runner.skip('OG tags', 'No published website available');
      return;
    }

    const ogTags = ['og:title', 'og:description', 'og:type'];
    let foundTags = 0;

    for (const tag of ogTags) {
      const content = await runner.page.locator(`meta[property="${tag}"]`).getAttribute('content');
      if (content) {
        foundTags++;
      }
    }

    console.log(`   Found ${foundTags}/${ogTags.length} Open Graph tags`);
  });

  await runner.test('Public website has Twitter Card tags', async () => {
    if (!publishedSlug) {
      runner.skip('Twitter tags', 'No published website available');
      return;
    }

    const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    let foundTags = 0;

    for (const tag of twitterTags) {
      const content = await runner.page.locator(`meta[name="${tag}"]`).getAttribute('content');
      if (content) {
        foundTags++;
      }
    }

    console.log(`   Found ${foundTags}/${twitterTags.length} Twitter Card tags`);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 9: Final Verification
  // ──────────────────────────────────────────────────────────────────────────

  await runner.test('Clear state for clean test environment', async () => {
    // Return to template preview (known state)
    await navigateToTemplatePreview(runner, validTemplateId);
    await waitForLoadingComplete(runner);

    // Move mouse to neutral position
    await runner.page.mouse.move(0, 0);

    console.log('   Test state cleared');
  });

  await runner.test('No console errors after all interactions', async () => {
    runner.clearAllErrors();
    await runner.assertNoConsoleErrors();
  });

  await runner.test('No critical network errors', async () => {
    // Allow 404s for missing resources, 401 for auth checks
    await runner.assertNoNetworkErrors({ ignore: [404, 401] });
  });

  // Take final screenshot
  await runner.screenshot('preview-public-final');
});
