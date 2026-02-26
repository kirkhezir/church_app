/**
 * Theme types and React context definition.
 *
 * Separated from the Provider component so Vite fast-refresh
 * works correctly (a file must export only components OR only non-components).
 */

import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** The resolved theme after applying system preference */
  resolvedTheme: 'light' | 'dark';
}

export const THEME_STORAGE_KEY = 'settings:theme';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
