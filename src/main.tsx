import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import theme from "./styles/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { I18nProvider } from "./context/I18nContext";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import { ABTestProvider } from "./context/ABTestContext";
import { initSentry, isSentryEnabled, getSentry } from "./config/sentry";

/**
 * CSP Nonce for Emotion (Step 2.12.3)
 *
 * Reads the CSP nonce from a <meta name="csp-nonce"> tag injected by the backend.
 * When present, all MUI/emotion-injected <style> tags will include the nonce attribute,
 * allowing them to pass CSP nonce-based style-src validation.
 *
 * If the meta tag is not present (e.g., in development without backend serving the SPA),
 * getNonce() returns undefined and emotion works normally without nonce (compatible with
 * 'unsafe-inline' style-src in development mode).
 */
const getNonce = (): string | undefined => {
  const value = document
    .querySelector('meta[name="csp-nonce"]')
    ?.getAttribute("content");
  return value && !value.startsWith("__") ? value : undefined;
};

const emotionCache = createCache({
  key: "mui",
  nonce: getNonce(),
  prepend: true,
});

/**
 * Sentry Initialization (Step 10.23)
 *
 * Must be called before createRoot() so that Sentry attaches global error listeners
 * (window.onerror, unhandledrejection) before any React component mounts.
 * Safe no-op when VITE_SENTRY_DSN is not set.
 */
initSentry();

/**
 * Sentry ErrorBoundary fallback component.
 * Shown when a child component throws an unhandled error.
 * Only rendered when Sentry is active — otherwise React's default error handling applies.
 */
function SentryFallback(): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Something went wrong
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        An unexpected error occurred. Our team has been notified. Please try
        refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "0.5rem 1.5rem",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Refresh Page
      </button>
    </div>
  );
}

// Determine whether to wrap with Sentry's ErrorBoundary
const _sentry = getSentry();

function AppWithErrorBoundary(): JSX.Element {
  const inner = (
    <StrictMode>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <I18nProvider defaultLanguage="en">
            <FeatureFlagsProvider
              defaultFlags={{
                analytics_enabled: true,
                contact_form_enabled: true,
                lazy_load_images: true,
              }}
              source="local"
            >
              <ABTestProvider tests={[]}>
                <CssBaseline />
                <App />
              </ABTestProvider>
            </FeatureFlagsProvider>
          </I18nProvider>
        </ThemeProvider>
      </CacheProvider>
    </StrictMode>
  );

  if (isSentryEnabled() && _sentry) {
    const SentryErrorBoundary = _sentry.ErrorBoundary;
    return (
      <SentryErrorBoundary fallback={<SentryFallback />}>
        {inner}
      </SentryErrorBoundary>
    );
  }

  return inner;
}

createRoot(document.getElementById("root")!).render(<AppWithErrorBoundary />);
