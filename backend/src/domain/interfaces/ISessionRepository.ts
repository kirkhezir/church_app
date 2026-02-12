/**
 * Session Repository Interface
 * Defines methods for managing user sessions
 */
export interface ISessionRepository {
  /**
   * Create a new session record
   */
  create(data: {
    id: string;
    memberId: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void>;

  /**
   * End a session (set sessionEnd and calculate duration)
   */
  endSession(memberId: string): Promise<void>;

  /**
   * End all active sessions for a member
   */
  endAllSessions(memberId: string): Promise<void>;

  /**
   * Get average session duration in minutes for the last N days
   */
  getAverageSessionDuration(days: number): Promise<number>;

  /**
   * Get active session count
   */
  getActiveSessionCount(): Promise<number>;
}
