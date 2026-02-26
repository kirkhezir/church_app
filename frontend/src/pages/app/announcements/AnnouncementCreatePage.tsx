/**
 * AnnouncementCreatePage Component
 *
 * Admin/Staff page for creating new announcements
 * Features:
 * - Form validation
 * - Priority selection
 * - Success/error handling
 * - Navigation after creation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { announcementService } from '@/services/endpoints/announcementService';
import { AnnouncementForm } from '@/components/features/announcements/AnnouncementForm';
import { SidebarLayout } from '@/components/layout';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AnnouncementCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    priority: 'URGENT' | 'NORMAL';
    isDraft: boolean;
  }) => {
    setIsLoading(true);

    try {
      await announcementService.createAnnouncement(data);
      toast({ title: 'Announcement created successfully!' });

      // Redirect to admin announcements page after short delay
      setTimeout(() => {
        navigate('/app/admin/announcements');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleCancel = () => {
    navigate('/app/admin/announcements');
  };

  const createContent = (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-balance text-2xl font-bold sm:text-3xl">Create New Announcement</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Share important information with the church community
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <AnnouncementForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Announcement"
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Announcements', href: '/app/announcements' },
        { label: 'Manage', href: '/app/admin/announcements' },
        { label: 'Create' },
      ]}
    >
      {createContent}
    </SidebarLayout>
  );
}
