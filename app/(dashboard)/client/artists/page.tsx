'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Music,
  Filter,
  X,
} from 'lucide-react'
import { Card, Button, Input, Avatar, Badge } from '@/components/ui'
import { usersApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'SOLO_VOCALIST', label: 'Solo Vocalist' },
  { value: 'LIVE_BAND', label: 'Live Band' },
  { value: 'DJ', label: 'DJ' },
  { value: 'ACOUSTIC', label: 'Acoustic' },
  { value: 'CLASSICAL', label: 'Classical' },
  { value: 'JAZZ', label: 'Jazz' },
  { value: 'ELECTRONIC', label: 'Electronic' },
  { value: 'TRADITIONAL', label: 'Traditional' },
]

export default function FindArtistsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch artists
  const { data: artistsData, isLoading } = useQuery({
    queryKey: ['artists', { search, category, city }],
    queryFn: () => usersApi.getArtists({ search, category, city }),
  })

  const artists = artistsData?.data || []

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setCity('')
  }

  const hasActiveFilters = search || category || city

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">Find Artists</h1>
        <p className="text-foreground-muted">
          Discover talented artists for your events
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search artists by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="elevated" className="p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border bg-surface-elevated px-4 py-3 text-foreground border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    City
                  </label>
                  <Input
                    placeholder="Any city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" onClick={clearFilters} leftIcon={<X className="w-4 h-4" />}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="elevated" className="p-4 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-surface-elevated" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-surface-elevated rounded mb-2" />
                    <div className="h-3 w-16 bg-surface-elevated rounded" />
                  </div>
                </div>
                <div className="h-16 bg-surface-elevated rounded" />
              </Card>
            ))}
          </div>
        ) : artists.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <Link key={artist.id} href={`/client/artists/${artist.id}`}>
                <Card variant="elevated" hoverable className="p-4 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={artist.profilePicture}
                      name={artist.artistProfile?.stageName || artist.name}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {artist.artistProfile?.stageName || artist.name}
                      </h3>
                      {artist.artistProfile?.location?.city && (
                        <p className="text-sm text-foreground-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {artist.artistProfile.location.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {artist.artistProfile?.bio && (
                    <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
                      {artist.artistProfile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {artist.artistProfile?.genres?.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" size="sm">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    {artist.artistProfile?.baseRate && (
                      <span className="text-sm text-foreground-muted">
                        From {formatCurrency(artist.artistProfile.baseRate)}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="default" className="p-12 text-center">
            <Music className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No artists found</h3>
            <p className="text-foreground-muted mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to find more artists'
                : 'No artists have registered yet'}
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </motion.div>
    </div>
  )
}
