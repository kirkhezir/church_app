import type {
  IAnalyticsRepository,
  EngagementData,
} from '../../domain/interfaces/IAnalyticsRepository';

/**
 * GetEngagementMetrics Use Case
 *
 * Retrieves user engagement metrics including activity heatmap,
 * session duration, and feature usage stats.
 */
export class GetEngagementMetrics {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<EngagementData> {
    return this.analyticsRepository.getEngagement();
  }
}
