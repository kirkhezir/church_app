/**
 * Centralized Error Reporting
 *
 * Routes errors through Sentry in production, console.error in development.
 * Use instead of bare console.error() in page-level catch blocks.
 */

import { captureException } from '@/lib/sentry';

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
