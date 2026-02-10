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

import { useParams, useNavigate } from 'react-router';
import { useAnnouncement } from '@/hooks/useAnnouncements';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarLayout } from '@/components/layout';
import { ArrowLeftIcon, CalendarIcon, UserIcon, AlertCircleIcon, BellIcon } from 'lucide-react';
import { format } from 'date-fns';

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { announcement, loading, error } = useAnnouncement(id);

  const handleBack = () => {
    navigate('/app/announcements');
  };

  if (loading) {
    const loadingContent = (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="mb-4 h-64 w-full" />
      </div>
    );
    return (
      <SidebarLayout
        breadcrumbs={[{ label: 'Announcements', href: '/app/announcements' }, { label: 'Details' }]}
      >
        {loadingContent}
      </SidebarLayout>
    );
  }

  if (error || !announcement) {
    const errorContent = (
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
    return (
      <SidebarLayout
        breadcrumbs={[{ label: 'Announcements', href: '/app/announcements' }, { label: 'Details' }]}
      >
        {errorContent}
      </SidebarLayout>
    );
  }

  const publishedDate = new Date(announcement.publishedAt);
  const isUrgent = announcement.priority === 'URGENT';

  const detailContent = (
    <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-4xl sm:px-6 sm:py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 sm:mb-6">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Announcements
      </Button>

      {/* Announcement Content */}
      <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6 md:p-8">
        {/* Priority Badge */}
        <div className="mb-3 sm:mb-4">
          {isUrgent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 sm:px-3 sm:text-sm">
              <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              Urgent Announcement
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 sm:px-3 sm:text-sm">
              <BellIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              Announcement
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl md:text-3xl">
          {announcement.title}
        </h1>

        {/* Meta Information */}
        <div className="mb-4 flex flex-col gap-2 border-b border-gray-200 pb-3 text-xs text-gray-600 sm:mb-6 sm:flex-row sm:flex-wrap sm:gap-4 sm:pb-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>
              Posted by {announcement.author.firstName} {announcement.author.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{format(publishedDate, 'MMMM d, yyyy · h:mm a')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm prose-gray sm:prose-base max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">{announcement.content}</div>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Announcements', href: '/app/announcements' },
        { label: announcement.title },
      ]}
    >
      {detailContent}
    </SidebarLayout>
  );
}
