import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ApiError, ApiResponse } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * Custom API Error class with user-friendly messages
 */
export class ApiClientError extends Error {
  public statusCode: number
  public code: string
  public details?: unknown

  constructor(message: string, statusCode: number, code: string = 'UNKNOWN_ERROR', details?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }

  /**
   * Create from Axios error with user-friendly message
   */
  static fromAxiosError(error: AxiosError<ApiError>): ApiClientError {
    // Network errors (no response)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiClientError(
          'Request timed out. Please check your connection and try again.',
          0,
          'TIMEOUT'
        )
      }
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        return new ApiClientError(
          'Unable to connect to server. Please check if the backend is running.',
          0,
          'NETWORK_ERROR'
        )
      }
      return new ApiClientError(
        'Connection failed. Please check your internet connection.',
        0,
        'CONNECTION_ERROR'
      )
    }

    const status = error.response.status
    const data = error.response.data

    // Extract message from various response formats
    let serverMessage: string | null = null
    if (data?.message) {
      serverMessage = data.message
    } else if (typeof data?.error === 'string') {
      serverMessage = data.error
    } else if (data?.error?.message) {
      serverMessage = data.error.message
    } else if (typeof data === 'string') {
      serverMessage = data
    }

    // Map status codes to user-friendly messages
    switch (status) {
      case 400:
        return new ApiClientError(
          serverMessage || 'Invalid request. Please check your input and try again.',
          status,
          'BAD_REQUEST',
          data
        )
      case 401:
        return new ApiClientError(
          serverMessage || 'Authentication failed. Please sign in again.',
          status,
          'UNAUTHORIZED'
        )
      case 403:
        return new ApiClientError(
          serverMessage || 'You do not have permission to perform this action.',
          status,
          'FORBIDDEN'
        )
      case 404:
        return new ApiClientError(
          serverMessage || 'The requested resource was not found.',
          status,
          'NOT_FOUND'
        )
      case 409:
        return new ApiClientError(
          serverMessage || 'This action conflicts with existing data.',
          status,
          'CONFLICT'
        )
      case 422:
        return new ApiClientError(
          serverMessage || 'Validation failed. Please check your input.',
          status,
          'VALIDATION_ERROR',
          data
        )
      case 429:
        return new ApiClientError(
          'Too many requests. Please wait a moment and try again.',
          status,
          'RATE_LIMITED'
        )
      case 500:
        return new ApiClientError(
          'Server error. Our team has been notified. Please try again later.',
          status,
          'SERVER_ERROR'
        )
      case 502:
      case 503:
      case 504:
        return new ApiClientError(
          'Service temporarily unavailable. Please try again in a few moments.',
          status,
          'SERVICE_UNAVAILABLE'
        )
      default:
        return new ApiClientError(
          serverMessage || `Request failed (Error ${status}). Please try again.`,
          status,
          'UNKNOWN_ERROR',
          data
        )
    }
  }
}

// Cookie helper for middleware compatibility
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

class ApiClient {
  private client: AxiosInstance

  private clearAuthAndRedirect() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    deleteCookie('accessToken')
    deleteCookie('refreshToken')
    // Use setTimeout to allow the error to propagate before redirect
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          let token = localStorage.getItem('accessToken')
          // Clean token - remove quotes and validate
          if (token) {
            token = token.replace(/^"|"$/g, '')
          }
          // Only add Authorization header if token exists and is valid
          if (token && token !== 'null' && token !== 'undefined' && token.length > 0) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Handle 401 with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            let refreshToken = localStorage.getItem('refreshToken')
            // Clean refresh token
            if (refreshToken) {
              refreshToken = refreshToken.replace(/^"|"$/g, '')
            }

            if (refreshToken && refreshToken !== 'null' && refreshToken !== 'undefined') {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              })

              // Handle response - clean tokens before storing
              const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data
              const cleanAccessToken = accessToken?.replace(/^"|"$/g, '') || ''
              const cleanRefreshToken = newRefreshToken?.replace(/^"|"$/g, '') || ''

              localStorage.setItem('accessToken', cleanAccessToken)
              setCookie('accessToken', cleanAccessToken)
              if (cleanRefreshToken) {
                localStorage.setItem('refreshToken', cleanRefreshToken)
                setCookie('refreshToken', cleanRefreshToken)
              }

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${cleanAccessToken}`
              }

              return this.client(originalRequest)
            } else {
              // No refresh token available - clear auth and throw
              this.clearAuthAndRedirect()
              throw new ApiClientError('Session expired. Please sign in again.', 401, 'SESSION_EXPIRED')
            }
          } catch (refreshError) {
            // Refresh failed - clear auth and throw
            this.clearAuthAndRedirect()
            throw new ApiClientError('Session expired. Please sign in again.', 401, 'SESSION_EXPIRED')
          }
        }

        // Transform to user-friendly error
        throw ApiClientError.fromAxiosError(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
