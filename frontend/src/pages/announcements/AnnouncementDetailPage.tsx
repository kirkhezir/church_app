/**
 * AnnouncementDetailPage Component
 *
 * Displays full announcement details
 * Features:
 * - Full content with Markdown rendering
 * - Author information
 * - Published date
 * - Priority indicator
 * - Back navigation
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAnnouncement } from '../../../hooks/useAnnouncements';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { ArrowLeftIcon, CalendarIcon, UserIcon, AlertCircleIcon, BellIcon } from 'lucide-react';
import { format } from 'date-fns';

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { announcement, loading, error } = useAnnouncement(id);

  const handleBack = () => {
    navigate('/announcements');
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="mb-4 h-64 w-full" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Announcements
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Announcement not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const publishedDate = new Date(announcement.publishedAt);
  const isUrgent = announcement.priority === 'URGENT';

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Announcements
      </Button>

      {/* Announcement Content */}
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        {/* Priority Badge */}
        <div className="mb-4">
          {isUrgent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
              <AlertCircleIcon className="h-4 w-4" />
              Urgent Announcement
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              <BellIcon className="h-4 w-4" />
              Announcement
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold">{announcement.title}</h1>

        {/* Meta Information */}
        <div className="mb-6 flex flex-wrap gap-4 border-b border-gray-200 pb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>
              Posted by {announcement.author.firstName} {announcement.author.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(publishedDate, 'MMMM d, yyyy · h:mm a')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">{announcement.content}</div>
        </div>
      </div>
    </div>
  );
}
