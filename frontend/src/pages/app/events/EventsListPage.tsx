/**
 * EventsListPage Component
 *
 * Displays list of all events with filtering options and calendar view
 * Conditionally uses SidebarLayout for authenticated users
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarIcon, PlusIcon, List, LayoutGrid } from 'lucide-react';
import { useEvents, useEventRSVP } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { SidebarLayout } from '@/components/layout';
import { EventCard } from '@/components/features/events/EventCard';
import { EventFilters } from '@/components/features/events/EventFilters';
import { EventCalendarView } from '@/components/features/events/EventCalendarView';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCategory } from '@/types/api';

export function EventsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  const handleViewDetails = (eventId: string) => {
    navigate(`/app/events/${eventId}`);
  };

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/app/events/${eventId}` } });
      return;
    }

    try {
      await rsvpToEvent(eventId);
      // Show success message or navigate to event details
      navigate(`/app/events/${eventId}`);
    } catch (err) {
      // Error is already handled by the hook
      console.error('RSVP failed:', err);
    }
  };

  const handleCreateEvent = () => {
    navigate('/app/events/create');
  };

  const canCreateEvents = user && (user.role === 'ADMIN' || user.role === 'STAFF');

  // Event list content — always rendered inside SidebarLayout (behind PrivateRoute)
  const eventListContent = (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <CalendarIcon className="h-8 w-8" />
            Church Events
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse upcoming events and activities at our church
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Error Alert */}
      {(error || rsvpError) && (
        <Alert variant="destructive" className="mb-6">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-3">
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
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewDetails={handleViewDetails}
                      onRSVP={handleRSVP}
                      showRSVPButton={true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Always wrap with SidebarLayout — this page is always behind PrivateRoute at /app/events
  return <SidebarLayout breadcrumbs={[{ label: 'Events' }]}>{eventListContent}</SidebarLayout>;
}
