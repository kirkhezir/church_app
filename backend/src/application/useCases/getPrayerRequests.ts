import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * GetPrayerRequests Use Case - Retrieve public approved prayer requests
 */
export class GetPrayerRequests {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(): Promise<any[]> {
    return await this.prayerRepository.findPublicApproved();
  }
}
