import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface GoogleAnalyticsConfig {
  measurementId: string;
  enabled?: boolean;
  debug?: boolean;
}

/**
 * Initialize Google Analytics
 */
export const initializeGA = (config: GoogleAnalyticsConfig) => {
  if (!config.enabled || !config.measurementId) {
    return;
  }

  // Check if gtag is already loaded
  if (typeof window.gtag === "function") {
    if (config.debug) {
      console.log("[GA] Already initialized");
    }
    return;
  }

  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", config.measurementId, {
    send_page_view: false, // We'll handle page views manually
    debug_mode: config.debug,
  });

  if (config.debug) {
    console.log("[GA] Initialized with measurement ID:", config.measurementId);
  }
};

/**
 * Track page view
 */
export const trackPageView = (
  path: string,
  title?: string,
  additionalParams?: Record<string, any>,
) => {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    ...additionalParams,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>,
) => {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, eventParams);
};

/**
 * Track button/link clicks
 */
export const trackClick = (
  elementName: string,
  additionalParams?: Record<string, any>,
) => {
  trackEvent("click", {
    element_name: elementName,
    ...additionalParams,
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmit = (
  formName: string,
  success: boolean,
  additionalParams?: Record<string, any>,
) => {
  trackEvent("form_submit", {
    form_name: formName,
    success,
    ...additionalParams,
  });
};

/**
 * Track custom conversions
 */
export const trackConversion = (
  conversionName: string,
  value?: number,
  currency: string = "USD",
) => {
  trackEvent("conversion", {
    conversion_name: conversionName,
    value,
    currency,
  });
};

/**
 * React hook for Google Analytics
 * Automatically tracks page views on route changes
 */
export const useGoogleAnalytics = (config: GoogleAnalyticsConfig) => {
  const location = useLocation();

  useEffect(() => {
    initializeGA(config);
  }, [config.measurementId, config.enabled]);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    // Track page view on route change
    trackPageView(location.pathname + location.search, document.title);

    if (config.debug) {
      console.log("[GA] Page view tracked:", location.pathname);
    }
  }, [location, config.enabled, config.debug]);

  return {
    trackEvent,
    trackClick,
    trackFormSubmit,
    trackConversion,
    trackPageView,
  };
};

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default useGoogleAnalytics;
