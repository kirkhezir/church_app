/**
 * English Tutorial Enrollment Service
 *
 * Public enrollment submissions for the English Tutorial Ministry.
 */
import apiClient from '../api/apiClient';

export interface EnglishTutorialEnrollmentInput {
  name: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  birthDate: string;
  phone?: string;
  email?: string;
}

interface EnglishTutorialEnrollmentResponse {
  success: boolean;
  message: string;
  data: { id: string; enrolledAt: string };
}

export const englishTutorialService = {
  async enroll(input: EnglishTutorialEnrollmentInput): Promise<EnglishTutorialEnrollmentResponse> {
    return apiClient.post<EnglishTutorialEnrollmentResponse>(
      '/english-tutorial-enrollments',
      input
    );
  },
};
