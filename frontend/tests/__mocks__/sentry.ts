/**
 * Mock for Sentry module in Jest tests.
 * Avoids import.meta.env SyntaxError in CJS test environment.
 */
export function initSentry(): void {
  // no-op in tests
}

export function captureException(_error: Error, _context?: Record<string, unknown>): void {
  // no-op in tests
}

export function captureMessage(_message: string): void {
  // no-op in tests
}

export function setUser(_user: Record<string, unknown> | null): void {
  // no-op in tests
}
