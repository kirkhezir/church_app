/**
 * Mock for @/hooks/useTheme
 * Provides a default theme context value without requiring ThemeProvider.
 */
export type Theme = 'light' | 'dark' | 'system';
export type ThemeScope = 'landing' | 'app';

export function useTheme() {
  return {
    theme: 'light' as Theme,
    setTheme: () => {},
    resolvedTheme: 'light' as Theme,
    scope: 'app' as ThemeScope,
    setScopedTheme: () => {},
    getScopedTheme: () => 'light' as Theme,
  };
}
