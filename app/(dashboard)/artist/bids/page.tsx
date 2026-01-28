'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsString } from 'nuqs'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Badge, StatusBadge, BidCardSkeleton, EmptyState } from '@/components/ui'
import { bidsApi } from '@/lib/api'
import { formatCurrency, formatEventDate, formatRelativeTime, cn } from '@/lib/utils'
import type { BidStatus } from '@/lib/types'

const statusTabs: { value: BidStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { value: 'all', label: 'All', icon: Clock },
  { value: 'PENDING', label: 'Pending', icon: Clock },
  { value: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { value: 'REJECTED', label: 'Rejected', icon: XCircle },
]

export default function MyBidsPage() {
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('all'))

  const { data, isLoading } = useQuery({
    queryKey: ['bids', 'my', status],
    queryFn: () =>
      bidsApi.getMyBids({
        status: status !== 'all' ? (status as BidStatus) : undefined,
      }),
  })

  const bids = data || []

  // Group bids by status for summary
  const statusCounts = {
    all: bids.length,
    PENDING: bids.filter((b) => b.status === 'PENDING').length,
    ACCEPTED: bids.filter((b) => b.status === 'ACCEPTED').length,
    REJECTED: bids.filter((b) => b.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">My Bids</h1>
        <p className="text-foreground-muted">Track your bid submissions and responses</p>
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

      {/* Bids List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <BidCardSkeleton key={i} />
          ))}
        </div>
      ) : bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((bid, i) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/artist/bids/${bid.id}`}>
                <Card variant="elevated" hoverable className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Gig Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {bid.gig?.title || 'Untitled Gig'}
                        </h3>
                        <StatusBadge status={bid.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-muted mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {bid.gig?.venue?.city || 'Location TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatEventDate(bid.gig?.eventTiming?.date || new Date().toISOString())}
                        </span>
                      </div>

                      <p className="text-sm text-foreground-subtle line-clamp-2">
                        {bid.proposal}
                      </p>
                    </div>

                    {/* Bid Amount & Actions */}
                    <div className="flex items-center gap-4 md:flex-col md:items-end">
                      <div className="text-right">
                        <p className="text-xs text-foreground-muted">Your Bid</p>
                        <p className="text-xl font-bold text-violet-400">
                          {formatCurrency(bid.amount)}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          Max: {formatCurrency(bid.gig?.budget?.max || 0)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ArrowUpRight className="w-4 h-4" />}
                      >
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-foreground-subtle">
                    <span>Submitted {formatRelativeTime(bid.createdAt)}</span>
                    {bid.status === 'ACCEPTED' && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        You got the gig!
                      </span>
                    )}
                    {bid.status === 'PENDING' && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Awaiting response
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-10 h-10" />}
          title={status === 'all' ? 'No bids yet' : `No ${status?.toLowerCase()} bids`}
          description={
            status === 'all'
              ? "You haven't placed any bids yet. Browse gigs to find your next opportunity!"
              : `You don't have any ${status?.toLowerCase()} bids at the moment.`
          }
          action={
            status === 'all'
              ? { label: 'Browse Gigs', onClick: () => (window.location.href = '/artist/discover') }
              : undefined
          }
        />
      )}
    </div>
  )
}
