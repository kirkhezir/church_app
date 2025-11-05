import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Users, Mail, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useEventDetail } from '@/hooks/useEvents';
import { eventService } from '@/services/endpoints/eventService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventRSVP, RSVPStatus } from '@/types/api';

const statusIcons = {
  [RSVPStatus.CONFIRMED]: <CheckCircle className="h-4 w-4 text-green-600" />,
  [RSVPStatus.WAITLISTED]: <Clock className="h-4 w-4 text-yellow-600" />,
  [RSVPStatus.CANCELLED]: <XCircle className="h-4 w-4 text-red-600" />,
};

const statusLabels = {
  [RSVPStatus.CONFIRMED]: 'Confirmed',
  [RSVPStatus.WAITLISTED]: 'Waitlisted',
  [RSVPStatus.CANCELLED]: 'Cancelled',
};

const statusColors = {
  [RSVPStatus.CONFIRMED]: 'bg-green-100 text-green-800',
  [RSVPStatus.WAITLISTED]: 'bg-yellow-100 text-yellow-800',
  [RSVPStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export const RSVPListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | RSVPStatus>('all');

  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useEventDetail({
    eventId: id!,
    enabled: !!id,
  });

  // Fetch RSVPs when component mounts or tab changes
  React.useEffect(() => {
    const fetchRSVPs = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const status = activeTab === 'all' ? undefined : activeTab;
        const data = await eventService.getEventRSVPs(id, status);
        setRsvps(data);
      } catch (err) {
        console.error('Failed to fetch RSVPs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load RSVPs');
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPs();
  }, [id, activeTab]);

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{eventError || 'Event not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate statistics
  const confirmedCount = rsvps.filter((r) => r.status === RSVPStatus.CONFIRMED).length;
  const waitlistedCount = rsvps.filter((r) => r.status === RSVPStatus.WAITLISTED).length;
  const cancelledCount = rsvps.filter((r) => r.status === RSVPStatus.CANCELLED).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/events/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>
        <Button onClick={() => navigate(`/events/${id}/edit`)}>Edit Event</Button>
      </div>

      {/* Event Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy h:mm a')} • {event.location}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{event.rsvpCount || 0}</p>
                <p className="text-sm text-muted-foreground">Total RSVPs</p>
              </div>
            </div>
            {event.maxCapacity && (
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-2xl font-bold">{event.maxCapacity}</p>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RSVP List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Event Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs for filtering by status */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({confirmedCount + waitlistedCount})</TabsTrigger>
              <TabsTrigger value={RSVPStatus.CONFIRMED}>Confirmed ({confirmedCount})</TabsTrigger>
              <TabsTrigger value={RSVPStatus.WAITLISTED}>
                Waitlisted ({waitlistedCount})
              </TabsTrigger>
              <TabsTrigger value={RSVPStatus.CANCELLED}>Cancelled ({cancelledCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : rsvps.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No RSVPs found for this filter.</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>RSVP Date</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rsvps.map((rsvp) => (
                        <TableRow key={rsvp.id}>
                          <TableCell className="font-medium">
                            {rsvp.member
                              ? `${rsvp.member.firstName} ${rsvp.member.lastName}`
                              : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {rsvp.member?.email || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[rsvp.status]}>
                              <span className="flex items-center gap-1">
                                {statusIcons[rsvp.status]}
                                {statusLabels[rsvp.status]}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(rsvp.rsvpedAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {format(new Date(rsvp.updatedAt), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RSVPListPage;
