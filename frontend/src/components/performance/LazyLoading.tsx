/**
 * Code Splitting and Lazy Loading utilities
 *
 * Optimizes bundle size by lazy loading components
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Loading fallback components
 */
export function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}

export function CardLoadingFallback() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function TableLoadingFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * Lazy load wrapper with error boundary
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <PageLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  importFn();
}

/**
 * Lazy loaded page components
 * Note: Add more pages as needed. These are examples of commonly lazy-loaded pages.
 */
export const LazyPages = {
  // Dashboard
  Dashboard: lazyLoad(() => import('../../pages/dashboard/MemberDashboard')),

  // Events
  EventDetailPage: lazyLoad(() =>
    import('../../pages/events/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
  ),
  EventCreatePage: lazyLoad(() =>
    import('../../pages/events/EventCreatePage').then((m) => ({ default: m.EventCreatePage }))
  ),

  // Admin
  AdminReportsPage: lazyLoad(() => import('../../pages/admin/AdminReportsPage')),
  AdminHealthPage: lazyLoad(() => import('../../pages/admin/AdminHealthPage')),
  AdminAnalyticsPage: lazyLoad(() => import('../../pages/admin/AdminAnalyticsPage')),

  // Settings
  SettingsPage: lazyLoad(() => import('../../pages/settings/SettingsPage')),
};

/**
 * Preload commonly accessed pages
 */
export function preloadCommonPages(): void {
  // Preload after initial page load
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      preloadComponent(() => import('../../pages/dashboard/MemberDashboard'));
    }, 2000);
  }
}
