/**
 * Repository interface for PrayerRequest entity
 */
export interface IPrayerRepository {
  findPublicApproved(): Promise<any[]>;
  findPublicApprovedWithHasPrayed(memberId?: string): Promise<any[]>;
  findAll(options?: { status?: string }): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(request: any): Promise<any>;
  updateStatus(id: string, status: string): Promise<any>;
  incrementPrayerCount(id: string): Promise<any>;
  decrementPrayerCount(id: string): Promise<any>;
  findRecentPublic(limit: number): Promise<any[]>;
  countPublicApproved(): Promise<number>;
  countPending(): Promise<number>;
  addSupporter(prayerRequestId: string, memberId: string): Promise<void>;
  removeSupporter(prayerRequestId: string, memberId: string): Promise<void>;
  hasMemberPrayed(prayerRequestId: string, memberId: string): Promise<boolean>;
}
