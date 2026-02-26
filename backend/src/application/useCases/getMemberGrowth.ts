import type {
  IAnalyticsRepository,
  MemberGrowthEntry,
} from '../../domain/interfaces/IAnalyticsRepository';

/**
 * GetMemberGrowth Use Case
 *
 * Retrieves member growth data over a specified number of months.
 */

interface GetMemberGrowthInput {
  months: number;
}

export class GetMemberGrowth {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async execute(input: GetMemberGrowthInput): Promise<MemberGrowthEntry[]> {
    const months = Math.max(1, Math.min(input.months, 24));
    return this.analyticsRepository.getMemberGrowth(months);
  }
}
