'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  PlusCircle,
  FileText,
  User,
  Settings,
  LogOut,
  Music2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers'
import { useAtom } from 'jotai'
import { isSidebarCollapsedAtom } from '@/lib/atoms'
import { Avatar } from '@/components/ui'

const artistNavItems = [
  { href: '/artist', icon: Home, label: 'Dashboard' },
  { href: '/artist/discover', icon: Search, label: 'Discover Gigs' },
  { href: '/artist/bids', icon: FileText, label: 'My Bids' },
  { href: '/artist/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/artist/reviews', icon: Star, label: 'Reviews' },
  { href: '/artist/profile', icon: User, label: 'Profile' },
]

const clientNavItems = [
  { href: '/client', icon: Home, label: 'Dashboard' },
  { href: '/client/gigs/new', icon: PlusCircle, label: 'Post Gig' },
  { href: '/client/gigs', icon: FileText, label: 'My Gigs' },
  { href: '/client/artists', icon: Search, label: 'Find Artists' },
  { href: '/client/profile', icon: User, label: 'Profile' },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useAtom(isSidebarCollapsedAtom)

  const navItems = user?.role?.toUpperCase() === 'ARTIST' ? artistNavItems : clientNavItems

  // Don't show sidebar on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null
  }

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen flex-col bg-surface border-r border-white/5 z-40 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg gradient-text">ZTS Music</span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-foreground-muted hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // More specific active state logic to prevent multiple items being selected
          let isActive = false
          if (item.href === '/artist' || item.href === '/client') {
            // Dashboard: only exact match
            isActive = pathname === item.href
          } else if (item.href === '/client/gigs/new') {
            // Post Gig: exact match
            isActive = pathname === item.href
          } else if (item.href === '/client/gigs') {
            // My Gigs: match /client/gigs but NOT /client/gigs/new
            isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && !pathname.includes('/new'))
          } else {
            // Other items: exact match or starts with + /
            isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          }
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                isActive
                  ? 'text-violet-400'
                  : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-violet-500/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 shrink-0 relative z-10" />
              {!isCollapsed && (
                <span className="font-medium relative z-10">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-surface-elevated',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <Avatar
            src={user?.profilePicture}
            name={user?.name}
            size={isCollapsed ? 'md' : 'sm'}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-foreground-muted capitalize">
                {user?.role?.toLowerCase()}
              </p>
            </div>
          )}
        </div>

        {/* Settings & Logout */}
        <div className={cn('mt-2 space-y-1', isCollapsed && 'flex flex-col items-center')}>
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors',
              isCollapsed && 'px-2 justify-center'
            )}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">Settings</span>}
          </Link>
          <button
            onClick={logout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors',
              isCollapsed && 'px-2 justify-center'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
