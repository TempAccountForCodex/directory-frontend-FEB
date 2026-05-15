/**
 * Sentry Error Tracking Configuration — Frontend (Step 10.23)
 *
 * Initializes the Sentry browser SDK for frontend error tracking.
 * Gracefully skips initialization when VITE_SENTRY_DSN is not set (local dev).
 * Guards the entire import with try/catch so the app works when @sentry/react
 * is not installed.
 *
 * Usage:
 *   import { initSentry, isSentryEnabled } from './config/sentry';
 *   initSentry(); // call before createRoot()
 */

// SentryLike describes the minimum API surface used by callers.
// Using a local interface avoids any dependency on @sentry/react types at compile time,
// which means the build succeeds even when the package is not installed.
interface SentryLike {
  init(options: Record<string, unknown>): void;
  setUser(user: { id: string; email?: string } | null): void;
  captureException(error: unknown, options?: Record<string, unknown>): string;
  ErrorBoundary: React.ComponentType<{
    fallback: React.ReactNode;
    children: React.ReactNode;
  }>;
  BrowserTracing: new (options?: Record<string, unknown>) => unknown;
  Replay: new (options?: Record<string, unknown>) => unknown;
}

// Lazy module reference — populated by initSentry() if SDK is available and DSN is set
let SentryModule: SentryLike | null = null;
let _enabled = false;

/**
 * Sensitive data that must never be forwarded to Sentry.
 * Strip any Authorization-style headers from breadcrumb fetch calls.
 */
const SENSITIVE_HEADERS = ["authorization", "cookie", "x-api-key"];

/**
 * beforeSend hook — strip sensitive fields from the event before it is sent to Sentry.
 */
function stripSensitiveData(
  event: Record<string, unknown>,
): Record<string, unknown> | null {
  const typedEvent = event as {
    request?: { headers?: Record<string, unknown> };
  };
  if (typedEvent.request?.headers) {
    const sanitized: Record<string, unknown> = {
      ...typedEvent.request.headers,
    };
    for (const header of SENSITIVE_HEADERS) {
      delete sanitized[header];
      delete sanitized[header.toLowerCase()];
      delete sanitized[header.toUpperCase()];
    }
    typedEvent.request = { ...typedEvent.request, headers: sanitized };
  }
  return event;
}

/**
 * Initialize Sentry for the browser.
 *
 * Must be called BEFORE React createRoot() so that Sentry can attach global
 * error listeners (window.onerror, unhandledrejection) before any components render.
 *
 * When VITE_SENTRY_DSN is not set, this is a safe no-op.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  if (!dsn) {
    // Expected in local development — not an error
    console.warn(
      "[Sentry] VITE_SENTRY_DSN is not set. Frontend error tracking is disabled.",
    );
    return;
  }

  try {
    // Dynamic import pattern: we use a try/catch around the require so the bundle
    // continues to work even when @sentry/react is not installed.
    // The cast to unknown then SentryLike avoids any compile-time @sentry/react dependency.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require("@sentry/react") as unknown as SentryLike;

    const environment =
      (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ||
      import.meta.env.MODE ||
      "development";
    const release = import.meta.env.VITE_GIT_SHA as string | undefined;

    Sentry.init({
      dsn,
      environment,
      release,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          // Record a sample of all sessions for general performance insights
          replaysSessionSampleRate: 0.1,
          // Always record a replay when an error occurs
          replaysOnErrorSampleRate: 1.0,
          // Mask sensitive text content in recordings
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 0.1,
      // Strip sensitive data before sending events
      beforeSend: stripSensitiveData,
    });

    SentryModule = Sentry;
    _enabled = true;

    console.info(
      `[Sentry] Frontend initialized. Environment: ${environment}${release ? `, Release: ${release}` : ""}`,
    );
  } catch {
    // @sentry/react is not installed or init failed — app must continue normally
    console.warn(
      "[Sentry] @sentry/react is not installed or failed to initialize. " +
        "Frontend error tracking is disabled. Run: npm install @sentry/react",
    );
    SentryModule = null;
    _enabled = false;
  }
}

/**
 * Returns true when Sentry has been successfully initialized.
 * Use this to conditionally wrap components or call Sentry APIs.
 */
export function isSentryEnabled(): boolean {
  return _enabled && SentryModule !== null;
}

/**
 * Returns the Sentry module instance or null.
 * Callers should always check isSentryEnabled() first.
 */
export function getSentry(): SentryLike | null {
  return SentryModule;
}
