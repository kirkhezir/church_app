/**
 * Unit Tests for EventCard Component (T121)
 * Tests event display, RSVP button rendering, and user interactions
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/features/events/EventCard';
import { Event, EventCategory } from '@/types/api';

describe('EventCard', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Sunday Worship Service',
    description: 'Join us for our weekly worship service',
    startDateTime: '2025-11-10T10:00:00Z',
    endDateTime: '2025-11-10T12:00:00Z',
    location: 'Main Chapel',
    category: EventCategory.WORSHIP,
    maxCapacity: 100,
    rsvpCount: 50,
    hasUserRSVPd: false,
    cancelledAt: null,
    createdById: 'creator-1',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
  };

  const mockOnViewDetails = jest.fn();
  const mockOnRSVP = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Event Information Display', () => {
    it('should render event title', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      expect(screen.getByText('Sunday Worship Service')).toBeInTheDocument();
    });

    it('should render event category badge', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      expect(screen.getByText('Worship Service')).toBeInTheDocument();
    });

    it('should render event location', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      expect(screen.getByText('Main Chapel')).toBeInTheDocument();
    });

    it('should render event date and time', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      // Check that date is displayed (format: Nov 10, 2025)
      expect(screen.getByText(/Nov 10, 2025/i)).toBeInTheDocument();
    });

    it('should render capacity information when maxCapacity is set', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      // Text is split across elements, use flexible matcher targeting the capacity section
      expect(screen.getByText(/50.*attendees/)).toBeInTheDocument();
      expect(screen.getByText(/100.*attendees/)).toBeInTheDocument();
      expect(screen.getByText(/50 spots left/)).toBeInTheDocument();
    });

    it('should not render capacity when maxCapacity is not set', () => {
      const eventWithoutCapacity = { ...mockEvent, maxCapacity: undefined, rsvpCount: 0 };

      render(
        <EventCard
          event={eventWithoutCapacity}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Category Badge Colors', () => {
    it('should render WORSHIP category with blue badge', () => {
      const { container } = render(
        <EventCard
          event={{ ...mockEvent, category: EventCategory.WORSHIP }}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      const badge = screen.getByText('Worship Service');
      expect(badge).toHaveClass('bg-blue-100');
    });

    it('should render BIBLE_STUDY category with purple badge', () => {
      const { container } = render(
        <EventCard
          event={{ ...mockEvent, category: EventCategory.BIBLE_STUDY }}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      const badge = screen.getByText('Bible Study');
      expect(badge).toHaveClass('bg-purple-100');
    });

    it('should render COMMUNITY category with green badge', () => {
      const { container } = render(
        <EventCard
          event={{ ...mockEvent, category: EventCategory.COMMUNITY }}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      const badge = screen.getByText('Community');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('should render FELLOWSHIP category with orange badge', () => {
      const { container } = render(
        <EventCard
          event={{ ...mockEvent, category: EventCategory.FELLOWSHIP }}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      const badge = screen.getByText('Fellowship');
      expect(badge).toHaveClass('bg-orange-100');
    });
  });

  describe('RSVP Button', () => {
    it('should show RSVP button when showRSVPButton is true', () => {
      render(
        <EventCard
          event={mockEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={true}
        />
      );

      expect(screen.getByText('RSVP')).toBeInTheDocument();
    });

    it('should not show RSVP button when showRSVPButton is false', () => {
      render(
        <EventCard
          event={mockEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={false}
        />
      );

      expect(screen.queryByText('RSVP')).not.toBeInTheDocument();
    });

    it('should call onRSVP when RSVP button is clicked', () => {
      render(
        <EventCard
          event={mockEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={true}
        />
      );

      const rsvpButton = screen.getByText('RSVP');
      fireEvent.click(rsvpButton);

      expect(mockOnRSVP).toHaveBeenCalledTimes(1);
      expect(mockOnRSVP).toHaveBeenCalledWith(mockEvent.id);
    });

    it('should show "Already RSVP\'d" when user has RSVPd', () => {
      const rsvpdEvent = { ...mockEvent, hasUserRSVPd: true };

      render(
        <EventCard
          event={rsvpdEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={true}
        />
      );

      expect(screen.getByText("Already RSVP'd")).toBeInTheDocument();
    });

    it('should show "Event Full" when event is at capacity', () => {
      const fullEvent = { ...mockEvent, rsvpCount: 100, maxCapacity: 100 };

      render(
        <EventCard
          event={fullEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={true}
        />
      );

      expect(screen.getByText('Event Full')).toBeInTheDocument();
    });

    it('should disable RSVP button when event is at capacity and user has not RSVPd', () => {
      const fullEvent = { ...mockEvent, rsvpCount: 100, maxCapacity: 100, hasUserRSVPd: false };

      render(
        <EventCard
          event={fullEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={true}
        />
      );

      const rsvpButton = screen.getByText('Event Full');
      expect(rsvpButton).toBeDisabled();
    });
  });

  describe('Cancelled Events', () => {
    it('should show cancelled indicator for cancelled events', () => {
      const cancelledEvent = { ...mockEvent, cancelledAt: '2025-11-05T00:00:00Z' };

      render(
        <EventCard event={cancelledEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />
      );

      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should apply opacity style to cancelled events', () => {
      const cancelledEvent = { ...mockEvent, cancelledAt: '2025-11-05T00:00:00Z' };

      const { container } = render(
        <EventCard event={cancelledEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('opacity-60');
    });

    it('should not show RSVP button for cancelled events', () => {
      const cancelledEvent = { ...mockEvent, cancelledAt: '2025-11-05T00:00:00Z' };

      render(
        <EventCard
          event={cancelledEvent}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
          showRSVPButton={true}
        />
      );

      expect(screen.queryByText('RSVP')).not.toBeInTheDocument();
    });
  });

  describe('View Details Button', () => {
    it('should render "View Details" button', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('should call onViewDetails when "View Details" button is clicked', () => {
      render(<EventCard event={mockEvent} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />);

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockEvent.id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle event with no rsvpCount', () => {
      const eventWithoutRsvpCount = { ...mockEvent, rsvpCount: undefined };

      render(
        <EventCard
          event={eventWithoutRsvpCount}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      // Text is split across elements, use flexible matcher targeting the capacity section
      expect(screen.getByText(/0.*attendees/)).toBeInTheDocument();
      expect(screen.getByText(/100.*attendees/)).toBeInTheDocument();
    });

    it('should handle event with long title', () => {
      const eventWithLongTitle = {
        ...mockEvent,
        title:
          'This is a very long event title that should be displayed properly without breaking the layout',
      };

      render(
        <EventCard
          event={eventWithLongTitle}
          onViewDetails={mockOnViewDetails}
          onRSVP={mockOnRSVP}
        />
      );

      expect(
        screen.getByText(
          'This is a very long event title that should be displayed properly without breaking the layout'
        )
      ).toBeInTheDocument();
    });

    it('should handle event with creator information', () => {
      const eventWithCreator = {
        ...mockEvent,
        creator: {
          id: 'creator-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      };

      render(
        <EventCard event={eventWithCreator} onViewDetails={mockOnViewDetails} onRSVP={mockOnRSVP} />
      );

      // Creator info may not be shown in card view, just ensure component renders
      expect(screen.getByText('Sunday Worship Service')).toBeInTheDocument();
    });
  });
});
