'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, PlusCircle, MessageSquare, User, Wallet, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers'

const artistNavItems = [
  { href: '/artist', icon: Home, label: 'Home' },
  { href: '/artist/discover', icon: Search, label: 'Gigs' },
  { href: '/artist/bids', icon: MessageSquare, label: 'Bids' },
  { href: '/artist/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/artist/profile', icon: User, label: 'Profile' },
]

const clientNavItems = [
  { href: '/client', icon: Home, label: 'Home' },
  { href: '/client/gigs/new', icon: PlusCircle, label: 'Post' },
  { href: '/client/gigs', icon: Search, label: 'My Gigs' },
  { href: '/client/artists', icon: Users, label: 'Artists' },
  { href: '/client/profile', icon: User, label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = user?.role?.toUpperCase() === 'ARTIST' ? artistNavItems : clientNavItems

  // Don't show nav on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div className="glass border-t border-white/10">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            // Special handling for exact matches and sub-routes
            // /client/gigs/new should match "Post Gig", not "My Gigs"
            let isActive = pathname === item.href
            if (!isActive && item.href !== '/artist' && item.href !== '/client') {
              // For non-home items, check if it's a sub-route but exclude /new paths for the gigs list
              if (item.href === '/client/gigs') {
                // My Gigs should only match /client/gigs exactly or /client/gigs/[id] but not /client/gigs/new
                isActive = pathname === '/client/gigs' || (pathname.startsWith('/client/gigs/') && !pathname.includes('/new'))
              } else {
                isActive = pathname.startsWith(item.href + '/')
              }
            }
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 h-14 rounded-lg transition-colors',
                  isActive ? 'text-violet-400' : 'text-foreground-muted hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-1 bg-violet-500/10 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[9px] mt-0.5 font-medium relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
