'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsString } from 'nuqs'
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Badge, StatusBadge, GigCardSkeleton, EmptyState } from '@/components/ui'
import { gigsApi } from '@/lib/api'
import { formatCurrency, formatEventDate, getCategoryIcon, cn } from '@/lib/utils'
import type { GigStatus, GigListItem } from '@/lib/types'

const statusTabs: { value: GigStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { value: 'all', label: 'All', icon: FileText },
  { value: 'DRAFT', label: 'Draft', icon: Clock },
  { value: 'LIVE', label: 'Live', icon: CheckCircle2 },
  { value: 'BOOKED', label: 'Booked', icon: Users },
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle },
]

export default function MyGigsPage() {
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('all'))

  const { data, isLoading } = useQuery({
    queryKey: ['gigs', 'my', status],
    queryFn: () =>
      gigsApi.getMyGigs({
        status: status !== 'all' ? (status as GigStatus) : undefined,
      }),
  })

  const gigs: GigListItem[] = data?.data || []

  // Group gigs by status for summary
  const statusCounts = {
    all: gigs.length,
    DRAFT: gigs.filter((g) => g.status === 'DRAFT').length,
    LIVE: gigs.filter((g) => g.status === 'LIVE').length,
    BOOKED: gigs.filter((g) => g.status === 'BOOKED').length,
    CLOSED: gigs.filter((g) => g.status === 'CLOSED').length,
    COMPLETED: gigs.filter((g) => g.status === 'COMPLETED').length,
    CANCELLED: gigs.filter((g) => g.status === 'CANCELLED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">My Gigs</h1>
          <p className="text-foreground-muted">Manage your posted gigs</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          asChild
        >
          <Link href="/client/gigs/new">Post New Gig</Link>
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {statusTabs.map((tab) => {
          const Icon = tab.icon
          const count = statusCounts[tab.value as keyof typeof statusCounts] || 0

          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value === 'all' ? null : tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all',
                status === tab.value || (status === null && tab.value === 'all')
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-surface border border-white/5 text-foreground-muted hover:text-foreground hover:border-white/10'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-md',
                  status === tab.value || (status === null && tab.value === 'all')
                    ? 'bg-violet-500/30'
                    : 'bg-white/5'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Gigs List */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GigCardSkeleton key={i} />
          ))}
        </div>
      ) : gigs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gigs.map((gig, i) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/client/gigs/${gig.id}`}>
                <Card variant="elevated" hoverable padding="none" className="overflow-hidden">
                  {/* Category Banner */}
                  <div className="h-24 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-orange-500/20 flex items-center justify-center relative">
                    <span className="text-4xl">{getCategoryIcon(gig.category)}</span>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={gig.status} />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                      {gig.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-foreground-muted mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{gig.city}</span>
                      <span>•</span>
                      <Calendar className="w-3 h-3" />
                      <span>{formatEventDate(gig.eventDate)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div>
                        <p className="text-xs text-foreground-muted">Budget</p>
                        <p className="text-lg font-bold gradient-text">
                          {formatCurrency(gig.budget?.max)}
                        </p>
                      </div>
                      {gig.status === 'LIVE' && (
                        <Badge variant="primary">
                          <Users className="w-3 h-3 mr-1" />
                          {gig.bidsCount ?? gig.applicationCount ?? 0} bids
                        </Badge>
                      )}
                      {gig.status === 'DRAFT' && (
                        <Button variant="primary" size="sm">
                          Publish
                        </Button>
                      )}
                      {gig.status === 'BOOKED' && (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title={status === 'all' ? 'No gigs yet' : `No ${status?.toLowerCase()} gigs`}
          description={
            status === 'all'
              ? "You haven't posted any gigs yet. Create your first gig to start receiving bids from artists!"
              : `You don't have any ${status?.toLowerCase()} gigs at the moment.`
          }
          action={
            status === 'all'
              ? { label: 'Post Your First Gig', onClick: () => (window.location.href = '/client/gigs/new') }
              : undefined
          }
        />
      )}
    </div>
  )
}
