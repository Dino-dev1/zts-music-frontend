import { apiClient } from './client'
import type { Bid, BidFilters, CreateBidInput, UpdateBidInput, BidStatus, PaginatedData } from '@/lib/types'

// Helper to build query string from filters
function buildQueryString(filters?: BidFilters): string {
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

// Extended bid type with outbid status
export interface BidWithStatus extends Bid {
  isOutbid?: boolean
}

// Artist's bid status on a gig
export interface ArtistBidStatus {
  hasBid: boolean
  bidId?: string
  amount?: number
  isOutbid?: boolean
  isLowest?: boolean
  currentLowest?: number
}

// Artist dashboard stats
export interface ArtistStats {
  activeBids: number
  upcomingGigs: number
  totalEarnings: number
  completedGigs: number
}

export const bidsApi = {
  /**
   * Create a new bid on a gig (reverse auction)
   * Must be lower than current lowest bid
   */
  create: async (data: CreateBidInput): Promise<Bid> => {
    const response = await apiClient.post<Bid>('/bids', data)
    return response.data
  },

  /**
   * Get current user's bids with optional filters
   * Includes isOutbid status for each bid
   */
  getMyBids: async (filters?: BidFilters): Promise<BidWithStatus[]> => {
    const response = await apiClient.get<BidWithStatus[]>(`/bids/my${buildQueryString(filters)}`)
    return response.data
  },

  /**
   * Get all bids for a specific gig (sorted by amount, lowest first)
   */
  getGigBids: async (gigId: string): Promise<Bid[]> => {
    const response = await apiClient.get<Bid[]>(`/bids/gig/${gigId}`)
    return response.data
  },

  /**
   * Get artist's bid status on a specific gig
   */
  getMyBidStatus: async (gigId: string): Promise<ArtistBidStatus> => {
    const response = await apiClient.get<ArtistBidStatus>(`/bids/gig/${gigId}/my-status`)
    return response.data
  },

  /**
   * Get a single bid by ID
   */
  getById: async (id: string): Promise<Bid> => {
    const response = await apiClient.get<Bid>(`/bids/${id}`)
    return response.data
  },

  /**
   * Update bid (amount and/or proposal)
   */
  update: async (id: string, data: UpdateBidInput): Promise<Bid> => {
    const response = await apiClient.patch<Bid>(`/bids/${id}`, data)
    return response.data
  },

  /**
   * Update bid amount (only if outbid, must bid lower than current lowest)
   */
  updateAmount: async (id: string, amount: number): Promise<Bid> => {
    const response = await apiClient.put<Bid>(`/bids/${id}/amount`, { amount })
    return response.data
  },

  /**
   * Withdraw a bid (only if outbid)
   */
  withdraw: async (id: string): Promise<void> => {
    await apiClient.delete(`/bids/${id}`)
  },

  /**
   * Accept a bid (for clients)
   */
  accept: async (id: string): Promise<Bid> => {
    const response = await apiClient.put<Bid>(`/bids/${id}/status`, { status: 'ACCEPTED' })
    return response.data
  },

  /**
   * Reject a bid (for clients)
   */
  reject: async (id: string): Promise<Bid> => {
    const response = await apiClient.put<Bid>(`/bids/${id}/status`, { status: 'REJECTED' })
    return response.data
  },

  /**
   * Get artist dashboard stats
   */
  getMyStats: async (): Promise<ArtistStats> => {
    const response = await apiClient.get<ArtistStats>('/bids/my/stats')
    return response.data
  },

  /**
   * Get accepted bids (upcoming events for artist)
   */
  getAcceptedBids: async (): Promise<BidWithStatus[]> => {
    const response = await apiClient.get<BidWithStatus[]>('/bids/my/accepted')
    return response.data
  },
}
