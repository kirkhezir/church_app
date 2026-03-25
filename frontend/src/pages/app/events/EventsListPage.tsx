/**
 * EventsListPage Component
 *
 * Displays list of all events with filtering, sorting, pagination and calendar view.
 * Conditionally uses SidebarLayout for authenticated users.
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  CalendarIcon,
  PlusIcon,
  List,
  LayoutGrid,
  SlidersHorizontal,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { useEvents, useEventRSVP } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { SidebarLayout } from '@/components/layout';
import { EventCard } from '@/components/features/events/EventCard';
import { EventFilters } from '@/components/features/events/EventFilters';
import { reportError } from '@/lib/errorReporting';
import { gooeyToast } from 'goey-toast';
import { EventCalendarView } from '@/components/features/events/EventCalendarView';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventCategory, Event } from '@/types/api';

const EVENTS_PER_PAGE = 6;

type SortOption = 'date-asc' | 'date-desc' | 'title-asc';

function sortEvents(events: Event[], sortBy: SortOption): Event[] {
  return [...events].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      case 'date-desc':
        return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}

function getPaginationRange(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (currentPage > 3) pages.push('ellipsis');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export function EventsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort & pagination state
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch events with filters
  const { events, loading, error, refetch } = useEvents({
    category: selectedCategory,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // RSVP handling
  const { rsvpToEvent, rsvpError } = useEventRSVP(() => {
    refetch(); // Refresh events after RSVP
  });

  // Sort and paginate events
  const sortedEvents = useMemo(() => sortEvents(events, sortBy), [events, sortBy]);
  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / EVENTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvents = useMemo(
    () => sortedEvents.slice((safePage - 1) * EVENTS_PER_PAGE, safePage * EVENTS_PER_PAGE),
    [sortedEvents, safePage]
  );
  const paginationRange = useMemo(
    () => getPaginationRange(safePage, totalPages),
    [safePage, totalPages]
  );

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat?: EventCategory) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    setCurrentPage(1);
  };

  const handleViewDetails = useCallback(
    (eventId: string) => {
      navigate(`/app/events/${eventId}`);
    },
    [navigate]
  );

  const handleRSVP = useCallback(
    async (eventId: string) => {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: `/app/events/${eventId}` } });
        return;
      }

      try {
        await rsvpToEvent(eventId);
        gooeyToast.success('RSVP confirmed!', {
          description: 'You have been registered for this event.',
        });
        // Show success message or navigate to event details
        navigate(`/app/events/${eventId}`);
      } catch (err) {
        // Error is already handled by the hook
        gooeyToast.error('RSVP failed', {
          description: 'Could not register for this event. Please try again.',
        });
        reportError('RSVP failed', err);
      }
    },
    [user, navigate, rsvpToEvent]
  );

  const handleCreateEvent = useCallback(() => {
    navigate('/app/events/create');
  }, [navigate]);

  const canCreateEvents = user && (user.role === 'ADMIN' || user.role === 'STAFF');
  const activeFilterCount = [selectedCategory, startDate, endDate].filter(Boolean).length;

  // Event list content — always rendered inside SidebarLayout (behind PrivateRoute)
  const eventListContent = (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="mb-8 rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 font-heading text-3xl font-bold tracking-tight text-foreground">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="h-5 w-5" />
              </span>
              Church Events
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse upcoming events and activities at our church
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
              <TabsList className="h-9">
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-1.5 text-xs"
                  aria-label="Switch to list view"
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-1.5 text-xs"
                  aria-label="Switch to calendar view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {canCreateEvents && (
              <Button onClick={handleCreateEvent} size="sm" className="flex items-center gap-1.5">
                <PlusIcon className="h-4 w-4" />
                Create Event
              </Button>
            )}

            {viewMode === 'list' && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 lg:hidden"
                onClick={() => setShowFilters(true)}
                aria-label={
                  activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : 'Open filters'
                }
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 rounded-full px-1.5 py-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {(error || rsvpError) && (
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertDescription>{error || rsvpError}</AlertDescription>
        </Alert>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <EventCalendarView
          events={events}
          onEventClick={(eventId) => navigate(`/app/events/${eventId}`)}
          onDateClick={(date) => {
            setStartDate(date.toISOString().split('T')[0]);
            setViewMode('list');
          }}
        />
      ) : (
        /* List View */
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar — desktop only */}
          <div className="hidden lg:col-span-1 lg:block">
            <EventFilters
              selectedCategory={selectedCategory}
              startDate={startDate}
              endDate={endDate}
              onCategoryChange={handleCategoryChange}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Events List */}
          <div className="flex-1 lg:col-span-3">
            {loading ? (
              // Card-shaped skeleton loaders
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="overflow-hidden rounded-xl border bg-card">
                    <Skeleton className="h-1 w-full" />
                    <div className="space-y-4 p-5">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="space-y-2 rounded-lg bg-muted/30 p-3">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 flex-1 rounded-md" />
                        <Skeleton className="h-8 flex-1 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              // Empty state with better visual
              <div className="flex flex-col items-center rounded-xl border border-dashed bg-muted/20 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CalendarIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-1 font-heading text-lg font-semibold">No events found</h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  {selectedCategory || startDate || endDate
                    ? 'Try adjusting your filters to see more events'
                    : 'There are no upcoming events at this time. Check back soon!'}
                </p>
                {(selectedCategory || startDate || endDate) && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              // Events grid with sort + pagination
              <div className="flex flex-col">
                {/* Toolbar: count + sort */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold tabular-nums text-foreground">
                      {sortedEvents.length}
                    </span>{' '}
                    {sortedEvents.length === 1 ? 'event' : 'events'}
                  </p>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-8 w-[170px] border-dashed text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="date-asc">Date (oldest first)</SelectItem>
                      <SelectItem value="date-desc">Date (newest first)</SelectItem>
                      <SelectItem value="title-asc">Title A\u2013Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Event cards grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                    >
                      <EventCard
                        event={event}
                        onViewDetails={handleViewDetails}
                        onRSVP={handleRSVP}
                        showRSVPButton={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Events pagination"
                    className="mt-8 flex items-center justify-center gap-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="h-9 gap-1.5 rounded-lg px-3"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {paginationRange.map((page, i) =>
                        page === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                            aria-hidden
                          >
                            \u2026
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            aria-current={page === safePage ? 'page' : undefined}
                            className={cn(
                              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              page === safePage
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="h-9 gap-1.5 rounded-lg px-3"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Events</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <EventFilters
              selectedCategory={selectedCategory}
              startDate={startDate}
              endDate={endDate}
              onCategoryChange={(cat) => {
                handleCategoryChange(cat);
                setShowFilters(false);
              }}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onClear={() => {
                handleClearFilters();
                setShowFilters(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  // Always wrap with SidebarLayout — this page is always behind PrivateRoute at /app/events
  return <SidebarLayout breadcrumbs={[{ label: 'Events' }]}>{eventListContent}</SidebarLayout>;
}
