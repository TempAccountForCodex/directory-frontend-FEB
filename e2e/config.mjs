/**
 * E2E Test Configuration & Helpers
 * ================================
 * Single source of truth for all E2E tests.
 *
 * Usage:
 *   import { runTest, SELECTORS, ROUTES, CONFIG } from '../config.mjs';
 *
 *   runTest('My Test Suite', async (runner) => {
 *     await runner.test('Test name', async () => {
 *       // test code
 *     });
 *   });
 *
 * Environment Variables:
 *   E2E_BASE_URL      - Frontend URL (default: http://localhost:5173)
 *   E2E_API_URL       - Backend API URL (default: http://localhost:3000/api)
 *   E2E_TEST_EMAIL    - Test user email
 *   E2E_TEST_PASSWORD - Test user password
 *   E2E_HEADLESS      - Run headless (default: true, set 'false' to see browser)
 *   E2E_SLOW_MO       - Slow down actions by ms (default: 0, use 100+ for debugging)
 *
 * @module e2e/config
 * @version 1.0.0
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Global configuration object
 * All values can be overridden via environment variables
 */
export const CONFIG = {
  // URLs
  BASE_URL: process.env.E2E_BASE_URL || 'http://localhost:5173',
  API_URL: process.env.E2E_API_URL || 'http://localhost:3000/api',

  // Test User Credentials
  TEST_USER: {
    email: process.env.E2E_TEST_EMAIL || 'test@example.com',
    password: process.env.E2E_TEST_PASSWORD || 'Test@123456',
  },

  // Timeouts (in milliseconds)
  TIMEOUTS: {
    short: 2000, // Animations, transitions, micro-interactions
    medium: 5000, // API calls, page loads, form submissions
    long: 15000, // Auth redirects, heavy pages, file uploads
    veryLong: 30000, // Full flow tests, complex operations
  },

  // Paths
  SCREENSHOTS_DIR: path.join(__dirname, '../screenshots'),

  // Browser Settings
  HEADLESS: process.env.E2E_HEADLESS !== 'false', // Default: true
  SLOW_MO: parseInt(process.env.E2E_SLOW_MO || '0', 10), // Default: 0

  // Viewport (default)
  VIEWPORT: {
    width: 1920,
    height: 1080,
  },

  // Viewport Presets for Responsive Testing
  VIEWPORTS: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },

  // Retry Settings
  RETRY_COUNT: 2,
  RETRY_DELAY: 1000,
};

// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Application routes
 * Centralized route definitions for easy maintenance
 */
export const ROUTES = {
  // Auth
  auth: '/auth',
  login: '/auth',
  logout: '/logout',

  // Dashboard
  dashboard: '/dashboard',

  // Websites
  websitesList: '/dashboard',
  createWebsite: '/dashboard/websites/create',
  customizeWebsite: (templateId) =>
    `/dashboard/websites/create/customize?template=${encodeURIComponent(templateId)}`,
  websiteEditor: (websiteId) => `/dashboard/websites/${websiteId}/editor`,

  // Templates
  templatePreview: (templateId) => `/template-preview/${templateId}`,

  // Public
  publicWebsite: (subdomain) => `/${subdomain}`,
};

// ════════════════════════════════════════════════════════════════════════════
// SELECTORS
// ════════════════════════════════════════════════════════════════════════════

/**
 * UI Element Selectors
 *
 * Strategy:
 * 1. Prefer data-testid (most stable)
 * 2. Fallback to role-based selectors
 * 3. Last resort: class-based selectors
 *
 * Format: Multiple selectors separated by comma for resilience
 */
