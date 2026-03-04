#!/usr/bin/env node

/**
 * E2E Test Suite Runner
 * =====================
 *
 * Unified runner for all E2E tests with aggregated reporting.
 *
 * Usage:
 *   node e2e/run-all.mjs              # Run all tests
 *   node e2e/run-all.mjs --filter=list  # Run only tests matching "list"
 *   node e2e/run-all.mjs --ci         # CI mode (JSON output)
 *   node e2e/run-all.mjs --headed     # Show browser (non-headless)
 *
 * Environment Variables:
 *   E2E_BASE_URL      - Frontend URL (default: http://localhost:5173)
 *   E2E_API_URL       - Backend API URL (default: http://localhost:3000/api)
 *   E2E_TEST_EMAIL    - Test user email
 *   E2E_TEST_PASSWORD - Test user password
 *   E2E_HEADLESS      - Run headless (default: true)
 *   E2E_SLOW_MO       - Slow down actions (ms)
 *
 * @module e2e/run-all
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Test files in execution order
 * Order matters: list -> create -> customize -> editor -> preview
 */
const TEST_FILES = [
  { name: '01-list', file: 'tests/01-list.test.mjs', description: 'Websites List Page' },
  { name: '02-create', file: 'tests/02-create.test.mjs', description: 'Create Website Wizard' },
  { name: '03-customize', file: 'tests/03-customize.test.mjs', description: 'Website Customization' },
  { name: '04-editor', file: 'tests/04-editor.test.mjs', description: 'Website Editor' },
  { name: '05-preview', file: 'tests/05-preview.test.mjs', description: 'Template Preview & Public Website' },
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    filter: null,
    ci: false,
    headed: false,
    help: false,
    verbose: false,
    bail: false, // Stop on first failure
    list: false, // List tests without running
    timeout: null, // Custom timeout multiplier
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--headed') {
      options.headed = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--bail' || arg === '-b') {
      options.bail = true;
    } else if (arg === '--list' || arg === '-l') {
      options.list = true;
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('-f=')) {
      options.filter = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseFloat(arg.split('=')[1]);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
E2E Test Suite Runner
=====================

Usage:
  node e2e/run-all.mjs [options]

Options:
  --help, -h       Show this help message
  --list, -l       List available test suites without running
  --filter=NAME    Run only tests matching NAME (e.g., --filter=list)
  --ci             CI mode: JSON output, strict error handling
  --headed         Show browser window (non-headless mode)
  --verbose, -v    Show detailed output
  --bail, -b       Stop on first test failure
  --timeout=N      Timeout multiplier (e.g., --timeout=2 doubles timeouts)

Available Test Suites:
${TEST_FILES.map((t) => `  ${t.name.padEnd(12)} - ${t.description}`).join('\n')}

Environment Variables:
  E2E_BASE_URL      Frontend URL (default: http://localhost:5173)
  E2E_API_URL       Backend API URL (default: http://localhost:3000/api)
  E2E_TEST_EMAIL    Test user email
  E2E_TEST_PASSWORD Test user password
  E2E_HEADLESS      Run headless (default: true, set 'false' for browser)
  E2E_SLOW_MO       Slow down actions by ms (default: 0)

Examples:
  node e2e/run-all.mjs                    # Run all tests
  node e2e/run-all.mjs --list             # List test suites
  node e2e/run-all.mjs --filter=list      # Run list tests only
  node e2e/run-all.mjs --filter=create    # Run create tests only
  node e2e/run-all.mjs --headed           # Run with visible browser
  node e2e/run-all.mjs --ci               # CI mode with JSON output
  node e2e/run-all.mjs --bail             # Stop on first failure
  node e2e/run-all.mjs --timeout=2        # Double all timeouts

npm Scripts:
  npm run e2e            # Run all tests
  npm run e2e:list       # Run list tests
  npm run e2e:create     # Run create tests
  npm run e2e:customize  # Run customize tests
  npm run e2e:editor     # Run editor tests
  npm run e2e:preview    # Run preview tests
  npm run e2e:headed     # Run with visible browser
  npm run e2e:ci         # CI mode with JSON output
  npm run e2e:bail       # Stop on first failure
`);
}

// ════════════════════════════════════════════════════════════════════════════
// TEST EXECUTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run a single test file
 * @param {Object} testInfo - Test file info
 * @param {Object} options - Run options
 * @returns {Promise<Object>} Test result
 */
function runTestFile(testInfo, options) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const testPath = path.join(__dirname, testInfo.file);

    // Check file exists
    if (!fs.existsSync(testPath)) {
      resolve({
        name: testInfo.name,
        description: testInfo.description,
        status: 'error',
        duration: 0,
        error: `Test file not found: ${testInfo.file}`,
        passed: 0,
        failed: 0,
        skipped: 0,
      });
      return;
    }

    // Build environment
    const env = { ...process.env };
    if (options.headed) {
      env.E2E_HEADLESS = 'false';
    }
    if (options.timeout) {
      env.E2E_TIMEOUT_MULTIPLIER = String(options.timeout);
    }

    // Spawn test process - always pipe to capture output
    const child = spawn('node', [testPath], {
      cwd: path.join(__dirname, '..'),
      env,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        // In verbose mode, also print to console
        if (options.verbose) {
          process.stdout.write(text);
        }
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        // In verbose mode, also print to console
        if (options.verbose) {
          process.stderr.write(text);
        }
      });
    }

    child.on('close', (code) => {
      const duration = Date.now() - startTime;

      // Parse results from stdout
      const result = parseTestOutput(stdout);

      resolve({
        name: testInfo.name,
        description: testInfo.description,
        status: code === 0 ? 'pass' : 'fail',
        duration,
        exitCode: code,
        passed: result.passed,
        failed: result.failed,
        skipped: result.skipped,
        output: options.ci ? undefined : stdout,
        error: code !== 0 ? (stderr || result.error || 'Test failed') : undefined,
      });
    });

    child.on('error', (err) => {
      resolve({
        name: testInfo.name,
        description: testInfo.description,
        status: 'error',
        duration: Date.now() - startTime,
        error: err.message,
        passed: 0,
        failed: 0,
        skipped: 0,
      });
    });
  });
}

/**
 * Parse test output to extract counts
 * @param {string} output - Stdout from test
 * @returns {Object} Parsed counts
 */
function parseTestOutput(output) {
  const result = { passed: 0, failed: 0, skipped: 0, error: null };

  if (!output) return result;

  // Look for summary lines like "✅ Passed:  25"
  const passedMatch = output.match(/Passed:\s*(\d+)/);
  const failedMatch = output.match(/Failed:\s*(\d+)/);
  const skippedMatch = output.match(/Skipped:\s*(\d+)/);

  if (passedMatch) result.passed = parseInt(passedMatch[1], 10);
  if (failedMatch) result.failed = parseInt(failedMatch[1], 10);
  if (skippedMatch) result.skipped = parseInt(skippedMatch[1], 10);

  // Look for fatal error
  const errorMatch = output.match(/Fatal error: (.+)/);
  if (errorMatch) {
    result.error = errorMatch[1];
  }

  return result;
}

// ════════════════════════════════════════════════════════════════════════════
// REPORTING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print styled header
 */
function printHeader() {
  console.log(`
${'═'.repeat(70)}
  E2E TEST SUITE - Techietribe Directory
${'═'.repeat(70)}
`);
}

/**
 * Print test suite start
 * @param {Object} testInfo - Test info
 * @param {number} index - Test index
 * @param {number} total - Total tests
 */
function printTestStart(testInfo, index, total) {
  console.log(`\n[${index + 1}/${total}] Running: ${testInfo.description}`);
  console.log(`    File: ${testInfo.file}`);
}

/**
 * Print test result
 * @param {Object} result - Test result
 */
function printTestResult(result) {
  const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  const duration = (result.duration / 1000).toFixed(1);

  console.log(`    ${statusIcon} ${result.status.toUpperCase()} (${duration}s)`);
  console.log(`    Tests: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped`);

  if (result.error) {
    const errorMsg = result.error.length > 200 ? result.error.substring(0, 200) + '...' : result.error;
    console.log(`    Error: ${errorMsg}`);
  }
}

/**
 * Print summary report
 * @param {Array} results - All test results
 * @param {number} totalDuration - Total duration in ms
 */
function printSummary(results, totalDuration) {
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const errored = results.filter((r) => r.status === 'error').length;

  const totalTests = results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  console.log(`
${'═'.repeat(70)}
  SUMMARY
${'═'.repeat(70)}

  Test Suites: ${passed} passed, ${failed + errored} failed, ${results.length} total
  Tests:       ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped, ${totalTests} total
  Duration:    ${(totalDuration / 1000).toFixed(1)}s

${'─'.repeat(70)}
  Results by Suite:
${'─'.repeat(70)}
`);

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const duration = (result.duration / 1000).toFixed(1);
    const stats = `${result.passed}/${result.passed + result.failed + result.skipped}`;

    console.log(`  ${icon} ${result.name.padEnd(15)} ${stats.padStart(6)} tests  (${duration}s)`);
  }

  console.log(`
${'═'.repeat(70)}
`);

  if (failed + errored > 0) {
    console.log('  ❌ Some tests failed. See output above for details.\n');
  } else {
    console.log('  ✅ All test suites passed!\n');
  }
}

/**
 * Output CI-friendly JSON report
 * @param {Array} results - All test results
 * @param {number} totalDuration - Total duration
 */
function outputCIReport(results, totalDuration) {
  const report = {
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    environment: {
      baseUrl: process.env.E2E_BASE_URL || 'http://localhost:5173',
      apiUrl: process.env.E2E_API_URL || 'http://localhost:3000/api',
      headless: process.env.E2E_HEADLESS !== 'false',
      nodeVersion: process.version,
      platform: process.platform,
    },
    summary: {
      suites: {
        total: results.length,
        passed: results.filter((r) => r.status === 'pass').length,
        failed: results.filter((r) => r.status !== 'pass').length,
      },
      tests: {
        total: results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0),
        passed: results.reduce((sum, r) => sum + r.passed, 0),
        failed: results.reduce((sum, r) => sum + r.failed, 0),
        skipped: results.reduce((sum, r) => sum + r.skipped, 0),
      },
    },
    suites: results.map((r) => ({
      name: r.name,
      description: r.description,
      status: r.status,
      duration: r.duration,
      tests: {
        passed: r.passed,
        failed: r.failed,
        skipped: r.skipped,
      },
      error: r.error || null,
    })),
  };

  // Write to file
  const reportPath = path.join(__dirname, '..', 'e2e-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nCI Report written to: e2e-report.json`);

  // Also output to stdout for CI systems
  console.log('\n--- CI REPORT START ---');
  console.log(JSON.stringify(report));
  console.log('--- CI REPORT END ---\n');
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print list of available test suites
 * @param {Array} tests - Test files to list
 */
function printTestList(tests) {
  console.log('\nAvailable E2E Test Suites:');
  console.log('─'.repeat(50));
  for (const t of tests) {
    console.log(`  ${t.name.padEnd(14)} ${t.description}`);
    console.log(`                 File: ${t.file}`);
  }
  console.log('─'.repeat(50));
  console.log(`\nTotal: ${tests.length} test suite(s)\n`);
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // List mode - show tests and exit
  if (options.list) {
    printTestList(TEST_FILES);
    process.exit(0);
  }

  // Filter tests if specified
  let testsToRun = TEST_FILES;
  if (options.filter) {
    testsToRun = TEST_FILES.filter(
      (t) =>
        t.name.toLowerCase().includes(options.filter) ||
        t.description.toLowerCase().includes(options.filter)
    );

    if (testsToRun.length === 0) {
      console.error(`No tests match filter: "${options.filter}"`);
      console.error(`Available: ${TEST_FILES.map((t) => t.name).join(', ')}`);
      process.exit(1);
    }
  }

  // Print header (unless CI mode)
  if (!options.ci) {
    printHeader();
    console.log(`Running ${testsToRun.length} test suite(s)...`);
    if (options.filter) {
      console.log(`Filter: "${options.filter}"`);
    }
    if (options.headed) {
      console.log(`Mode: Headed (browser visible)`);
    }
  }

  const startTime = Date.now();
  const results = [];

  // Run tests sequentially
  for (let i = 0; i < testsToRun.length; i++) {
    const testInfo = testsToRun[i];

    if (!options.ci) {
      printTestStart(testInfo, i, testsToRun.length);
    }

    const result = await runTestFile(testInfo, options);
    results.push(result);

    if (!options.ci) {
      printTestResult(result);
    }

    // Bail on failure if requested
    if (options.bail && result.status !== 'pass') {
      console.log('\n⚠️  Bail: Stopping due to test failure');
      break;
    }
  }

  const totalDuration = Date.now() - startTime;

  // Output results
  if (options.ci) {
    outputCIReport(results, totalDuration);
  } else {
    printSummary(results, totalDuration);
  }

  // Exit with appropriate code
  const hasFailures = results.some((r) => r.status !== 'pass');
  process.exit(hasFailures ? 1 : 0);
}

// Run
main().catch((err) => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
