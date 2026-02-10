/**
 * Announcement Banner Component
 *
 * Dismissible announcement bar for important church updates
 * Shows at the top of the landing page
 *
 * UI/UX Best Practices:
 * - Non-intrusive but visible
 * - Easy to dismiss
 * - Clear call-to-action
 * - Accessible (proper ARIA labels)
 * - Mobile responsive
 * - Pause/Play control for auto-rotation (WCAG compliant)
 */

import { useState, useEffect } from 'react';
import { X, ChevronRight, Pause, Play } from 'lucide-react';
import { Link } from 'react-router';

interface Announcement {
  id: string;
  message: string;
  link?: string;
  linkText?: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
}

interface AnnouncementBannerProps {
  announcements?: Announcement[];
}

const defaultAnnouncements: Announcement[] = [
  {
    id: 'welcome-2026',
    message: '🎉 Welcome to 2026! Join us for our New Year Service this Sabbath!',
    link: '/events',
    linkText: 'View Events',
    type: 'success',
  },
];

const typeStyles = {
  info: 'bg-blue-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  urgent: 'bg-rose-600',
};

export function AnnouncementBanner({
  announcements = defaultAnnouncements,
}: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dismissedAnnouncements');
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch {
        // Invalid JSON, reset
        localStorage.removeItem('dismissedAnnouncements');
      }
    }
  }, []);

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  useEffect(() => {
    if (visibleAnnouncements.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
    }, 8000); // Increased to 8 seconds for better readability
    return () => clearInterval(interval);
  }, [visibleAnnouncements.length, isPaused]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  if (visibleAnnouncements.length === 0) return null;

  const currentAnnouncement = visibleAnnouncements[currentIndex] || visibleAnnouncements[0];
  if (!currentAnnouncement) return null;

  return (
    <div
      className={`${typeStyles[currentAnnouncement.type]} relative`}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Content */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-x-3">
          <p className="truncate text-sm font-medium text-white">{currentAnnouncement.message}</p>
          {currentAnnouncement.link && (
            <Link
              to={currentAnnouncement.link}
              className="group inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
            >
              {currentAnnouncement.linkText || 'Learn More'}
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Controls: Pause/Play and Dismiss */}
        <div className="ml-3 flex flex-shrink-0 items-center gap-1">
          {/* Pause/Play Button - only show if multiple announcements */}
          {visibleAnnouncements.length > 1 && (
            <button
              onClick={togglePause}
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
          {/* Dismiss Button */}
          <button
            onClick={() => handleDismiss(currentAnnouncement.id)}
            className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress indicators for multiple announcements */}
      {visibleAnnouncements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-0.5">
          {visibleAnnouncements.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'
              }`}
              aria-label={`Go to announcement ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnnouncementBanner;
