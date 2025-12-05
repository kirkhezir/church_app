/**
 * EventCard Component
 *
 * Displays event information in a card format
 * Shows: title, date/time, location, category, capacity
 * Handles: click to view details
 */

import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { Event, EventCategory } from '../../../types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onViewDetails?: (eventId: string) => void;
  onRSVP?: (eventId: string) => void;
  showRSVPButton?: boolean;
}

const categoryLabels: Record<EventCategory, string> = {
  WORSHIP: 'Worship Service',
  BIBLE_STUDY: 'Bible Study',
  COMMUNITY: 'Community',
  FELLOWSHIP: 'Fellowship',
};

const categoryColors: Record<EventCategory, string> = {
  WORSHIP: 'bg-blue-100 text-blue-800',
  BIBLE_STUDY: 'bg-purple-100 text-purple-800',
  COMMUNITY: 'bg-green-100 text-green-800',
  FELLOWSHIP: 'bg-orange-100 text-orange-800',
};

export function EventCard({
  event,
  onViewDetails,
  onRSVP,
  showRSVPButton = false,
}: EventCardProps) {
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  const isCancelled = !!event.cancelledAt;

  const formatTime = (date: Date) => format(date, 'h:mm a');
  const formatDate = (date: Date) => format(date, 'MMM d, yyyy');

  const availableSpots =
    event.maxCapacity && event.rsvpCount !== undefined
      ? event.maxCapacity - event.rsvpCount
      : undefined;

  const isFull = availableSpots !== undefined && availableSpots <= 0;

  return (
    <Card
      className={`transition-shadow hover:shadow-lg ${isCancelled ? 'opacity-60' : ''}`}
      data-testid="event-card"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${categoryColors[event.category]}`}
              >
                {categoryLabels[event.category]}
              </span>
              {isCancelled && (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                  Cancelled
                </span>
              )}
              {isFull && !isCancelled && (
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  Full
                </span>
              )}
            </div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date and Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>{formatDate(startDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4" />
          <span>
            {formatTime(startDate)} - {formatTime(endDate)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinIcon className="h-4 w-4" />
          <span>{event.location}</span>
        </div>

        {/* Capacity */}
        {event.maxCapacity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
            <span>
              {event.rsvpCount || 0} / {event.maxCapacity} attendees
              {availableSpots !== undefined && availableSpots > 0 && (
                <span className="ml-1 text-green-600">({availableSpots} spots left)</span>
              )}
            </span>
          </div>
        )}

        {/* Creator */}
        {event.creator && (
          <div className="border-t pt-2 text-xs text-muted-foreground">
            Organized by {event.creator.firstName} {event.creator.lastName}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(event.id)}
            className="flex-1"
          >
            View Details
          </Button>

          {showRSVPButton && !isCancelled && (
            <>
              {event.hasUserRSVPd ? (
                <Button variant="secondary" size="sm" disabled className="flex-1">
                  Already RSVP&apos;d
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onRSVP?.(event.id)}
                  disabled={isFull}
                  className="flex-1"
                >
                  {isFull ? 'Event Full' : 'RSVP'}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
