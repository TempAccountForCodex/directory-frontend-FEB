import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { translations } from "../i18n/translations";
import type { Language, Translations } from "../i18n/translations";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: Language[];
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Get translation by dot-notated key
 */
const getNestedTranslation = (obj: Translations, path: string): string => {
  const keys = path.split(".");
  let result: any = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return path; // Return key if translation not found
    }
  }

  return typeof result === "string" ? result : path;
};

/**
 * Replace placeholders in translation strings
 * Example: "Hello {name}" with params {name: "World"} => "Hello World"
 */
const replacePlaceholders = (
  str: string,
  params?: Record<string, string | number>,
): string => {
  if (!params) return str;

  return str.replace(/{(\w+)}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
};

/**
 * Detect browser language
 */
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split("-")[0] as Language;
  const supportedLanguages: Language[] = [
    "en",
    "es",
    "fr",
    "de",
    "pt",
    "ar",
    "zh",
    "hi",
  ];

  return supportedLanguages.includes(browserLang) ? browserLang : "en";
};

/**
 * Hook for internationalization
 */
export const useI18n = (defaultLanguage?: Language) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem("language");
    if (stored && stored in translations) {
      return stored as Language;
    }

    // Use default or detect from browser
    return defaultLanguage || detectBrowserLanguage();
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem("language", language);

    // Update document language attribute
    document.documentElement.lang = language;

    // Update document direction for RTL languages
    const isRTL = language === "ar";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [language]);

  /**
   * Translate function
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedTranslation(translations[language], key);
      return replacePlaceholders(translation, params);
    },
    [language],
  );

  /**
   * Set language with validation
   */
  const setLanguage = useCallback((lang: Language) => {
    if (lang in translations) {
      setLanguageState(lang);
    } else {
      console.warn(
        `[i18n] Language "${lang}" is not supported, falling back to English`,
      );
      setLanguageState("en");
    }
  }, []);

  const languages: Language[] = Object.keys(translations) as Language[];
  const isRTL = language === "ar";

  return {
    language,
    setLanguage,
    t,
    languages,
    isRTL,
  };
};

/**
 * Context hook for i18n
 */
export const useI18nContext = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18nContext must be used within an I18nProvider");
  }
  return context;
};

export { I18nContext };

export default useI18n;
