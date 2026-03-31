/**
 * Mock for errorReporting module in Jest tests.
 * Avoids import.meta.env SyntaxError in CJS test environment.
 */
export function getErrorMessage(_err: unknown, fallback = 'An unexpected error occurred'): string {
  if (typeof _err === 'string') return _err;
  if (typeof _err === 'object' && _err !== null) {
    const obj = _err as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
  }
  return fallback;
}

export function reportError(_message: string, _error: unknown): void {
  // no-op in tests
}
