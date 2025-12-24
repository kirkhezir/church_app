/**
 * Performance Monitoring Utilities
 *
 * Utilities for monitoring and measuring performance
 */

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }

    // Report to analytics if in production
    if (process.env.NODE_ENV === 'production' && duration > 100) {
      // Could send to analytics service
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyResolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback for browsers that don't support requestIdleCallback
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(handle: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
}

/**
 * Defer non-critical work
 */
export function deferWork(callback: () => void): void {
  requestIdleCallback(
    () => {
      callback();
    },
    { timeout: 2000 }
  );
}

/**
 * Batch DOM operations
 */
export function batchDomOperations(operations: Array<() => void>): void {
  requestAnimationFrame(() => {
    operations.forEach((op) => op());
  });
}

/**
 * Measure Web Vitals
 */
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function measureWebVitals(onMetric: (metric: WebVitalsMetric) => void): void {
  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;

        onMetric({
          name: 'LCP',
          value: lcp,
          rating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as PerformanceEventTiming[];
        const firstEntry = entries[0];
        const fid = firstEntry.processingStart - firstEntry.startTime;

        onMetric({
          name: 'FID',
          value: fid,
          rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        onMetric({
          name: 'CLS',
          value: clsValue,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Performance Observer not supported');
    }
  }
}

/**
 * Preconnect to external resources
 */
export function preconnect(url: string, crossOrigin: boolean = true): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Prefetch a resource
 */
export function prefetch(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Check if device has slow connection
 */
export function hasSlowConnection(): boolean {
  const connection = (navigator as any).connection;
  if (connection) {
    return connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
  }
  return false;
}

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
