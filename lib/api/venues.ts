import { apiClient } from './client'

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  state?: string
  pincode?: string
  coordinates?: {
    lat: number
    lng: number
  }
  capacity?: number
  venueType?: string
  amenities?: string[]
  images?: string[]
  owner: {
    id: string
    name?: string
    profilePicture?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateVenueInput {
  name: string
  address: string
  city: string
  state?: string
  pincode?: string
  coordinates?: {
    lat: number
    lng: number
  }
  capacity?: number
  venueType?: string
  amenities?: string[]
  images?: string[]
}

export interface UpdateVenueInput extends Partial<CreateVenueInput> {}

export const venuesApi = {
  /**
   * Create a new venue
   */
  create: (data: CreateVenueInput) =>
    apiClient.post<Venue>('/venues', data),

  /**
   * Get my venues (for clients)
   */
  getMyVenues: () =>
    apiClient.get<Venue[]>('/venues/my'),

  /**
   * Get venue by ID
   */
  getById: (id: string) =>
    apiClient.get<Venue>(`/venues/${id}`),

  /**
   * Update venue
   */
  update: (id: string, data: UpdateVenueInput) =>
    apiClient.put<Venue>(`/venues/${id}`, data),

  /**
   * Delete venue
   */
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/venues/${id}`),

  /**
   * Search venues
   */
  search: (params?: { q?: string; city?: string }) =>
    apiClient.get<Venue[]>('/venues/search', { params }),
}
