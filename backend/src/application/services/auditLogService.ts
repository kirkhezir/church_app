import prisma from '../../infrastructure/database/prismaClient';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Enum for audit log actions
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Audit Log Service
 * Records admin actions for compliance and security auditing
 */
export class AuditLogService {
  /**
   * Log an action to the audit log
   */

  async logAction(data: {
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          changes: (data.changes as never) || {},
          ipAddress: data.ipAddress || '',
          userAgent: data.userAgent || '',
        },
      });

      logger.info('Audit log created', {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to create audit log', error);
      // Don't throw - audit logging failure should not break the application
    }
  }

  /**
   * Log a CREATE action
   */
  async logCreate(data: {
    entityType: string;
    entityId: string;
    userId: string;
    entity: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.logAction({
      action: AuditAction.CREATE,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      changes: { created: data.entity },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Log an UPDATE action with before/after changes
   */
  async logUpdate(data: {
    entityType: string;
    entityId: string;
    userId: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Calculate the diff
    const changes = this.calculateDiff(data.before, data.after);

    await this.logAction({
      action: AuditAction.UPDATE,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      changes,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Log a DELETE action
   */
  async logDelete(data: {
    entityType: string;
    entityId: string;
    userId: string;
    entity: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.logAction({
      action: AuditAction.DELETE,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      changes: { deleted: data.entity },
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getLogsForEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getLogsByUser(userId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get recent audit logs with filtering
   */
  async getRecentLogs(options: {
    action?: AuditAction;
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    const { action, entityType, limit = 50, offset = 0 } = options;

    return prisma.auditLog.findMany({
      where: {
        ...(action && { action }),
        ...(entityType && { entityType }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip: offset,
      take: limit,
    });
  }

  /**
   * Calculate the diff between two objects
   * Returns only changed fields with before/after values
   */
  private calculateDiff(
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Record<string, { before: unknown; after: unknown }> {
    const diff: Record<string, { before: unknown; after: unknown }> = {};

    // Check all keys in 'after' object
    for (const key in after) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diff[key] = {
          before: before[key],
          after: after[key],
        };
      }
    }

    // Check for deleted keys (present in before but not in after)
    for (const key in before) {
      if (!(key in after)) {
        diff[key] = {
          before: before[key],
          after: undefined,
        };
      }
    }

    return diff;
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
