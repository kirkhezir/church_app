import { announcementRepository } from '../../infrastructure/database/repositories/announcementRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Use Case: Get Announcements
 *
 * Retrieves announcements based on filter criteria.
 * Supports pagination, filtering by archived status, search, priority, author, date range, and sorting.
 *
 * @param includeArchived - Whether to include archived announcements (default: false)
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @param search - Search term for title/content (optional)
 * @param priority - Filter by priority: 'URGENT' or 'NORMAL' (optional)
 * @param authorId - Filter by author ID (optional)
 * @param dateFrom - Filter announcements from this date (optional)
 * @param dateTo - Filter announcements until this date (optional)
 * @param sortBy - Sort field: 'date', 'priority', 'views' (default: 'date')
 * @param sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
 * @param includeDrafts - Whether to include draft announcements (default: false)
 * @returns Announcements list with pagination metadata
 */
export async function getAnnouncements(
  includeArchived: boolean = false,
  page: number = 1,
  limit: number = 10,
  search?: string,
  priority?: 'URGENT' | 'NORMAL',
  authorId?: string,
  dateFrom?: Date,
  dateTo?: Date,
  sortBy: 'date' | 'priority' | 'views' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc',
  includeDrafts: boolean = false
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
    logger.info('Fetching announcements', {
      includeArchived,
      page,
      limit,
      search,
      priority,
      authorId,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      includeDrafts,
    });

    // Build filter object
    const filters: any = {
      deletedAt: null,
    };

    // Archived filter
    if (includeArchived) {
      filters.archivedAt = { not: null };
    } else {
      filters.archivedAt = null;
    }

    // Draft filter - only show published unless explicitly including drafts
    if (!includeDrafts) {
      filters.isDraft = false;
    }

    // Search filter (title or content)
    if (search && search.trim()) {
      filters.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Priority filter
    if (priority) {
      filters.priority = priority;
    }

    // Author filter
    if (authorId) {
      filters.authorId = authorId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filters.publishedAt = {};
      if (dateFrom) {
        filters.publishedAt.gte = dateFrom;
      }
      if (dateTo) {
        filters.publishedAt.lte = dateTo;
      }
    }

    // Determine sort configuration
    let orderBy: any = {};
    if (sortBy === 'date') {
      orderBy = { publishedAt: sortOrder };
    } else if (sortBy === 'priority') {
      orderBy = [{ priority: sortOrder }, { publishedAt: 'desc' }];
    } else if (sortBy === 'views') {
      // For views, we need to count the views relation
      // This requires a more complex query
      orderBy = { publishedAt: sortOrder }; // Fallback for now
    }

    // Fetch announcements with pagination
    const [announcements, total] = await Promise.all([
      announcementRepository.findWithFilters(filters, orderBy, page, limit),
      announcementRepository.countWithFilters(filters),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: announcements,
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
