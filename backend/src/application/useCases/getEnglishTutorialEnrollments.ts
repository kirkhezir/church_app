import { IEnglishTutorialEnrollmentRepository } from '../../domain/interfaces/IEnglishTutorialEnrollmentRepository';
import { EnglishTutorialEnrollment } from '../../domain/entities/EnglishTutorialEnrollment';

/**
 * GetEnglishTutorialEnrollments Use Case
 *
 * Lists all English Tutorial Ministry enrollments (admin/staff only).
 */
export class GetEnglishTutorialEnrollments {
  constructor(private enrollmentRepository: IEnglishTutorialEnrollmentRepository) {}

  async execute(): Promise<EnglishTutorialEnrollment[]> {
    return this.enrollmentRepository.findAll();
  }
}
