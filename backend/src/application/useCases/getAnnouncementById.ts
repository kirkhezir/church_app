import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Get Announcement By ID
 *
 * Retrieves a single announcement by its ID.
 *
 * @param id - Announcement ID
 * @returns Announcement details with author information
 * @throws Error if announcement not found
 */
export async function getAnnouncementById(id: string): Promise<any> {
  try {
    logger.info('Fetching announcement by ID', { id });

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid announcement ID format');
    }

    const announcement = await announcementRepository.findById(id);

    if (!announcement) {
      throw new Error('Announcement not found');
    }

    return announcement;
  } catch (error: any) {
    logger.error('Failed to fetch announcement', {
      id,
      error: error.message,
    });
    throw error;
  }
}
