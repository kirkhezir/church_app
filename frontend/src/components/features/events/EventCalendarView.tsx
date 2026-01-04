/**
 * Event Calendar View Component
 *
 * Interactive calendar view for church events
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
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { cn } from '../../../lib/utils';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type?: string;
}

interface EventCalendarViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
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
      const dateKey = format(parseISO(event.startDate), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
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

  const getEventTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'worship':
        return 'bg-blue-500';
      case 'meeting':
        return 'bg-green-500';
      case 'social':
        return 'bg-purple-500';
      case 'outreach':
        return 'bg-orange-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(currentMonth, 'MMMM yyyy')}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Weekday Headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
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
                      'min-h-[100px] rounded-md border p-1 text-left transition-colors hover:bg-muted/50',
                      !isCurrentMonth && 'text-muted-foreground opacity-50',
                      isToday && 'border-primary',
                      isSelected && 'bg-muted'
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                          isToday && 'bg-primary text-primary-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {onCreateEvent && isCurrentMonth && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateEvent(day);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Event Indicators */}
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'truncate rounded px-1 py-0.5 text-xs text-white',
                            getEventTypeColor(event.type)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>

                {/* Popover for Events Detail */}
                {dayEvents.length > 0 && (
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{format(day, 'EEEE, MMMM d')}</h4>
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="cursor-pointer rounded-md border p-2 transition-colors hover:bg-muted"
                            onClick={() => onEventClick(event)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'h-2 w-2 rounded-full',
                                  getEventTypeColor(event.type)
                                )}
                              />
                              <span className="font-medium">{event.title}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {format(parseISO(event.startDate), 'h:mm a')}
                              {event.location && ` • ${event.location}`}
                            </p>
                          </div>
                        ))}
                      </div>
                      {onCreateEvent && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => onCreateEvent(day)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Event
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Worship</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Meeting</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span>Social</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span>Outreach</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
