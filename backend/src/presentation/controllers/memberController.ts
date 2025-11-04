/**
 * Member Controller (T095)
 *
 * Handles member-related HTTP requests:
 * - GET /api/v1/members/dashboard - Get dashboard data
 * - GET /api/v1/members/me - Get current member profile
 * - PATCH /api/v1/members/me - Update member profile (Phase 4 later)
 */

import { Request, Response } from 'express';
import { GetMemberDashboard } from '../../application/useCases/getMemberDashboard';
import { MemberRepository } from '../../infrastructure/database/repositories/memberRepository';
import { EventRepository } from '../../infrastructure/database/repositories/eventRepository';
import { AnnouncementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Member Controller
 */
export class MemberController {
  private getMemberDashboardUseCase: GetMemberDashboard;
  private memberRepository: MemberRepository;

  constructor() {
    this.memberRepository = new MemberRepository();
    const eventRepository = new EventRepository();
    const announcementRepository = new AnnouncementRepository();

    this.getMemberDashboardUseCase = new GetMemberDashboard(
      this.memberRepository,
      eventRepository,
      announcementRepository
    );
  }

  /**
   * GET /api/v1/members/dashboard
   * Get dashboard data for authenticated member
   */
  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get member ID from auth middleware (attached to req.user)
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      // Execute use case
      const dashboard = await this.getMemberDashboardUseCase.execute({ memberId });

      res.status(200).json(dashboard);
    } catch (error) {
      logger.error('Error getting dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error && error.message === 'Member not found') {
        res.status(404).json({
          error: 'NotFound',
          message: 'Member not found',
        });
        return;
      }

      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve dashboard data',
      });
    }
  };

  /**
   * GET /api/v1/members/me
   * Get current member profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get member ID from auth middleware
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      // Get member from repository
      const member = await this.memberRepository.findById(memberId);

      if (!member) {
        res.status(404).json({
          error: 'NotFound',
          message: 'Member not found',
        });
        return;
      }

      // Return member profile (exclude sensitive data)
      res.status(200).json({
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        phone: member.phone,
        address: member.address,
        membershipDate: member.membershipDate,
        emailNotifications: member.emailNotifications,
        privacySettings: member.privacySettings,
        lastLoginAt: member.lastLoginAt,
      });
    } catch (error) {
      logger.error('Error getting profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve profile',
      });
    }
  };
}
