import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state to trigger fallback UI
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Catch errors and log them
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // Update state with error info - this is the correct pattern for class component error boundaries
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error monitoring service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  /**
   * Log error to external monitoring service
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // This would be replaced with actual error tracking service
    // Example implementations:
    // - Sentry.captureException(error, { extra: errorInfo });
    // - LogRocket.captureException(error);
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // For now, just log to console
    console.error('Error would be sent to monitoring service:', errorData);
  }

  /**
   * Reset error state and retry (can be called via ref or exposed to children)
   */
  public resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Navigate to home page
   */
  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  /**
   * Refresh the page
   */
  private handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>

            <p className="mb-6 text-gray-600">
              We&apos;re sorry, but something unexpected happened. Our team has been notified and is
              working to fix the issue.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
                <p className="mb-2 font-mono text-sm text-red-600">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="default" onClick={this.handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              If this problem persists, please{' '}
              <a href="/contact" className="text-primary underline hover:no-underline">
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook to throw an error (for testing error boundaries)
 * Usage: const throwError = useErrorBoundaryTest();
 */
export function useErrorBoundaryTest() {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Test error from useErrorBoundaryTest');
  }

  return () => setShouldThrow(true);
}

export default ErrorBoundary;
