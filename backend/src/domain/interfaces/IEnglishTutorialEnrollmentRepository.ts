import { EnglishTutorialEnrollment } from '../entities/EnglishTutorialEnrollment';

/**
 * EnglishTutorialEnrollment Repository Interface
 * Defines methods for persisting English Tutorial Ministry enrollments
 */
export interface IEnglishTutorialEnrollmentRepository {
  create(enrollment: EnglishTutorialEnrollment): Promise<EnglishTutorialEnrollment>;
}
