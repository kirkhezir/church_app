/**
 * Event Calendar View Component
 *
 * Interactive calendar view for church events with category-based coloring,
 * accessible keyboard navigation, and responsive cell sizing.
 */

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Event, EventCategory } from '@/types/api';

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; dot: string }> = {
  [EventCategory.WORSHIP]: {
    label: 'Worship',
    color: 'bg-blue-500',
    dot: 'bg-blue-500 ring-blue-200 dark:ring-blue-900',
  },
  [EventCategory.BIBLE_STUDY]: {
    label: 'Bible Study',
    color: 'bg-emerald-500',
    dot: 'bg-emerald-500 ring-emerald-200 dark:ring-emerald-900',
  },
  [EventCategory.COMMUNITY]: {
    label: 'Community',
    color: 'bg-purple-500',
    dot: 'bg-purple-500 ring-purple-200 dark:ring-purple-900',
  },
  [EventCategory.FELLOWSHIP]: {
    label: 'Fellowship',
    color: 'bg-amber-500',
    dot: 'bg-amber-500 ring-amber-200 dark:ring-amber-900',
  },
};

function getCategoryColor(category?: EventCategory): string {
  if (category && category in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[category].color;
  }
  return 'bg-primary';
}

interface EventCalendarViewProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
  onCreateEvent?: (date: Date) => void;
}

export function EventCalendarView({
  events,
  onEventClick,
  onDateClick,
  onCreateEvent,
}: EventCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = format(parseISO(event.startDateTime), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = start;

    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const getEventsForDate = (date: Date): Event[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
        <CardTitle className="flex items-center gap-2.5 font-heading text-xl tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarIcon className="h-4 w-4" />
          </span>
          {format(currentMonth, 'MMMM yyyy')}
        </CardTitle>
        <nav className="flex items-center gap-1.5" aria-label="Calendar navigation">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setCurrentMonth(new Date())}
            aria-label="Go to today"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </CardHeader>

      <CardContent>
        {/* Weekday Headers */}
        <div className="mb-1 grid grid-cols-7 gap-1" role="row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              role="columnheader"
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Event calendar">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'group min-h-[60px] rounded-md border p-1 text-left transition-colors hover:bg-muted/50 sm:min-h-[80px] lg:min-h-[100px]',
                      !isCurrentMonth && 'text-muted-foreground opacity-50',
                      isToday && 'border-primary',
                      isSelected && 'bg-muted'
                    )}
                    onClick={() => handleDateClick(day)}
                    aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}${dayEvents.length > 0 ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                    aria-current={isToday ? 'date' : undefined}
                    aria-selected={isSelected || undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm',
                          isToday && 'bg-primary text-primary-foreground shadow-sm',
                          !isToday && dayEvents.length > 0 && 'font-semibold'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {onCreateEvent && isCurrentMonth && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateEvent(day);
                          }}
                          aria-label={`Create event on ${format(day, 'MMMM d')}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Event Indicators */}
                    <div className="mt-1 space-y-0.5 sm:space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          type="button"
                          key={event.id}
                          className={cn(
                            'hidden w-full truncate rounded px-1 py-0.5 text-left text-xs text-white sm:block',
                            getCategoryColor(event.category)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event.id);
                          }}
                        >
                          {event.title}
                        </button>
                      ))}
                      {/* Mobile: show colored dots instead of full titles */}
                      <div className="flex gap-0.5 sm:hidden">
                        {dayEvents.slice(0, 4).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              getCategoryColor(event.category)
                            )}
                          />
                        ))}
                      </div>
                      {dayEvents.length > 2 && (
                        <div className="hidden text-xs text-muted-foreground sm:block">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>

                {/* Popover for Events Detail */}
                {dayEvents.length > 0 && (
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="border-b px-4 py-3">
                      <h4 className="font-heading text-sm font-semibold">
                        {format(day, 'EEEE, MMMM d')}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y p-1">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          className="w-full cursor-pointer rounded-md p-2.5 text-left transition-colors hover:bg-muted"
                          onClick={() => onEventClick(event.id)}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                'h-2.5 w-2.5 shrink-0 rounded-full ring-2',
                                CATEGORY_CONFIG[event.category]?.dot || 'bg-primary'
                              )}
                            />
                            <span className="text-sm font-medium">{event.title}</span>
                          </div>
                          <p className="mt-1 pl-5 text-xs text-muted-foreground">
                            {format(parseISO(event.startDateTime), 'h:mm a')}
                            {event.location && ` · ${event.location}`}
                          </p>
                        </button>
                      ))}
                    </div>
                    {onCreateEvent && (
                      <div className="border-t p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => onCreateEvent(day)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Event
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Legend
          </span>
          {Object.values(CATEGORY_CONFIG).map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs">
              <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
