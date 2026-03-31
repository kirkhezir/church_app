/**
 * Test utility: renders components wrapped in all required providers.
 * Use instead of bare render() when components require ThemeProvider,
 * I18nProvider, AuthContext, or Router context.
 */
import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { ThemeContext, type ThemeContextValue } from '../src/contexts/themeTypes';
import { AuthContext } from '../src/contexts/AuthContext';

// Inline minimal I18nProvider mock to avoid import.meta issues from i18n/index.tsx
const I18nContext = React.createContext<
  | {
      language: string;
      setLanguage: (lang: string) => void;
      t: (key: string) => string;
      translations: Record<string, unknown>;
    }
  | undefined
>(undefined);

function MockI18nProvider({ children }: { children: React.ReactNode }) {
  const value = {
    language: 'en',
    setLanguage: () => {},
    t: (key: string) => key,
    translations: {},
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// We also need to mock the useI18n import used by components
// This is handled by moduleNameMapper in jest.config.js

const defaultTheme: ThemeContextValue = {
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  scope: 'app',
  setScopedTheme: () => {},
  getScopedTheme: () => 'light',
};

const defaultAuth = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
  completeMFALogin: () => {},
  updateUser: () => {},
};

interface TestWrapperOptions {
  theme?: Partial<ThemeContextValue>;
  auth?: Partial<typeof defaultAuth>;
  route?: string;
  useMemoryRouter?: boolean;
}

export function createTestWrapper(options: TestWrapperOptions = {}) {
  const theme = { ...defaultTheme, ...options.theme };
  const auth = { ...defaultAuth, ...options.auth };

  const Router = options.useMemoryRouter ? MemoryRouter : BrowserRouter;
  const routerProps =
    options.useMemoryRouter && options.route ? { initialEntries: [options.route] } : {};

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <Router {...routerProps}>
        <ThemeContext.Provider value={theme}>
          <MockI18nProvider>
            <AuthContext.Provider value={auth as any}>{children}</AuthContext.Provider>
          </MockI18nProvider>
        </ThemeContext.Provider>
      </Router>
    );
  };
}

/**
 * Render with all providers. Pass options to customize auth/theme state.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: TestWrapperOptions & { renderOptions?: Omit<RenderOptions, 'wrapper'> }
) {
  const { renderOptions, ...wrapperOptions } = options || {};
  return render(ui, { wrapper: createTestWrapper(wrapperOptions), ...renderOptions });
}
