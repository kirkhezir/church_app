import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>An error occurred while rendering this component</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-mono text-sm text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page Error Boundary
 * Full-page error display for route-level errors
 */
export class PageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Page Error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>
            <p className="mb-6 text-gray-600">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
                <p className="font-mono text-sm text-red-600">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 overflow-auto text-xs text-gray-500">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button onClick={this.handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for data fetching
 * Shows different UI states for loading, error, and success
 */
interface AsyncBoundaryProps {
  children: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function AsyncBoundary({
  children,
  loading,
  error,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return <>{loading || <DefaultLoadingUI />}</>;
  }

  if (isError) {
    return <>{error || <DefaultErrorUI message={errorMessage} onRetry={onRetry} />}</>;
  }

  return <>{children}</>;
}

function DefaultLoadingUI() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function DefaultErrorUI({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
      <p className="mb-2 font-medium">Failed to load data</p>
      <p className="mb-4 text-sm text-muted-foreground">
        {message || 'An unexpected error occurred'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * Higher-order component for error boundary wrapping
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
