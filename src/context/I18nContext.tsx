import React, { type ReactNode } from "react";
import { I18nContext, useI18n } from "../hooks/useI18n";
import type { Language } from "../i18n/translations";

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

/**
 * I18n Provider Component
 * Wraps the application and provides translation functionality
 *
 * @example
 * ```tsx
 * <I18nProvider defaultLanguage="en">
 *   <App />
 * </I18nProvider>
 * ```
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage,
}) => {
  const i18n = useI18n(defaultLanguage);

  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
