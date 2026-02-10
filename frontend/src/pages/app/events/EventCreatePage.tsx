import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EventForm } from '@/components/features/events/EventForm';
import { SidebarLayout } from '@/components/layout';
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

export const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const newEvent = await eventService.createEvent(data);
      // Navigate to the new event detail page
      navigate(`/app/events/${newEvent.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      setIsSubmitting(false);
      throw error; // Re-throw to let EventForm handle the error display
    }
  };

  const handleCancel = () => {
    navigate('/app/events');
  };

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Events', href: '/app/events' }, { label: 'Create Event' }]}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/app/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Fill in the details below to create a new event. All fields marked with * are
              required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isSubmitting} />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default EventCreatePage;
