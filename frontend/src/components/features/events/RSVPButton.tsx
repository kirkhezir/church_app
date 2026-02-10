import React from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/api';

interface RSVPButtonProps {
  event: Event;
  onRSVP: (eventId: string) => Promise<void>;
  onCancelRSVP: (eventId: string) => Promise<void>;
  loading?: boolean;
  className?: string;
  redirectTo?: string;
}

export const RSVPButton: React.FC<RSVPButtonProps> = ({
  event,
  onRSVP,
  onCancelRSVP,
  loading = false,
  className = '',
  redirectTo,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isCancelled = !!event.cancelledAt;
  const isFull =
    event.maxCapacity && event.rsvpCount ? event.rsvpCount >= event.maxCapacity : false;
  const hasRSVPd = event.hasUserRSVPd;

  const handleClick = async () => {
    // Redirect to login if not authenticated
    if (!user) {
      const returnPath = redirectTo || `/events/${event.id}`;
      navigate('/login', { state: { from: returnPath } });
      return;
    }

    // Handle RSVP or cancellation
    if (hasRSVPd) {
      await onCancelRSVP(event.id);
    } else {
      await onRSVP(event.id);
    }
  };

  // Don't show button for cancelled events
  if (isCancelled) {
    return null;
  }

  // Show different states based on user and event status
  if (!user) {
    return (
      <Button onClick={handleClick} className={className} size="sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Log In to RSVP
      </Button>
    );
  }

  if (loading) {
    return (
      <Button disabled className={className} size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (hasRSVPd) {
    return (
      <Button onClick={handleClick} variant="outline" className={className} size="sm">
        <UserMinus className="mr-2 h-4 w-4" />
        Cancel RSVP
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button disabled className={className} size="sm">
        Event Full
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} className={className} size="sm">
      <UserPlus className="mr-2 h-4 w-4" />
      RSVP
    </Button>
  );
};

export default RSVPButton;
