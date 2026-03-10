/**
 * EventsListPage Component
 *
 * Displays list of all events with filtering options and calendar view
 * Conditionally uses SidebarLayout for authenticated users
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { CalendarIcon, PlusIcon, List, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { useEvents, useEventRSVP } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { SidebarLayout } from '@/components/layout';
import { EventCard } from '@/components/features/events/EventCard';
import { EventFilters } from '@/components/features/events/EventFilters';
import { reportError } from '@/lib/errorReporting';
import { gooeyToast } from 'goey-toast';
import { EventCalendarView } from '@/components/features/events/EventCalendarView';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EventCategory } from '@/types/api';

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

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setStartDate('');
    setEndDate('');
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

  // Event list content — always rendered inside SidebarLayout (behind PrivateRoute)
  const eventListContent = (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-balance text-3xl font-bold">
            <CalendarIcon className="h-8 w-8" />
            Church Events
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse upcoming events and activities at our church
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger
                value="list"
                className="flex items-center gap-2"
                aria-label="Switch to list view"
              >
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2"
                aria-label="Switch to calendar view"
              >
                <LayoutGrid className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {canCreateEvents && (
            <Button onClick={handleCreateEvent} className="flex items-center gap-2">
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
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          )}
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
          events={events.map((e) => ({
            id: e.id,
            title: e.title,
            startDate: e.startDateTime,
            endDate: e.endDateTime,
            category: e.category,
            location: e.location,
          }))}
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
              onCategoryChange={setSelectedCategory}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={handleClearFilters}
            />
          </div>

          {/* Events List */}
          <div className="flex-1 lg:col-span-3">
            {loading ? (
              // Loading skeletons
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              // Empty state
              <div className="py-12 text-center">
                <CalendarIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No events found</h3>
                <p className="mb-4 text-muted-foreground">
                  {selectedCategory || startDate || endDate
                    ? 'Try adjusting your filters to see more events'
                    : 'There are no upcoming events at this time'}
                </p>
                {(selectedCategory || startDate || endDate) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              // Events grid
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {events.length} {events.length === 1 ? 'event' : 'events'}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {events.map((event, index) => (
                    <div
                      key={event.id}
                      className={`animate-fade-in-up ${index < 10 ? `stagger-${index + 1}` : ''}`}
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
              </>
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
                setSelectedCategory(cat);
                setShowFilters(false);
              }}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
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
