/**
 * Centralized Error Reporting
 *
 * Routes errors through Sentry in production, console.error in development.
 * Use instead of bare console.error() in page-level catch blocks.
 */

import { captureException } from '@/lib/sentry';

/**
 * Safely extract an error message from an unknown caught value.
 * Handles Axios errors (response.data.error / response.data.message),
 * standard Error instances, and plain strings.
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (typeof err === 'string') return err;

  if (typeof err === 'object' && err !== null) {
    // Axios-style error: err.response?.data?.error / .message
    const obj = err as Record<string, unknown>;
    if (typeof obj.response === 'object' && obj.response !== null) {
      const response = obj.response as Record<string, unknown>;
      if (typeof response.data === 'object' && response.data !== null) {
        const data = response.data as Record<string, unknown>;
        if (typeof data.error === 'string') return data.error;
        if (typeof data.message === 'string') return data.message;
      }
    }
    // Standard Error or error-like object with .message
    if (typeof obj.message === 'string') return obj.message;
  }

  return fallback;
}

export function reportError(message: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }

  if (error instanceof Error) {
    captureException(error, { message });
  } else {
    captureException(new Error(String(error)), { message });
  }
}
