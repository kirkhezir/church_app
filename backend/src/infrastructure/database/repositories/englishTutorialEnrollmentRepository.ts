import prisma from '../prismaClient';
import { EnglishTutorialEnrollment } from '../../../domain/entities/EnglishTutorialEnrollment';
import { IEnglishTutorialEnrollmentRepository } from '../../../domain/interfaces/IEnglishTutorialEnrollmentRepository';

/**
 * Prisma-backed implementation of IEnglishTutorialEnrollmentRepository
 */
export class EnglishTutorialEnrollmentRepository implements IEnglishTutorialEnrollmentRepository {
  async create(enrollment: EnglishTutorialEnrollment): Promise<EnglishTutorialEnrollment> {
    const created = await prisma.english_tutorial_enrollments.create({
      data: {
        id: enrollment.id,
        name: enrollment.name,
        nickname: enrollment.nickname,
        gender: enrollment.gender as never,
        age: enrollment.age,
        birthDate: enrollment.birthDate,
        phone: enrollment.phone,
        email: enrollment.email,
        enrolledAt: enrollment.enrolledAt,
        updatedAt: enrollment.updatedAt,
      },
    });

    return EnglishTutorialEnrollment.create({
      id: created.id,
      name: created.name,
      nickname: created.nickname,
      gender: created.gender,
      age: created.age,
      birthDate: created.birthDate,
      phone: created.phone ?? undefined,
      email: created.email ?? undefined,
      enrolledAt: created.enrolledAt,
      updatedAt: created.updatedAt,
    });
  }
}
