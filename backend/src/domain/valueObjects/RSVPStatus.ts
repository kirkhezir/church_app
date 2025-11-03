/**
 * RSVP status for event attendance
 */
export enum RSVPStatus {
  CONFIRMED = 'CONFIRMED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Check if RSVP is active (not cancelled)
 */
export function isActiveRSVP(status: RSVPStatus): boolean {
  return status !== RSVPStatus.CANCELLED;
}
