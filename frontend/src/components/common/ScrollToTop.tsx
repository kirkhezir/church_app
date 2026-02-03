/**
 * ScrollToTop Component
 *
 * Automatically scrolls to top of page on route changes.
 * Handles hash links by scrolling to the element after navigation.
 *
 * Best Practice: This should be placed inside BrowserRouter but outside Routes.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, scroll to the element
    if (hash) {
      // Small delay to ensure DOM is ready after navigation
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const offset = 80; // Account for fixed header
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth',
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      // No hash, scroll to top instantly
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
