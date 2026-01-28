import { apiClient } from './client'
import type { Review, ReviewStats, CreateReviewInput } from '@/lib/types'

export const reviewsApi = {
  create: async (data: CreateReviewInput) => {
    return apiClient.post<Review>('/reviews', data)
  },

  getById: async (id: string) => {
    return apiClient.get<Review>(`/reviews/${id}`)
  },

  getUserReviews: async (userId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    return apiClient.get<Review[]>(`/reviews/user/${userId}?${searchParams.toString()}`)
  },

  getUserStats: async (userId: string) => {
    return apiClient.get<ReviewStats>(`/reviews/user/${userId}/stats`)
  },

  getGigReviews: async (gigId: string) => {
    return apiClient.get<Review[]>(`/reviews/gig/${gigId}`)
  },

  update: async (id: string, data: Partial<CreateReviewInput>) => {
    return apiClient.put<Review>(`/reviews/${id}`, data)
  },

  respond: async (id: string, response: string) => {
    return apiClient.post<Review>(`/reviews/${id}/response`, { response })
  },

  flag: async (id: string, reason: string) => {
    return apiClient.post(`/reviews/${id}/flag`, { reason })
  },

  delete: async (id: string) => {
    return apiClient.delete(`/reviews/${id}`)
  },
}
