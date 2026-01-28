'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  ChevronDown,
  Plus,
  Building2,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { venuesApi, type Venue } from '@/lib/api/venues'
import { Input } from './input'

interface VenueData {
  name: string
  address: string
  city: string
}

interface VenueSelectProps {
  label?: string
  value?: VenueData
  onChange?: (venue: VenueData, isNew: boolean) => void
  error?: string
  hint?: string
  disabled?: boolean
}

export function VenueSelect({
  label,
  value,
  onChange,
  error,
  hint,
  disabled,
}: VenueSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'select' | 'new'>('select')
  const [newVenue, setNewVenue] = useState<VenueData>({
    name: '',
    address: '',
    city: '',
  })
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch user's saved venues
  const { data: venuesData, isLoading } = useQuery({
    queryKey: ['venues', 'my'],
    queryFn: () => venuesApi.getMyVenues(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const venues = venuesData?.data || []
  const hasVenues = venues.length > 0

  // Initialize mode based on whether user has saved venues
  useEffect(() => {
    if (!hasVenues && !isLoading) {
      setMode('new')
    }
  }, [hasVenues, isLoading])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelectVenue = (venue: Venue) => {
    onChange?.(
      {
        name: venue.name,
        address: venue.address,
        city: venue.city,
      },
      false // Not a new venue
    )
    setIsOpen(false)
  }

  const handleNewVenueSubmit = () => {
    if (newVenue.name && newVenue.city) {
      onChange?.(newVenue, true) // This is a new venue
      setIsOpen(false)
    }
  }

  const displayValue = value?.name
    ? `${value.name}${value.city ? `, ${value.city}` : ''}`
    : null

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground-muted mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-between w-full h-12 rounded-xl border bg-surface-elevated px-4',
            'text-foreground transition-all duration-200 outline-none',
            'border-white/10 hover:border-white/20',
            isOpen && 'border-violet-500 ring-2 ring-violet-500/20',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Select venue"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <MapPin className="w-4 h-4 text-foreground-subtle shrink-0" />
            <span className={cn('truncate', !displayValue && 'text-foreground-subtle')}>
              {displayValue || 'Select or add venue'}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-foreground-subtle transition-transform shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 mt-2 rounded-2xl overflow-hidden w-full',
                'bg-surface-elevated border border-white/10',
                'shadow-xl shadow-black/30'
              )}
            >
              {/* Mode Tabs */}
              {hasVenues && (
                <div className="flex border-b border-white/5">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className={cn(
                      'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                      mode === 'select'
                        ? 'text-violet-400 border-b-2 border-violet-500'
                        : 'text-foreground-muted hover:text-foreground'
                    )}
                  >
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Saved Venues
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('new')}
                    className={cn(
                      'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                      mode === 'new'
                        ? 'text-violet-400 border-b-2 border-violet-500'
                        : 'text-foreground-muted hover:text-foreground'
                    )}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    New Venue
                  </button>
                </div>
              )}

              {/* Content */}
              {mode === 'select' ? (
                <div className="max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    </div>
                  ) : venues.length > 0 ? (
                    venues.map((venue) => {
                      const isSelected =
                        value?.name === venue.name && value?.city === venue.city
                      return (
                        <button
                          key={venue.id}
                          type="button"
                          onClick={() => handleSelectVenue(venue)}
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors',
                            'hover:bg-violet-500/20 focus:outline-none focus:bg-violet-500/20',
                            isSelected && 'bg-violet-500/30'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {venue.name}
                              </p>
                              <p className="text-sm text-foreground-muted truncate">
                                {venue.address && `${venue.address}, `}
                                {venue.city}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-violet-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="py-8 text-center">
                      <Building2 className="w-10 h-10 text-foreground-subtle mx-auto mb-2" />
                      <p className="text-foreground-muted">No saved venues</p>
                      <button
                        type="button"
                        onClick={() => setMode('new')}
                        className="mt-2 text-sm text-violet-400 hover:text-violet-300"
                      >
                        Add a new venue
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <Input
                    label="Venue Name"
                    placeholder="e.g., Grand Ballroom"
                    value={newVenue.name}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, name: e.target.value })
                    }
                  />
                  <Input
                    label="Address"
                    placeholder="Full venue address"
                    value={newVenue.address}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, address: e.target.value })
                    }
                  />
                  <Input
                    label="City"
                    placeholder="e.g., Mumbai"
                    value={newVenue.city}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, city: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={handleNewVenueSubmit}
                    disabled={!newVenue.name || !newVenue.city}
                    className={cn(
                      'w-full py-3 rounded-xl font-medium transition-all',
                      'bg-violet-500 hover:bg-violet-600 text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    Use This Venue
                  </button>
                  <p className="text-xs text-foreground-subtle text-center">
                    This venue will be saved for future gigs
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-foreground-subtle">{hint}</p>}
    </div>
  )
}
