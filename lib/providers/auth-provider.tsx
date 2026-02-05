'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAtom } from 'jotai'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userAtom, accessTokenAtom, refreshTokenAtom } from '@/lib/atoms'
import { authApi } from '@/lib/api'
import type { User, AuthTokens } from '@/lib/types'

// Cookie helpers for middleware compatibility
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (tokens: AuthTokens, user: User) => void
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Helper to get clean token from localStorage
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  const clean = token.replace(/^"|"$/g, '')
  if (!clean || clean === 'null' || clean === 'undefined') return null
  return clean
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useAtom(userAtom)
  const [, setAccessToken] = useAtom(accessTokenAtom)
  const [, setRefreshToken] = useAtom(refreshTokenAtom)
  const queryClient = useQueryClient()

  // Track hydration state - start with null (unknown), then true/false after mount
  const [tokenState, setTokenState] = useState<'checking' | 'has-token' | 'no-token'>('checking')

  // Hydration effect - runs once on mount to check for token
  useEffect(() => {
    const token = getStoredToken()
    setTokenState(token ? 'has-token' : 'no-token')
  }, [])

  // Only fetch user if we have determined there's a token
  const shouldFetchUser = tokenState === 'has-token'

  const { refetch, isFetching, isPending } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const userData = await authApi.getMe()
        setUser(userData)
        return userData
      } catch {
        // Token is invalid, clear everything
        clearAuth()
        return null
      }
    },
    enabled: shouldFetchUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  })

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    deleteCookie('accessToken')
    deleteCookie('refreshToken')
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    setTokenState('no-token')
  }, [setAccessToken, setRefreshToken, setUser])

  const login = useCallback(
    (tokens: AuthTokens, userData: User) => {
      const cleanAccessToken = tokens.accessToken?.replace(/^"|"$/g, '') || ''
      const cleanRefreshToken = tokens.refreshToken?.replace(/^"|"$/g, '') || ''

      localStorage.setItem('accessToken', cleanAccessToken)
      localStorage.setItem('refreshToken', cleanRefreshToken)
      setCookie('accessToken', cleanAccessToken)
      setCookie('refreshToken', cleanRefreshToken)
      setAccessToken(cleanAccessToken)
      setRefreshToken(cleanRefreshToken)
      setUser(userData)
      setTokenState('has-token')
    },
    [setAccessToken, setRefreshToken, setUser]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore errors during logout
    } finally {
      clearAuth()
      queryClient.clear()
    }
  }, [clearAuth, queryClient])

  const refetchUser = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Calculate loading state
  // - Loading if we're still checking for a token (initial mount)
  // - Loading if we have a token and the query is pending (initial fetch only)
  // Note: Don't use isFetching here - it becomes true during refetch and causes infinite loading
  const isLoading = tokenState === 'checking' || (tokenState === 'has-token' && isPending && !user)

  // Authenticated if we have a user
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
