/**
 * Admin Controller
 *
 * Handles admin-only endpoints:
 * - POST /api/v1/admin/members - Create new member
 * - GET /api/v1/admin/members - List all members
 * - DELETE /api/v1/admin/members/:id - Soft delete member
 * - GET /api/v1/admin/audit-logs - View audit logs
 * - GET /api/v1/admin/export/members - Export member data
 * - GET /api/v1/admin/export/events - Export event data
 *
 * T304-T306, T316, T321-T322: Create admin controller
 */

import { Request, Response, NextFunction } from 'express';
import { MemberRepository } from '../../infrastructure/database/repositories/memberRepository';
import { PasswordService } from '../../infrastructure/auth/passwordService';
import { EmailService } from '../../infrastructure/email/emailService';
import { AuditLogService } from '../../application/services/auditLogService';
import { CreateMemberAccount } from '../../application/useCases/createMemberAccount';
import { GetAuditLogs } from '../../application/useCases/getAuditLogs';
import { ExportMemberData } from '../../application/useCases/exportMemberData';
import { ExportEventData } from '../../application/useCases/exportEventData';
import prisma from '../../infrastructure/database/prismaClient';
import { logger } from '../../infrastructure/logging/logger';

// Initialize dependencies
const memberRepository = new MemberRepository();
const passwordService = new PasswordService();
const emailService = new EmailService();
const auditLogService = new AuditLogService();

// Initialize use cases
const createMemberAccount = new CreateMemberAccount(
  memberRepository,
  passwordService,
  emailService,
  auditLogService
);

const getAuditLogs = new GetAuditLogs({
  findMany: (options) => prisma.auditLog.findMany(options),
  count: (options) => prisma.auditLog.count(options),
});

const exportMemberData = new ExportMemberData({
  findMany: (options) => prisma.member.findMany(options),
});

const exportEventData = new ExportEventData({
  findMany: (options) => prisma.event.findMany(options),
});

/**
 * POST /api/v1/admin/members
 * Create a new member account
 */
export async function createMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const { email, firstName, lastName, role, phone, address } = req.body;

    const result = await createMemberAccount.execute({
      email,
      firstName,
      lastName,
      role,
      phone,
      address,
      createdBy: user.userId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    });

    res.status(201).json(result);
  } catch (error: any) {
    logger.error('Create member error', { error: error.message });

    if (error.message.includes('required')) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message.includes('Invalid email')) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message.includes('already exists')) {
      res.status(409).json({ error: error.message });
      return;
    }

    next(error);
  }
}

/**
 * GET /api/v1/admin/members
 * List all members with filtering and pagination
 */
export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string;
    const role = req.query.role as string;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Get total count
    const total = await prisma.member.count({ where });

    // Get members
    const members = await prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        membershipDate: true,
        emailNotifications: true,
        accountLocked: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      data: members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('List members error', { error: error.message });
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/members/:id
 * Soft delete a member
 */
export async function deleteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const memberId = req.params.id;

    // Prevent deleting own account
    if (memberId === user.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    if (member.deletedAt) {
      res.status(404).json({ error: 'Member already deleted' });
      return;
    }

    // Soft delete
    await prisma.member.update({
      where: { id: memberId },
      data: { deletedAt: new Date() },
    });

    // Log audit trail
    await auditLogService.log({
      userId: user.userId,
      action: 'DELETE',
      entityType: 'MEMBER',
      entityId: memberId,
      changes: {
        before: {
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
        },
      },
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    });

    logger.info('Member deleted', { memberId, deletedBy: user.userId });

    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    logger.error('Delete member error', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/v1/admin/audit-logs
 * Get audit logs with filtering
 */
export async function getAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { action, entityType, userId, startDate, endDate, page, limit } = req.query;

    const result = await getAuditLogs.execute({
      action: action as string,
      entityType: entityType as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Get audit logs error', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/v1/admin/export/members
 * Export member data as CSV or JSON
 */
export async function exportMembers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const format = (req.query.format as string) || 'json';
    const role = req.query.role as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const result = await exportMemberData.execute({
      format: format as 'json' | 'csv',
      role,
      startDate,
      endDate,
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } else {
      res.status(200).json(result.data);
    }
  } catch (error: any) {
    logger.error('Export members error', { error: error.message });
    next(error);
  }
}

/**
 * GET /api/v1/admin/export/events
 * Export event data as CSV or JSON
 */
export async function exportEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const format = (req.query.format as string) || 'json';
    const category = req.query.category as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const includeCancelled = req.query.includeCancelled === 'true';

    const result = await exportEventData.execute({
      format: format as 'json' | 'csv',
      category,
      startDate,
      endDate,
      includeCancelled,
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } else {
      res.status(200).json(result.data);
    }
  } catch (error: any) {
    logger.error('Export events error', { error: error.message });
    next(error);
  }
}
