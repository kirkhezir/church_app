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

    return this.toEntity(created);
  }

  async findAll(): Promise<EnglishTutorialEnrollment[]> {
    const rows = await prisma.english_tutorial_enrollments.findMany({
      orderBy: { enrolledAt: 'desc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async markReviewed(id: string): Promise<EnglishTutorialEnrollment> {
    const updated = await prisma.english_tutorial_enrollments.update({
      where: { id },
      data: { reviewedAt: new Date(), updatedAt: new Date() },
    });
    return this.toEntity(updated);
  }

  async countUnreviewed(): Promise<number> {
    return prisma.english_tutorial_enrollments.count({
      where: { reviewedAt: null },
    });
  }

  private toEntity(row: {
    id: string;
    name: string;
    nickname: string;
    gender: string;
    age: number;
    birthDate: Date;
    phone: string | null;
    email: string | null;
    enrolledAt: Date;
    reviewedAt: Date | null;
    updatedAt: Date;
  }): EnglishTutorialEnrollment {
    return EnglishTutorialEnrollment.create({
      id: row.id,
      name: row.name,
      nickname: row.nickname,
      gender: row.gender,
      age: row.age,
      birthDate: row.birthDate,
      phone: row.phone ?? undefined,
      email: row.email ?? undefined,
      enrolledAt: row.enrolledAt,
      reviewedAt: row.reviewedAt ?? undefined,
      updatedAt: row.updatedAt,
    });
  }
}
