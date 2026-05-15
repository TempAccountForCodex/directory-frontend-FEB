import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  rejectNonEssentialCookies,
  hasUserConsented,
  isCategoryAllowed,
  loadGoogleAnalytics,
  disableGoogleAnalytics,
  COOKIE_CATEGORIES,
} from "../utils/preferences";

interface CookieConsentContextType {
  showBanner: boolean;
  showPreferences: boolean;
  preferences: any;
  handleAcceptAll: () => void;
  handleRejectNonEssential: () => void;
  handleCustomize: (categories: any) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  isCategoryAllowed: (category: string) => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(
  null,
);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider",
    );
  }
  return context;
};

export const CookieConsentProvider = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(() => getCookiePreferences());

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = hasUserConsented();

    if (!hasConsented) {
      // Show banner after a brief delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load analytics if user has consented
      const savedPrefs = getCookiePreferences();
      if (savedPrefs?.categories[COOKIE_CATEGORIES.ANALYTICS]) {
        loadGoogleAnalytics();
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newPrefs = acceptAllCookies();
    setPreferences(newPrefs);
    setShowBanner(false);
    setShowPreferences(false);
    loadGoogleAnalytics();
  };

  const handleRejectNonEssential = () => {
    const newPrefs = rejectNonEssentialCookies();
    setPreferences(newPrefs);
    setShowBanner(false);
    setShowPreferences(false);
    disableGoogleAnalytics();
  };

  const handleCustomize = (categories) => {
    const newPrefs = saveCookiePreferences(categories);
    setPreferences(newPrefs);
    setShowBanner(false);
    setShowPreferences(false);

    // Load/disable analytics based on preference
    if (categories[COOKIE_CATEGORIES.ANALYTICS]) {
      loadGoogleAnalytics();
    } else {
      disableGoogleAnalytics();
    }
  };

  const openPreferences = () => {
    setShowPreferences(true);
  };

  const closePreferences = () => {
    setShowPreferences(false);
  };

  const value = {
    showBanner,
    showPreferences,
    preferences,
    handleAcceptAll,
    handleRejectNonEssential,
    handleCustomize,
    openPreferences,
    closePreferences,
    isCategoryAllowed,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};
