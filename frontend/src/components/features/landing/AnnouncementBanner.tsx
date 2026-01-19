/**
 * Announcement Banner Component
 *
 * Dismissible announcement bar for important church updates
 * Shows at the top of the landing page
 */

import { useState, useEffect } from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/button';

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
    id: 'welcome-2025',
    message: '🎉 Welcome to 2026! Join us for our New Year Service this Sabbath!',
    link: '/events',
    linkText: 'View Events',
    type: 'success',
  },
];

const typeStyles = {
  info: 'bg-blue-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-500 text-yellow-900',
  urgent: 'bg-red-600 text-white',
};

export function AnnouncementBanner({
  announcements = defaultAnnouncements,
}: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load dismissed announcements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dismissedAnnouncements');
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
  }, []);

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  // Auto-rotate announcements
  useEffect(() => {
    if (visibleAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [visibleAnnouncements.length]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  if (visibleAnnouncements.length === 0) return null;

  const currentAnnouncement = visibleAnnouncements[currentIndex];

  return (
    <div
      className={`relative ${typeStyles[currentAnnouncement.type]} px-4 py-3 shadow-lg transition-all duration-300`}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
        <Bell className="h-5 w-5 flex-shrink-0 animate-pulse" />

        <div className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-medium md:text-base">
          <span>{currentAnnouncement.message}</span>

          {currentAnnouncement.link && (
            <a
              href={currentAnnouncement.link}
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold transition-all hover:bg-white/30"
            >
              {currentAnnouncement.linkText || 'Learn More'}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Indicators for multiple announcements */}
        {visibleAnnouncements.length > 1 && (
          <div className="hidden items-center gap-1 md:flex">
            {visibleAnnouncements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Go to announcement ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDismiss(currentAnnouncement.id)}
          className="ml-2 h-8 w-8 rounded-full p-0 text-current hover:bg-white/20"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default AnnouncementBanner;
