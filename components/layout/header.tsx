'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers'
import { useAtom } from 'jotai'
import { isSidebarCollapsedAtom } from '@/lib/atoms'
import { Avatar } from '@/components/ui'

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isSidebarCollapsed] = useAtom(isSidebarCollapsedAtom)

  // Don't show header on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5',
        'transition-all duration-300',
        // Desktop: adjust for sidebar
        'md:left-64',
        isSidebarCollapsed && 'md:left-20',
        // Mobile: full width
        'left-0'
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side - Title */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-foreground-muted hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-foreground-muted hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
          </button>

          {/* User avatar (mobile only - desktop shows in sidebar) */}
          <Link href={user?.role === 'artist' ? '/artist/profile' : '/client/profile'} className="md:hidden">
            <Avatar src={user?.profilePicture} name={user?.name} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/artist': 'Dashboard',
    '/artist/discover': 'Discover Gigs',
    '/artist/bids': 'My Bids',
    '/artist/earnings': 'Earnings',
    '/artist/reviews': 'My Reviews',
    '/artist/profile': 'Profile',
    '/client': 'Dashboard',
    '/client/gigs': 'My Gigs',
    '/client/gigs/new': 'Post a Gig',
    '/client/artists': 'Find Artists',
    '/client/profile': 'Profile',
    '/settings': 'Settings',
  }

  // Check for dynamic routes
  if (pathname.match(/^\/artist\/gigs\/[^/]+$/)) return 'Gig Details'
  if (pathname.match(/^\/artist\/bids\/[^/]+$/)) return 'Bid Details'
  if (pathname.match(/^\/client\/gigs\/[^/]+$/)) return 'Gig Details'
  if (pathname.match(/^\/client\/gigs\/[^/]+\/bids$/)) return 'Review Bids'

  return routes[pathname] || 'ZTS Music'
}
