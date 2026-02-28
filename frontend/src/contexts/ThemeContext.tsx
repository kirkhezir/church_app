/**
 * Theme Provider Component
 *
 * Manages independent light/dark/system themes for landing pages vs. the app.
 * Detects current URL scope and applies the correct theme's `.dark` class
 * to <html>. Each scope persists its own preference in localStorage.
 *
 * Types and context are in themeTypes.ts to satisfy fast-refresh.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import {
  ThemeContext,
  LANDING_THEME_KEY,
  APP_THEME_KEY,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeScope,
} from './themeTypes';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyToHtml(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

/** Read persisted theme, migrating from legacy single-key if needed. */
function readStored(key: string): Theme {
  const val = localStorage.getItem(key) as Theme | null;
  if (val) return val;

  // One-time migration: copy old 'settings:theme' into both scope keys
  if (key === APP_THEME_KEY || key === LANDING_THEME_KEY) {
    const legacy = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (legacy) {
      localStorage.setItem(APP_THEME_KEY, legacy);
      localStorage.setItem(LANDING_THEME_KEY, legacy);
      return legacy;
    }
  }
  return 'system';
}

/** Determine scope from a pathname. */
function scopeFromPath(pathname: string): ThemeScope {
  return pathname.startsWith('/app') ? 'app' : 'landing';
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const scope = scopeFromPath(pathname);

  // Independent theme state per scope
  const [landingTheme, setLandingThemeState] = useState<Theme>(() => readStored(LANDING_THEME_KEY));
  const [appTheme, setAppThemeState] = useState<Theme>(() => readStored(APP_THEME_KEY));

  // Derive which theme is active right now
  const activeTheme = scope === 'app' ? appTheme : landingTheme;
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolve(activeTheme));

  // Setters
  const setLandingTheme = useCallback((t: Theme) => {
    localStorage.setItem(LANDING_THEME_KEY, t);
    setLandingThemeState(t);
  }, []);

  const setAppTheme = useCallback((t: Theme) => {
    localStorage.setItem(APP_THEME_KEY, t);
    setAppThemeState(t);
  }, []);

  /** Set theme for the current scope (used by the generic `setTheme`). */
  const setTheme = useCallback(
    (t: Theme) => {
      if (scope === 'app') setAppTheme(t);
      else setLandingTheme(t);
    },
    [scope, setAppTheme, setLandingTheme]
  );

  /** Set theme for a named scope (useful from AppearanceSettings). */
  const setScopedTheme = useCallback(
    (s: ThemeScope, t: Theme) => {
      if (s === 'app') setAppTheme(t);
      else setLandingTheme(t);
    },
    [setAppTheme, setLandingTheme]
  );

  /** Read theme for a named scope. */
  const getScopedTheme = useCallback(
    (s: ThemeScope): Theme => (s === 'app' ? appTheme : landingTheme),
    [appTheme, landingTheme]
  );

  // Apply theme whenever active theme or scope changes
  useEffect(() => {
    const r = resolve(activeTheme);
    setResolvedTheme(r);
    applyToHtml(r);
  }, [activeTheme, scope]);

  // Listen for system preference changes when active theme is "system"
  useEffect(() => {
    if (activeTheme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = resolve('system');
      setResolvedTheme(r);
      applyToHtml(r);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [activeTheme]);

  const value = useMemo(
    () => ({
      theme: activeTheme,
      setTheme,
      resolvedTheme,
      scope,
      setScopedTheme,
      getScopedTheme,
    }),
    [activeTheme, setTheme, resolvedTheme, scope, setScopedTheme, getScopedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
