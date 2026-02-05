'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Star,
  Music,
  BadgeCheck,
  Instagram,
  ExternalLink,
  Play,
  Headphones,
} from 'lucide-react'
import { Card, Button, Badge, Avatar, ProfileSkeleton } from '@/components/ui'
import { usersApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function ArtistProfilePage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['user', artistId],
    queryFn: () => usersApi.getById(artistId),
    enabled: !!artistId,
  })

  // Extract artist from API response wrapper
  const artist = response?.data

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProfileSkeleton />
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Music className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Artist not found</h2>
        <p className="text-foreground-muted mb-4">
          This artist profile may have been removed or doesn&apos;t exist.
        </p>
        <Button variant="primary" onClick={() => router.push('/client/artists')}>
          Browse Artists
        </Button>
      </div>
    )
  }

  const profile = artist.artistProfile

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Artists
      </button>

      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="gradient" className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar
                src={artist.profilePicture}
                name={profile?.stageName || artist.name}
                size="xl"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">
                        {profile?.stageName || artist.name}
                      </h1>
                      {artist.isVerified && (
                        <BadgeCheck className="w-5 h-5 text-violet-400" />
                      )}
                    </div>
                    {profile?.location?.city && (
                      <p className="text-foreground-muted flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location.city}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-lg font-semibold">4.8</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 p-4 rounded-xl bg-surface/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {profile?.yearsOfExperience || 0}
                    </p>
                    <p className="text-xs text-foreground-muted">Years Exp.</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-2xl font-bold gradient-text">
                      {profile?.baseRate ? formatCurrency(profile.baseRate) : 'N/A'}
                    </p>
                    <p className="text-xs text-foreground-muted">Base Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-xs text-foreground-muted">Gigs Done</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bio Section */}
        {profile?.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
              <p className="text-foreground-muted whitespace-pre-wrap">{profile.bio}</p>
            </Card>
          </motion.div>
        )}

        {/* Genres & Performance Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card variant="elevated" className="p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Performance Types */}
              {profile?.performanceTypes && profile.performanceTypes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Performance Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.performanceTypes.map((type) => (
                      <Badge key={type} variant="primary" size="md">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Genres */}
              {profile?.genres && profile.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" size="md">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile?.languages && profile.languages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="default" size="md">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Instruments */}
              {profile?.instruments && profile.instruments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3">Instruments</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.instruments.map((inst) => (
                      <Badge key={inst} variant="default" size="md">
                        {inst}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Portfolio Section */}
        {((profile?.videoLinks && profile.videoLinks.length > 0) ||
          (profile?.audioSamples && profile.audioSamples.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Portfolio</h2>

              {/* Video Links */}
              {profile?.videoLinks && profile.videoLinks.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Videos
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profile.videoLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <Play className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="flex-1 text-sm text-foreground truncate">
                          Video {idx + 1}
                        </span>
                        <ExternalLink className="w-4 h-4 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Samples */}
              {profile?.audioSamples && profile.audioSamples.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    Audio Samples
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {profile.audioSamples.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-violet-400" />
                        </div>
                        <span className="flex-1 text-sm text-foreground truncate">
                          Audio {idx + 1}
                        </span>
                        <ExternalLink className="w-4 h-4 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Social Links */}
        {profile?.instagramHandle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Social</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-foreground hover:from-purple-500/30 hover:to-pink-500/30 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span>{profile.instagramHandle}</span>
                </a>
              </div>
            </Card>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card variant="gradient" className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Interested in booking {profile?.stageName || artist.name}?
                </h3>
                <p className="text-foreground-muted">
                  Post a gig and invite this artist to bid
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/client/gigs/new')}
              >
                Post a Gig
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
