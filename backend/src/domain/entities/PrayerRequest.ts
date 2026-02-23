/**
 * PrayerRequest Domain Entity
 *
 * Represents a prayer request from a member or visitor.
 * Business Rules:
 * - Request text is required (min 10 chars)
 * - New requests default to PENDING status
 * - Admin must approve before public visibility
 * - Prayer count can be incremented by any visitor
 */
export type PrayerRequestStatus = 'PENDING' | 'APPROVED' | 'ARCHIVED';

export class PrayerRequest {
  private constructor(
    public readonly id: string,
    public name: string,
    public email: string | null,
    public category: string,
    public categoryThai: string | null,
    public request: string,
    public requestThai: string | null,
    public isPublic: boolean,
    public isAnonymous: boolean,
    public prayerCount: number,
    public status: PrayerRequestStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    this.validateRequest(request);
    this.validateName(name);
  }

  static create(
    id: string,
    name: string,
    category: string,
    request: string,
    options: {
      email?: string;
      categoryThai?: string;
      requestThai?: string;
      isPublic?: boolean;
      isAnonymous?: boolean;
    } = {}
  ): PrayerRequest {
    const now = new Date();
    return new PrayerRequest(
      id,
      name,
      options.email ?? null,
      category,
      options.categoryThai ?? null,
      request,
      options.requestThai ?? null,
      options.isPublic ?? false,
      options.isAnonymous ?? true,
      0,
      'PENDING',
      now,
      now
    );
  }

  static fromPersistence(data: {
    id: string;
    name: string;
    email: string | null;
    category: string;
    categoryThai: string | null;
    request: string;
    requestThai: string | null;
    isPublic: boolean;
    isAnonymous: boolean;
    prayerCount: number;
    status: PrayerRequestStatus;
    createdAt: Date;
    updatedAt: Date;
  }): PrayerRequest {
    return new PrayerRequest(
      data.id,
      data.name,
      data.email,
      data.category,
      data.categoryThai,
      data.request,
      data.requestThai,
      data.isPublic,
      data.isAnonymous,
      data.prayerCount,
      data.status,
      data.createdAt,
      data.updatedAt
    );
  }

  approve(): void {
    this.status = 'APPROVED';
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  incrementPrayerCount(): void {
    this.prayerCount += 1;
    this.updatedAt = new Date();
  }

  private validateRequest(request: string): void {
    if (!request || request.trim().length < 10) {
      throw new Error('Prayer request must be at least 10 characters');
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 1) {
      throw new Error('Name is required for prayer request');
    }
  }
}
