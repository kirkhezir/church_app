/**
 * AnnouncementCard Component
 *
 * Displays announcement information in a card format
 * Shows: title, content preview, priority badge, author, date
 * Handles: click to view full announcement
 */

import { memo } from 'react';
import { BellIcon, AlertCircleIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { Announcement } from '@/services/endpoints/announcementService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AnnouncementCardProps {
  announcement: Announcement;
  onViewDetails?: (announcementId: string) => void;
  showFullContent?: boolean;
}

export const AnnouncementCard = memo(function AnnouncementCard({
  announcement,
  onViewDetails,
  showFullContent = false,
}: AnnouncementCardProps) {
  const publishedDate = new Date(announcement.publishedAt);
  const isUrgent = announcement.priority === 'URGENT';
  const isArchived = !!announcement.archivedAt;

  // Truncate content for preview (first 200 characters)
  const contentPreview =
    announcement.content.length > 200 && !showFullContent
      ? announcement.content.substring(0, 200) + '\u2026'
      : announcement.content;

  return (
    <Card
      className={`transition-shadow hover:shadow-lg ${isArchived ? 'opacity-60' : ''} ${
        isUrgent ? 'border-l-4 border-l-red-500' : ''
      }`}
      data-testid="announcement-card"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {isUrgent && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                  <AlertCircleIcon className="h-3 w-3" />
                  Urgent
                </span>
              )}
              {!isUrgent && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  <BellIcon className="h-3 w-3" />
                  Normal
                </span>
              )}
              {isArchived && (
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  Archived
                </span>
              )}
            </div>
            <CardTitle className="text-xl">{announcement.title}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-4 whitespace-pre-wrap text-sm text-foreground/80">
          {contentPreview}
        </CardDescription>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" />
            <span>
              {announcement.author.firstName} {announcement.author.lastName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(publishedDate, 'MMM d, yyyy')}</span>
          </div>
        </div>

        {!showFullContent && onViewDetails && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(announcement.id)}
              data-testid="view-details-button"
            >
              Read More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
