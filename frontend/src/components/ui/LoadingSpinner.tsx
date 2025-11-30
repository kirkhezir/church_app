import React from 'react';
import { cn } from '@/lib/utils';

/**
 * LoadingSpinner Props
 */
interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional label for screen readers */
  label?: string;
  /** Optional CSS class name */
  className?: string;
  /** Whether to center in container */
  centered?: boolean;
}

/**
 * Size classes for the spinner
 */
const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

/**
 * LoadingSpinner Component
 *
 * Accessible loading indicator with screen reader support.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" label="Loading events..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className,
  centered = false,
}) => {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-primary border-t-transparent',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );

  if (centered) {
    return <div className="flex min-h-[200px] items-center justify-center">{spinner}</div>;
  }

  return spinner;
};

/**
 * Full page loading overlay
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" label={message} />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

/**
 * Inline loading indicator for buttons, etc.
 */
export const InlineLoader: React.FC<{ className?: string }> = ({ className }) => {
  return <LoadingSpinner size="sm" className={className} label="Processing..." />;
};

/**
 * Skeleton loader for content placeholders
 */
export const Skeleton: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className, lines = 1 }) => {
  return (
    <div className={cn('animate-pulse', className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-muted',
            i < lines - 1 && 'mb-2',
            i === lines - 1 && lines > 1 && 'w-3/4'
          )}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

/**
 * Card skeleton for loading states
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('animate-pulse rounded-lg border bg-card p-6', className)}
      role="status"
      aria-label="Loading card"
    >
      <div className="mb-4 h-6 w-1/3 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/6 rounded bg-muted" />
      </div>
      <span className="sr-only">Loading card...</span>
    </div>
  );
};

export default LoadingSpinner;
