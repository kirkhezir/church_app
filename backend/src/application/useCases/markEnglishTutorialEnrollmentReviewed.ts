import { IEnglishTutorialEnrollmentRepository } from '../../domain/interfaces/IEnglishTutorialEnrollmentRepository';
import { EnglishTutorialEnrollment } from '../../domain/entities/EnglishTutorialEnrollment';

/**
 * MarkEnglishTutorialEnrollmentReviewed Use Case
 *
 * Marks an enrollment as reviewed by an admin/staff member.
 */
export class MarkEnglishTutorialEnrollmentReviewed {
  constructor(private enrollmentRepository: IEnglishTutorialEnrollmentRepository) {}

  async execute(id: string): Promise<EnglishTutorialEnrollment> {
    return this.enrollmentRepository.markReviewed(id);
  }
}
