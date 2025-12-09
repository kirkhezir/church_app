/**
 * Sentry Error Monitoring Configuration for Frontend
 */

import * as Sentry from '@sentry/react';

// Sentry configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT =
  import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'development';
const SENTRY_RELEASE = import.meta.env.VITE_SENTRY_RELEASE || '1.0.0';
const SENTRY_ENABLED = import.meta.env.VITE_SENTRY_ENABLED === 'true' && !!SENTRY_DSN;

/**
 * Initialize Sentry for the frontend
 */
export function initSentry(): void {
  if (!SENTRY_ENABLED) {
    console.info('Sentry is disabled. Set VITE_SENTRY_ENABLED=true and VITE_SENTRY_DSN to enable.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: `church-app-frontend@${SENTRY_RELEASE}`,

    // Performance monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Replay for session recording (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out noisy errors
    ignoreErrors: [
      // Common browser errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      // Network errors (expected)
      'Network Error',
      'Failed to fetch',
      'Load failed',
      // Auth errors (expected)
      'Unauthorized',
      'Token expired',
    ],

    // URL patterns to exclude
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Firefox extensions
      /^moz-extension:\/\//i,
    ],

    // Before send hook
    beforeSend(event, hint) {
      // Filter out specific errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send aborted requests
        if (error.name === 'AbortError') {
          return null;
        }
      }

      // Add additional context
      event.tags = {
        ...event.tags,
        component: 'frontend',
      };

      return event;
    },

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });

  console.info('Sentry initialized', {
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; role?: string }): void {
  if (!SENTRY_ENABLED) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context on logout
 */
export function clearUser(): void {
  if (!SENTRY_ENABLED) return;
  Sentry.setUser(null);
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!SENTRY_ENABLED) {
    console.error('Error captured (Sentry disabled)', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!SENTRY_ENABLED) {
    console.log(`[${level}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Get Sentry status
 */
export function getSentryStatus(): { enabled: boolean; environment: string } {
  return {
    enabled: SENTRY_ENABLED,
    environment: SENTRY_ENVIRONMENT,
  };
}

// Export Sentry ErrorBoundary for React components
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Export Sentry for direct access
export { Sentry };
