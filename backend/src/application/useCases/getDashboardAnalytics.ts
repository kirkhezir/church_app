import type {
  IAnalyticsRepository,
  DashboardOverview,
} from '../../domain/interfaces/IAnalyticsRepository';

/**
 * GetDashboardAnalytics Use Case
 *
 * Retrieves dashboard overview metrics for the admin analytics page.
 */
export class GetDashboardAnalytics {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<DashboardOverview> {
    return this.analyticsRepository.getDashboard();
  }
}
