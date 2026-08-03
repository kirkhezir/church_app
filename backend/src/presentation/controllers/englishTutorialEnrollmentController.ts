import { Request, Response } from 'express';
import { CreateEnglishTutorialEnrollment } from '../../application/useCases/createEnglishTutorialEnrollment';
import { EnglishTutorialEnrollmentRepository } from '../../infrastructure/database/repositories/englishTutorialEnrollmentRepository';
import { EnglishTutorialNotificationService } from '../../application/services/englishTutorialNotificationService';
import { isValidGender } from '../../domain/valueObjects/Gender';
import { logger } from '../../infrastructure/logging/logger';

/**
 * EnglishTutorialEnrollmentController
 *
 * Handles POST /api/v1/english-tutorial-enrollments — public enrollment
 * submissions for the English Tutorial Ministry.
 */
export class EnglishTutorialEnrollmentController {
  private createEnrollment: CreateEnglishTutorialEnrollment;

  constructor(createEnrollment?: CreateEnglishTutorialEnrollment) {
    this.createEnrollment =
      createEnrollment ||
      new CreateEnglishTutorialEnrollment(
        new EnglishTutorialEnrollmentRepository(),
        new EnglishTutorialNotificationService()
      );
  }

  async submitEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { name, nickname, gender, age, birthDate, phone, email } = req.body;
      const errors: string[] = [];

      if (!name || typeof name !== 'string' || name.trim().length < 1) {
        errors.push('Name is required');
      }
      if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 1) {
        errors.push('Nickname is required');
      }
      if (!gender || typeof gender !== 'string' || !isValidGender(gender)) {
        errors.push('Gender must be MALE or FEMALE');
      }

      const parsedAge = typeof age === 'number' ? age : Number(age);
      if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        errors.push('Age must be a whole number between 1 and 120');
      }

      const parsedBirthDate = new Date(birthDate);
      if (!birthDate || isNaN(parsedBirthDate.getTime())) {
        errors.push('Birthdate is required and must be a valid date');
      } else if (parsedBirthDate.getTime() > Date.now()) {
        errors.push('Birthdate cannot be in the future');
      }

      if (email && (typeof email !== 'string' || !email.includes('@'))) {
        errors.push('Email format is invalid');
      }

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', message: errors });
        return;
      }

      const result = await this.createEnrollment.execute({
        name,
        nickname,
        gender,
        age: parsedAge,
        birthDate: parsedBirthDate,
        phone: typeof phone === 'string' ? phone : undefined,
        email: typeof email === 'string' ? email : undefined,
      });

      logger.info('English Tutorial enrollment submitted', { enrollmentId: result.id });

      res.status(201).json({
        success: true,
        message: 'Thank you for enrolling! We will contact you soon with more details.',
        data: result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing English Tutorial enrollment', { error: message });

      res.status(500).json({
        error: 'Failed to submit enrollment',
        message: 'An error occurred while processing your request. Please try again later.',
      });
    }
  }
}
