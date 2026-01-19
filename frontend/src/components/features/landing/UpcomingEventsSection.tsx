/**
 * Upcoming Events Section Component
 *
 * Displays upcoming church events from the backend API
 * Shows next 4 events with RSVP info
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { Calendar, MapPin, Clock, Users, ArrowRight, CalendarDays } from 'lucide-react';
import { eventService } from '../../../services/endpoints/eventService';
import { Event, EventCategory } from '../../../types/api';

const categoryColors: Record<EventCategory, string> = {
  [EventCategory.WORSHIP]: 'bg-blue-100 text-blue-700 border-blue-200',
  [EventCategory.BIBLE_STUDY]: 'bg-purple-100 text-purple-700 border-purple-200',
  [EventCategory.COMMUNITY]: 'bg-green-100 text-green-700 border-green-200',
  [EventCategory.FELLOWSHIP]: 'bg-orange-100 text-orange-700 border-orange-200',
};

const categoryLabels: Record<EventCategory, string> = {
  [EventCategory.WORSHIP]: 'Worship',
  [EventCategory.BIBLE_STUDY]: 'Bible Study',
  [EventCategory.COMMUNITY]: 'Community',
  [EventCategory.FELLOWSHIP]: 'Fellowship',
};

function formatDate(dateString: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
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
        // Fetch upcoming events (no auth required for public events)
        const data = await eventService.getEvents({
          startDate: new Date().toISOString(),
        });
        // Get only upcoming events (not cancelled) and limit to 4
        const upcomingEvents = data
          .filter((event) => !event.cancelledAt && new Date(event.startDateTime) > new Date())
          .slice(0, 4);
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

  return (
    <section className="bg-gray-50 px-4 py-20" id="events">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <CalendarDays className="h-4 w-4" />
              <span>Upcoming Events</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">Join Us</h2>
            <p className="mt-2 text-xl text-gray-600">See what's happening at our church</p>
          </div>
          <Link to="/events">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border-none shadow-lg">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg text-gray-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Upcoming Events</h3>
            <p className="text-gray-500">
              Check back soon for new events, or contact us for information about our regular
              services.
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => {
              const dateInfo = formatDate(event.startDateTime);
              const timeStr = formatTime(event.startDateTime);
              const category = event.category as EventCategory;
              const spotsLeft = event.maxCapacity
                ? event.maxCapacity - (event.rsvpCount || 0)
                : null;

              return (
                <Link to={`/events/${event.id}`} key={event.id}>
                  <Card className="group h-full overflow-hidden border-none shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    {/* Date Badge */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white">
                      <div className="flex items-start justify-between">
                        <div className="text-center">
                          <p className="text-sm font-medium uppercase opacity-80">
                            {dateInfo.weekday}
                          </p>
                          <p className="text-4xl font-bold">{dateInfo.day}</p>
                          <p className="text-sm font-medium uppercase">{dateInfo.month}</p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryColors[category]}`}
                        >
                          {categoryLabels[category]}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                        {event.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{timeStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        {spotsLeft !== null && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className={spotsLeft <= 5 ? 'font-medium text-orange-600' : ''}>
                              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center text-sm font-medium text-blue-600 transition-all group-hover:translate-x-1">
                        <span>View Details</span>
                        <ArrowRight className="ml-1 h-4 w-4" />
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
