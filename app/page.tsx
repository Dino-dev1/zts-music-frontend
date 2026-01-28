'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/providers'
import { Music2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  // Redirect based on auth state - wait until loading is complete
  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return

    if (isAuthenticated && user) {
      const role = user.role?.toUpperCase()
      if (role === 'ARTIST') {
        router.replace('/artist')
      } else if (role === 'CLIENT') {
        router.replace('/client')
      } else if (role === 'ADMIN') {
        router.replace('/admin')
      } else {
        // Unknown role, go to login
        router.replace('/login')
      }
    } else {
      // Not authenticated, go to login
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center animate-pulse-glow">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-400 rounded-full" />
          </div>
        </div>
        <p className="text-foreground-muted text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
