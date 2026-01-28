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
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  Star,
  ExternalLink,
  Wifi,
  TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import {
  Card,
  Button,
  Badge,
  StatusBadge,
  Avatar,
  GigCardSkeleton,
  BidCardSkeleton,
  ConfirmModal,
} from '@/components/ui'
import { gigsApi, bidsApi } from '@/lib/api'
import {
  formatCurrency,
  formatEventDate,
  formatTime,
  formatRelativeTime,
  getCategoryIcon,
  getCategoryLabel,
} from '@/lib/utils'
import { useBidsSocket } from '@/lib/hooks/use-bids-socket'
import toast from 'react-hot-toast'

export default function ClientGigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const gigId = params.id as string

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null)

  // Real-time WebSocket connection
  const { isConnected } = useBidsSocket({
    gigId,
    onBidPlaced: (bid) => {
      toast(`New bid: ${formatCurrency(bid.amount)}`, { icon: '🎉' })
    },
    onBidUpdated: (bid) => {
      toast(`Bid updated: ${formatCurrency(bid.amount)}`, { icon: '📝' })
    },
  })

  // Fetch gig details
  const { data: gig, isLoading: gigLoading } = useQuery({
    queryKey: ['gig', gigId],
    queryFn: () => gigsApi.getById(gigId),
    enabled: !!gigId,
  })

  // Fetch bids for this gig
  const { data: bids = [], isLoading: bidsLoading } = useQuery({
    queryKey: ['bids', 'gig', gigId],
    queryFn: () => bidsApi.getGigBids(gigId),
    enabled: !!gigId,
  })

  const pendingBids = bids.filter((b) => b.status === 'PENDING')
  const lowestBid = pendingBids.length > 0 ? pendingBids[0] : null // Already sorted by amount

  // Publish gig mutation
  const publishMutation = useMutation({
    mutationFn: () => gigsApi.publish(gigId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig published! Artists can now bid.')
    },
    onError: () => {
      toast.error('Failed to publish gig')
    },
  })

  // Accept bid mutation
  const acceptBidMutation = useMutation({
    mutationFn: (bidId: string) => bidsApi.accept(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['bids', 'gig', gigId] })
      toast.success('Bid accepted! The artist has been notified.')
      setAcceptingBidId(null)
    },
    onError: () => {
      toast.error('Failed to accept bid')
      setAcceptingBidId(null)
    },
  })

  // Delete gig mutation
  const deleteMutation = useMutation({
    mutationFn: () => gigsApi.delete(gigId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig deleted')
      router.push('/client/gigs')
    },
    onError: () => {
      toast.error('Failed to delete gig')
    },
  })

  if (gigLoading) {
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
        <Button variant="primary" onClick={() => router.push('/client/gigs')}>
          Back to My Gigs
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Gigs
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card variant="elevated" className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center text-3xl shrink-0">
              {getCategoryIcon(gig.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{gig.title}</h1>
                <div className="flex items-center gap-2">
                  {gig.status === 'LIVE' && isConnected && (
                    <Badge variant="success" size="sm">
                      <Wifi className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                  <StatusBadge status={gig.status} />
                </div>
              </div>
              <p className="text-foreground-muted mb-4">{getCategoryLabel(gig.category)}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-foreground-muted">
                  <Calendar className="w-4 h-4" />
                  {formatEventDate(gig.eventTiming.date)}
                </div>
                <div className="flex items-center gap-1.5 text-foreground-muted">
                  <Clock className="w-4 h-4" />
                  {formatTime(gig.eventTiming.startTime)}
                </div>
                <div className="flex items-center gap-1.5 text-foreground-muted">
                  <MapPin className="w-4 h-4" />
                  {gig.venue.city}
                </div>
                <div className="flex items-center gap-1.5 text-violet-400 font-medium">
                  <Users className="w-4 h-4" />
                  {bids.length} bids
                </div>
              </div>
            </div>

            {/* Budget & Lowest Bid */}
            <div className="sm:text-right space-y-2">
              <div>
                <p className="text-xs text-foreground-muted mb-1">Max Budget</p>
                <p className="text-2xl font-bold gradient-text">
                  {formatCurrency(gig.budget.max)}
                </p>
              </div>
              {lowestBid && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Lowest Bid
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    {formatCurrency(lowestBid.amount)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/5">
            {gig.status === 'DRAFT' && (
              <>
                <Button
                  variant="primary"
                  onClick={() => publishMutation.mutate()}
                  isLoading={publishMutation.isPending}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Publish Gig
                </Button>
                <Button variant="secondary" leftIcon={<Edit2 className="w-4 h-4" />} asChild>
                  <Link href={`/client/gigs/${gigId}/edit`}>Edit</Link>
                </Button>
              </>
            )}
            {gig.status === 'LIVE' && (
              <Button variant="secondary" leftIcon={<Edit2 className="w-4 h-4" />} asChild>
                <Link href={`/client/gigs/${gigId}/edit`}>Edit Gig</Link>
              </Button>
            )}
            {gig.status === 'BOOKED' && gig.acceptedArtist && (
              <Button variant="primary" asChild>
                <Link href={`/client/gigs/${gigId}/manage`}>Manage Event</Link>
              </Button>
            )}
            {['DRAFT', 'LIVE'].includes(gig.status) && (
              <Button
                variant="ghost"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Bids Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Bids Received ({bids.length})
            {gig.status === 'LIVE' && (
              <span className="text-xs text-foreground-muted font-normal">
                (Lowest bid wins)
              </span>
            )}
          </h2>
          {gig.status === 'LIVE' && pendingBids.length > 0 && (
            <Badge variant="primary">
              {pendingBids.length} active
            </Badge>
          )}
        </div>

        {bidsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
                <Card
                  variant={bid.status === 'ACCEPTED' ? 'gradient' : i === 0 ? 'elevated' : 'default'}
                  className={`p-4 ${i === 0 && bid.status === 'PENDING' ? 'ring-2 ring-emerald-500/50' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Artist Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar
                        src={bid.artist?.profilePicture}
                        name={bid.artist?.name || 'Artist'}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {bid.artist?.artistProfile?.stageName || bid.artist?.name || 'Artist'}
                          </h3>
                          {i === 0 && bid.status === 'PENDING' && (
                            <Badge variant="success" size="sm">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Lowest
                            </Badge>
                          )}
                          <StatusBadge status={bid.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>4.9</span>
                          <span>•</span>
                          <span>{bid.artist?.artistProfile?.yearsOfExperience || 0} yrs exp</span>
                        </div>
                        {bid.proposal && (
                          <p className="text-sm text-foreground-muted line-clamp-2">
                            {bid.proposal}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bid Amount & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-4">
                      <div className="text-right">
                        <p className="text-xs text-foreground-muted">Bid Amount</p>
                        <p className={`text-2xl font-bold ${i === 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
                          {formatCurrency(bid.amount)}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {formatRelativeTime(bid.createdAt)}
                        </p>
                      </div>

                      {gig.status === 'LIVE' && bid.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setAcceptingBidId(bid.id)}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                          >
                            <Link href={`/artists/${bid.artistId}`}>
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      )}

                      {bid.status === 'ACCEPTED' && (
                        <Badge variant="success" size="lg">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card variant="default" className="p-12 text-center">
            <Users className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No bids yet</h3>
            <p className="text-foreground-muted max-w-sm mx-auto">
              {gig.status === 'DRAFT'
                ? 'Publish your gig to start receiving bids from artists.'
                : 'Artists will start bidding on your gig soon. Check back later!'}
            </p>
            {gig.status === 'DRAFT' && (
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => publishMutation.mutate()}
                isLoading={publishMutation.isPending}
              >
                Publish Now
              </Button>
            )}
          </Card>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete this gig?"
        description="This action cannot be undone. All bids will be cancelled."
        confirmText="Delete Gig"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Accept Bid Confirmation Modal */}
      <ConfirmModal
        isOpen={!!acceptingBidId}
        onClose={() => setAcceptingBidId(null)}
        onConfirm={() => acceptingBidId && acceptBidMutation.mutate(acceptingBidId)}
        title="Accept this bid?"
        description="This will book the artist for your gig. Other bids will be automatically rejected."
        confirmText="Accept Bid"
        variant="primary"
        isLoading={acceptBidMutation.isPending}
      />
    </div>
  )
}
