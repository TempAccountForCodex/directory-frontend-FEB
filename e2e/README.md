# E2E Test Suite

End-to-end tests for the Techietribe Directory dashboard using Playwright.

## Prerequisites

```bash
# Install Playwright (run from frontend directory)
npx playwright install chromium

# Or install with system dependencies (CI/Linux)
npx playwright install chromium --with-deps
```

**Requirements:**
- Node.js 20+
- Backend server running on port 3000
- Frontend dev server running on port 5173
- Test user account in database

## Quick Start

```bash
# Run all tests
npm run e2e

# Run specific test suite
npm run e2e:list      # Websites list page
npm run e2e:create    # Create website wizard
npm run e2e:customize # Website customization
npm run e2e:editor    # Website editor
npm run e2e:preview   # Template preview & public website

# Debug mode (visible browser)
npm run e2e:headed

# CI mode (JSON report)
npm run e2e:ci
```

## Test Suites

| Suite | File | Tests | Description |
|-------|------|-------|-------------|
| 01-list | `tests/01-list.test.mjs` | 25+ | Dashboard websites list, stats, tabs, card actions |
| 02-create | `tests/02-create.test.mjs` | 32 | Create website wizard, template selection |
| 03-customize | `tests/03-customize.test.mjs` | 34 | Website customization form, validation |
| 04-editor | `tests/04-editor.test.mjs` | 35+ | Website editor, blocks, save/publish |
| 05-preview | `tests/05-preview.test.mjs` | 33+ | Template preview, public website, SEO |

**Total: 159+ tests**

## Architecture

```
e2e/
├── config.mjs          # Shared config, selectors, E2ETestRunner class
├── run-all.mjs         # Unified test runner with CLI options
├── README.md           # This file
└── tests/
    ├── 01-list.test.mjs
    ├── 02-create.test.mjs
    ├── 03-customize.test.mjs
    ├── 04-editor.test.mjs
    └── 05-preview.test.mjs
```

## Configuration

### Quick Setup

```bash
# Copy the example config
cp .env.e2e.example .env.e2e

# Edit with your test credentials
nano .env.e2e
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `http://localhost:5173` | Frontend URL |
| `E2E_API_URL` | `http://localhost:3000/api` | Backend API URL |
| `E2E_TEST_EMAIL` | `test@example.com` | Test user email |
| `E2E_TEST_PASSWORD` | `Test@123456` | Test user password |
| `E2E_HEADLESS` | `true` | Run headless (`false` for browser) |
| `E2E_SLOW_MO` | `0` | Slow down actions (ms) |
| `E2E_TIMEOUT_MULTIPLIER` | `1` | Multiply all timeouts |

### CLI Options

```bash
node e2e/run-all.mjs [options]

Options:
  --help, -h       Show help message
  --list, -l       List available test suites
  --filter=NAME    Run tests matching NAME
  --ci             CI mode with JSON output
  --headed         Show browser window
  --verbose, -v    Show detailed output
  --bail, -b       Stop on first failure
  --timeout=N      Timeout multiplier
```

## Writing Tests

### Basic Test Structure

```javascript
import { runTest, SELECTORS, ROUTES, CONFIG } from '../config.mjs';

runTest('My Test Suite', async (runner) => {
  // Tests run after automatic login

  await runner.test('Page loads correctly', async () => {
    await runner.goto(ROUTES.dashboard);
    await runner.assertVisible(SELECTORS.layout.mainContent);
  });

  await runner.test('Can interact with elements', async () => {
    await runner.click('button:has-text("Create")');
    await runner.assertUrl('/create');
  });
});
```

### Testing Public Routes (No Login)

```javascript
import { runTestWithoutLogin, ROUTES } from '../config.mjs';

runTestWithoutLogin('Public Page Tests', async (runner) => {
  await runner.test('Template preview loads', async () => {
    await runner.goto(ROUTES.templatePreview('my-template'));
    await runner.assertVisible('.template-preview');
  });
});
```

### Available Runner Methods

#### Navigation
- `goto(path, options)` - Navigate to URL
- `waitForNavigation(pattern, timeout)` - Wait for URL change

