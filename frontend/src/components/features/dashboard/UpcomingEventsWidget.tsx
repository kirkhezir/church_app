/**
 * Upcoming Events Widget (T099)
 *
 * Displays upcoming church events in dashboard
 */

import { Link } from 'react-router-dom';
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

export function UpcomingEventsWidget({ events }: UpcomingEventsWidgetProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No upcoming events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Upcoming Events</CardTitle>
        <Link to="/app/events">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{startDate.getDate()}</div>
                    <div className="text-xs text-gray-500">
                      {startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      {dateStr} at {timeStr}
                    </span>
                    <span>•</span>
                    <span>{event.location}</span>
                  </div>
                  {event.rsvpStatus && (
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
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
}
