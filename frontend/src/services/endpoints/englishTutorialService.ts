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

export interface EnglishTutorialEnrollment {
  id: string;
  name: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  birthDate: string;
  phone?: string;
  email?: string;
  enrolledAt: string;
  reviewedAt?: string;
  updatedAt: string;
}

interface EnglishTutorialEnrollmentListResponse {
  success: boolean;
  data: EnglishTutorialEnrollment[];
}

interface EnglishTutorialEnrollmentDetailResponse {
  success: boolean;
  data: EnglishTutorialEnrollment;
}

export const englishTutorialService = {
  async enroll(input: EnglishTutorialEnrollmentInput): Promise<EnglishTutorialEnrollmentResponse> {
    return apiClient.post<EnglishTutorialEnrollmentResponse>(
      '/english-tutorial-enrollments',
      input
    );
  },

  /**
   * Get all enrollments (ADMIN, STAFF)
   */
  async getAllEnrollments(): Promise<EnglishTutorialEnrollment[]> {
    const response = await apiClient.get<EnglishTutorialEnrollmentListResponse>(
      '/english-tutorial-enrollments'
    );
    return response.data;
  },

  /**
   * Mark an enrollment as reviewed (ADMIN, STAFF)
   */
  async markReviewed(id: string): Promise<EnglishTutorialEnrollment> {
    const response = await apiClient.patch<EnglishTutorialEnrollmentDetailResponse>(
      `/english-tutorial-enrollments/${id}/review`
    );
    return response.data;
  },
};
