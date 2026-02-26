import type {
  IAnalyticsRepository,
  AttendanceData,
} from '../../domain/interfaces/IAnalyticsRepository';

/**
 * GetAttendanceAnalytics Use Case
 *
 * Retrieves attendance data based on event RSVPs.
 */

interface GetAttendanceInput {
  limit: number;
}

export class GetAttendanceAnalytics {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async execute(input: GetAttendanceInput): Promise<AttendanceData> {
    const limit = Math.max(1, Math.min(input.limit, 50));
    return this.analyticsRepository.getAttendance(limit);
  }
}
