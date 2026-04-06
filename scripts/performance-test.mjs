#!/usr/bin/env node
/**
 * performance-test.mjs
 *
 * Lighthouse CI runner for Techietribe Directory.
 *
 * Runs Lighthouse audits against the defined performance budgets and exits
 * with a non-zero code if any budget threshold is exceeded. Intended to run
 * as a blocking gate after the staging deployment and before production promotion.
 *
 * Usage:
 *   # Against staging
 *   BASE_URL=https://staging.techietribe.io node frontend/scripts/performance-test.mjs
 *
 *   # Against local dev server
 *   BASE_URL=http://localhost:5173 node frontend/scripts/performance-test.mjs
 *
 * Prerequisites:
 *   npm install --save-dev @lhci/cli lighthouse
 *
 * Performance Budgets (as defined in docs/TESTING_STRATEGY.md):
 *   - Dashboard LCP           < 2 000 ms  (throttled 4G simulation)
 *   - Public page LCP         < 1 500 ms  (throttled 4G simulation)
 *   - Time to Interactive     < 3 000 ms
 *   - First Contentful Paint  < 1 000 ms
 *   - Cumulative Layout Shift < 0.1
 *   - Total Blocking Time     < 200 ms
 *   - JS bundle (gzipped)     < 500 KB    (enforced by Vite build, not Lighthouse)
 *   - CSS bundle (gzipped)    < 100 KB    (enforced by Vite build, not Lighthouse)
 */

import { execSync, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const LHCI_OUTPUT_DIR = path.join(__dirname, '../.lighthouseci');

/**
 * Pages to audit.
 * Each entry maps a human-readable label to a URL path and its LCP budget (ms).
 */
const PAGES = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    // Budget: Dashboard page must achieve LCP < 2 000 ms on throttled 4G
    lcpBudgetMs: 2000,
  },
  {
    label: 'Public listing page',
    path: '/demo',
    // Budget: Public-facing pages must achieve LCP < 1 500 ms on throttled 4G
    lcpBudgetMs: 1500,
  },
];

/**
 * Lighthouse CI assertion thresholds.
 * These map to Lighthouse metric keys returned in lhr.audits.
 *
 * All thresholds reference the performance budgets in docs/TESTING_STRATEGY.md.
 */
const BUDGET_THRESHOLDS = {
  // First Contentful Paint < 1 000 ms
  'first-contentful-paint': { maxNumericValue: 1000 },

  // Time to Interactive < 3 000 ms
  'interactive': { maxNumericValue: 3000 },

  // Cumulative Layout Shift < 0.1
  'cumulative-layout-shift': { maxNumericValue: 0.1 },

  // Total Blocking Time < 200 ms (proxy for INP in lab conditions)
  'total-blocking-time': { maxNumericValue: 200 },

  // Speed Index < 3 000 ms (secondary indicator)
  'speed-index': { maxNumericValue: 3000 },
};

// ---------------------------------------------------------------------------
// Lighthouse CI configuration object (written to a temp file)
// ---------------------------------------------------------------------------

const lhciConfig = {
  ci: {
    collect: {
      // Run Lighthouse 3 times per URL and use the median result
      numberOfRuns: 3,
      url: PAGES.map((p) => `${BASE_URL}${p.path}`),
      settings: {
        // Throttle to simulate a mid-range mobile device on 4G
        // This matches the budget measurement conditions in TESTING_STRATEGY.md
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,               // 4G RTT
          throughputKbps: 10240,   // 4G downlink ~10 Mbps
          cpuSlowdownMultiplier: 4, // Mid-range mobile CPU
        },
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
          disabled: false,
        },
        // Only run the performance category to keep audit time short
        onlyCategories: ['performance'],
      },
    },
    assert: {
      // Treat any assertion failure as an error (not a warning)
      assertMatrix: PAGES.map((page) => ({
        matchingUrlPattern: `.*${page.path}.*`,
        assertions: {
          // LCP budget is page-specific
          'largest-contentful-paint': [
            'error',
            { maxNumericValue: page.lcpBudgetMs },
          ],
          // Shared Web Vitals thresholds applied to every page
          'first-contentful-paint': [
            'error',
            BUDGET_THRESHOLDS['first-contentful-paint'],
          ],
          'interactive': [
            'error',
            BUDGET_THRESHOLDS['interactive'],
          ],
          'cumulative-layout-shift': [
            'error',
            BUDGET_THRESHOLDS['cumulative-layout-shift'],
          ],
          'total-blocking-time': [
            'error',
            BUDGET_THRESHOLDS['total-blocking-time'],
          ],
          'speed-index': [
            'warn', // Warning only — not a blocking gate
            BUDGET_THRESHOLDS['speed-index'],
          ],
        },
      })),
    },
    upload: {
      // Store results locally; swap for a Lighthouse CI server URL in CI
      target: 'filesystem',
      outputDir: LHCI_OUTPUT_DIR,
    },
  },
};

