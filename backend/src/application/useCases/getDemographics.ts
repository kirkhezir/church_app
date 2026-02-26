import type {
  IAnalyticsRepository,
  DemographicsData,
} from '../../domain/interfaces/IAnalyticsRepository';

/**
 * GetDemographics Use Case
 *
 * Retrieves member demographics including role distribution,
 * MFA security stats, and age distribution.
 */
export class GetDemographics {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<DemographicsData> {
    return this.analyticsRepository.getDemographics();
  }
}
