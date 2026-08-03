import { Gender, isValidGender } from '../valueObjects/Gender';

/**
 * EnglishTutorialEnrollment Domain Entity
 *
 * Represents a public enrollment submission for the English Tutorial Ministry.
 */
export class EnglishTutorialEnrollment {
  readonly id: string;
  readonly name: string;
  readonly nickname: string;
  readonly gender: Gender;
  readonly age: number;
  readonly birthDate: Date;
  readonly phone?: string;
  readonly email?: string;
  readonly enrolledAt: Date;
  readonly updatedAt: Date;

  private constructor(data: {
    id: string;
    name: string;
    nickname: string;
    gender: Gender;
    age: number;
    birthDate: Date;
    phone?: string;
    email?: string;
    enrolledAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.nickname = data.nickname;
    this.gender = data.gender;
    this.age = data.age;
    this.birthDate = data.birthDate;
    this.phone = data.phone;
    this.email = data.email;
    this.enrolledAt = data.enrolledAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a new enrollment with validation
   */
  static create(data: {
    id: string;
    name: string;
    nickname: string;
    gender: string;
    age: number;
    birthDate: Date;
    phone?: string;
    email?: string;
    enrolledAt?: Date;
    updatedAt?: Date;
  }): EnglishTutorialEnrollment {
    this.validate(data);

    return new EnglishTutorialEnrollment({
      id: data.id,
      name: data.name.trim(),
      nickname: data.nickname.trim(),
      gender: data.gender as Gender,
      age: data.age,
      birthDate: data.birthDate,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      enrolledAt: data.enrolledAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    });
  }

  private static validate(data: {
    name: string;
    nickname: string;
    gender: string;
    age: number;
    birthDate: Date;
    email?: string;
  }): void {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name is required');
    }
    if (!data.nickname || data.nickname.trim() === '') {
      throw new Error('Nickname is required');
    }
    if (!isValidGender(data.gender)) {
      throw new Error('Gender must be MALE or FEMALE');
    }
    if (!Number.isInteger(data.age) || data.age < 1 || data.age > 120) {
      throw new Error('Age must be a whole number between 1 and 120');
    }
    if (!(data.birthDate instanceof Date) || isNaN(data.birthDate.getTime())) {
      throw new Error('Birthdate is invalid');
    }
    if (data.birthDate.getTime() > Date.now()) {
      throw new Error('Birthdate cannot be in the future');
    }
    if (data.email && !data.email.includes('@')) {
      throw new Error('Email format is invalid');
    }
  }
}
