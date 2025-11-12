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
import { useNavigate } from 'react-router-dom';
import { announcementService } from '@/services/endpoints/announcementService';
import { AnnouncementForm } from '@/components/features/announcements/AnnouncementForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import { ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnnouncementCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    priority: 'URGENT' | 'NORMAL';
    isDraft: boolean;
  }) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      await announcementService.createAnnouncement(data);
      setSuccess(true);

      // Redirect to admin announcements page after short delay
      setTimeout(() => {
        navigate('/admin/announcements');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleCancel = () => {
    navigate('/admin/announcements');
  };

  const createContent = (
    <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-3xl sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold sm:text-3xl">Create New Announcement</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Share important information with the church community
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50 sm:mb-6">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800 sm:text-base">
            Announcement created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
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
        { label: 'Announcements', href: '/announcements' },
        { label: 'Manage', href: '/admin/announcements' },
        { label: 'Create' },
      ]}
    >
      {createContent}
    </SidebarLayout>
  );
}
