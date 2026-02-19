/**
 * useScrollReveal — lightweight IntersectionObserver hook
 *
 * Adds the `is-visible` class to elements with `.reveal` or `.reveal-scale`
 * when they scroll into view (once). Works with the utility classes defined
 * in globals.css.
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLElement>();
 *   <section ref={ref} className="reveal"> ... </section>
 */

import { useEffect, useRef } from 'react';

interface ScrollRevealOptions {
  /** Percentage of element that must be visible (0–1). Default 0.15 */
  threshold?: number;
  /** Root margin (CSS margin syntax). Default "0px 0px -40px 0px" */
  rootMargin?: string;
}

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!motionOk) {
      // Show immediately without animation
      el.classList.add('is-visible');
      el.querySelectorAll('.reveal, .reveal-scale').forEach((child) =>
        child.classList.add('is-visible')
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe the ref element itself
    observer.observe(el);

    // Also observe any child .reveal / .reveal-scale elements
    el.querySelectorAll('.reveal, .reveal-scale').forEach((child) => {
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
