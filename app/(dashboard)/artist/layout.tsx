'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/providers'

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  // Check role (case-insensitive)
  const role = user?.role?.toUpperCase()
  const isArtist = role === 'ARTIST'
  const isAdmin = role === 'ADMIN'
  const canAccess = isArtist || isAdmin

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // If not an artist or admin, redirect to client dashboard
    if (!canAccess) {
      router.replace('/client')
    }
  }, [canAccess, isLoading, isAuthenticated, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If not authorized, show nothing while redirecting
  if (!isAuthenticated || !canAccess) {
    return null
  }

  return <>{children}</>
}
