import { apiClient } from './client'
import type { CheckIn } from '@/lib/types'

export const checkinApi = {
  generateOtp: async (gigId: string) => {
    return apiClient.post<CheckIn>(`/checkin/generate-otp/${gigId}`)
  },

  getOtp: async (gigId: string) => {
    return apiClient.get<CheckIn>(`/checkin/otp/${gigId}`)
  },

  verifyOtp: async (gigId: string, otp: string) => {
    return apiClient.post<CheckIn>('/checkin/verify-otp', { gigId, otp })
  },

  endEvent: async (gigId: string) => {
    return apiClient.post<CheckIn>(`/checkin/end-event/${gigId}`)
  },

  getStatus: async (gigId: string) => {
    return apiClient.get<CheckIn>(`/checkin/status/${gigId}`)
  },
}
