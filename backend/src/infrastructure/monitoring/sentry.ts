/**
 * Sentry Error Monitoring Configuration
 *
 * Provides error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import { Express } from 'express';
import { logger } from '../logging/logger';

// Sentry configuration
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.npm_package_version || '1.0.0';
const SENTRY_ENABLED = process.env.SENTRY_ENABLED === 'true' && !!SENTRY_DSN;

/**
 * Initialize Sentry
 */
export function initSentry(): void {
  if (!SENTRY_ENABLED) {
    logger.info('Sentry is disabled. Set SENTRY_ENABLED=true and SENTRY_DSN to enable.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: `church-app@${SENTRY_RELEASE}`,

    // Performance monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Include local variables in stack traces
    includeLocalVariables: true,

    // Filter out noisy errors
    ignoreErrors: [
      // Network errors
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      // Common auth errors (expected)
      'Invalid credentials',
      'Token expired',
      'Unauthorized',
    ],

    // Additional configuration
    maxBreadcrumbs: 50,
    attachStacktrace: true,

    // Before send hook for filtering/modifying events
    beforeSend(event, hint) {
      // Filter out specific errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send validation errors (expected behavior)
        if (error.message.includes('Validation failed')) {
          return null;
        }
      }

      // Add additional context
      event.tags = {
        ...event.tags,
        component: 'backend',
      };

      return event;
    },

    // Integrations
    integrations: [
      Sentry.onUncaughtExceptionIntegration({
        exitEvenIfOtherHandlersAreRegistered: false,
      }),
      Sentry.onUnhandledRejectionIntegration({
        mode: 'warn',
      }),
    ],
  });

  logger.info('Sentry initialized', {
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
  });
}

/**
 * Setup Sentry error handler for Express
 */
export function setupSentryErrorHandler(app: Express): void {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setupExpressErrorHandler(app);
  logger.info('Sentry Express error handler configured');
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): string | null {
  if (!SENTRY_ENABLED) {
    logger.error('Error captured (Sentry disabled)', { error: error.message, context });
    return null;
  }

  const eventId = Sentry.captureException(error, {
    extra: context,
  });

  return eventId;
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string | null {
  if (!SENTRY_ENABLED) {
    logger.info(message, { level, context });
    return null;
  }

  const eventId = Sentry.captureMessage(message, {
    level,
    extra: context,
  });

  return eventId;
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; role?: string }): void {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void {
  if (!SENTRY_ENABLED) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Get Sentry status
 */
export function getSentryStatus(): { enabled: boolean; environment: string; release: string } {
  return {
    enabled: SENTRY_ENABLED,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
  };
}

// Export Sentry for direct access if needed
export { Sentry };