export const SELECTORS = {
  // ──────────────────────────────────────────────────────────────────────────
  // Authentication
  // ──────────────────────────────────────────────────────────────────────────
  auth: {
    emailInput: 'input[type="email"], input[name="email"], [data-testid="email-input"]',
    passwordInput:
      'input[type="password"], input[name="password"], [data-testid="password-input"]',
    submitButton: 'button[type="submit"], [data-testid="login-button"]',
    errorAlert: '[role="alert"], [data-testid="auth-error"], .MuiAlert-root',
    forgotPassword: 'a:has-text("Forgot"), [data-testid="forgot-password"]',
    signupLink: 'a:has-text("Sign up"), a:has-text("Register"), [data-testid="signup-link"]',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Dashboard Layout
  // ──────────────────────────────────────────────────────────────────────────
  layout: {
    sidebar:
      '[data-testid="sidebar"], [data-testid="CollapsibleSidebar"], nav[class*="Sidebar"], aside',
    mainContent: 'main, [role="main"], [data-testid="main-content"]',
    pageHeader:
      '[data-testid="page-header"], [data-testid="DashboardPageHeader"], h1, h2:first-of-type',
    topBar: '[data-testid="top-bar"], header',
    userMenu:
      '[data-testid="user-menu"], [data-testid="UserProfileDropdown"], [aria-label="user menu"]',
    navItem: '[data-testid="nav-item"], [data-testid="SidebarNavItem"]',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Websites List (/dashboard)
  // ──────────────────────────────────────────────────────────────────────────
  websitesList: {
    // Page elements
    pageTitle: 'h1:has-text("Website"), h2:has-text("Website"), [data-testid="websites-title"]',

    // Action buttons
    createButton:
      'button:has-text("Create"), button:has-text("New Website"), button:has-text("Add Website"), [data-testid="create-website-btn"]',
    refreshButton: 'button:has-text("Refresh"), [data-testid="refresh-btn"]',

    // Website cards
    websiteCard:
      '[data-testid="website-card"], [class*="WebsiteCard"], .MuiCard-root:has([class*="website"])',
    websiteCardTitle:
      '[data-testid="website-card-title"], [data-testid="website-card"] h3, [data-testid="website-card"] h4',
    websiteCardStatus: '[data-testid="website-status"], .MuiChip-root',

    // Card actions
    editButton:
      'button:has-text("Edit"), button[aria-label="edit"], [data-testid="edit-website-btn"]',
    analyticsButton:
      'button:has-text("Analytics"), button[aria-label="analytics"], [data-testid="analytics-btn"]',
    previewButton:
      'button:has-text("Preview"), button:has-text("View"), button[aria-label="preview"], [data-testid="preview-btn"]',
    deleteButton:
      'button:has-text("Delete"), button[aria-label="delete"], [data-testid="delete-website-btn"]',
    settingsButton: 'button:has-text("Settings"), button[aria-label="settings"]',

    // Stats
    statsCard: '[data-testid="stat-card"], [data-testid="StatCard"], [class*="StatCard"]',

    // Tabs
    tabs: '[role="tablist"]',
    tab: '[role="tab"]',
    activeTab: '[role="tab"][aria-selected="true"]',

    // Empty state
    emptyState:
      '[data-testid="empty-state"], [class*="empty"]:has-text("No websites"), div:has-text("Create your first")',

    // Loading
    loadingSpinner: '[role="progressbar"], .MuiCircularProgress-root, [data-testid="loading"]',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Create Website Wizard (/dashboard/websites/create)
  // ──────────────────────────────────────────────────────────────────────────
  createWizard: {
    // Navigation
    backButton:
      '[data-testid="back-button"], button:has(svg[data-testid="ArrowBackIcon"]), button[aria-label="back"], button:has-text("Back")',

    // Category tabs
    categoryTabs: '[role="tablist"]',
    categoryTab: '[role="tab"]',
    activeCategoryTab: '[role="tab"][aria-selected="true"]',

    // Templates
    templateCard:
      '[data-testid="template-card"], [class*="template-card"], [class*="TemplateCard"], .MuiCard-root:has(img)',
    templateImage: '[data-testid="template-card"] img, [class*="template"] img',
    templateName:
      '[data-testid="template-name"], [data-testid="template-card"] h3, [data-testid="template-card"] h4',
    templateCategory: '[data-testid="template-category"], .MuiChip-root',

    // Template actions
    useTemplateButton:
      'button:has-text("Use"), button:has-text("Select"), button:has-text("Choose"), [data-testid="use-template-btn"]',
    previewButton:
      'button:has-text("Preview"), button:has-text("Demo"), [data-testid="preview-template-btn"]',

    // Loading states
    loadingSpinner: '[role="progressbar"], .MuiCircularProgress-root',
    loadingOverlay: '[data-testid="loading-overlay"], [class*="loading"]',

    // Error states
    errorMessage: '[data-testid="error-message"], [role="alert"], .MuiAlert-root',
    retryButton: 'button:has-text("Retry"), button:has-text("Try again")',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Customize Website Step (/dashboard/websites/create/customize)
  // ──────────────────────────────────────────────────────────────────────────
  customize: {
    // Preview
    templatePreview:
      '[data-testid="template-preview"], [class*="preview"], iframe[src*="template"]',

    // Form inputs
    nameInput:
      'input[name="name"], input[placeholder*="name" i], input[placeholder*="website" i], [data-testid="website-name-input"]',
    domainInput:
      'input[name="domain"], input[name="subdomain"], input[placeholder*="domain" i], [data-testid="domain-input"]',
    descriptionInput:
      'textarea[name="description"], [data-testid="description-input"], textarea[placeholder*="description" i]',

    // Form actions
    createButton:
      'button:has-text("Create"), button:has-text("Create Website"), button[type="submit"], [data-testid="create-website-submit"]',
    cancelButton:
      'button:has-text("Cancel"), button:has-text("Back"), [data-testid="cancel-btn"]',

    // Validation
    validationError: '.MuiFormHelperText-root.Mui-error, [data-testid="validation-error"]',
    fieldError: '[class*="error"], .Mui-error',

    // Loading
    submitLoading: 'button[type="submit"]:has([role="progressbar"])',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Website Editor (/dashboard/websites/:id/editor)
  // ──────────────────────────────────────────────────────────────────────────
  editor: {
    // Main areas
    canvas: '[data-testid="editor-canvas"], [class*="canvas"], iframe[class*="preview"]',
    blockPanel:
      '[data-testid="block-panel"], [data-testid="blocks-sidebar"], [class*="blocks-panel"]',
    settingsPanel: '[data-testid="settings-panel"], [class*="settings"]',
    toolbar: '[data-testid="editor-toolbar"], [class*="toolbar"]',

    // Actions
    saveButton:
      'button:has-text("Save"), button[aria-label="save"], [data-testid="save-btn"]',
    publishButton:
      'button:has-text("Publish"), button[aria-label="publish"], [data-testid="publish-btn"]',
    previewButton:
      'button:has-text("Preview"), button[aria-label="preview"], [data-testid="preview-btn"]',
    undoButton: 'button:has-text("Undo"), button[aria-label="undo"], [data-testid="undo-btn"]',
    redoButton: 'button:has-text("Redo"), button[aria-label="redo"], [data-testid="redo-btn"]',

    // Blocks
    blockItem: '[data-testid="block-item"], [class*="block-item"]',
    addBlockButton: 'button:has-text("Add"), [data-testid="add-block"]',

    // Status indicators
    savedIndicator: '[data-testid="saved-indicator"], :has-text("Saved")',
    unsavedIndicator: '[data-testid="unsaved-indicator"], :has-text("Unsaved")',
    publishedBadge: '[data-testid="published-badge"], .MuiChip-root:has-text("Published")',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Analytics Dialog
  // ──────────────────────────────────────────────────────────────────────────
  analytics: {
    dialog: '[role="dialog"], [data-testid="analytics-dialog"], .MuiDialog-root:has(.MuiDialogTitle-root)',
    dialogTitle: '.MuiDialogTitle-root, [data-testid="analytics-title"]',
    closeButton:
      '[data-testid="close-dialog"], button[aria-label="close"], .MuiDialogTitle-root button',
    charts: '[data-testid="analytics-chart"], canvas, [class*="chart"], [class*="Chart"]',
    dateRange: '[data-testid="date-range"], [class*="date-picker"], [class*="DatePicker"]',
    metrics: '[data-testid="metric-card"], [class*="metric"], [class*="Metric"]',
    exportButton: '[data-testid="export-btn"], button:has-text("Export")',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Common/Shared Elements
  // ──────────────────────────────────────────────────────────────────────────
  common: {
    // Dialogs
    dialog: '[role="dialog"], .MuiDialog-root',
    dialogTitle: '[role="dialog"] h2, .MuiDialogTitle-root',
    dialogContent: '[role="dialog"] .MuiDialogContent-root',
    dialogActions: '[role="dialog"] .MuiDialogActions-root',
    dialogClose:
      '[role="dialog"] button[aria-label="close"], [role="dialog"] button:has-text("Close")',
    confirmButton: 'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK")',
    cancelButton:
      'button:has-text("Cancel"), button:has-text("No"), button:has-text("Dismiss")',

    // Notifications
    toast: '.MuiSnackbar-root, [class*="toast"], [role="alert"]',
    toastSuccess: '.MuiAlert-standardSuccess, [class*="success"]',
    toastError: '.MuiAlert-standardError, [class*="error"]',

    // Loading
    loading: '[role="progressbar"], [class*="loading"], [class*="spinner"]',
    skeleton: '.MuiSkeleton-root, [class*="skeleton"]',

    // Errors
    errorBoundary: '[data-testid="error-boundary"], [class*="error-boundary"]',
    errorMessage: '[role="alert"], .MuiAlert-standardError, [class*="error-message"]',

    // Forms
    submitButton: 'button[type="submit"]',
    requiredField: '[aria-required="true"], .Mui-required',
  },
};

// ════════════════════════════════════════════════════════════════════════════
// E2E TEST RUNNER CLASS
// ════════════════════════════════════════════════════════════════════════════

/**
 * E2E Test Runner
 * Provides a clean API for writing and running E2E tests
 */
export class E2ETestRunner {
  /**
   * @param {string} testName - Name of the test suite
   */
  constructor(testName) {
    this.testName = testName;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.networkErrors = [];
    this.testResults = [];
    this.startTime = Date.now();
    this.isSetup = false;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Lifecycle Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Initialize browser and page
   * @returns {Promise<E2ETestRunner>}
   */
  async setup() {
    // Ensure screenshots directory exists
    if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
      fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
    }

    // Print header
    this._printHeader();

    // Launch browser
    this.browser = await chromium.launch({
      headless: CONFIG.HEADLESS,
      slowMo: CONFIG.SLOW_MO,
    });

    // Create context with viewport
    this.context = await this.browser.newContext({
      viewport: CONFIG.VIEWPORT,
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    // Create page
    this.page = await this.context.newPage();

    // Setup console error capture
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      // Filter out noise
      if (text.includes('favicon') || text.includes('Download the React DevTools')) {
        return;
      }

      if (type === 'error') {
        this.consoleErrors.push(text);
      } else if (type === 'warning') {
        this.consoleWarnings.push(text);
      }
    });

    // Setup network error capture
    this.page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      // Capture 4xx and 5xx errors (except favicon)
      if (status >= 400 && !url.includes('favicon')) {
        this.networkErrors.push({
          url: url.substring(0, 100),
          status,
          statusText: response.statusText(),
        });
      }
    });

    // Setup page error capture
    this.page.on('pageerror', (error) => {
      this.consoleErrors.push(`Page error: ${error.message}`);
    });

    this.isSetup = true;
    return this;
  }

  /**
   * Login to the application
   * @returns {Promise<E2ETestRunner>}
   */
  async login() {
    if (!this.isSetup) {
      throw new Error('Must call setup() before login()');
    }

    console.log('🔐 Logging in...');

    try {
      // Navigate to auth page
      await this.page.goto(`${CONFIG.BASE_URL}${ROUTES.auth}`, {
        waitUntil: 'networkidle',
        timeout: CONFIG.TIMEOUTS.long,
      });

      // Wait for form to be ready
      await this.page.waitForSelector(SELECTORS.auth.emailInput, {
        timeout: CONFIG.TIMEOUTS.medium,
      });

      // Fill credentials
      await this.page.fill(SELECTORS.auth.emailInput, CONFIG.TEST_USER.email);
      await this.page.fill(SELECTORS.auth.passwordInput, CONFIG.TEST_USER.password);

      // Submit form
      await this.page.click(SELECTORS.auth.submitButton);

      // Wait for redirect to dashboard
      await this.page.waitForURL(/.*dashboard/, {
        timeout: CONFIG.TIMEOUTS.long,
      });

      // Wait for page to stabilize
      await this.page.waitForLoadState('networkidle');

      console.log(`   Email: ${CONFIG.TEST_USER.email}`);
      console.log('   ✅ Login successful\n');
    } catch (error) {
      console.log(`   ❌ Login failed: ${error.message}`);

      // Check for error message on page
      const errorAlert = this.page.locator(SELECTORS.auth.errorAlert);
      if ((await errorAlert.count()) > 0) {
        const errorText = await errorAlert.first().textContent();
        console.log(`   Error message: ${errorText}`);
      }

      await this.screenshot('LOGIN-FAILED');
      throw error;
    }

    return this;
  }

  /**
   * Cleanup and close browser
   * @returns {Promise<boolean>} True if all tests passed
   */
  async teardown() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const passed = this.testResults.filter((t) => t.status === 'pass').length;
    const failed = this.testResults.filter((t) => t.status === 'fail').length;
    const skipped = this.testResults.filter((t) => t.status === 'skip').length;

    // Print summary
    this._printSummary(passed, failed, skipped, duration);

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    return failed === 0;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Test Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Run a single test
   * @param {string} name - Test name
   * @param {Function} testFn - Test function receiving page
   */
  async test(name, testFn) {
    const testStart = Date.now();
    console.log(`📋 Test: ${name}`);

    try {
      await testFn(this.page);
      const duration = Date.now() - testStart;
      console.log(`   ✅ PASS (${duration}ms)\n`);
      this.testResults.push({ name, status: 'pass', duration });
    } catch (error) {
      const duration = Date.now() - testStart;
      console.log(`   ❌ FAIL: ${error.message}\n`);
      this.testResults.push({ name, status: 'fail', duration, error: error.message });

      // Take failure screenshot
      await this.screenshot(`FAIL-${this._sanitizeFilename(name)}`);

      // Re-throw to stop test suite
      throw error;
    }
  }

  /**
   * Skip a test with a reason
   * @param {string} name - Test name
   * @param {string} reason - Skip reason
   */
  skip(name, reason) {
    console.log(`⏭️  Skip: ${name}`);
    console.log(`   Reason: ${reason}\n`);
    this.testResults.push({ name, status: 'skip', reason });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Navigation Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Navigate to a URL
   * @param {string} pathOrUrl - Path or full URL
   * @param {Object} options - Options
   * @param {string} options.waitFor - Selector to wait for after navigation
   * @param {number} options.timeout - Navigation timeout
   */
  async goto(pathOrUrl, options = {}) {
    const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${CONFIG.BASE_URL}${pathOrUrl}`;

    // Use 'load' by default - more robust for apps with continuous polling/WebSockets
    // Can be overridden with options.waitUntil = 'networkidle' if needed
    await this.page.goto(url, {
      waitUntil: options.waitUntil || 'load',
      timeout: options.timeout || CONFIG.TIMEOUTS.long,
    });

    if (options.waitFor) {
      await this.page.waitForSelector(options.waitFor, {
        timeout: options.timeout || CONFIG.TIMEOUTS.medium,
      });
    }

    return this;
  }

  /**
   * Wait for navigation to complete
   * @param {RegExp|string} urlPattern - URL pattern to wait for
   * @param {number} timeout - Timeout in ms
   */
  async waitForNavigation(urlPattern, timeout = CONFIG.TIMEOUTS.long) {
    await this.page.waitForURL(urlPattern, { timeout });
    // Use 'load' instead of 'networkidle' for apps with continuous polling
    await this.page.waitForLoadState('load');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Assertion Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Assert element is visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in ms
   */
  async assertVisible(selector, timeout = CONFIG.TIMEOUTS.medium) {
    try {
      const locator = this.page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`Element not visible: ${selector}`);
    }
  }

  /**
   * Assert element is hidden
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in ms
   */
  async assertHidden(selector, timeout = CONFIG.TIMEOUTS.medium) {
    try {
      await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    } catch (error) {
      throw new Error(`Element still visible: ${selector}`);
    }
  }

  /**
   * Assert element contains text
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text content
   */
  async assertText(selector, expectedText) {
    const locator = this.page.locator(selector).first();
    const text = await locator.textContent();

    if (!text?.toLowerCase().includes(expectedText.toLowerCase())) {
      throw new Error(`Expected text "${expectedText}" not found in "${text?.substring(0, 50)}"`);
    }
  }

  /**
   * Assert current URL matches pattern
   * @param {string|RegExp} pattern - URL pattern
   */
  async assertUrl(pattern) {
    const url = this.page.url();

    if (typeof pattern === 'string') {
      if (!url.includes(pattern)) {
        throw new Error(`URL "${url}" doesn't contain "${pattern}"`);
      }
    } else if (!pattern.test(url)) {
      throw new Error(`URL "${url}" doesn't match pattern ${pattern}`);
    }
  }

  /**
   * Assert no console errors occurred
   * @param {boolean} strict - If true, fail on any error. If false, only fail on critical errors.
   */
  async assertNoConsoleErrors(strict = false) {
    // Filter errors
    const criticalErrors = this.consoleErrors.filter((e) => {
      // Always ignore these
      if (e.includes('favicon') || e.includes('404')) return false;
      if (e.includes('React DevTools')) return false;

      // Ignore auth-related errors (expected during session initialization)
      if (e.includes('401') || e.includes('Unauthorized')) return false;
      if (e.includes('access token') || e.includes('Auth check failed')) return false;
      if (e.includes('Authentication error')) return false;

      // In non-strict mode, ignore warnings that look like errors
      if (!strict) {
        if (e.includes('Warning:')) return false;
        if (e.includes('deprecated')) return false;
      }

      return true;
    });

    if (criticalErrors.length > 0) {
      const errorList = criticalErrors.slice(0, 3).join('\n   - ');
      throw new Error(`Console errors detected:\n   - ${errorList}`);
    }
  }

  /**
   * Assert element count
   * @param {string} selector - Element selector
   * @param {number} expectedCount - Expected count (or min count if options.min)
   * @param {Object} options - Options { min: boolean, max: number }
   */
  async assertCount(selector, expectedCount, options = {}) {
    const count = await this.page.locator(selector).count();

    if (options.min && count < expectedCount) {
      throw new Error(`Expected at least ${expectedCount} elements, found ${count}`);
    } else if (options.max !== undefined && count > options.max) {
      throw new Error(`Expected at most ${options.max} elements, found ${count}`);
    } else if (!options.min && count !== expectedCount) {
      throw new Error(`Expected ${expectedCount} elements, found ${count}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Utility Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} Screenshot path
   */
  async screenshot(name) {
    const filename = `${Date.now()}-${this._sanitizeFilename(this.testName)}-${this._sanitizeFilename(name)}.png`;
    const filepath = path.join(CONFIG.SCREENSHOTS_DIR, filename);

    await this.page.screenshot({
      path: filepath,
      fullPage: true,
    });

    console.log(`   📸 Screenshot: ${filename}`);
    return filepath;
  }

  /**
   * Wait for a condition with retry
   * @param {Function} condition - Async function that returns boolean
   * @param {Object} options - Options { timeout, interval, message }
   */
  async waitFor(condition, options = {}) {
    const timeout = options.timeout || CONFIG.TIMEOUTS.medium;
    const interval = options.interval || 100;
    const message = options.message || 'Condition not met';

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return;
        }
      } catch (e) {
        // Ignore errors during condition check
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error(`${message} (timeout: ${timeout}ms)`);
  }

  /**
   * Clear console errors (useful between tests)
   */
  clearConsoleErrors() {
    this.consoleErrors = [];
    this.consoleWarnings = [];
  }

  /**
   * Get element count
   * @param {string} selector - Element selector
   * @returns {Promise<number>}
   */
  async getCount(selector) {
    return this.page.locator(selector).count();
  }

  /**
   * Check if element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>}
   */
  async exists(selector) {
    return (await this.page.locator(selector).count()) > 0;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Interaction Helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Click an element
   * @param {string} selector - Element selector
   * @param {Object} options - Click options
   */
  async click(selector, options = {}) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: options.timeout || CONFIG.TIMEOUTS.medium });
    await locator.click(options);
  }

  /**
   * Fill an input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.medium });
    await locator.fill(value);
  }

  /**
   * Get text content of an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>}
   */
  async getText(selector) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.medium });
    return locator.textContent();
  }

  /**
   * Get input value
   * @param {string} selector - Input selector
   * @returns {Promise<string>}
   */
  async getInputValue(selector) {
    const locator = this.page.locator(selector).first();
    return locator.inputValue();
  }

  /**
   * Select option from dropdown
   * @param {string} selector - Select element selector
   * @param {string} value - Value to select
   */
  async select(selector, value) {
    const locator = this.page.locator(selector).first();
    await locator.selectOption(value);
  }

  /**
   * Wait for API response
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Function} action - Action to trigger the request
   * @returns {Promise<Object>} Response object with status and body
   */
  async waitForResponse(urlPattern, action) {
    const responsePromise = this.page.waitForResponse(
      (response) => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout: CONFIG.TIMEOUTS.medium }
    );

    await action();
    const response = await responsePromise;

    return {
      status: response.status(),
      url: response.url(),
      body: await response.json().catch(() => null),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Additional Assertions
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Assert input has specific value
   * @param {string} selector - Input selector
   * @param {string} expectedValue - Expected value
   */
  async assertInputValue(selector, expectedValue) {
    const value = await this.getInputValue(selector);
    if (value !== expectedValue) {
      throw new Error(`Expected input value "${expectedValue}", got "${value}"`);
    }
  }

  /**
   * Assert element is enabled
   * @param {string} selector - Element selector
   */
  async assertEnabled(selector) {
    const locator = this.page.locator(selector).first();
    const isDisabled = await locator.isDisabled();
    if (isDisabled) {
      throw new Error(`Element is disabled: ${selector}`);
    }
  }

  /**
   * Assert element is disabled
   * @param {string} selector - Element selector
   */
  async assertDisabled(selector) {
    const locator = this.page.locator(selector).first();
    const isDisabled = await locator.isDisabled();
    if (!isDisabled) {
      throw new Error(`Element is not disabled: ${selector}`);
    }
  }

  /**
   * Assert element has specific attribute value
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @param {string} expectedValue - Expected value
   */
  async assertAttribute(selector, attribute, expectedValue) {
    const locator = this.page.locator(selector).first();
    const value = await locator.getAttribute(attribute);
    if (value !== expectedValue) {
      throw new Error(`Expected ${attribute}="${expectedValue}", got "${value}"`);
    }
  }

  /**
   * Clear network errors (useful between test sections)
   */
  clearNetworkErrors() {
    this.networkErrors = [];
  }

  /**
   * Clear all captured errors
   */
  clearAllErrors() {
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.networkErrors = [];
  }

  /**
   * Assert no network errors occurred
   * @param {Object} options - Options { ignore: [status codes to ignore] }
   */
  async assertNoNetworkErrors(options = {}) {
    const ignoredStatuses = options.ignore || [404]; // 404s are often expected

    const errors = this.networkErrors.filter((e) => !ignoredStatuses.includes(e.status));

    if (errors.length > 0) {
      const errorList = errors.slice(0, 3).map((e) => `${e.status} ${e.url}`).join('\n   - ');
      throw new Error(`Network errors detected:\n   - ${errorList}`);
    }
  }

  /**
   * Assert checkbox/radio is checked
   * @param {string} selector - Input selector
   */
  async assertChecked(selector) {
    const locator = this.page.locator(selector).first();
    const isChecked = await locator.isChecked();
    if (!isChecked) {
      throw new Error(`Element is not checked: ${selector}`);
    }
  }

  /**
   * Assert checkbox/radio is not checked
   * @param {string} selector - Input selector
   */
  async assertNotChecked(selector) {
    const locator = this.page.locator(selector).first();
    const isChecked = await locator.isChecked();
    if (isChecked) {
      throw new Error(`Element is checked: ${selector}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Additional Interaction Helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Set viewport size (use with CONFIG.VIEWPORTS presets)
   * @param {string|Object} viewport - Preset name ('mobile', 'tablet', 'laptop', 'desktop') or { width, height }
   */
  async setViewport(viewport) {
    let size;
    if (typeof viewport === 'string') {
      size = CONFIG.VIEWPORTS[viewport];
      if (!size) {
        throw new Error(`Unknown viewport preset: ${viewport}. Available: ${Object.keys(CONFIG.VIEWPORTS).join(', ')}`);
      }
      console.log(`   📱 Viewport: ${viewport} (${size.width}x${size.height})`);
    } else {
      size = viewport;
      console.log(`   📱 Viewport: ${size.width}x${size.height}`);
    }
    await this.page.setViewportSize(size);
  }

  /**
   * Hover over an element
   * @param {string} selector - Element selector
   */
  async hover(selector) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.medium });
    await locator.hover();
  }

  /**
   * Press keyboard key(s)
   * @param {string} key - Key or key combination (e.g., 'Enter', 'Control+a', 'Escape')
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text (character by character, useful for autocomplete/search)
   * @param {string} text - Text to type
   * @param {Object} options - Options { delay: ms between keys }
   */
  async type(text, options = {}) {
    await this.page.keyboard.type(text, { delay: options.delay || 50 });
  }

  /**
   * Check a checkbox or radio button
   * @param {string} selector - Input selector
   */
  async check(selector) {
    const locator = this.page.locator(selector).first();
    await locator.check();
  }

  /**
   * Uncheck a checkbox
   * @param {string} selector - Input selector
   */
  async uncheck(selector) {
    const locator = this.page.locator(selector).first();
    await locator.uncheck();
  }

  /**
   * Scroll element into view
   * @param {string} selector - Element selector
   */
  async scrollIntoView(selector) {
    const locator = this.page.locator(selector).first();
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element and return its locator
   * @param {string} selector - Element selector
   * @param {Object} options - Options { state: 'visible'|'attached', timeout }
   * @returns {Promise<import('playwright').Locator>}
   */
  async waitForSelector(selector, options = {}) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({
      state: options.state || 'visible',
      timeout: options.timeout || CONFIG.TIMEOUTS.medium,
    });
    return locator;
  }

  /**
   * Double-click an element
   * @param {string} selector - Element selector
   */
  async doubleClick(selector) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: CONFIG.TIMEOUTS.medium });
    await locator.dblclick();
  }

  /**
   * Focus an element
   * @param {string} selector - Element selector
   */
  async focus(selector) {
    const locator = this.page.locator(selector).first();
    await locator.focus();
  }

  /**
   * Blur (unfocus) an element
   * @param {string} selector - Element selector
   */
  async blur(selector) {
    const locator = this.page.locator(selector).first();
    await locator.blur();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ──────────────────────────────────────────────────────────────────────────

  _printHeader() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🧪 E2E Test Suite: ${this.testName}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`⚙️  Base URL:  ${CONFIG.BASE_URL}`);
    console.log(`⚙️  Headless:  ${CONFIG.HEADLESS}`);
    console.log(`⚙️  Viewport:  ${CONFIG.VIEWPORT.width}x${CONFIG.VIEWPORT.height}`);
    if (CONFIG.SLOW_MO > 0) {
      console.log(`⚙️  Slow Mo:   ${CONFIG.SLOW_MO}ms`);
    }
    console.log('');
  }

  _printSummary(passed, failed, skipped, duration) {
    console.log(`${'─'.repeat(60)}`);
    console.log('📊 Test Results');
    console.log(`${'─'.repeat(60)}`);

    // Print each result
    this.testResults.forEach((r) => {
      const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
      const time = r.duration ? ` (${r.duration}ms)` : '';
      console.log(`${icon} ${r.name}${time}`);
      if (r.error) {
        console.log(`   Error: ${r.error}`);
      }
      if (r.reason) {
        console.log(`   Reason: ${r.reason}`);
      }
    });

    console.log(`${'─'.repeat(60)}`);
    console.log(`✅ Passed:  ${passed}`);
    console.log(`❌ Failed:  ${failed}`);
    if (skipped > 0) {
      console.log(`⏭️  Skipped: ${skipped}`);
    }
    console.log(`⏱️  Duration: ${duration}s`);

    // Warnings
    if (this.consoleWarnings.length > 0) {
      console.log(`\n⚠️  Console warnings: ${this.consoleWarnings.length}`);
    }
    if (this.networkErrors.length > 0) {
      console.log(`⚠️  Network errors: ${this.networkErrors.length}`);
      this.networkErrors.slice(0, 3).forEach((e) => {
        console.log(`   - ${e.status} ${e.url}`);
      });
    }

    console.log(`${'═'.repeat(60)}\n`);
  }

  _sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run a test suite with automatic setup/login/teardown
 *
 * @param {string} testName - Name of the test suite
 * @param {Function} testFn - Test function receiving E2ETestRunner instance
 *
 * @example
 * import { runTest, SELECTORS } from '../config.mjs';
 *
 * runTest('My Test Suite', async (runner) => {
 *   await runner.test('Page loads', async () => {
 *     await runner.goto('/dashboard');
 *     await runner.assertVisible(SELECTORS.layout.mainContent);
 *   });
 * });
 */
export async function runTest(testName, testFn) {
  const runner = new E2ETestRunner(testName);

  try {
    await runner.setup();
    await runner.login();
    await testFn(runner);
    const success = await runner.teardown();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack.split('\n').slice(1, 4).join('\n'));
    }
    await runner.teardown();
    process.exit(1);
  }
}

