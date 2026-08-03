import { randomUUID } from 'crypto';
import { IEnglishTutorialEnrollmentRepository } from '../../domain/interfaces/IEnglishTutorialEnrollmentRepository';
import { EnglishTutorialEnrollment } from '../../domain/entities/EnglishTutorialEnrollment';
import { EnglishTutorialNotificationService } from '../services/englishTutorialNotificationService';
import { logger } from '../../infrastructure/logging/logger';

interface CreateEnglishTutorialEnrollmentInput {
  name: string;
  nickname: string;
  gender: string;
  age: number;
  birthDate: Date;
  phone?: string;
  email?: string;
}

interface CreateEnglishTutorialEnrollmentOutput {
  id: string;
  enrolledAt: Date;
}

/**
 * CreateEnglishTutorialEnrollment Use Case
 *
 * Validates and persists a public enrollment submission for the
 * English Tutorial Ministry, then notifies staff by email.
 */
export class CreateEnglishTutorialEnrollment {
  constructor(
    private enrollmentRepository: IEnglishTutorialEnrollmentRepository,
    private notificationService: EnglishTutorialNotificationService
  ) {}

  async execute(
    input: CreateEnglishTutorialEnrollmentInput
  ): Promise<CreateEnglishTutorialEnrollmentOutput> {
    const enrollment = EnglishTutorialEnrollment.create({
      id: randomUUID(),
      name: input.name,
      nickname: input.nickname,
      gender: input.gender,
      age: input.age,
      birthDate: input.birthDate,
      phone: input.phone,
      email: input.email,
    });

    const created = await this.enrollmentRepository.create(enrollment);

    // Don't block the response on notification email delivery
    this.notificationService.sendEnrollmentNotification(created).catch((error) => {
      logger.error('Failed to send English Tutorial enrollment notification', {
        error: error.message,
        enrollmentId: created.id,
      });
    });

    return { id: created.id, enrolledAt: created.enrolledAt };
  }
}
