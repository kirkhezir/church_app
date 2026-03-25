/**
 * EventCard Component
 *
 * Displays event information in a card format with category-colored accent,
 * hover animations, and optional image thumbnail.
 */

import { memo } from 'react';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { Event, EventCategory } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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

const categoryConfig: Record<
  EventCategory,
  { badge: 'default' | 'success' | 'secondary' | 'warning'; accent: string; bg: string }
> = {
  WORSHIP: {
    badge: 'default',
    accent: 'bg-blue-600 dark:bg-blue-500',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
  BIBLE_STUDY: {
    badge: 'success',
    accent: 'bg-emerald-600 dark:bg-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  COMMUNITY: {
    badge: 'secondary',
    accent: 'bg-purple-600 dark:bg-purple-500',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
  },
  FELLOWSHIP: {
    badge: 'warning',
    accent: 'bg-amber-500 dark:bg-amber-400',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
};

export const EventCard = memo(function EventCard({
  event,
  onViewDetails,
  onRSVP,
  showRSVPButton = false,
}: EventCardProps) {
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  const isCancelled = !!event.cancelledAt;
  const config = categoryConfig[event.category];

  const formatTime = (date: Date) => format(date, 'h:mm a');
  const formatDate = (date: Date) => format(date, 'EEE, MMM d');

  const availableSpots =
    event.maxCapacity && event.rsvpCount !== undefined
      ? event.maxCapacity - event.rsvpCount
      : undefined;

  const isFull = availableSpots !== undefined && availableSpots <= 0;

  return (
    <article className="h-full">
      <Card
        className={cn(
          'group relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isCancelled ? 'opacity-60 grayscale' : 'cursor-pointer'
        )}
        data-testid="event-card"
        tabIndex={0}
        role="link"
        onClick={() => onViewDetails?.(event.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetails?.(event.id);
          }
        }}
      >
        {/* Category accent bar */}
        <div className={cn('h-1 w-full', config.accent)} />

        {/* Optional image banner */}
        {event.imageUrl && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={event.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <CardContent className="flex flex-1 flex-col p-5">
          {/* Badge row */}
          <div className="mb-3 flex items-center gap-2">
            <Badge variant={config.badge} className="rounded-full text-xs">
              {categoryLabels[event.category]}
            </Badge>
            {isCancelled && (
              <Badge variant="destructive" className="rounded-full text-xs">
                Cancelled
              </Badge>
            )}
            {isFull && !isCancelled && (
              <Badge variant="warning" className="rounded-full text-xs">
                Full
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-heading text-lg font-semibold leading-tight tracking-tight group-hover:text-primary">
            {event.title}
          </h3>

          {/* Description — always reserve space for consistent height */}
          <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {event.description || '\u00A0'}
          </p>

          {/* Meta info */}
          <div className={cn('space-y-2 rounded-lg p-3', config.bg)}>
            <div className="flex items-center gap-2.5 text-sm">
              <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <time dateTime={startDate.toISOString().split('T')[0]} className="font-medium">
                {formatDate(startDate)}
              </time>
            </div>

            <div className="flex items-center gap-2.5 text-sm">
              <ClockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                <time dateTime={startDate.toISOString()}>{formatTime(startDate)}</time>
                {' \u2013 '}
                <time dateTime={endDate.toISOString()}>{formatTime(endDate)}</time>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-sm">
              <MapPinIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-muted-foreground">{event.location}</span>
            </div>
          </div>

          {/* Flexible spacer — pushes capacity + actions to the bottom */}
          <div className="flex-1" />

          {/* Capacity bar */}
          {event.maxCapacity && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {event.rsvpCount || 0} / {event.maxCapacity}
                </span>
                {availableSpots !== undefined && availableSpots > 0 && (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {availableSpots} spots left
                  </span>
                )}
              </div>
              <Progress
                value={Math.min(((event.rsvpCount || 0) / event.maxCapacity) * 100, 100)}
                className="h-1.5"
              />
            </div>
          )}

          {/* Organizer */}
          {event.creator && (
            <p className="mt-3 text-xs text-muted-foreground">
              By {event.creator.firstName} {event.creator.lastName}
            </p>
          )}

          {/* Actions — anchored to bottom */}
          <div className="mt-4 flex gap-2 border-t border-border/40 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(event.id);
              }}
              className="flex-1"
            >
              View Details
            </Button>

            {showRSVPButton && !isCancelled && (
              <>
                {event.hasUserRSVPd ? (
                  <Button
                    variant="success"
                    size="sm"
                    disabled
                    className="flex-1"
                    aria-label="You are registered for this event"
                  >
                    Going ✓
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={isFull ? 'secondary' : 'warning'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRSVP?.(event.id);
                    }}
                    disabled={isFull}
                    className="flex-1"
                    aria-label={isFull ? 'Event is at full capacity' : 'RSVP for this event'}
                  >
                    {isFull ? 'Event Full' : 'RSVP'}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
});
