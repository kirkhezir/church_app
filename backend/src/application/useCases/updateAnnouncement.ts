import { Announcement } from '../../domain/entities/Announcement';
import { Priority } from '../../domain/valueObjects/Priority';
import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import { memberRepository } from '../../infrastructure/database/repositories/memberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Update Announcement
 *
 * Business Rules:
 * - Only ADMIN and STAFF roles can update announcements
 * - Cannot update archived announcements
 * - Title and content validation applies
 * - Partial updates are supported
 *
 * @param id - Announcement ID to update
 * @param userId - ID of user performing the update (must be ADMIN/STAFF)
 * @param updates - Fields to update (title, content, priority)
 * @returns Updated announcement
 */
export async function updateAnnouncement(
  id: string,
  userId: string,
  updates: {
    title?: string;
    content?: string;
    priority?: Priority;
  }
): Promise<any> {
  try {
    logger.info('Updating announcement', { id, userId, updates });

    // Validate user permissions
    const user = await memberRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      throw new Error('Only administrators and staff can update announcements');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid announcement ID format');
    }

    // Fetch existing announcement
    const existing = await announcementRepository.findById(id);
    if (!existing) {
      throw new Error('Announcement not found');
    }

    // Check if archived
    if (existing.archivedAt) {
      throw new Error('Cannot update an archived announcement');
    }

    // Create domain entity and apply updates
    const announcement = Announcement.fromPersistence(existing);
    announcement.updateDetails(updates.title?.trim(), updates.content?.trim(), updates.priority);

    // Persist changes
    const updated = await announcementRepository.update(announcement.toPersistence());

    logger.info('Announcement updated successfully', { id });

    return updated;
  } catch (error: any) {
    logger.error('Failed to update announcement', {
      id,
      userId,
      error: error.message,
    });
    throw error;
  }
}
