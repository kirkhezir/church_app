/**
 * Recent Announcements Widget (T100)
 *
 * Displays recent church announcements in dashboard with
 * priority-based accent colors and unread indicators.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import { Megaphone, ArrowRight, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: string;
  isRead: boolean;
}

interface RecentAnnouncementsWidgetProps {
  announcements: Announcement[];
}

const PRIORITY_STYLES: Record<string, { badge: string; dot: string; border: string }> = {
  URGENT: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    dot: 'bg-red-500',
    border: 'border-l-red-500',
  },
  HIGH: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-l-amber-500',
  },
  NORMAL: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    dot: 'bg-blue-500',
    border: 'border-l-blue-500',
  },
  LOW: {
    badge: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    border: 'border-l-muted-foreground/50',
  },
};

export const RecentAnnouncementsWidget = memo(function RecentAnnouncementsWidget({
  announcements,
}: RecentAnnouncementsWidgetProps) {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            Recent Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Megaphone className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No recent announcements</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-amber-500" />
          Recent Announcements
        </CardTitle>
        <Link to="/app/announcements">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const publishedDate = new Date(announcement.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const priority = announcement.priority.toUpperCase();
            const styles = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.NORMAL;

            return (
              <div
                key={announcement.id}
                className={`rounded-lg border border-l-[3px] p-3 transition-all duration-200 hover:-translate-y-px hover:shadow-sm ${styles.border} ${
                  !announcement.isRead ? 'bg-accent/30 dark:bg-accent/10' : 'border-border/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        {announcement.title}
                      </h3>
                      {!announcement.isRead && (
                        <span className="relative flex h-2 w-2 flex-shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {announcement.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                        {announcement.priority}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {publishedDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
