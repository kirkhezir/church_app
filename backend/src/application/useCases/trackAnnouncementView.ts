import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Track Announcement View
 *
 * Records that a member has viewed an announcement.
 * Used for analytics and "unread" indicators.
 *
 * @param announcementId - ID of the announcement being viewed
 * @param memberId - ID of the member viewing the announcement
 */
export async function trackAnnouncementView(
  announcementId: string,
  memberId: string
): Promise<void> {
  try {
    logger.info('Tracking announcement view', { announcementId, memberId });

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(announcementId) || !uuidRegex.test(memberId)) {
      throw new Error('Invalid ID format');
    }

    // Check if announcement exists
    const announcement = await announcementRepository.findById(announcementId);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    // Mark as viewed (upsert to handle multiple views)
    await announcementRepository.markAsViewed(announcementId, memberId);

    logger.debug('Announcement view tracked', { announcementId, memberId });
  } catch (error: any) {
    // Log error but don't throw - tracking views should not break user experience
    logger.error('Failed to track announcement view', {
      announcementId,
      memberId,
      error: error.message,
    });
  }
}
