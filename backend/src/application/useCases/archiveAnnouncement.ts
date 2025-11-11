import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import { memberRepository } from '../../infrastructure/database/repositories/memberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Archive Announcement
 *
 * Business Rules:
 * - Only ADMIN and STAFF roles can archive announcements
 * - Archived announcements are hidden from main feed
 * - Archiving is idempotent (can archive already archived announcements)
 *
 * @param id - Announcement ID to archive
 * @param userId - ID of user performing the archive (must be ADMIN/STAFF)
 */
export async function archiveAnnouncement(id: string, userId: string): Promise<void> {
  try {
    logger.info('Archiving announcement', { id, userId });

    // Validate user permissions
    const user = await memberRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      throw new Error('Only administrators and staff can archive announcements');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid announcement ID format');
    }

    // Check if announcement exists
    const announcement = await announcementRepository.findById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    // Archive the announcement (idempotent)
    await announcementRepository.archive(id);

    logger.info('Announcement archived successfully', { id });
  } catch (error: any) {
    logger.error('Failed to archive announcement', {
      id,
      userId,
      error: error.message,
    });
    throw error;
  }
}
