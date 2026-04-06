import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const GoogleAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
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