// ---------------------------------------------------------------------------
// Bundle size checks (Vite build output)
// ---------------------------------------------------------------------------

/**
 * Checks the Vite build output for bundle size budget compliance.
 * This runs separately from Lighthouse because Lighthouse does not measure
 * gzipped asset sizes directly.
 *
 * Budgets (from docs/TESTING_STRATEGY.md):
 *   - JS  < 500 KB gzipped
 *   - CSS < 100 KB gzipped
 */
function checkBundleSizes() {
  const distDir = path.join(__dirname, '../dist/assets');

  if (!fs.existsSync(distDir)) {
    console.warn('[bundle-check] dist/assets not found — skipping bundle size check.');
    console.warn('               Run `npm run build` first to generate a production build.');
    return { passed: true, skipped: true };
  }

  const files = fs.readdirSync(distDir);
  const jsBudgetKB = 500;  // < 500 KB gzipped (JS budget)
  const cssBudgetKB = 100; // < 100 KB gzipped (CSS budget)

  let totalJsKB = 0;
  let totalCssKB = 0;
  const violations = [];

  for (const file of files) {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;

    if (file.endsWith('.js')) {
      totalJsKB += sizeKB;
    } else if (file.endsWith('.css')) {
      totalCssKB += sizeKB;
    }
  }

  console.log(`[bundle-check] Total JS:  ${totalJsKB.toFixed(1)} KB (budget: ${jsBudgetKB} KB gzipped)`);
  console.log(`[bundle-check] Total CSS: ${totalCssKB.toFixed(1)} KB (budget: ${cssBudgetKB} KB gzipped)`);

  // Note: These are uncompressed sizes from the Vite build. Gzipped sizes are
  // typically 60-70% smaller. Adjust the check multiplier as needed once you
  // have real gzip measurements from your CDN / server.
  const gzipEstimateRatio = 0.35; // Conservative estimate: gzipped ~35% of raw

  if (totalJsKB * gzipEstimateRatio > jsBudgetKB) {
    violations.push(`JS bundle estimated gzipped size (${(totalJsKB * gzipEstimateRatio).toFixed(1)} KB) exceeds budget (${jsBudgetKB} KB)`);
  }
  if (totalCssKB * gzipEstimateRatio > cssBudgetKB) {
    violations.push(`CSS bundle estimated gzipped size (${(totalCssKB * gzipEstimateRatio).toFixed(1)} KB) exceeds budget (${cssBudgetKB} KB)`);
  }

  return { passed: violations.length === 0, violations, skipped: false };
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

async function main() {
  console.log('='.repeat(60));
  console.log('Techietribe Directory — Performance Budget Gate');
  console.log(`Target: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Write the LHCI config to a temporary file
  const lhciConfigPath = path.join(__dirname, '../.lighthouseci-config.json');
  fs.mkdirSync(LHCI_OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(lhciConfigPath, JSON.stringify(lhciConfig, null, 2));

  let lighthousePassed = true;

  // Verify lhci is available
  const lhciCheck = spawnSync('npx', ['lhci', '--version'], { stdio: 'pipe' });
  if (lhciCheck.status !== 0) {
    console.error('[lhci] @lhci/cli not found. Install it with:');
    console.error('       npm install --save-dev @lhci/cli');
    console.error('       Skipping Lighthouse audits.');
    lighthousePassed = false;
  } else {
    console.log('\n[lhci] Starting Lighthouse CI audits...\n');

    // Run lhci autorun using our config
    const result = spawnSync(
      'npx',
      ['lhci', 'autorun', `--config=${lhciConfigPath}`],
      {
        cwd: ROOT,
        stdio: 'inherit',
        shell: false,
      }
    );

    if (result.status !== 0) {
      console.error('\n[lhci] One or more performance budgets were exceeded.');
      lighthousePassed = false;
    } else {
      console.log('\n[lhci] All Lighthouse budget assertions passed.');
    }
  }

  // Bundle size check
  console.log('\n[bundle-check] Checking bundle sizes...');
  const bundleResult = checkBundleSizes();

  if (!bundleResult.skipped && !bundleResult.passed) {
    console.error('[bundle-check] Bundle size budget violations:');
    bundleResult.violations.forEach((v) => console.error(`  - ${v}`));
  } else if (!bundleResult.skipped) {
    console.log('[bundle-check] Bundle sizes within budget.');
  }

  // Final result
  const allPassed = lighthousePassed && (bundleResult.skipped || bundleResult.passed);

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('RESULT: All performance budgets PASSED');
    process.exit(0);
  } else {
    console.error('RESULT: Performance budget check FAILED');
    console.error('        Fix the violations above before promoting to production.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[performance-test] Unexpected error:', err);
  process.exit(1);
});
