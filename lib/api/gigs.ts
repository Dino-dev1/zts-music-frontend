import { apiClient } from './client'
import type { Gig, GigListItem, GigFilters, CreateGigInput, PaginatedData } from '@/lib/types'

// Helper to build query string from filters
function buildQueryString(filters?: GigFilters): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export const gigsApi = {
  /**
   * Search/list all gigs with filters
   * Returns paginated data with gigs array and meta
   */
  getAll: async (filters?: GigFilters): Promise<PaginatedData<GigListItem>> => {
    const response = await apiClient.get<PaginatedData<GigListItem>>(`/gigs${buildQueryString(filters)}`)
    return response.data
  },

  /**
   * Search nearby gigs by location
   * Returns paginated data with gigs array and meta
   */
  getNearby: async (lat: number, lng: number, distance = 50000, filters?: GigFilters): Promise<PaginatedData<GigListItem>> => {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      distance: String(distance),
    })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const response = await apiClient.get<PaginatedData<GigListItem>>(`/gigs/nearby?${params.toString()}`)
    return response.data
  },

  /**
   * Get list of cities with available gigs
   */
  getCities: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/gigs/cities')
    return response.data
  },

  /**
   * Get single gig by ID
   */
  getById: async (id: string): Promise<Gig> => {
    const response = await apiClient.get<Gig>(`/gigs/${id}`)
    return response.data
  },

  /**
   * Create a new gig
   */
  create: async (data: CreateGigInput): Promise<Gig> => {
    const response = await apiClient.post<Gig>('/gigs', data)
    return response.data
  },

  /**
   * Update an existing gig
   */
  update: async (id: string, data: Partial<CreateGigInput>): Promise<Gig> => {
    const response = await apiClient.put<Gig>(`/gigs/${id}`, data)
    return response.data
  },

  /**
   * Delete a gig
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/gigs/${id}`)
  },

  /**
   * Publish a draft gig (DRAFT -> LIVE)
   */
  publish: async (id: string): Promise<Gig> => {
    const response = await apiClient.post<Gig>(`/gigs/${id}/publish`)
    return response.data
  },

  /**
   * Close a gig (stop accepting bids)
   */
  close: async (id: string): Promise<Gig> => {
    const response = await apiClient.post<Gig>(`/gigs/${id}/close`)
    return response.data
  },

  /**
   * Cancel a gig
   */
  cancel: async (id: string): Promise<Gig> => {
    const response = await apiClient.post<Gig>(`/gigs/${id}/cancel`)
    return response.data
  },

  /**
   * Complete a gig
   */
  complete: async (id: string): Promise<Gig> => {
    const response = await apiClient.post<Gig>(`/gigs/${id}/complete`)
    return response.data
  },

  /**
   * Get current user's gigs (for clients)
   * Returns paginated data with gigs array and meta
   */
  getMyGigs: async (filters?: GigFilters): Promise<PaginatedData<GigListItem>> => {
    const response = await apiClient.get<PaginatedData<GigListItem>>(`/gigs/my/list${buildQueryString(filters)}`)
    return response.data
  },
}
