import prisma from '../prismaClient';
import { ISessionRepository } from '../../../domain/interfaces/ISessionRepository';

/**
 * Session Repository Implementation
 * Manages user_sessions table via Prisma
 */
export class SessionRepository implements ISessionRepository {
  /**
   * Create a new session record when a user logs in
   */
  async create(data: {
    id: string;
    memberId: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<void> {
    await prisma.user_sessions.create({
      data: {
        id: data.id,
        memberId: data.memberId,
        sessionStart: new Date(),
        userAgent: data.userAgent || null,
        ipAddress: data.ipAddress || null,
      },
    });
  }

  /**
   * End the most recent active session for a member
   * Sets sessionEnd to now and calculates duration in seconds
   */
  async endSession(memberId: string): Promise<void> {
    const activeSession = await prisma.user_sessions.findFirst({
      where: {
        memberId,
        sessionEnd: null,
      },
      orderBy: { sessionStart: 'desc' },
    });

    if (activeSession) {
      const now = new Date();
      const durationSeconds = Math.round(
        (now.getTime() - activeSession.sessionStart.getTime()) / 1000
      );

      await prisma.user_sessions.update({
        where: { id: activeSession.id },
        data: {
          sessionEnd: now,
          duration: durationSeconds,
        },
      });
    }
  }

  /**
   * End all active sessions for a member (e.g., on forced logout)
   */
  async endAllSessions(memberId: string): Promise<void> {
    const now = new Date();

    const activeSessions = await prisma.user_sessions.findMany({
      where: {
        memberId,
        sessionEnd: null,
      },
    });

    for (const session of activeSessions) {
      const durationSeconds = Math.round((now.getTime() - session.sessionStart.getTime()) / 1000);

      await prisma.user_sessions.update({
        where: { id: session.id },
        data: {
          sessionEnd: now,
          duration: durationSeconds,
        },
      });
    }
  }

  /**
   * Get average session duration in minutes for completed sessions
   * within the last N days
   */
  async getAverageSessionDuration(days: number): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await prisma.user_sessions.aggregate({
      where: {
        sessionEnd: { not: null },
        duration: { not: null },
        sessionStart: { gte: since },
      },
      _avg: {
        duration: true,
      },
    });

    // Convert seconds to minutes, default to 0
    const avgSeconds = result._avg.duration || 0;
    return Math.round(avgSeconds / 60);
  }

  /**
   * Get count of currently active sessions (no sessionEnd)
   */
  async getActiveSessionCount(): Promise<number> {
    return prisma.user_sessions.count({
      where: {
        sessionEnd: null,
      },
    });
  }
}
