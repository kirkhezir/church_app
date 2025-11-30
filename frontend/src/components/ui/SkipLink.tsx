import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipLink Component
 *
 * Provides a skip navigation link for keyboard users to bypass
 * repetitive navigation and jump directly to main content.
 * This is a critical WCAG 2.1 Level A requirement.
 *
 * The link is visually hidden until it receives focus, then it
 * becomes visible at the top of the page.
 *
 * @example
 * ```tsx
 * // Add at the top of your layout, before any other content
 * <SkipLink href="#main-content" />
 *
 * // And add the corresponding id to your main content
 * <main id="main-content">...</main>
 * ```
 */
interface SkipLinkProps {
  /** The href/id to skip to (e.g., "#main-content") */
  href?: string;
  /** Custom text for the link */
  children?: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}) => {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default
        'sr-only',
        // Visible when focused
        'focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'focus:rounded-md focus:bg-primary focus:px-4 focus:py-2',
        'focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      {children}
    </a>
  );
};

/**
 * SkipLinks Component
 *
 * Provides multiple skip links for complex pages with multiple
 * navigable regions.
 *
 * @example
 * ```tsx
 * <SkipLinks
 *   links={[
 *     { href: '#main-content', label: 'Skip to main content' },
 *     { href: '#navigation', label: 'Skip to navigation' },
 *     { href: '#footer', label: 'Skip to footer' },
 *   ]}
 * />
 * ```
 */
interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ links, className }) => {
  return (
    <div className={cn('skip-links', className)}>
      {links.map((link) => (
        <SkipLink key={link.href} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </div>
  );
};

export default SkipLink;
