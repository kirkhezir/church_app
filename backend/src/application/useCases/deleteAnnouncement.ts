import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import { memberRepository } from '../../infrastructure/database/repositories/memberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Delete Announcement
 *
 * Business Rules:
 * - Only ADMIN and STAFF roles can delete announcements
 * - Soft delete (sets deletedAt timestamp)
 * - Deleted announcements are not visible in any queries
 *
 * @param id - Announcement ID to delete
 * @param userId - ID of user performing the delete (must be ADMIN/STAFF)
 */
export async function deleteAnnouncement(id: string, userId: string): Promise<void> {
  try {
    logger.info('Deleting announcement', { id, userId });

    // Validate user permissions
    const user = await memberRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      throw new Error('Only administrators and staff can delete announcements');
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

    // Soft delete the announcement
    await announcementRepository.delete(id);

    logger.info('Announcement deleted successfully', { id });
  } catch (error: any) {
    logger.error('Failed to delete announcement', {
      id,
      userId,
      error: error.message,
    });
    throw error;
  }
}
