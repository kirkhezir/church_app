/**
 * useTheme Hook
 *
 * Provides access to theme context (light/dark/system).
 * Must be used within <ThemeProvider>.
 *
 * Returns the theme for the current route scope (landing vs app).
 * Use `setScopedTheme` / `getScopedTheme` for cross-scope access.
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/themeTypes';

export type { Theme, ThemeScope } from '../contexts/themeTypes';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
