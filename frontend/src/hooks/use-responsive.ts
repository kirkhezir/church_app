/**
 * Responsive utility hooks for mobile-first development
 */

import * as React from 'react';

// Breakpoint definitions matching Tailwind
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to check if viewport is at or above a specific breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isAbove, setIsAbove] = React.useState<boolean>(false);

  React.useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
    const mql = window.matchMedia(query);

    const onChange = (e: MediaQueryListEvent) => {
      setIsAbove(e.matches);
    };

    // Set initial value
    setIsAbove(mql.matches);

    // Listen for changes
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isAbove;
}

/**
 * Hook to get current breakpoint name
 */
export function useCurrentBreakpoint(): Breakpoint | 'xs' {
  const [current, setCurrent] = React.useState<Breakpoint | 'xs'>('xs');

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS['2xl']) {
        setCurrent('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setCurrent('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setCurrent('lg');
      } else if (width >= BREAKPOINTS.md) {
        setCurrent('md');
      } else if (width >= BREAKPOINTS.sm) {
        setCurrent('sm');
      } else {
        setCurrent('xs');
      }
    };

    // Initial check
    checkBreakpoint();

    // Listen for resize
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return current;
}

/**
 * Hook for responsive values based on breakpoints
 */
export function useResponsiveValue<T>(values: {
  default: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T {
  const currentBreakpoint = useCurrentBreakpoint();

  const getValue = (): T => {
    const breakpointOrder: (Breakpoint | 'xs')[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    // Find the closest defined value at or below current breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (bp === 'xs') {
        return values.default;
      }
      const bpKey = bp as Exclude<typeof bp, 'xs'>;
      if (values[bpKey] !== undefined) {
        return values[bpKey] as T;
      }
    }

    return values.default;
  };

  return getValue();
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Hook to detect orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Hook for safe area insets (notch handling)
 */
export function useSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const [insets, setInsets] = React.useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  React.useEffect(() => {
    const root = document.documentElement;

    const updateInsets = () => {
      const style = getComputedStyle(root);
      setInsets({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10),
      });
    };

    // Set CSS custom properties for safe area
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');

    updateInsets();

    window.addEventListener('resize', updateInsets);
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
}

/**
 * Hook to prevent scroll when modal is open
 */
export function usePreventScroll(prevent: boolean): void {
  React.useEffect(() => {
    if (prevent) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [prevent]);
}
