import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  User2,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Edit,
  AlertTriangle,
  Ban,
  ClockIcon,
} from 'lucide-react';
import { useEventDetail, useEventRSVP } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { EventCategory } from '@/types/api';
import { gooeyToast } from 'goey-toast';
import { eventService } from '@/services/endpoints/eventService';
import { reportError } from '@/lib/errorReporting';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const categoryConfig: Record<
  EventCategory,
  { label: string; badge: string; accent: string; bg: string }
> = {
  [EventCategory.WORSHIP]: {
    label: 'Worship Service',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    accent: 'bg-blue-600 dark:bg-blue-500',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
  [EventCategory.BIBLE_STUDY]: {
    label: 'Bible Study',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    accent: 'bg-emerald-600 dark:bg-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  [EventCategory.COMMUNITY]: {
    label: 'Community Service',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    accent: 'bg-purple-600 dark:bg-purple-500',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
  },
  [EventCategory.FELLOWSHIP]: {
    label: 'Fellowship',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    accent: 'bg-amber-500 dark:bg-amber-400',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
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

  const [cancelling, setCancelling] = useState(false);

  const handleCancelEvent = async () => {
    if (!event) return;
    setCancelling(true);
    try {
      await eventService.cancelEvent(event.id);
      gooeyToast.success('Event cancelled');
      refetch();
    } catch (err) {
      gooeyToast.error('Failed to cancel event');
      reportError('Failed to cancel event', err);
    } finally {
      setCancelling(false);
    }
  };

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
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4 p-6">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-3/5" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-3 rounded-xl border bg-card p-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
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

    try {
      if (event.hasUserRSVPd) {
        await cancelRSVP(event.id);
        gooeyToast.success('RSVP cancelled');
      } else {
        await rsvpToEvent(event.id);
        gooeyToast.success('RSVP confirmed!', {
          description: 'You have been registered for this event.',
        });
      }
    } catch {
      gooeyToast.error('RSVP failed', {
        description: 'Could not process your request. Please try again.',
      });
    }
  };

  const isCancelled = !!event.cancelledAt;
  const isFull =
    event.maxCapacity && event.rsvpCount ? event.rsvpCount >= event.maxCapacity : false;
  const canRSVP = !isCancelled && user;
  const isCreator = user?.id === event.createdById;
  const canEdit = user && (user.role === 'ADMIN' || user.role === 'STAFF' || isCreator);

  const config = categoryConfig[event.category];

  const eventDetailContent = (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        {canEdit && !isCancelled && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/app/events/${event.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={cancelling}>
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel &ldquo;{event.title}&rdquo; and notify all RSVPd attendees.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Event</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelEvent}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Event
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Cancelled Alert */}
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
          {/* Event Header Card with Hero Image */}
          <Card className="overflow-hidden">
            {/* Hero image */}
            {event.imageUrl && (
              <div className="relative h-56 w-full overflow-hidden sm:h-72">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <Badge className={cn('absolute bottom-4 left-4 rounded-full', config.badge)}>
                  {config.label}
                </Badge>
              </div>
            )}

            {/* Category accent bar when no image */}
            {!event.imageUrl && <div className={cn('h-1.5 w-full', config.accent)} />}

            <CardContent className="p-6">
              {/* Badge when no image */}
              {!event.imageUrl && (
                <Badge className={cn('mb-3 rounded-full', config.badge)}>{config.label}</Badge>
              )}

              <h1 className="mb-4 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {event.title}
              </h1>

              {/* Info grid with subtle background */}
              <div className={cn('space-y-3 rounded-lg p-4', config.bg)}>
                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startDateTime), 'h:mm a')} –{' '}
                      {format(new Date(event.endDateTime), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Location */}
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p>{event.location}</p>
                </div>

                {/* Capacity */}
                {event.maxCapacity && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">
                            {event.rsvpCount || 0} / {event.maxCapacity} attendees
                          </p>
                          {isFull && (
                            <span className="text-xs font-medium text-destructive">Full</span>
                          )}
                        </div>
                        <Progress
                          value={Math.min(((event.rsvpCount || 0) / event.maxCapacity) * 100, 100)}
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Organizer */}
                {event.creator && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="flex items-center gap-3">
                      <User2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">
                          Organized by{' '}
                          <span className="font-medium">
                            {event.creator.firstName} {event.creator.lastName}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canRSVP && (
                <>
                  <Button
                    onClick={handleRSVP}
                    disabled={rsvping || (isFull && !event.hasUserRSVPd)}
                    className="w-full"
                    size="lg"
                    variant={event.hasUserRSVPd ? 'outline' : 'default'}
                  >
                    {rsvping ? (
                      'Processing\u2026'
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
                    <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                      ✓ You&apos;re attending this event
                    </p>
                  )}
                </>
              )}

              {!user && !isCancelled && (
                <div className="space-y-3">
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
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <Badge className={cn('rounded-full text-xs', config.badge)}>{config.label}</Badge>
              </div>
              <Separator />
              {event.maxCapacity && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{event.maxCapacity}</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Duration
                </span>
                <span className="font-medium">
                  {(() => {
                    const totalMinutes = Math.round(
                      (new Date(event.endDateTime).getTime() -
                        new Date(event.startDateTime).getTime()) /
                        (1000 * 60)
                    );
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    if (hours === 0) return `${minutes} min`;
                    if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
                    return `${hours}h ${minutes}m`;
                  })()}
                </span>
              </div>
              {event.creator && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <time
                      dateTime={new Date(event.createdAt).toISOString()}
                      className="font-medium"
                    >
                      {format(new Date(event.createdAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return wrapWithLayout(eventDetailContent);
};

export default EventDetailPage;
