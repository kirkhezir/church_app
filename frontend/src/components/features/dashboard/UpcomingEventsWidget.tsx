/**
 * Upcoming Events Widget (T099)
 *
 * Displays upcoming church events in dashboard with
 * visual date badges and hover lift effects.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  rsvpStatus?: string;
}

interface UpcomingEventsWidgetProps {
  events: Event[];
}

export const UpcomingEventsWidget = memo(function UpcomingEventsWidget({
  events,
}: UpcomingEventsWidgetProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No upcoming events</p>
            <Link to="/app/events" className="mt-2">
              <Button variant="link" size="sm">
                Browse Events
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <Link to="/app/events">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => {
            const startDate = new Date(event.startDate);
            const dateStr = startDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div
                key={event.id}
                className="group flex items-start gap-4 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm"
              >
                {/* Date badge */}
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
                    <div className="text-xl font-bold tabular-nums leading-none text-primary">
                      {startDate.getDate()}
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                      {startDate.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dateStr} at {timeStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  </div>
                  {event.rsvpStatus && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {event.rsvpStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
