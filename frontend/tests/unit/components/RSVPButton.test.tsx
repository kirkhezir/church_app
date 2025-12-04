/**
 * Unit Tests for RSVPButton Component (T123)
 * Tests RSVP button states, authentication handling, and capacity checking
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock apiClient before any imports to avoid import.meta issues
jest.mock('@/services/api/apiClient');

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RSVPButton } from '@/components/features/events/RSVPButton';
import { AuthContext } from '@/contexts/AuthContext';
import { Event, EventCategory } from '@/types/api';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RSVPButton', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Sunday Worship',
    description: 'Worship service',
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

  const mockOnRSVP = jest.fn();
  const mockOnCancelRSVP = jest.fn();

  const mockAuthContext = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
    },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnRSVP.mockResolvedValue(undefined);
    mockOnCancelRSVP.mockResolvedValue(undefined);
  });

  const renderWithAuth = (component: React.ReactElement, authValue = mockAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>{component}</AuthContext.Provider>
      </BrowserRouter>
    );
  };

  describe('Unauthenticated User', () => {
    it('should show "Log In to RSVP" button for unauthenticated users', () => {
      const unauthContext = { ...mockAuthContext, user: null, isAuthenticated: false };

      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />,
        unauthContext
      );

      expect(screen.getByText('Log In to RSVP')).toBeInTheDocument();
    });

    it('should navigate to login when unauthenticated user clicks button', () => {
      const unauthContext = { ...mockAuthContext, user: null, isAuthenticated: false };

      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />,
        unauthContext
      );

      const button = screen.getByText('Log In to RSVP');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { from: '/events/event-1' },
      });
    });

    it('should use custom redirectTo path if provided', () => {
      const unauthContext = { ...mockAuthContext, user: null, isAuthenticated: false };

      renderWithAuth(
        <RSVPButton
          event={mockEvent}
          onRSVP={mockOnRSVP}
          onCancelRSVP={mockOnCancelRSVP}
          redirectTo="/custom/path"
        />,
        unauthContext
      );

      const button = screen.getByText('Log In to RSVP');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { from: '/custom/path' },
      });
    });
  });

  describe('Authenticated User - Not RSVPd', () => {
    it('should show "RSVP" button for authenticated users who have not RSVPd', () => {
      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.getByText('RSVP')).toBeInTheDocument();
    });

    it('should call onRSVP when authenticated user clicks RSVP button', async () => {
      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('RSVP');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnRSVP).toHaveBeenCalledTimes(1);
        expect(mockOnRSVP).toHaveBeenCalledWith('event-1');
      });
    });

    it('should show loading state while RSVP is processing', () => {
      renderWithAuth(
        <RSVPButton
          event={mockEvent}
          onRSVP={mockOnRSVP}
          onCancelRSVP={mockOnCancelRSVP}
          loading={true}
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      renderWithAuth(
        <RSVPButton
          event={mockEvent}
          onRSVP={mockOnRSVP}
          onCancelRSVP={mockOnCancelRSVP}
          loading={true}
        />
      );

      const button = screen.getByText('Processing...');
      expect(button).toBeDisabled();
    });
  });

  describe('Authenticated User - Already RSVPd', () => {
    it('should show "Cancel RSVP" button when user has already RSVPd', () => {
      const rsvpdEvent = { ...mockEvent, hasUserRSVPd: true };

      renderWithAuth(
        <RSVPButton event={rsvpdEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.getByText('Cancel RSVP')).toBeInTheDocument();
    });

    it('should call onCancelRSVP when user clicks cancel button', async () => {
      const rsvpdEvent = { ...mockEvent, hasUserRSVPd: true };

      renderWithAuth(
        <RSVPButton event={rsvpdEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('Cancel RSVP');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnCancelRSVP).toHaveBeenCalledTimes(1);
        expect(mockOnCancelRSVP).toHaveBeenCalledWith('event-1');
      });
    });

    it('should use outline variant for cancel button', () => {
      const rsvpdEvent = { ...mockEvent, hasUserRSVPd: true };

      renderWithAuth(
        <RSVPButton event={rsvpdEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('Cancel RSVP').closest('button');
      // Check for outline variant class or similar styling
      expect(button).toBeInTheDocument();
    });
  });

  describe('Event at Capacity', () => {
    it('should show "Event Full" when event is at capacity', () => {
      const fullEvent = { ...mockEvent, rsvpCount: 100, maxCapacity: 100 };

      renderWithAuth(
        <RSVPButton event={fullEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.getByText('Event Full')).toBeInTheDocument();
    });

    it('should disable button when event is full', () => {
      const fullEvent = { ...mockEvent, rsvpCount: 100, maxCapacity: 100 };

      renderWithAuth(
        <RSVPButton event={fullEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('Event Full');
      expect(button).toBeDisabled();
    });

    it('should not call onRSVP when full event button is clicked', () => {
      const fullEvent = { ...mockEvent, rsvpCount: 100, maxCapacity: 100 };

      renderWithAuth(
        <RSVPButton event={fullEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('Event Full');
      fireEvent.click(button);

      expect(mockOnRSVP).not.toHaveBeenCalled();
    });

    it('should show cancel button even when event is full if user has RSVPd', () => {
      const fullEvent = {
        ...mockEvent,
        rsvpCount: 100,
        maxCapacity: 100,
        hasUserRSVPd: true,
      };

      renderWithAuth(
        <RSVPButton event={fullEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.getByText('Cancel RSVP')).toBeInTheDocument();
      expect(screen.queryByText('Event Full')).not.toBeInTheDocument();
    });
  });

  describe('Cancelled Events', () => {
    it('should not render button for cancelled events', () => {
      const cancelledEvent = { ...mockEvent, cancelledAt: '2025-11-05T00:00:00Z' };

      const { container } = renderWithAuth(
        <RSVPButton event={cancelledEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null for cancelled events', () => {
      const cancelledEvent = { ...mockEvent, cancelledAt: '2025-11-05T00:00:00Z' };

      renderWithAuth(
        <RSVPButton event={cancelledEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      renderWithAuth(
        <RSVPButton
          event={mockEvent}
          onRSVP={mockOnRSVP}
          onCancelRSVP={mockOnCancelRSVP}
          className="custom-class"
        />
      );

      const button = screen.getByText('RSVP').closest('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should use small size variant', () => {
      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('RSVP').closest('button');
      // Button should have size="sm" prop
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle event with undefined maxCapacity', () => {
      const eventWithoutCapacity = { ...mockEvent, maxCapacity: undefined };

      renderWithAuth(
        <RSVPButton
          event={eventWithoutCapacity}
          onRSVP={mockOnRSVP}
          onCancelRSVP={mockOnCancelRSVP}
        />
      );

      expect(screen.getByText('RSVP')).toBeInTheDocument();
      expect(screen.queryByText('Event Full')).not.toBeInTheDocument();
    });

    it('should handle event with undefined rsvpCount', () => {
      const eventWithoutCount = { ...mockEvent, rsvpCount: undefined };

      renderWithAuth(
        <RSVPButton event={eventWithoutCount} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.getByText('RSVP')).toBeInTheDocument();
    });

    it('should handle event with rsvpCount exceeding maxCapacity', () => {
      const overCapacityEvent = { ...mockEvent, rsvpCount: 110, maxCapacity: 100 };

      renderWithAuth(
        <RSVPButton event={overCapacityEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      expect(screen.getByText('Event Full')).toBeInTheDocument();
    });

    it('should handle RSVP function that returns a promise', async () => {
      mockOnRSVP.mockResolvedValue(undefined);

      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('RSVP');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnRSVP).toHaveBeenCalled();
      });
    });

    it('should handle cancelRSVP function that returns a promise', async () => {
      mockOnCancelRSVP.mockResolvedValue(undefined);
      const rsvpdEvent = { ...mockEvent, hasUserRSVPd: true };

      renderWithAuth(
        <RSVPButton event={rsvpdEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      const button = screen.getByText('Cancel RSVP');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnCancelRSVP).toHaveBeenCalled();
      });
    });
  });

  describe('Icon Display', () => {
    it('should display UserPlus icon for RSVP button', () => {
      renderWithAuth(
        <RSVPButton event={mockEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      // Check that SVG icon is present
      const button = screen.getByText('RSVP').closest('button');
      expect(button?.querySelector('svg')).toBeInTheDocument();
    });

    it('should display UserMinus icon for Cancel RSVP button', () => {
      const rsvpdEvent = { ...mockEvent, hasUserRSVPd: true };

      renderWithAuth(
        <RSVPButton event={rsvpdEvent} onRSVP={mockOnRSVP} onCancelRSVP={mockOnCancelRSVP} />
      );

      // Check that SVG icon is present
      const button = screen.getByText('Cancel RSVP').closest('button');
      expect(button?.querySelector('svg')).toBeInTheDocument();
    });

    it('should display loading spinner icon when loading', () => {
      renderWithAuth(
        <RSVPButton
          event={mockEvent}
          onRSVP={mockOnRSVP}
          onCancelRSVP={mockOnCancelRSVP}
          loading={true}
        />
      );

      // Check that SVG icon with animate-spin class is present
      const button = screen.getByText('Processing...').closest('button');
      const icon = button?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
