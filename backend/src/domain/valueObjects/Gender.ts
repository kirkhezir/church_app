/**
 * Gender for English Tutorial Ministry enrollment
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export function isValidGender(value: string): value is Gender {
  return value === Gender.MALE || value === Gender.FEMALE;
}
