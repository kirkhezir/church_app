/**
 * Theme types and React context definition.
 *
 * Separated from the Provider component so Vite fast-refresh
 * works correctly (a file must export only components OR only non-components).
 *
 * Supports independent themes for landing pages vs. the church app:
 *   - Landing pages use LANDING_THEME_KEY ('settings:landing-theme')
 *   - App pages (/app/*) use APP_THEME_KEY ('settings:app-theme')
 *   - The active scope is determined by the current URL path.
 */

import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ThemeScope = 'landing' | 'app';

export interface ThemeContextValue {
  /** Currently active theme preference (for the current scope) */
  theme: Theme;
  /** Set theme for the current scope */
  setTheme: (theme: Theme) => void;
  /** The resolved theme after applying system preference */
  resolvedTheme: 'light' | 'dark';
  /** Which scope is currently active */
  scope: ThemeScope;
  /** Set theme for a specific scope (useful when AppearanceSettings
   *  always targets the 'app' scope regardless of current URL) */
  setScopedTheme: (scope: ThemeScope, theme: Theme) => void;
  /** Read theme for a specific scope */
  getScopedTheme: (scope: ThemeScope) => Theme;
}

/** @deprecated Use LANDING_THEME_KEY or APP_THEME_KEY instead */
export const THEME_STORAGE_KEY = 'settings:theme';

export const LANDING_THEME_KEY = 'settings:landing-theme';
export const APP_THEME_KEY = 'settings:app-theme';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
