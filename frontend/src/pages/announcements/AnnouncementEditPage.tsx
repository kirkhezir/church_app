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
import { useParams, useNavigate } from 'react-router-dom';
import { announcementService } from '../../../services/endpoints/announcementService';
import { AnnouncementForm } from '../../../components/features/announcements/AnnouncementForm';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export function AnnouncementEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;

      try {
        const data = await announcementService.getAnnouncementById(id);
        setAnnouncement(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load announcement');
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
  }) => {
    if (!id) return;

    setIsSaving(true);
    setSuccess(false);

    try {
      await announcementService.updateAnnouncement(id, data);
      setSuccess(true);

      // Redirect to announcement detail after short delay
      setTimeout(() => {
        navigate(`/announcements/${id}`);
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      throw error; // Re-throw to let form handle the error
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/announcements/${id}`);
    } else {
      navigate('/announcements');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-48" />
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Announcement not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Announcement
        </Button>
        <h1 className="text-3xl font-bold">Edit Announcement</h1>
        <p className="mt-2 text-gray-600">Update announcement details</p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Announcement updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <AnnouncementForm
          initialData={{
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Announcement"
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
