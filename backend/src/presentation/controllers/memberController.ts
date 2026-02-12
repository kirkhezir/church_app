/**
 * Member Controller (T095, T243-T246)
 *
 * Handles member-related HTTP requests:
 * - GET /api/v1/members/dashboard - Get dashboard data
 * - GET /api/v1/members/me - Get current member profile
 * - PATCH /api/v1/members/me - Update member profile
 * - GET /api/v1/members - List members (directory)
 * - GET /api/v1/members/search - Search members
 * - GET /api/v1/members/:id - Get member profile
 * - PATCH /api/v1/members/me/privacy - Update privacy settings
 */

import { Request, Response } from 'express';
import { GetMemberDashboard } from '../../application/useCases/getMemberDashboard';
import { UpdateProfile } from '../../application/useCases/updateProfile';
import { UpdateNotificationPreferences } from '../../application/useCases/updateNotificationPreferences';
import { GetMemberDirectory } from '../../application/useCases/getMemberDirectory';
import { SearchMembers } from '../../application/useCases/searchMembers';
import { GetMemberProfile } from '../../application/useCases/getMemberProfile';
import { UpdatePrivacySettings } from '../../application/useCases/updatePrivacySettings';
import { MemberRepository } from '../../infrastructure/database/repositories/memberRepository';
import { EventRepository } from '../../infrastructure/database/repositories/eventRepository';
import { EventRSVPRepository } from '../../infrastructure/database/repositories/eventRSVPRepository';
import { AnnouncementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Member Controller
 */
export class MemberController {
  private getMemberDashboardUseCase: GetMemberDashboard;
  private updateProfileUseCase: UpdateProfile;
  private updateNotificationPreferencesUseCase: UpdateNotificationPreferences;
  private getMemberDirectoryUseCase: GetMemberDirectory;
  private searchMembersUseCase: SearchMembers;
  private getMemberProfileUseCase: GetMemberProfile;
  private updatePrivacySettingsUseCase: UpdatePrivacySettings;
  private memberRepository: MemberRepository;

  constructor() {
    this.memberRepository = new MemberRepository();
    const eventRepository = new EventRepository();
    const eventRSVPRepository = new EventRSVPRepository();
    const announcementRepository = new AnnouncementRepository();

    this.getMemberDashboardUseCase = new GetMemberDashboard(
      this.memberRepository,
      eventRepository,
      announcementRepository,
      eventRSVPRepository
    );
    this.updateProfileUseCase = new UpdateProfile(this.memberRepository);
    this.updateNotificationPreferencesUseCase = new UpdateNotificationPreferences(
      this.memberRepository
    );
    this.getMemberDirectoryUseCase = new GetMemberDirectory();
    this.searchMembersUseCase = new SearchMembers();
    this.getMemberProfileUseCase = new GetMemberProfile();
    this.updatePrivacySettingsUseCase = new UpdatePrivacySettings();
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

  /**
   * PATCH /api/v1/members/me
   * Update current member's profile (T106)
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get member ID from JWT token (set by authMiddleware)
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { firstName, lastName, phone, address, privacySettings } = req.body;

      // Execute update profile use case
      const result = await this.updateProfileUseCase.execute({
        memberId,
        firstName,
        lastName,
        phone,
        address,
        privacySettings,
      });

      if (!result.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: result.message,
        });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error updating profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to update profile',
      });
    }
  };

  /**
   * PATCH /api/v1/members/me/notifications
   * Update notification preferences (T107)
   */
  updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get member ID from JWT token (set by authMiddleware)
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { emailNotifications } = req.body;

      if (typeof emailNotifications !== 'boolean') {
        res.status(400).json({
          error: 'ValidationError',
          message: 'emailNotifications must be a boolean value',
        });
        return;
      }

      // Execute update notification preferences use case
      const result = await this.updateNotificationPreferencesUseCase.execute({
        memberId,
        emailNotifications,
      });

      if (!result.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: result.message,
        });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error updating notification preferences', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to update notification preferences',
      });
    }
  };

  /**
   * GET /api/v1/members
   * List members (directory) with privacy controls
   */
  listMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { search, page = '1', limit = '20' } = req.query;

      const result = await this.getMemberDirectoryUseCase.execute({
        requesterId: memberId,
        search: search as string | undefined,
        page: parseInt(page as string, 10),
        limit: Math.min(parseInt(limit as string, 10), 100),
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error listing members', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list members' },
      });
    }
  };

  /**
   * GET /api/v1/members/search
   * Search members by name
   */
  searchMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { q, limit = '20' } = req.query;

      const result = await this.searchMembersUseCase.execute({
        requesterId: memberId,
        query: (q as string) || '',
        limit: Math.min(parseInt(limit as string, 10), 50),
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error searching members', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to search members' },
      });
    }
  };

  /**
   * GET /api/v1/members/:id
   * Get member profile with privacy controls
   */
  getMemberById = async (req: Request, res: Response): Promise<void> => {
    try {
      const requesterId = (req as any).user?.userId;

      if (!requesterId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = req.params;

      const result = await this.getMemberProfileUseCase.execute({
        memberId: id,
        requesterId,
      });

      if (!result) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Member not found' },
        });
        return;
      }

      res.status(200).json(result.member);
    } catch (error) {
      logger.error('Error getting member profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get member profile' },
      });
    }
  };

  /**
   * PATCH /api/v1/members/me/privacy
   * Update privacy settings
   */
  updatePrivacySettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const memberId = (req as any).user?.userId;

      if (!memberId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { showPhone, showEmail, showAddress } = req.body;

      // Validate that at least one field is provided
      if (showPhone === undefined && showEmail === undefined && showAddress === undefined) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'At least one privacy setting is required' },
        });
        return;
      }

      // Validate types
      if (
        (showPhone !== undefined && typeof showPhone !== 'boolean') ||
        (showEmail !== undefined && typeof showEmail !== 'boolean') ||
        (showAddress !== undefined && typeof showAddress !== 'boolean')
      ) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Privacy settings must be boolean values' },
        });
        return;
      }

      const result = await this.updatePrivacySettingsUseCase.execute({
        memberId,
        showPhone,
        showEmail,
        showAddress,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error updating privacy settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update privacy settings' },
      });
    }
  };
}
