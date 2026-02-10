import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { useEventDetail, useEventRSVP } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCategory } from '@/types/api';

const categoryColors: Record<EventCategory, string> = {
  [EventCategory.WORSHIP]: 'bg-blue-100 text-blue-800',
  [EventCategory.BIBLE_STUDY]: 'bg-purple-100 text-purple-800',
  [EventCategory.COMMUNITY]: 'bg-green-100 text-green-800',
  [EventCategory.FELLOWSHIP]: 'bg-orange-100 text-orange-800',
};

const categoryLabels: Record<EventCategory, string> = {
  [EventCategory.WORSHIP]: 'Worship Service',
  [EventCategory.BIBLE_STUDY]: 'Bible Study',
  [EventCategory.COMMUNITY]: 'Community Service',
  [EventCategory.FELLOWSHIP]: 'Fellowship',
};

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { event, loading, error, refetch } = useEventDetail({
    eventId: id!,
    autoFetch: !!id,
  });

  const { rsvping, rsvpError, rsvpToEvent, cancelRSVP } = useEventRSVP(() => {
    refetch();
  });

  // Always wrap with SidebarLayout — this page is behind PrivateRoute at /app/events/:id
  const wrapWithLayout = (content: React.ReactNode) => {
    const breadcrumbs = event
      ? [{ label: 'Events', href: '/app/events' }, { label: event.title }]
      : [{ label: 'Events', href: '/app/events' }];
    return <SidebarLayout breadcrumbs={breadcrumbs}>{content}</SidebarLayout>;
  };

  if (loading) {
    return wrapWithLayout(
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return wrapWithLayout(
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/app/events')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Event not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleRSVP = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/app/events/${id}` } });
      return;
    }

    if (event.hasUserRSVPd) {
      await cancelRSVP(event.id);
    } else {
      await rsvpToEvent(event.id);
    }
  };

  const isCancelled = !!event.cancelledAt;
  const isFull =
    event.maxCapacity && event.rsvpCount ? event.rsvpCount >= event.maxCapacity : false;
  const canRSVP = !isCancelled && user;
  const isCreator = user?.id === event.createdById;
  const canEdit = user && (user.role === 'ADMIN' || user.role === 'STAFF' || isCreator);

  const eventDetailContent = (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/app/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        {canEdit && !isCancelled && (
          <Button onClick={() => navigate(`/app/events/${event.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        )}
      </div>

      {/* Cancelled Badge */}
      {isCancelled && event.cancelledAt && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This event has been cancelled on {format(new Date(event.cancelledAt), 'MMMM d, yyyy')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Event Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge className={categoryColors[event.category]}>
                    {categoryLabels[event.category]}
                  </Badge>
                  <CardTitle className="mt-2 text-3xl">{event.title}</CardTitle>
                </div>
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDateTime), 'h:mm a')} -{' '}
                    {format(new Date(event.endDateTime), 'h:mm a')}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <p>{event.location}</p>
              </div>

              {/* Capacity */}
              {event.maxCapacity && (
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p>
                      {event.rsvpCount || 0} / {event.maxCapacity} attendees
                    </p>
                    {isFull && (
                      <p className="text-sm text-destructive">Event is at full capacity</p>
                    )}
                  </div>
                </div>
              )}

              {/* Created By */}
              {event.creator && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">
                      Organized by{' '}
                      <span className="font-medium">
                        {event.creator.firstName} {event.creator.lastName}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(event.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canRSVP && (
                <>
                  <Button
                    onClick={handleRSVP}
                    disabled={rsvping || (isFull && !event.hasUserRSVPd)}
                    className="w-full"
                    variant={event.hasUserRSVPd ? 'outline' : 'default'}
                  >
                    {rsvping ? (
                      'Processing...'
                    ) : event.hasUserRSVPd ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Cancel RSVP
                      </>
                    ) : isFull ? (
                      'Event Full'
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        RSVP to Event
                      </>
                    )}
                  </Button>
                  {rsvpError && (
                    <Alert variant="destructive">
                      <AlertDescription>{rsvpError}</AlertDescription>
                    </Alert>
                  )}
                  {event.hasUserRSVPd && (
                    <p className="text-center text-sm text-muted-foreground">
                      You&apos;re attending this event
                    </p>
                  )}
                </>
              )}

              {!user && !isCancelled && (
                <div className="space-y-2">
                  <p className="text-center text-sm text-muted-foreground">
                    Please log in to RSVP for this event
                  </p>
                  <Button
                    onClick={() => navigate('/login', { state: { from: `/app/events/${id}` } })}
                    className="w-full"
                  >
                    Log In to RSVP
                  </Button>
                </div>
              )}

              {canEdit && !isCancelled && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/events/${event.id}/rsvps`)}
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Attendees ({event.rsvpCount || 0})
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{categoryLabels[event.category]}</span>
              </div>
              {event.maxCapacity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{event.maxCapacity}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {Math.round(
                    (new Date(event.endDateTime).getTime() -
                      new Date(event.startDateTime).getTime()) /
                      (1000 * 60 * 60)
                  )}{' '}
                  hours
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return wrapWithLayout(eventDetailContent);
};

export default EventDetailPage;
