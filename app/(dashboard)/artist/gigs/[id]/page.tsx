'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Send,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  AlertTriangle,
  Wifi,
} from 'lucide-react'
import { Card, Button, Badge, StatusBadge, Avatar, GigCardSkeleton } from '@/components/ui'
import { gigsApi, bidsApi } from '@/lib/api'
import {
  formatCurrency,
  formatEventDate,
  formatTime,
  formatDuration,
  getCategoryIcon,
  getCategoryLabel,
} from '@/lib/utils'
import { useBidsSocket } from '@/lib/hooks/use-bids-socket'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/providers'

export default function GigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const gigId = params.id as string

  const [bidAmount, setBidAmount] = useState('')
  const [proposal, setProposal] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)

  // Real-time WebSocket connection
  const { isConnected } = useBidsSocket({
    gigId,
    asArtist: true,
    onOutbid: (data) => {
      // Refresh bid status when outbid
      queryClient.invalidateQueries({ queryKey: ['bidStatus', gigId] })
    },
  })

  // Fetch gig details
  const { data: gig, isLoading } = useQuery({
    queryKey: ['gig', gigId],
    queryFn: () => gigsApi.getById(gigId),
    enabled: !!gigId,
  })

  // Fetch artist's bid status on this gig
  const { data: bidStatus } = useQuery({
    queryKey: ['bidStatus', gigId],
    queryFn: () => bidsApi.getMyBidStatus(gigId),
    enabled: !!gigId && !!user,
  })

  // Create bid mutation
  const createBidMutation = useMutation({
    mutationFn: () =>
      bidsApi.create({
        gigId,
        amount: parseInt(bidAmount),
        proposal,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['bidStatus', gigId] })
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      toast.success('Bid placed successfully!')
      setShowBidForm(false)
      setBidAmount('')
      setProposal('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place bid')
    },
  })

  // Update bid mutation (only if outbid)
  const updateBidMutation = useMutation({
    mutationFn: () =>
      bidsApi.updateAmount(bidStatus!.bidId!, parseInt(bidAmount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['bidStatus', gigId] })
      toast.success('Bid updated! You are now the lowest bidder.')
      setShowBidForm(false)
      setBidAmount('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bid')
    },
  })

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    // Validate against current lowest
    if (bidStatus?.currentLowest && amount >= bidStatus.currentLowest) {
      toast.error(`Your bid must be lower than ₹${bidStatus.currentLowest.toLocaleString()}`)
      return
    }

    // First bid validation
    if (!bidStatus?.currentLowest && gig && amount > gig.budget.max) {
      toast.error(`Bid must be within the budget (max ₹${gig.budget.max.toLocaleString()})`)
      return
    }

    // If updating existing bid
    if (bidStatus?.hasBid && bidStatus.isOutbid) {
      updateBidMutation.mutate()
    } else {
      // New bid - need proposal
      if (!proposal.trim() || proposal.length < 20) {
        toast.error('Please write a proposal (minimum 20 characters)')
        return
      }
      createBidMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <GigCardSkeleton />
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Gig not found</h2>
        <p className="text-foreground-muted mb-4">
          This gig may have been removed or doesn&apos;t exist.
        </p>
        <Button variant="primary" onClick={() => router.push('/artist/discover')}>
          Browse Gigs
        </Button>
      </div>
    )
  }

  const canBid = gig.status === 'LIVE' && (!bidStatus?.hasBid || bidStatus?.isOutbid)
  const isLeading = bidStatus?.hasBid && bidStatus?.isLowest

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discover
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card variant="elevated" className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center text-3xl shrink-0">
                  {getCategoryIcon(gig.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground mb-1">{gig.title}</h1>
                      <p className="text-foreground-muted">{getCategoryLabel(gig.category)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConnected && (
                        <Badge variant="success" size="sm">
                          <Wifi className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                      <StatusBadge status={gig.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface">
                <div>
                  <div className="flex items-center gap-2 text-foreground-muted mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Date</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatEventDate(gig.eventTiming.date)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-foreground-muted mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Time</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatTime(gig.eventTiming.startTime)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-foreground-muted mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Location</span>
                  </div>
                  <p className="font-medium text-foreground">{gig.venue.city}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-foreground-muted mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Bids</span>
                  </div>
                  <p className="font-medium text-foreground">{gig.bidsCount || 0} bids</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">About This Gig</h2>
              <p className="text-foreground-muted whitespace-pre-wrap">{gig.description}</p>
            </Card>
          </motion.div>

          {/* Venue Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Venue Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-violet-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{gig.venue.name}</p>
                    <p className="text-foreground-muted">{gig.venue.address}</p>
                    <p className="text-foreground-muted">{gig.venue.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-violet-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {formatTime(gig.eventTiming.startTime)} - {formatTime(gig.eventTiming.endTime)}
                    </p>
                    <p className="text-foreground-muted">
                      Duration: {formatDuration(gig.eventTiming.startTime, gig.eventTiming.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Client Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Posted By</h2>
              <div className="flex items-center gap-4">
                <Avatar
                  src={gig.client?.profilePicture}
                  name={gig.client?.name || 'Client'}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-foreground">{gig.client?.name || 'Client'}</p>
                  <div className="flex items-center gap-1 text-foreground-muted">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>4.8</span>
                    <span className="text-foreground-subtle">• 12 gigs posted</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Bid Section */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="sticky top-24"
          >
            <Card variant="gradient" className="p-6">
              {/* Budget Info */}
              <div className="text-center mb-4">
                <p className="text-sm text-foreground-muted mb-1">Max Budget</p>
                <p className="text-3xl font-bold gradient-text">
                  {formatCurrency(gig.budget.max)}
                </p>
              </div>

              {/* Current Lowest Bid */}
              {bidStatus?.currentLowest && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mb-1">
                    <TrendingDown className="w-3 h-3" />
                    Current Lowest Bid
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(bidStatus.currentLowest)}
                  </p>
                </div>
              )}

              {/* Your Bid Status */}
              {bidStatus?.hasBid && (
                <div className={`p-4 rounded-xl border mb-4 ${
                  isLeading
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isLeading ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-medium text-emerald-400">You&apos;re Leading!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span className="font-medium text-amber-400">You&apos;ve Been Outbid</span>
                      </>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(bidStatus.amount!)}
                  </p>
                  {bidStatus.isOutbid && (
                    <p className="text-xs text-amber-400 mt-1">
                      Bid lower to regain the lead!
                    </p>
                  )}
                </div>
              )}

              {/* Bid Form */}
              {gig.status === 'LIVE' ? (
                canBid ? (
                  showBidForm || bidStatus?.isOutbid ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                          {bidStatus?.isOutbid ? 'Your New Bid' : 'Your Bid Amount'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-foreground-muted">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder={bidStatus?.currentLowest
                              ? `Less than ${bidStatus.currentLowest}`
                              : gig.budget.max.toString()
                            }
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full h-14 pl-8 pr-4 rounded-xl bg-surface-elevated border border-white/10 text-xl font-bold text-foreground placeholder:text-foreground-subtle focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                          />
                        </div>
                        <p className="mt-1 text-xs text-foreground-subtle">
                          {bidStatus?.currentLowest
                            ? `Must be lower than ₹${bidStatus.currentLowest.toLocaleString()}`
                            : `Max budget: ${formatCurrency(gig.budget.max)}`
                          }
                        </p>
                      </div>

                      {/* Only show proposal for new bids */}
                      {!bidStatus?.hasBid && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-muted mb-2">
                            Your Proposal
                          </label>
                          <textarea
                            placeholder="Introduce yourself and explain why you're the perfect fit..."
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border bg-surface-elevated px-4 py-3 text-foreground placeholder:text-foreground-subtle border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none resize-none"
                          />
                          <p className="mt-1 text-xs text-foreground-subtle">
                            {proposal.length}/20 minimum characters
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {!bidStatus?.isOutbid && (
                          <Button
                            variant="ghost"
                            onClick={() => setShowBidForm(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          onClick={handlePlaceBid}
                          isLoading={createBidMutation.isPending || updateBidMutation.isPending}
                          leftIcon={<Send className="w-4 h-4" />}
                          className="flex-1"
                        >
                          {bidStatus?.isOutbid ? 'Update Bid' : 'Submit Bid'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={() => setShowBidForm(true)}
                    >
                      Place Your Bid
                    </Button>
                  )
                ) : bidStatus?.hasBid && !bidStatus?.isOutbid ? (
                  <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="font-medium text-emerald-400">
                      You&apos;re the leading bidder!
                    </p>
                    <p className="text-sm text-foreground-muted mt-1">
                      You&apos;ll be notified if someone outbids you.
                    </p>
                  </div>
                ) : null
              ) : (
                <div className="text-center p-4 rounded-xl bg-surface">
                  <AlertCircle className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                  <p className="text-foreground-muted">
                    This gig is no longer accepting bids
                  </p>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-foreground-subtle">
                  <strong className="text-foreground-muted">Reverse Auction:</strong> The lowest bid wins.
                  Once you bid, you can only update if someone bids lower than you.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
