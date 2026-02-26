/**
 * AnnouncementEditPage Component
 *
 * Admin/Staff page for editing existing announcements
 * Features:
 * - Load existing announcement data
 * - Form validation
 * - Update submission
 * - Success/error handling
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { announcementService } from '@/services/endpoints/announcementService';
import { getErrorMessage } from '@/lib/errorReporting';
import { AnnouncementForm } from '@/components/features/announcements/AnnouncementForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarLayout } from '@/components/layout';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AnnouncementEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;

      try {
        const data = await announcementService.getAnnouncementById(id);
        setAnnouncement(data);
        setError(null);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load announcement'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    priority: 'URGENT' | 'NORMAL';
    isDraft: boolean;
  }) => {
    if (!id) return;

    setIsSaving(true);

    try {
      await announcementService.updateAnnouncement(id, data);
      toast({ title: 'Announcement updated successfully!' });

      // Redirect to admin announcements page after short delay
      setTimeout(() => {
        navigate('/app/admin/announcements');
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleCancel = () => {
    navigate('/app/admin/announcements');
  };

  if (isLoading) {
    const loadingContent = (
      <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-3xl sm:px-6 sm:py-8">
        <Skeleton className="mb-4 h-8 w-24 sm:h-10 sm:w-48" />
        <Skeleton className="mb-4 h-8 w-3/4 sm:h-12" />
        <Skeleton className="h-64 w-full sm:h-96" />
      </div>
    );
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: 'Announcements', href: '/app/announcements' },
          { label: 'Manage', href: '/app/admin/announcements' },
          { label: 'Edit' },
        ]}
      >
        {loadingContent}
      </SidebarLayout>
    );
  }

  if (error || !announcement) {
    const errorContent = (
      <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-3xl sm:px-6 sm:py-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription className="text-sm sm:text-base">
            {error || 'Announcement not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: 'Announcements', href: '/app/announcements' },
          { label: 'Manage', href: '/app/admin/announcements' },
          { label: 'Edit' },
        ]}
      >
        {errorContent}
      </SidebarLayout>
    );
  }

  const editContent = (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-balance text-2xl font-bold sm:text-3xl">Edit Announcement</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Update announcement details
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <AnnouncementForm
          initialData={{
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            isDraft: announcement.isDraft || false,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Announcement"
          isLoading={isSaving}
        />
      </div>
    </div>
  );

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Announcements', href: '/app/announcements' },
        { label: 'Manage', href: '/app/admin/announcements' },
        { label: 'Edit' },
      ]}
    >
      {editContent}
    </SidebarLayout>
  );
}
