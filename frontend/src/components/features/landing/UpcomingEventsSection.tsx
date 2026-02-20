/**
 * Upcoming Events Section Component
 *
 * Displays upcoming church events from the backend API
 * Shows next 3 events - hides section entirely if no events (cleaner UX)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { eventService } from '../../../services/endpoints/eventService';
import { Event, EventCategory } from '../../../types/api';

const categoryColors: Record<EventCategory, string> = {
  [EventCategory.WORSHIP]: 'bg-accent text-primary',
  [EventCategory.BIBLE_STUDY]: 'bg-purple-100 text-purple-700',
  [EventCategory.COMMUNITY]: 'bg-green-100 text-green-700',
  [EventCategory.FELLOWSHIP]: 'bg-orange-100 text-orange-700',
};

const categoryLabels: Record<EventCategory, string> = {
  [EventCategory.WORSHIP]: 'Worship',
  [EventCategory.BIBLE_STUDY]: 'Bible Study',
  [EventCategory.COMMUNITY]: 'Community',
  [EventCategory.FELLOWSHIP]: 'Fellowship',
};

function formatDate(dateString: string): { day: string; month: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
  };
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function UpcomingEventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents({
          startDate: new Date().toISOString(),
        });
        const upcomingEvents = data
          .filter((event) => !event.cancelledAt && new Date(event.startDateTime) > new Date())
          .slice(0, 3);
        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Unable to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Don't render section at all if there are no events and not loading
  if (!loading && (error || events.length === 0)) {
    return null;
  }

  return (
    <section className="bg-background py-16 sm:py-24" aria-labelledby="events-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2
              id="events-heading"
              className="text-balance text-3xl font-bold text-foreground sm:text-4xl"
            >
              Upcoming Events
            </h2>
            <p className="mt-1 text-lg text-muted-foreground">See what's happening at our church</p>
          </div>
          <Link to="/events">
            <Button className="bg-primary hover:bg-primary/90">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <Skeleton className="mb-3 h-5 w-20" />
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const dateInfo = formatDate(event.startDateTime);
              const timeStr = formatTime(event.startDateTime);
              const category = event.category as EventCategory;

              return (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <Card className="group h-full overflow-hidden border border-border transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      {/* Date + Category */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {dateInfo.month} {dateInfo.day}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[category]}`}
                        >
                          {categoryLabels[category]}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                        {event.title}
                      </h3>

                      {/* Details */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{timeStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default UpcomingEventsSection;
