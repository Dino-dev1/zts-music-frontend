'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Star, MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react'
import { Card, Avatar } from '@/components/ui'
import { reviewsApi } from '@/lib/api'
import { useAuth } from '@/lib/providers'
import { cn, formatDate } from '@/lib/utils'
import type { Review, ReviewStats } from '@/lib/types'

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-foreground-subtle'
          )}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const percentage = (value / max) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground-muted w-32">{label}</span>
      <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground w-8">{value.toFixed(1)}</span>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card variant="elevated" className="p-5">
      <div className="flex items-start gap-4">
        <Avatar name={review.reviewerId} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{review.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-sm text-foreground-muted">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-foreground-subtle">
              <Calendar className="w-3 h-3" />
              {formatDate(review.createdAt)}
            </div>
          </div>

          <p className="mt-3 text-foreground-muted">{review.comment}</p>

          {/* Rating breakdown */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(review.ratings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-foreground-subtle capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-foreground">{value}/5</span>
              </div>
            ))}
          </div>

          {review.wouldRecommend && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              Would recommend
            </div>
          )}

          {review.response && (
            <div className="mt-4 p-3 rounded-xl bg-surface border border-white/5">
              <p className="text-sm text-foreground-muted">
                <span className="font-medium text-foreground">Your response: </span>
                {review.response}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function ArtistReviewsPage() {
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['reviews', 'stats', user?.id],
    queryFn: () => reviewsApi.getUserStats(user!.id),
    enabled: !!user?.id,
  })

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', 'user', user?.id],
    queryFn: () => reviewsApi.getUserReviews(user!.id),
    enabled: !!user?.id,
  })

  const isLoading = statsLoading || reviewsLoading
  const reviewsList = reviews?.data || []
  const reviewStats = stats?.data

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">My Reviews</h1>
        <p className="text-foreground-muted">See what clients are saying about your performances</p>
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card variant="elevated" className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-surface rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-surface rounded w-3/4" />
                <div className="h-4 bg-surface rounded w-1/2" />
              </div>
            </div>
          ) : reviewStats && reviewStats.totalReviews > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">
                    {(reviewStats.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-foreground-muted">/ 5</span>
                </div>
                <div className="flex justify-center md:justify-start mt-2">
                  <StarRating rating={reviewStats.averageRating ?? 0} size="md" />
                </div>
                <p className="text-foreground-muted mt-2">
                  Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                </p>
                {(reviewStats.recommendationRate ?? 0) > 0 && (
                  <div className="flex items-center gap-2 justify-center md:justify-start mt-3 text-emerald-400">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">
                      {Math.round(reviewStats.recommendationRate)}% would recommend
                    </span>
                  </div>
                )}
              </div>

              {/* Rating Breakdown */}
              {reviewStats.ratings && (
                <div className="space-y-3">
                  <RatingBar label="Professionalism" value={reviewStats.ratings.professionalism ?? 0} />
                  <RatingBar label="Quality" value={reviewStats.ratings.quality ?? 0} />
                  <RatingBar label="Value" value={reviewStats.ratings.value ?? 0} />
                  <RatingBar label="Communication" value={reviewStats.ratings.communication ?? 0} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No reviews yet</h3>
              <p className="text-foreground-muted text-sm">
                Complete gigs to start receiving reviews from clients
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Reviews List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">All Reviews</h2>
          <span className="text-sm text-foreground-muted">
            {reviewsList.length} review{reviewsList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="elevated" className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface rounded w-1/3" />
                      <div className="h-3 bg-surface rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-surface rounded w-full" />
                  <div className="h-4 bg-surface rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : reviewsList.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {reviewsList.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card variant="elevated" className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No reviews yet</h3>
            <p className="text-foreground-muted text-sm max-w-sm mx-auto">
              After completing gigs, clients can leave reviews about their experience working with you.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
