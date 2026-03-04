import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

const GoogleAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (!ANALYTICS_ENABLED) {
      return;
    }

    // Only track if gtag is available (user has consented to analytics)
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-0XZY3WFXTG', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalyticsTracker;
