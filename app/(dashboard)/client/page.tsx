'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Calendar,
  Users,
  TrendingUp,
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Card, Badge, StatusBadge, Button, GigCardSkeleton } from '@/components/ui'
import { gigsApi } from '@/lib/api'
import { formatCurrency, formatEventDate, getCategoryIcon } from '@/lib/utils'
import { useAuth } from '@/lib/providers'
import type { GigListItem } from '@/lib/types'

export default function ClientDashboardPage() {
  const { user } = useAuth()

  // Fetch my gigs
  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ['gigs', 'my'],
    queryFn: () => gigsApi.getMyGigs(),
  })

  const myGigs: GigListItem[] = gigsData?.data || []
  const activeGigs = myGigs.filter((g) => ['LIVE', 'BOOKED'].includes(g.status))
  const draftGigs = myGigs.filter((g) => g.status === 'DRAFT')
  const completedGigs = myGigs.filter((g) => g.status === 'COMPLETED')
  const bookedGigs = myGigs.filter((g) => g.status === 'BOOKED')

  // Calculate total bids across all gigs
  const totalBids = myGigs.reduce((sum, gig) => sum + (gig.applicationCount || 0), 0)

  // Dynamic stats based on real data
  const stats = [
    {
      label: 'Active Gigs',
      value: activeGigs.length.toString(),
      change: `${activeGigs.filter(g => (g.applicationCount || 0) > 0).length} receiving bids`,
      icon: FileText,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      label: 'Total Bids',
      value: totalBids.toString(),
      change: 'Across all gigs',
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Upcoming Events',
      value: bookedGigs.length.toString(),
      change: bookedGigs.length > 0 ? 'Artist confirmed' : 'No upcoming',
      icon: Calendar,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Completed',
      value: completedGigs.length.toString(),
      change: 'Past events',
      icon: TrendingUp,
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-foreground-muted">
            Manage your gigs and find the perfect artist
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Plus className="w-5 h-5" />}
          asChild
        >
          <Link href="/client/gigs/new">Post a Gig</Link>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
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

      {/* Draft Gigs Alert */}
      {draftGigs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card variant="gradient" className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  You have {draftGigs.length} draft gig{draftGigs.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-foreground-muted">
                  Publish them to start receiving bids from artists
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/client/gigs?status=DRAFT">View Drafts</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Gigs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Active Gigs</h2>
            <Link
              href="/client/gigs"
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
            ) : activeGigs.length > 0 ? (
              activeGigs.slice(0, 3).map((gig) => (
                <Link key={gig.id} href={`/client/gigs/${gig.id}`}>
                  <Card variant="elevated" hoverable className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center text-2xl shrink-0">
                        {getCategoryIcon(gig.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {gig.title}
                          </h3>
                          <StatusBadge status={gig.status} />
                        </div>
                        <p className="text-sm text-foreground-muted mb-2">
                          {gig.city} • {formatEventDate(gig.eventDate)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold gradient-text">
                            {formatCurrency(gig.budget?.max)}
                          </span>
                          <Badge variant="primary" size="sm">
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
                <FileText className="w-10 h-10 text-foreground-subtle mx-auto mb-3" />
                <p className="text-foreground-muted mb-3">No active gigs</p>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/client/gigs/new">Post a Gig</Link>
                </Button>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Gigs with Bids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Gigs with Bids</h2>
          </div>

          <div className="space-y-3">
            {activeGigs.filter(g => (g.applicationCount || 0) > 0).length > 0 ? (
              activeGigs
                .filter(g => (g.applicationCount || 0) > 0)
                .slice(0, 3)
                .map((gig) => (
                  <Link key={gig.id} href={`/client/gigs/${gig.id}`}>
                    <Card variant="elevated" hoverable className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center text-xl shrink-0">
                          {getCategoryIcon(gig.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{gig.title}</p>
                          <p className="text-sm text-foreground-muted">
                            {gig.city} • {formatEventDate(gig.eventDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="primary" size="sm">
                            {gig.applicationCount} bids
                          </Badge>
                          <p className="text-xs text-foreground-subtle mt-1">Review now</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
            ) : (
              <Card variant="default" className="p-6 text-center">
                <Users className="w-8 h-8 text-foreground-subtle mx-auto mb-2" />
                <p className="text-foreground-muted text-sm">No bids yet</p>
                <p className="text-foreground-subtle text-xs mt-1">
                  Post a gig to start receiving bids
                </p>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      {bookedGigs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          </div>

          <div className="space-y-3">
            {bookedGigs.slice(0, 2).map((gig) => (
              <Link key={gig.id} href={`/client/gigs/${gig.id}`}>
                <Card variant="gradient" hoverable className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-2xl">
                      {getCategoryIcon(gig.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{gig.title}</h3>
                      <p className="text-sm text-foreground-muted mb-2">
                        {gig.venueName}, {gig.city} • {formatEventDate(gig.eventDate)}
                      </p>
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Artist Confirmed
                      </Badge>
                    </div>
                    <Button variant="primary" size="sm">
                      View
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
