// User Types
// NOTE: Backend expects lowercase values for role enum
export type UserRole = 'artist' | 'client' | 'admin'

export interface ClientProfile {
  companyName?: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
  totalGigsPosted?: number
}

export interface User {
  id: string
  firebaseUid: string
  email?: string
  phone?: string
  phoneNumber?: string
  name: string
  role: UserRole
  profilePicture?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  artistProfile?: ArtistProfile
  clientProfile?: ClientProfile
}

export interface ArtistProfile {
  stageName: string
  bio?: string
  performanceTypes: string[]
  genres: string[]
  instruments: string[]
  languages: string[]
  yearsOfExperience: number
  baseRate: number
  location: {
    city: string
    geoPoint?: {
      type: 'Point'
      coordinates: [number, number]
    }
  }
  videoLinks?: string[]
  audioSamples?: string[]
  instagramHandle?: string
  onboardingComplete: boolean
}

// Gig Types
export type GigStatus = 'DRAFT' | 'LIVE' | 'BOOKED' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'

export type GigCategory =
  | 'SOLO_VOCALIST'
  | 'LIVE_BAND'
  | 'DJ'
  | 'ACOUSTIC'
  | 'CLASSICAL'
  | 'JAZZ'
  | 'ELECTRONIC'
  | 'TRADITIONAL'
  | 'COVER_BAND'
  | 'ORIGINAL_ARTIST'

export interface Gig {
  id: string
  clientId: string
  client?: User
  title: string
  description: string
  category: GigCategory
  budget: {
    min: number
    max: number
    currency: string
  }
  venue: {
    name: string
    address: string
    city: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  eventTiming: {
    date: string
    startTime: string
    endTime: string
  }
  requirements?: string
  status: GigStatus
  acceptedBid?: string
  acceptedArtist?: string
  bidsCount?: number
  createdAt: string
  updatedAt: string
}

// Flattened gig type returned by list endpoints (search, my gigs, etc.)
export interface GigListItem {
  id: string
  title: string
  category: GigCategory
  budget: {
    min: number
    max: number
    currency: string
  }
  city: string
  venueName: string
  eventDate: string
  startTime: string
  durationMinutes: number
  status: GigStatus
  applicationCount: number
  createdAt: string
}

// Bid Types
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface Bid {
  id: string
  gigId: string
  gig?: Gig
  artistId: string
  artist?: User
  amount: number
  proposal: string
  status: BidStatus
  createdAt: string
  updatedAt: string
}

// Transaction Types
export type TransactionStatus =
  | 'PENDING_PAYMENT'
  | 'ESCROW'
  | 'RELEASED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED'

export interface Transaction {
  id: string
  gigId: string
  bidId: string
  clientId: string
  artistId: string
  amount: number
  platformFee: number
  artistPayout: number
  status: TransactionStatus
  paymentId?: string
  createdAt: string
  updatedAt: string
}

// Check-in Types
export interface CheckIn {
  id: string
  gigId: string
  otp: string
  isVerified: boolean
  checkedInAt?: string
  eventEndedByClient: boolean
  eventEndedByArtist: boolean
  eventEndedAt?: string
}

// Review Types
export type ReviewType = 'CLIENT_TO_ARTIST' | 'ARTIST_TO_CLIENT'

export interface Review {
  id: string
  gigId: string
  reviewerId: string
  revieweeId: string
  type: ReviewType
  rating: number
  ratings: {
    professionalism: number
    quality: number
    value: number
    communication: number
  }
  title: string
  comment: string
  wouldRecommend: boolean
  response?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratings: {
    professionalism: number
    quality: number
    value: number
    communication: number
  }
  recommendationRate: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

// Pagination metadata from backend
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Backend paginated response structure (nested data)
export interface PaginatedData<T> {
  data: T[]
  meta: PaginationMeta
}

// Full paginated API response
export interface PaginatedResponse<T> {
  success: boolean
  data: PaginatedData<T>
  message?: string
  timestamp?: string
}

// Backend error response formats (supports multiple formats)
export interface ApiError {
  success: false
  message?: string
  error?: string | {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// Auth Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Backend returns tokens at top level, not nested
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// Filter Types
export interface GigFilters {
  city?: string
  category?: GigCategory
  status?: GigStatus
  minBudget?: number
  maxBudget?: number
  date?: string
  lat?: number
  lng?: number
  distance?: number
  page?: number
  limit?: number
}

export interface BidFilters {
  status?: BidStatus
  page?: number
  limit?: number
}

// Form Types
export interface CreateGigInput {
  title: string
  description: string
  category: GigCategory
  budget: {
    min: number
    max: number
    currency: string
  }
  venue: {
    name: string
    address: string
    city: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  eventTiming: {
    date: string
    startTime: string
    endTime: string
  }
  requirements?: string
}

export interface CreateBidInput {
  gigId: string
  amount: number
  proposal: string
}

export interface UpdateBidInput {
  amount?: number
  proposal?: string
}

export interface UpdateGigInput extends Partial<CreateGigInput> {
  id?: string
}

export interface UpdateArtistProfileInput {
  stageName: string
  bio?: string
  performanceTypes: string[]
  genres: string[]
  instruments: string[]
  languages: string[]
  yearsOfExperience: number
  baseRate: number
  location: {
    city: string
    geoPoint?: {
      type: 'Point'
      coordinates: [number, number]
    }
  }
  videoLinks?: string[]
  audioSamples?: string[]
  instagramHandle?: string
}

export interface CreateReviewInput {
  gigId: string
  rating: number
  ratings: {
    professionalism: number
    quality: number
    value: number
    communication: number
  }
  title: string
  comment: string
  wouldRecommend: boolean
}
