/**
 * Mock for i18n module in Jest tests.
 * Loads real English translations so components render actual text.
 */
import React, { createContext, useContext } from 'react';
import enTranslations from '../../src/i18n/en.json';

export type Language = 'en' | 'th';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  th: 'ไทย',
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  translations: Record<string, unknown>;
}

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

function translate(key: string, params?: Record<string, string>): string {
  let value = getNestedValue(enTranslations as Record<string, unknown>, key) || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
  }
  return value;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translate,
  translations: enTranslations as Record<string, unknown>,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const value: I18nContextType = {
    language: 'en',
    setLanguage: () => {},
    t: translate,
    translations: enTranslations as Record<string, unknown>,
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  return useContext(I18nContext);
}
