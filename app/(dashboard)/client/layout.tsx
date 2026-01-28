'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/providers'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  // Check role (case-insensitive)
  const role = user?.role?.toUpperCase()
  const isClient = role === 'CLIENT'
  const isAdmin = role === 'ADMIN'
  const canAccess = isClient || isAdmin

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // If not a client or admin, redirect to artist dashboard
    if (!canAccess) {
      router.replace('/artist')
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
