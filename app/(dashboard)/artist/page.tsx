'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  Calendar,
  Wallet,
  Star,
  ArrowUpRight,
  Music,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Card, Badge, StatusBadge, Button, GigCardSkeleton } from '@/components/ui'
import { bidsApi, gigsApi } from '@/lib/api'
import { formatCurrency, formatEventDate, formatTime, getCategoryIcon } from '@/lib/utils'
import { useAuth } from '@/lib/providers'
import type { GigListItem } from '@/lib/types'

const quickActions = [
  { label: 'Browse Gigs', href: '/artist/discover', icon: Music },
  { label: 'My Bids', href: '/artist/bids', icon: Clock },
  { label: 'My Profile', href: '/artist/profile', icon: Star },
]

export default function ArtistDashboardPage() {
  const { user } = useAuth()

  // Fetch artist stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['bids', 'my', 'stats'],
    queryFn: () => bidsApi.getMyStats(),
  })

  // Fetch pending bids
  const { data: bidsData, isLoading: bidsLoading } = useQuery({
    queryKey: ['bids', 'my', 'PENDING'],
    queryFn: () => bidsApi.getMyBids({ status: 'PENDING' }),
  })

  // Fetch accepted bids (upcoming events)
  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['bids', 'my', 'accepted'],
    queryFn: () => bidsApi.getAcceptedBids(),
  })

  // Fetch recommended gigs
  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ['gigs', 'recommended'],
    queryFn: () => gigsApi.getAll({ status: 'LIVE', limit: 4 }),
  })

  const pendingBids = bidsData || []
  const recommendedGigs: GigListItem[] = gigsData?.data || []
  const acceptedGigs = upcomingEvents || []

  // Dynamic stats
  const statsCards = [
    {
      label: 'Active Bids',
      value: statsLoading ? '-' : (stats?.activeBids || 0).toString(),
      change: pendingBids.length > 0 ? `${pendingBids.filter(b => b.isOutbid).length} outbid` : 'No active bids',
      icon: TrendingUp,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      label: 'Upcoming Gigs',
      value: statsLoading ? '-' : (stats?.upcomingGigs || 0).toString(),
      change: acceptedGigs.length > 0 ? 'Confirmed bookings' : 'No upcoming gigs',
      icon: Calendar,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Total Earnings',
      value: statsLoading ? '-' : formatCurrency(stats?.totalEarnings || 0),
      change: `${stats?.completedGigs || 0} completed gigs`,
      icon: Wallet,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Completed',
      value: statsLoading ? '-' : (stats?.completedGigs || 0).toString(),
      change: 'Past performances',
      icon: Star,
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Artist'}!
        </h1>
        <p className="text-foreground-muted">
          Here&apos;s what&apos;s happening with your music career
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, i) => (
          <Card key={i} variant="elevated" className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-foreground-muted">{stat.label}</div>
            <div className="text-xs text-foreground-subtle mt-2">{stat.change}</div>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/5 hover:border-violet-500/30 transition-colors whitespace-nowrap"
          >
            <action.icon className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Bids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Bids</h2>
            <Link
              href="/artist/bids"
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {bidsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-shimmer h-24 rounded-xl" />
              ))
            ) : pendingBids.length > 0 ? (
              pendingBids.slice(0, 3).map((bid) => (
                <Link key={bid.id} href={`/artist/bids/${bid.id}`}>
                  <Card variant="elevated" hoverable className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                          {bid.gig?.title || 'Gig Title'}
                        </h3>
                        <p className="text-sm text-foreground-muted mb-2">
                          {bid.gig?.venue?.city || 'City'} • {formatEventDate(bid.gig?.eventTiming?.date || new Date().toISOString())}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-violet-400">
                            {formatCurrency(bid.amount)}
                          </span>
                          {bid.isOutbid ? (
                            <Badge variant="warning" size="sm">Outbid</Badge>
                          ) : (
                            <Badge variant="success" size="sm">Leading</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card variant="default" className="p-8 text-center">
                <Clock className="w-10 h-10 text-foreground-subtle mx-auto mb-3" />
                <p className="text-foreground-muted mb-3">No pending bids</p>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/artist/discover">Find Gigs</Link>
                </Button>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Recommended Gigs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recommended Gigs</h2>
            <Link
              href="/artist/discover"
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {gigsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <GigCardSkeleton key={i} />
              ))
            ) : recommendedGigs.length > 0 ? (
              recommendedGigs.slice(0, 3).map((gig) => (
                <Link key={gig.id} href={`/artist/gigs/${gig.id}`}>
                  <Card variant="elevated" hoverable className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center text-2xl shrink-0">
                        {getCategoryIcon(gig.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                          {gig.title}
                        </h3>
                        <p className="text-sm text-foreground-muted mb-2">
                          {gig.city} • {formatEventDate(gig.eventDate)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold gradient-text">
                            Up to {formatCurrency(gig.budget?.max)}
                          </span>
                          <Badge variant="default" size="sm">
                            {gig.applicationCount || 0} bids
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card variant="default" className="p-8 text-center">
                <Music className="w-10 h-10 text-foreground-subtle mx-auto mb-3" />
                <p className="text-foreground-muted">No gigs available</p>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          {acceptedGigs.length > 0 && (
            <Link
              href="/artist/bids?status=ACCEPTED"
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {eventsLoading ? (
          <div className="animate-shimmer h-32 rounded-xl" />
        ) : acceptedGigs.length > 0 ? (
          <div className="space-y-3">
            {acceptedGigs.slice(0, 2).map((bid) => (
              <Link key={bid.id} href={`/artist/bids/${bid.id}`}>
                <Card variant="gradient" hoverable className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-2xl">
                      {getCategoryIcon(bid.gig?.category || 'SOLO_VOCALIST')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {bid.gig?.title || 'Event'}
                      </h3>
                      <p className="text-sm text-foreground-muted mb-2">
                        {bid.gig?.venue?.name ? `${bid.gig.venue.name}, ` : ''}{bid.gig?.venue?.city || 'TBD'} • {bid.gig?.eventTiming?.date ? formatEventDate(bid.gig.eventTiming.date) : 'TBD'}
                        {bid.gig?.eventTiming?.startTime && ` at ${formatTime(bid.gig.eventTiming.startTime)}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Confirmed
                        </Badge>
                        <span className="text-sm font-medium text-violet-400">
                          {formatCurrency(bid.amount)}
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      View
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="default" className="p-8 text-center">
            <Calendar className="w-10 h-10 text-foreground-subtle mx-auto mb-3" />
            <p className="text-foreground-muted mb-1">No upcoming events</p>
            <p className="text-sm text-foreground-subtle">
              Your confirmed gigs will appear here
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
