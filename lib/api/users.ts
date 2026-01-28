import { apiClient } from './client'
import type { User, UpdateArtistProfileInput } from '@/lib/types'

export const usersApi = {
  getMe: async () => {
    return apiClient.get<User>('/users/me')
  },

  updateMe: async (data: Partial<User>) => {
    return apiClient.put<User>('/users/me', data)
  },

  // Alias for updateMe with clearer naming
  updateProfile: async (data: { name?: string; companyName?: string; city?: string }) => {
    return apiClient.put<User>('/users/me', data)
  },

  updateArtistProfile: async (data: UpdateArtistProfileInput) => {
    return apiClient.put<User>('/users/me/artist-profile', data)
  },

  getById: async (id: string) => {
    return apiClient.get<User>(`/users/${id}`)
  },

  searchArtists: async (params?: {
    city?: string
    genres?: string[]
    performanceTypes?: string[]
    minRate?: number
    maxRate?: number
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v))
          } else {
            searchParams.append(key, String(value))
          }
        }
      })
    }
    return apiClient.get<User[]>(`/users/artists?${searchParams.toString()}`)
  },

  // Get artists with search/filter support
  getArtists: async (params?: {
    search?: string
    category?: string
    city?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      // Map frontend params to backend params
      if (params.search) searchParams.append('query', params.search)
      if (params.category) searchParams.append('performanceType', params.category)
      if (params.city) searchParams.append('city', params.city)
      if (params.page) searchParams.append('page', String(params.page))
      if (params.limit) searchParams.append('limit', String(params.limit))
    }
    return apiClient.get<User[]>(`/users/artists?${searchParams.toString()}`)
  },
}
