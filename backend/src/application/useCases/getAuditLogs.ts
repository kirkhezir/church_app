/**
 * Get Audit Logs Use Case
 *
 * Retrieves audit logs with filtering:
 * - Filter by action (CREATE, UPDATE, DELETE)
 * - Filter by entity type (MEMBER, EVENT, ANNOUNCEMENT, etc.)
 * - Filter by date range
 * - Pagination support
 *
 * T315: Create GetAuditLogs use case
 */

export interface GetAuditLogsRequest {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface GetAuditLogsResponse {
  data: AuditLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAuditLogRepository {
  findMany(options: {
    where?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
  }): Promise<any[]>;
  count(options: { where?: any }): Promise<number>;
}

export class GetAuditLogs {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  async execute(request: GetAuditLogsRequest): Promise<GetAuditLogsResponse> {
    const page = request.page || 1;
    const limit = Math.min(request.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (request.action) {
      where.action = request.action;
    }

    if (request.entityType) {
      where.entityType = request.entityType;
    }

    if (request.userId) {
      where.userId = request.userId;
    }

    if (request.startDate || request.endDate) {
      where.timestamp = {};
      if (request.startDate) {
        where.timestamp.gte = request.startDate;
      }
      if (request.endDate) {
        where.timestamp.lte = request.endDate;
      }
    }

    // Get total count for pagination
    const total = await this.auditLogRepository.count({ where });

    // Get audit logs
    const logs = await this.auditLogRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        members: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      data: logs.map((log) => {
        // Handle both 'user' and 'members' property names (Prisma relation naming)
        const userData = log.user || log.members;
        return {
          id: log.id,
          userId: log.userId,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          changes: log.changes,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          timestamp: log.timestamp,
          user: userData
            ? {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
              }
            : undefined,
        };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
