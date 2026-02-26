/**
 * Theme Provider Component
 *
 * Manages light/dark/system theme with localStorage persistence.
 * Applies `.dark` class to <html> element for Tailwind dark mode.
 *
 * Types and context are in themeTypes.ts to satisfy fast-refresh.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, THEME_STORAGE_KEY, type Theme } from './themeTypes';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return applyTheme(stored || 'system');
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };

  // Apply theme changes
  useEffect(() => {
    setResolvedTheme(applyTheme(theme));
  }, [theme]);

  // Listen for system preference changes when set to "system"
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(applyTheme('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
