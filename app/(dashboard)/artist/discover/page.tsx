'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Input, Badge, StatusBadge, GigCardSkeleton, EmptyState } from '@/components/ui'
import { gigsApi } from '@/lib/api'
import { formatCurrency, formatEventDate, getCategoryIcon, getCategoryLabel, cn } from '@/lib/utils'
import type { GigCategory, GigListItem } from '@/lib/types'

const categories: GigCategory[] = [
  'SOLO_VOCALIST',
  'LIVE_BAND',
  'DJ',
  'ACOUSTIC',
  'CLASSICAL',
  'JAZZ',
  'ELECTRONIC',
  'TRADITIONAL',
  'COVER_BAND',
  'ORIGINAL_ARTIST',
]

export default function DiscoverGigsPage() {
  const [showFilters, setShowFilters] = useState(false)

  // URL state management with nuqs
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [city, setCity] = useQueryState('city', parseAsString)
  const [category, setCategory] = useQueryState('category', parseAsString)
  const [minBudget, setMinBudget] = useQueryState('minBudget', parseAsInteger)
  const [maxBudget, setMaxBudget] = useQueryState('maxBudget', parseAsInteger)
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  // Fetch gigs with filters
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['gigs', 'discover', { city, category, minBudget, maxBudget, page }],
    queryFn: () =>
      gigsApi.getAll({
        status: 'LIVE',
        city: city || undefined,
        category: category as GigCategory | undefined,
        minBudget: minBudget || undefined,
        maxBudget: maxBudget || undefined,
        page,
        limit: 12,
      }),
  })

  // Fetch available cities
  const { data: citiesData } = useQuery({
    queryKey: ['gigs', 'cities'],
    queryFn: () => gigsApi.getCities(),
  })

  const gigs: GigListItem[] = data?.data || []
  const cities: string[] = citiesData || []

  const hasActiveFilters = city || category || minBudget || maxBudget

  const clearFilters = () => {
    setCity(null)
    setCategory(null)
    setMinBudget(null)
    setMaxBudget(null)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Discover Gigs</h1>
        <p className="text-foreground-muted">Find your next performance opportunity</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={search}
              onChange={(e) => setSearch(e.target.value || null)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-elevated border border-white/10 text-foreground placeholder:text-foreground-subtle focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-violet-500 text-xs flex items-center justify-center">
                {[city, category, minBudget, maxBudget].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card variant="elevated" className="p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* City Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                      <select
                        value={city || ''}
                        onChange={(e) => setCity(e.target.value || null)}
                        className="w-full h-10 pl-10 pr-8 rounded-lg bg-surface border border-white/10 text-foreground appearance-none cursor-pointer focus:border-violet-500 outline-none"
                      >
                        <option value="">All Cities</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category || ''}
                        onChange={(e) => setCategory(e.target.value || null)}
                        className="w-full h-10 px-4 pr-8 rounded-lg bg-surface border border-white/10 text-foreground appearance-none cursor-pointer focus:border-violet-500 outline-none"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {getCategoryIcon(cat)} {getCategoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                      Min Budget
                    </label>
                    <input
                      type="number"
                      placeholder="₹0"
                      value={minBudget || ''}
                      onChange={(e) => setMinBudget(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full h-10 px-4 rounded-lg bg-surface border border-white/10 text-foreground placeholder:text-foreground-subtle focus:border-violet-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                      Max Budget
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={maxBudget || ''}
                      onChange={(e) => setMaxBudget(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full h-10 px-4 rounded-lg bg-surface border border-white/10 text-foreground placeholder:text-foreground-subtle focus:border-violet-500 outline-none"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Pills */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2">
            {city && (
              <Badge
                variant="primary"
                className="cursor-pointer hover:bg-violet-500/30"
                onClick={() => setCity(null)}
              >
                {city} <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {category && (
              <Badge
                variant="primary"
                className="cursor-pointer hover:bg-violet-500/30"
                onClick={() => setCategory(null)}
              >
                {getCategoryLabel(category)} <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {(minBudget || maxBudget) && (
              <Badge
                variant="primary"
                className="cursor-pointer hover:bg-violet-500/30"
                onClick={() => {
                  setMinBudget(null)
                  setMaxBudget(null)
                }}
              >
                {minBudget ? formatCurrency(minBudget) : '₹0'} -{' '}
                {maxBudget ? formatCurrency(maxBudget) : 'No limit'}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GigCardSkeleton key={i} />
          ))}
        </div>
      ) : gigs.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">
              Showing {gigs.length} gigs
              {isFetching && <span className="ml-2 text-violet-400">Updating...</span>}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigs.map((gig, i) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/artist/gigs/${gig.id}`}>
                  <Card variant="elevated" hoverable padding="none" className="overflow-hidden">
                    {/* Category Banner */}
                    <div className="h-24 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-orange-500/20 flex items-center justify-center">
                      <span className="text-4xl">{getCategoryIcon(gig.category)}</span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {gig.title}
                        </h3>
                        <Badge variant="default" size="sm">
                          {gig.applicationCount || 0} bids
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-foreground-muted mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>{gig.city}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{formatEventDate(gig.eventDate)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div>
                          <p className="text-xs text-foreground-muted">Max Budget</p>
                          <p className="text-lg font-bold gradient-text">
                            {formatCurrency(gig.budget?.max)}
                          </p>
                        </div>
                        <Button variant="primary" size="sm">
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-foreground-muted">
              Page {page}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="No gigs found"
          description="Try adjusting your filters or check back later for new opportunities."
          action={
            hasActiveFilters
              ? { label: 'Clear Filters', onClick: clearFilters }
              : undefined
          }
        />
      )}
    </div>
  )
}
