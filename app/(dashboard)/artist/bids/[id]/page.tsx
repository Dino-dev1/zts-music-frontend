'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Pencil,
} from 'lucide-react'
import { Card, Button, Badge, Avatar } from '@/components/ui'
import { bidsApi, gigsApi } from '@/lib/api'
import { cn, formatCurrency, formatDate, formatTime, getCategoryIcon, getCategoryLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

const statusConfig = {
  PENDING: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle, label: 'Pending' },
  ACCEPTED: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Accepted' },
  REJECTED: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: XCircle, label: 'Rejected' },
  WITHDRAWN: { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: XCircle, label: 'Withdrawn' },
}

export default function BidDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const bidId = params.id as string

  const { data: bid, isLoading: bidLoading } = useQuery({
    queryKey: ['bid', bidId],
    queryFn: () => bidsApi.getById(bidId),
    enabled: !!bidId,
  })

  const { data: gig, isLoading: gigLoading } = useQuery({
    queryKey: ['gig', bid?.gigId],
    queryFn: () => gigsApi.getById(bid!.gigId),
    enabled: !!bid?.gigId,
  })

  const withdrawMutation = useMutation({
    mutationFn: () => bidsApi.withdraw(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid', bidId] })
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
      toast.success('Bid withdrawn successfully')
    },
    onError: () => {
      toast.error('Failed to withdraw bid')
    },
  })

  const isLoading = bidLoading || gigLoading

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-surface-elevated rounded-lg" />
          <div className="h-64 bg-surface-elevated rounded-2xl" />
          <div className="h-48 bg-surface-elevated rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!bid) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-xl font-semibold text-foreground mb-2">Bid not found</h1>
        <p className="text-foreground-muted mb-6">This bid may have been deleted or you don&apos;t have access.</p>
        <Button variant="primary" onClick={() => router.push('/artist/bids')}>
          Back to My Bids
        </Button>
      </div>
    )
  }

  const status = statusConfig[bid.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = status.icon

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Bid Details</h1>
            <p className="text-foreground-muted">
              Submitted {formatDate(bid.createdAt)}
            </p>
          </div>
          <Badge className={cn('border', status.color)}>
            <StatusIcon className="w-3.5 h-3.5 mr-1" />
            {status.label}
          </Badge>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Bid Amount Card */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Bid</h2>
            {bid.status === 'PENDING' && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Pencil className="w-4 h-4" />}
              >
                Edit Bid
              </Button>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-violet-400">
              {formatCurrency(bid.amount)}
            </span>
            {gig && (
              <span className="text-foreground-muted">
                / {formatCurrency(gig.budget.max)} max
              </span>
            )}
          </div>

          {bid.proposal && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-medium text-foreground-muted mb-2">Your Proposal</h3>
              <p className="text-foreground">{bid.proposal}</p>
            </div>
          )}

          {bid.status === 'ACCEPTED' && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Congratulations! You got the gig!</span>
              </div>
              <p className="text-sm text-emerald-400/80 mt-1">
                The client has accepted your bid. Contact them to discuss the details.
              </p>
            </div>
          )}

          {bid.status === 'REJECTED' && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Bid Not Selected</span>
              </div>
              <p className="text-sm text-rose-400/80 mt-1">
                The client chose another artist for this gig. Keep bidding on other opportunities!
              </p>
            </div>
          )}
        </Card>

        {/* Gig Details Card */}
        {gig && (
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Gig Details</h2>
              <Link href={`/artist/gigs/${gig.id}`}>
                <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
                  View Gig
                </Button>
              </Link>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl shrink-0">
                {getCategoryIcon(gig.category)}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{gig.title}</h3>
                <p className="text-sm text-foreground-muted">{getCategoryLabel(gig.category)}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 text-foreground-muted">
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>{formatDate(gig.eventTiming.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground-muted">
                <Clock className="w-4 h-4 text-violet-400" />
                <span>
                  {formatTime(gig.eventTiming.startTime)} - {formatTime(gig.eventTiming.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-foreground-muted">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span>{gig.venue.name}, {gig.venue.city}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground-muted">
                <DollarSign className="w-4 h-4 text-violet-400" />
                <span>Budget: {formatCurrency(gig.budget.max)}</span>
              </div>
            </div>

            <p className="mt-4 text-foreground-muted line-clamp-3">{gig.description}</p>
          </Card>
        )}

        {/* Client Info (if bid is accepted) */}
        {bid.status === 'ACCEPTED' && gig?.client && (
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client Contact</h2>
            <div className="flex items-center gap-4">
              <Avatar src={gig.client.profilePicture} name={gig.client.name} size="lg" />
              <div>
                <p className="font-semibold text-foreground">{gig.client.name}</p>
                {gig.client.email && (
                  <p className="text-sm text-foreground-muted">{gig.client.email}</p>
                )}
                {gig.client.phone && (
                  <p className="text-sm text-foreground-muted">{gig.client.phone}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        {bid.status === 'PENDING' && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => withdrawMutation.mutate()}
              isLoading={withdrawMutation.isPending}
            >
              Withdraw Bid
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
