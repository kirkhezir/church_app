import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Get Announcements
 *
 * Retrieves announcements based on filter criteria.
 * Supports pagination and filtering by archived status.
 *
 * @param includeArchived - Whether to include archived announcements (default: false)
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Announcements list with pagination metadata
 */
export async function getAnnouncements(
  includeArchived: boolean = false,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    logger.info('Fetching announcements', { includeArchived, page, limit });

    // Fetch announcements based on archived status
    // includeArchived = true means ONLY archived announcements
    // includeArchived = false means ONLY active announcements
    const allAnnouncements = includeArchived
      ? await announcementRepository.findArchived()
      : await announcementRepository.findActive();

    // Calculate pagination
    const total = allAnnouncements.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Slice for pagination
    const paginatedAnnouncements = allAnnouncements.slice(startIndex, endIndex);

    return {
      data: paginatedAnnouncements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error: any) {
    logger.error('Failed to fetch announcements', {
      error: error.message,
    });
    throw error;
  }
}
