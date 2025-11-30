import React from 'react';
import { cn } from '@/lib/utils';

/**
 * VisuallyHidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * This is useful for providing additional context to assistive technologies
 * without cluttering the visual interface.
 *
 * @example
 * ```tsx
 * <button>
 *   <TrashIcon />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </button>
 * ```
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** Optional element type (default: span) */
  as?: keyof JSX.IntrinsicElements;
  /** Optional CSS class name */
  className?: string;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Element = 'span',
  className,
}) => {
  return <Element className={cn('sr-only', className)}>{children}</Element>;
};

/**
 * LiveRegion Component
 *
 * Creates an ARIA live region for announcing dynamic content changes
 * to screen reader users. This is essential for SPA applications where
 * content updates without page reloads.
 *
 * @example
 * ```tsx
 * const [message, setMessage] = useState('');
 *
 * return (
 *   <>
 *     <button onClick={() => setMessage('Item deleted')}>Delete</button>
 *     <LiveRegion>{message}</LiveRegion>
 *   </>
 * );
 * ```
 */
interface LiveRegionProps {
  /** Content to announce */
  children: React.ReactNode;
  /** Politeness level: polite (default) or assertive */
  politeness?: 'polite' | 'assertive';
  /** Whether atomic (announce entire region on change) */
  atomic?: boolean;
  /** Optional CSS class name */
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  className,
}) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
};

/**
 * FocusTrap Hook
 *
 * Traps focus within a container element, useful for modals and dialogs.
 * Returns a ref to attach to the container.
 *
 * @example
 * ```tsx
 * function Modal() {
 *   const trapRef = useFocusTrap();
 *
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       <button>Close</button>
 *       <p>Modal content</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Focus first element on mount
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return containerRef;
}

/**
 * Accessible Icon Button
 *
 * A button that only shows an icon but has proper accessibility.
 *
 * @example
 * ```tsx
 * <IconButton label="Delete item" onClick={handleDelete}>
 *   <TrashIcon />
 * </IconButton>
 * ```
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label for the button */
  label: string;
  /** Icon element */
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ label, children, className, ...props }) => {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Announce Component
 *
 * Utility component for announcing route changes or other navigation events.
 *
 * @example
 * ```tsx
 * // In your router
 * <Announce>Navigated to Dashboard page</Announce>
 * ```
 */
interface AnnounceProps {
  children: React.ReactNode;
}

export const Announce: React.FC<AnnounceProps> = ({ children }) => {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {children}
    </div>
  );
};

export default VisuallyHidden;
