/**
 * i18n Configuration
 *
 * Internationalization setup for Thai/English language support
 * Uses a simple context-based approach without external dependencies
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import enTranslations from './en.json';
import thTranslations from './th.json';

// Supported languages
export type Language = 'en' | 'th';

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  th: 'ไทย',
};

// Translation type
type Translations = typeof enTranslations;

// Translations map
const translations: Record<Language, Translations> = {
  en: enTranslations,
  th: thTranslations,
};

// Storage key
const LANGUAGE_STORAGE_KEY = 'church_app_language';

// i18n Context type
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  translations: Translations;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

// Provider component
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (stored && (stored === 'en' || stored === 'th')) {
        return stored;
      }
      // Check browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('th')) {
        return 'th';
      }
    }
    return defaultLanguage;
  });

  // Set language and persist to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
    // Update document lang attribute for accessibility
    document.documentElement.lang = lang;
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      let translation = getNestedValue(
        translations[language] as unknown as Record<string, unknown>,
        key
      );

      // Fallback to English if translation not found
      if (!translation) {
        translation = getNestedValue(translations.en as unknown as Record<string, unknown>, key);
      }

      // Return key if no translation found
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }

      // Replace params in translation
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translation = translation!.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
        });
      }

      return translation;
    },
    [language]
  );

  // Set initial document lang
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    translations: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Hook to use i18n
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook to get just the translation function (convenience)
export function useTranslation() {
  const { t, language } = useI18n();
  return { t, language };
}

export default I18nProvider;