/**
 * Run a test suite WITHOUT login (for public routes, login page testing)
 *
 * @param {string} testName - Name of the test suite
 * @param {Function} testFn - Test function receiving E2ETestRunner instance
 *
 * @example
 * import { runTestWithoutLogin, SELECTORS, ROUTES } from '../config.mjs';
 *
 * runTestWithoutLogin('Login Page Tests', async (runner) => {
 *   await runner.test('Login page loads', async () => {
 *     await runner.goto(ROUTES.auth);
 *     await runner.assertVisible(SELECTORS.auth.emailInput);
 *   });
 *
 *   await runner.test('Invalid credentials show error', async () => {
 *     await runner.fill(SELECTORS.auth.emailInput, 'bad@email.com');
 *     await runner.fill(SELECTORS.auth.passwordInput, 'wrongpass');
 *     await runner.click(SELECTORS.auth.submitButton);
 *     await runner.assertVisible(SELECTORS.auth.errorAlert);
 *   });
 * });
 */
export async function runTestWithoutLogin(testName, testFn) {
  const runner = new E2ETestRunner(testName);

  try {
    await runner.setup();
    // Skip login - go directly to tests
    console.log('🔓 Running without authentication\n');
    await testFn(runner);
    const success = await runner.teardown();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack.split('\n').slice(1, 4).join('\n'));
    }
    await runner.teardown();
    process.exit(1);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS SUMMARY
// ════════════════════════════════════════════════════════════════════════════

export default {
  CONFIG,
  ROUTES,
  SELECTORS,
  E2ETestRunner,
  runTest,
  runTestWithoutLogin,
};
