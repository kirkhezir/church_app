import { EnglishTutorialEnrollment } from '../entities/EnglishTutorialEnrollment';

/**
 * EnglishTutorialEnrollment Repository Interface
 * Defines methods for persisting English Tutorial Ministry enrollments
 */
export interface IEnglishTutorialEnrollmentRepository {
  create(enrollment: EnglishTutorialEnrollment): Promise<EnglishTutorialEnrollment>;
  findAll(): Promise<EnglishTutorialEnrollment[]>;
  markReviewed(id: string): Promise<EnglishTutorialEnrollment>;
  countUnreviewed(): Promise<number>;
}
