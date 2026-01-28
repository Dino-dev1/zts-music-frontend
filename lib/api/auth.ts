import { apiClient } from './client'
import type { LoginResponse, User, UserRole } from '@/lib/types'

// Extended login response with isNewUser flag
export type AuthResponse = LoginResponse & { isNewUser?: boolean }

export const authApi = {
  /**
   * Phone OTP verification - Firebase token goes in header
   */
  verifyPhone: async (idToken: string, phoneNumber: string, role?: UserRole, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/phone/verify',
      { phoneNumber, role, name },
      {
        headers: {
          'X-Firebase-Token': idToken,
        },
      }
    )
    return response.data
  },

  /**
   * Google sign-in verification - idToken goes in body
   */
  verifyGoogle: async (idToken: string, role?: UserRole, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google/verify', {
      idToken,
      role,
      name,
    })
    return response.data
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  /**
   * Get current authenticated user
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },
}
