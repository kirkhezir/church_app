/**
 * Authentication Service
 *
 * Handles all authentication-related API calls:
 * - Login
 * - Token refresh
 * - Logout
 */

import apiClient from '../api/apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  member: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface RefreshResponse {
  accessToken: string;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response as unknown as LoginResponse;
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });
    return response as unknown as RefreshResponse;
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', {
      refreshToken,
    });
  },
};
