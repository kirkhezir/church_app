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
  }) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      const announcement = await announcementService.createAnnouncement(data);
      setSuccess(true);

      // Redirect to announcement detail after short delay
      setTimeout(() => {
        navigate(`/announcements/${announcement.id}`);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleCancel = () => {
    navigate('/announcements');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Announcements
        </Button>
        <h1 className="text-3xl font-bold">Create New Announcement</h1>
        <p className="mt-2 text-gray-600">Share important information with the church community</p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Announcement created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <AnnouncementForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Announcement"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
