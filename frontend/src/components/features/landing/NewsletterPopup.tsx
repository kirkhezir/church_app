/**
 * Newsletter Popup Component
 *
 * Newsletter subscription popup that appears after
 * scrolling or after a time delay
 *
 * BEST PRACTICES:
 * - Only show to returning visitors (not first-time)
 * - Long delay before showing (60s+)
 * - High scroll threshold (80%+)
 * - Remember dismissal for 7 days
 * - Don't interrupt important user flows
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Mail, X, CheckCircle, Send, Bell } from 'lucide-react';

interface NewsletterPopupProps {
  /** Delay before showing popup (ms) - default 60s */
  delay?: number;
  /** Scroll percentage to trigger popup (0-100) - default 80% */
  scrollTrigger?: number;
  /** Only show to returning visitors */
  onlyReturningVisitors?: boolean;
}

export function NewsletterPopup({
  delay = 60000, // 60 seconds - more respectful
  scrollTrigger = 80, // 80% scroll - user is engaged
  onlyReturningVisitors = true,
}: NewsletterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already dismissed or subscribed
    const hasDismissed = localStorage.getItem('newsletterDismissed');
    const dismissedAt = localStorage.getItem('newsletterDismissedAt');
    const hasSubscribed = localStorage.getItem('newsletterSubscribed');
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);

    // Update visit count
    localStorage.setItem('visitCount', String(visitCount + 1));

    // Don't show if subscribed
    if (hasSubscribed) return;

    // Check if dismissed recently (within 7 days)
    if (hasDismissed && dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Only show to returning visitors (2+ visits)
    if (onlyReturningVisitors && visitCount < 1) return;

    let timeoutId: NodeJS.Timeout;
    let hasTriggered = false;

    // Time-based trigger
    timeoutId = setTimeout(() => {
      if (!hasTriggered) {
        setIsOpen(true);
        hasTriggered = true;
      }
    }, delay);

    // Scroll-based trigger
    const handleScroll = () => {
      if (hasTriggered) return;

      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercentage >= scrollTrigger) {
        setIsOpen(true);
        hasTriggered = true;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [delay, scrollTrigger, onlyReturningVisitors]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('newsletterDismissed', 'true');
    localStorage.setItem('newsletterDismissedAt', String(Date.now()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      setIsSubscribed(true);
      localStorage.setItem('newsletterSubscribed', 'true');

      // Close popup after showing success
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {!isSubscribed ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl">Stay Connected</DialogTitle>
              <DialogDescription className="text-base">
                Subscribe to our newsletter for updates on events, sermons, and church news.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newsletter-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Subscribe
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                No thanks, maybe later
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-2xl">Thank You!</DialogTitle>
            <DialogDescription className="text-base">
              You've been successfully subscribed to our newsletter. We'll keep you updated with the
              latest news and events.
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NewsletterPopup;