#### Assertions
- `assertVisible(selector, timeout)` - Element is visible
- `assertHidden(selector, timeout)` - Element is hidden
- `assertText(selector, text)` - Element contains text
- `assertUrl(pattern)` - URL matches pattern
- `assertCount(selector, count, options)` - Element count
- `assertInputValue(selector, value)` - Input has value
- `assertEnabled(selector)` / `assertDisabled(selector)`
- `assertChecked(selector)` / `assertNotChecked(selector)`
- `assertNoConsoleErrors(strict)` - No console errors
- `assertNoNetworkErrors(options)` - No network errors

#### Interactions
- `click(selector, options)` - Click element
- `fill(selector, value)` - Fill input
- `type(text, options)` - Type character by character
- `hover(selector)` - Hover over element
- `check(selector)` / `uncheck(selector)` - Toggle checkbox
- `select(selector, value)` - Select dropdown option
- `pressKey(key)` - Press keyboard key
- `scrollIntoView(selector)` - Scroll element into view
- `setViewport(preset)` - Change viewport ('mobile', 'tablet', 'desktop')

#### Utilities
- `screenshot(name)` - Take screenshot
- `exists(selector)` - Check if element exists
- `getCount(selector)` - Get element count
- `getText(selector)` - Get element text
- `getInputValue(selector)` - Get input value
- `waitFor(condition, options)` - Wait for condition
- `waitForResponse(pattern, action)` - Wait for API response
- `skip(name, reason)` - Skip a test
- `clearConsoleErrors()` / `clearNetworkErrors()` / `clearAllErrors()`

### Selectors

Use the shared `SELECTORS` object from config.mjs:

```javascript
SELECTORS.auth.emailInput        // Auth form selectors
SELECTORS.layout.sidebar         // Dashboard layout
SELECTORS.websitesList.createButton  // Websites list
SELECTORS.createWizard.templateCard  // Create wizard
SELECTORS.customize.nameInput    // Customize form
SELECTORS.editor.saveButton      // Website editor
SELECTORS.common.dialog          // Common elements
```

### Routes

Use the shared `ROUTES` object:

```javascript
ROUTES.dashboard                 // '/dashboard'
ROUTES.createWebsite             // '/dashboard/websites/create'
ROUTES.customizeWebsite(id)      // '/dashboard/websites/create/customize?template=...'
ROUTES.websiteEditor(id)         // '/dashboard/websites/:id/editor'
ROUTES.templatePreview(id)       // '/template-preview/:id'
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          npx playwright install chromium

      - name: Start services
        run: |
          cd backend && npm ci && npm run dev &
          cd frontend && npm run dev &
          sleep 10

      - name: Run E2E tests
        run: cd frontend && npm run e2e:ci
        env:
          E2E_TEST_EMAIL: ${{ secrets.E2E_TEST_EMAIL }}
          E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-report
          path: frontend/e2e-report.json

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-screenshots
          path: frontend/screenshots/
```

### CI Report Format

The `--ci` flag generates `e2e-report.json`:

```json
{
  "timestamp": "2026-01-26T12:00:00.000Z",
  "duration": 75000,
  "environment": {
    "baseUrl": "http://localhost:5173",
    "apiUrl": "http://localhost:3000/api",
    "headless": true,
    "nodeVersion": "v20.10.0",
    "platform": "linux"
  },
  "summary": {
    "suites": { "total": 5, "passed": 5, "failed": 0 },
    "tests": { "total": 159, "passed": 159, "failed": 0, "skipped": 48 }
  },
  "suites": [...]
}
```

## Troubleshooting

### Tests failing on CI but passing locally

1. Increase timeouts: `npm run e2e -- --timeout=2`
2. Check environment variables are set correctly
3. Ensure services are fully started before tests run

### Authentication failures

1. Verify test user exists in database
2. Check `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` are correct
3. Check for rate limiting (429 errors)

### Element not found errors

1. Run with `--headed` to see what's happening
2. Add `--verbose` for detailed output
3. Take screenshots at failure points (automatic)
4. Check if selectors changed in the UI

### Flaky tests

1. Use `waitFor()` instead of fixed timeouts
2. Clear errors between test sections
3. Ensure proper test isolation

## Best Practices

1. **Use shared selectors** - Add new selectors to `config.mjs`
2. **Prefer data-testid** - More stable than class selectors
3. **Clear errors between sections** - Call `clearAllErrors()` before major interactions
4. **Skip gracefully** - Use `runner.skip()` when preconditions aren't met
5. **Take screenshots** - Use `runner.screenshot()` at key points
6. **Test responsive** - Use `setViewport()` for different screen sizes
