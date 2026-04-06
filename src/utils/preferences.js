/**
 * Cookie Consent Utility
 * Minimal implementation for managing cookie preferences
 */

const COOKIE_CONSENT_KEY = 'techietribe_cookie_consent';
const CONSENT_VERSION = '1.0';

export const COOKIE_CATEGORIES = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
};

/**
 * Get saved cookie preferences from localStorage
 */
export const getCookiePreferences = () => {
  try {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!saved) return null;

    const preferences = JSON.parse(saved);

    // Validate version
    if (preferences.version !== CONSENT_VERSION) {
      return null;
    }

    return preferences;
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return null;
  }
};

/**
 * Save cookie preferences to localStorage
 */
export const saveCookiePreferences = (categories) => {
  try {
    const preferences = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: {
        [COOKIE_CATEGORIES.ESSENTIAL]: true, // Essential always true
        [COOKIE_CATEGORIES.ANALYTICS]: Boolean(categories[COOKIE_CATEGORIES.ANALYTICS]),
        [COOKIE_CATEGORIES.MARKETING]: Boolean(categories[COOKIE_CATEGORIES.MARKETING]),
      },
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    return preferences;
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
    return null;
  }
};

/**
 * Accept all cookies
 */
export const acceptAllCookies = () => {
  return saveCookiePreferences({
    [COOKIE_CATEGORIES.ESSENTIAL]: true,
    [COOKIE_CATEGORIES.ANALYTICS]: true,
    [COOKIE_CATEGORIES.MARKETING]: true,
  });
};

/**
 * Reject non-essential cookies
 */
export const rejectNonEssentialCookies = () => {
  return saveCookiePreferences({
    [COOKIE_CATEGORIES.ESSENTIAL]: true,
    [COOKIE_CATEGORIES.ANALYTICS]: false,
    [COOKIE_CATEGORIES.MARKETING]: false,
  });
};

/**
 * Check if user has made a choice
 */
export const hasUserConsented = () => {
  return getCookiePreferences() !== null;
};

/**
 * Check if a specific category is allowed
 */
export const isCategoryAllowed = (category) => {
  const preferences = getCookiePreferences();
  if (!preferences) return false;
  return Boolean(preferences.categories[category]);
};

/**
 * Clear cookie preferences (for testing)
 */
export const clearCookiePreferences = () => {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing cookie preferences:', error);
    return false;
  }
};

/**
 * Load Google Analytics if consent given
 */
export const loadGoogleAnalytics = () => {
  if (!isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)) {
    return;
  }

  // Check if GA is already loaded
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
    return;
  }

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-0XZY3WFXTG';
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', 'G-0XZY3WFXTG', {
      anonymize_ip: true,
    });
  };
};

/**
 * Disable Google Analytics
 */
export const disableGoogleAnalytics = () => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    });
  }

  // Set opt-out flag
  window['ga-disable-G-0XZY3WFXTG'] = true;

  // Proactively clear GA cookies so identifiers are removed on opt-out
  const gaCookies = ['_ga', '_gid'];
  const gaPrefix = '_ga_';
  document.cookie.split(';').forEach((raw) => {
    const name = raw.trim().split('=')[0];
    if (!name) return;
    if (gaCookies.includes(name) || name.startsWith(gaPrefix)) {
      // Attempt removal for current domain and higher-level domain
      const domains = window.location.hostname.split('.').reduceRight((acc, part, idx, arr) => {
        const domain = arr.slice(idx).join('.');
        if (domain) acc.push(domain);
        return acc;
      }, []);

      domains.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      });

      // Fallback without domain in case cookies were set that way
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
};
