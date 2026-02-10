import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { EventForm } from '@/components/features/events/EventForm';
import { SidebarLayout } from '@/components/layout';
import { useEventDetail } from '@/hooks/useEvents';
import { eventService } from '@/services/endpoints/eventService';
import { EventCategory } from '@/types/api';

interface EventFormData {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  category: EventCategory;
  maxCapacity?: number;
  imageUrl?: string;
}

export const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { event, loading, error } = useEventDetail({
    eventId: id!,
    autoFetch: !!id,
  });

  // Check if event is cancelled (cannot edit cancelled events)
  useEffect(() => {
    if (event && event.cancelledAt) {
      navigate(`/app/events/${id}`);
    }
  }, [event, id, navigate]);

  const handleSubmit = async (data: EventFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await eventService.updateEvent(id, data);
      // Navigate back to event detail page
      navigate(`/app/events/${id}`);
    } catch (error) {
      console.error('Failed to update event:', error);
      setIsSubmitting(false);
      throw error; // Re-throw to let EventForm handle the error display
    }
  };

  const handleCancel = () => {
    navigate(`/app/events/${id}`);
  };

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Events', href: '/app/events' }, { label: 'Edit Event' }]}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-6 h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !event) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Events', href: '/app/events' }, { label: 'Edit Event' }]}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/app/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Event not found'}</AlertDescription>
          </Alert>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Events', href: '/app/events' },
        { label: event.title, href: `/app/events/${id}` },
        { label: 'Edit' },
      ]}
    >
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/app/events/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
            <CardDescription>
              Update the event details below. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm
              event={event}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default EventEditPage;
