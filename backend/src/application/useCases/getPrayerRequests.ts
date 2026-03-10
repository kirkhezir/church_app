import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * GetPrayerRequests Use Case - Retrieve public approved prayer requests
 * Accepts an optional memberId to populate hasPrayed per request.
 */
export class GetPrayerRequests {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(memberId?: string): Promise<any[]> {
    return await this.prayerRepository.findPublicApprovedWithHasPrayed(memberId);
  }
}
