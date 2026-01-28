'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  DollarSign,
  FileText,
  Check,
  Sparkles,
} from 'lucide-react'
import { Card, Button, Input, DatePicker, TimePicker, VenueSelect } from '@/components/ui'
import { gigsApi, venuesApi } from '@/lib/api'
import { cn, getCategoryIcon, getCategoryLabel, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { GigCategory, CreateGigInput } from '@/lib/types'

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

const steps = [
  { id: 1, label: 'Category', shortLabel: 'Type' },
  { id: 2, label: 'Details', shortLabel: 'Info' },
  { id: 3, label: 'Venue & Time', shortLabel: 'When' },
  { id: 4, label: 'Budget', shortLabel: 'Price' },
]

// Helper to convert time string to minutes for comparison
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export default function CreateGigPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [isNewVenue, setIsNewVenue] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateGigInput>>({
    category: undefined,
    title: '',
    description: '',
    venue: {
      name: '',
      address: '',
      city: '',
    },
    eventTiming: {
      date: '',
      startTime: '',
      endTime: '',
    },
    budget: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    requirements: '',
  })

  // Save new venue mutation
  const saveVenueMutation = useMutation({
    mutationFn: (venueData: { name: string; address: string; city: string }) =>
      venuesApi.create(venueData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues', 'my'] })
    },
  })

  const createGigMutation = useMutation({
    mutationFn: (data: CreateGigInput) => gigsApi.create(data),
    onSuccess: async (response) => {
      // If the venue was new, save it for future use
      if (isNewVenue && formData.venue?.name && formData.venue?.city) {
        try {
          await saveVenueMutation.mutateAsync({
            name: formData.venue.name,
            address: formData.venue.address || '',
            city: formData.venue.city,
          })
        } catch {
          // Silently fail - venue saving is optional
        }
      }
      queryClient.invalidateQueries({ queryKey: ['gigs', 'my'] })
      toast.success('Gig created successfully!')
      router.push(`/client/gigs/${response.id}`)
    },
    onError: () => {
      toast.error('Failed to create gig. Please try again.')
    },
  })

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Submit the form
      createGigMutation.mutate(formData as CreateGigInput)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Check if times are valid (pure function, no side effects)
  const isTimesValid = (startTime?: string, endTime?: string): boolean => {
    if (!startTime || !endTime) return true // Not enough data to validate
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    return endMinutes > startMinutes && (endMinutes - startMinutes) >= 30
  }

  // Validate times and set error message (called on change only)
  const validateTimes = (startTime?: string, endTime?: string) => {
    if (startTime && endTime) {
      const startMinutes = timeToMinutes(startTime)
      const endMinutes = timeToMinutes(endTime)

      if (endMinutes <= startMinutes) {
        setTimeError('End time must be after start time')
        return
      }

      if (endMinutes - startMinutes < 30) {
        setTimeError('Event must be at least 30 minutes long')
        return
      }
    }
    setTimeError(null)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.category
      case 2:
        return formData.title && formData.title.length >= 5 && formData.description && formData.description.length >= 20
      case 3: {
        const hasVenue = formData.venue?.name && formData.venue?.city
        const hasDate = formData.eventTiming?.date
        const hasStartTime = formData.eventTiming?.startTime
        const hasEndTime = formData.eventTiming?.endTime
        const timesValid = isTimesValid(formData.eventTiming?.startTime, formData.eventTiming?.endTime)

        return hasVenue && hasDate && hasStartTime && hasEndTime && timesValid
      }
      case 4:
        return formData.budget?.max && formData.budget.max > 0
      default:
        return false
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-28 md:pb-6">
      {/* Header - Compact on mobile */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-3 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Post a New Gig</h1>
      </div>

      {/* Progress Steps - Mobile-first with connecting lines */}
      <div className="mb-6 px-4">
        <div className="relative flex items-center justify-between">
          {/* Connecting line background */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-surface-elevated" />

          {/* Progress line overlay - stops AT each step, not past it */}
          <motion.div
            className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{
              width: step === 1 ? 0 : `calc((100% - 32px) * ${(step - 1) / 3})`
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />

          {/* Step indicators */}
          {steps.map((s) => {
            const isActive = step === s.id
            const isCompleted = step > s.id

            return (
              <div key={s.id} className="relative flex flex-col items-center z-10">
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                    isCompleted
                      ? 'bg-violet-500 text-white'
                      : isActive
                      ? 'bg-violet-500 text-white ring-4 ring-violet-500/20'
                      : 'bg-surface-elevated text-foreground-muted border border-white/10'
                  )}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] mt-1.5 font-medium whitespace-nowrap',
                    isActive ? 'text-violet-400' : 'text-foreground-muted'
                  )}
                >
                  <span className="sm:hidden">{s.shortLabel}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Steps */}
      <Card variant="elevated" className="p-4 md:p-6" overflow="visible">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  What type of artist are you looking for?
                </h2>
                <p className="text-foreground-muted text-sm">
                  Select the category that best matches your event
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={cn(
                      'p-3 md:p-4 rounded-xl border-2 transition-all text-left',
                      'hover:border-violet-500/50 hover:bg-violet-500/5',
                      formData.category === cat
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 bg-surface'
                    )}
                  >
                    <span className="text-xl md:text-2xl mb-1 md:mb-2 block">{getCategoryIcon(cat)}</span>
                    <span className="text-xs md:text-sm font-medium text-foreground">
                      {getCategoryLabel(cat)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  Tell us about your gig
                </h2>
                <p className="text-foreground-muted text-sm">
                  Help artists understand your requirements
                </p>
              </div>

              <Input
                label="Gig Title"
                placeholder="e.g., Wedding Reception Live Band"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your event, atmosphere, and any specific requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border bg-surface-elevated px-3 py-2.5 md:px-4 md:py-3 text-foreground placeholder:text-foreground-subtle border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none resize-none text-sm md:text-base"
                />
                <p className="mt-1.5 text-xs text-foreground-subtle">
                  {formData.description?.length || 0} / 20 min characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Venue & Time */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  When and where?
                </h2>
                <p className="text-foreground-muted text-sm">
                  Set the venue and event timing
                </p>
              </div>

              <VenueSelect
                label="Event Venue"
                value={formData.venue}
                onChange={(venue, isNew) => {
                  setFormData({
                    ...formData,
                    venue: {
                      name: venue.name,
                      address: venue.address,
                      city: venue.city,
                    },
                  })
                  setIsNewVenue(isNew)
                }}
              />

              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
                <DatePicker
                  label="Event Date"
                  value={formData.eventTiming?.date}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      eventTiming: { ...formData.eventTiming!, date },
                    })
                  }
                  minDate={new Date()}
                  placeholder="Select date"
                />

                <div className="grid grid-cols-2 gap-3 md:contents">
                  <TimePicker
                    label="Start Time"
                    value={formData.eventTiming?.startTime}
                    onChange={(time) => {
                      setFormData({
                        ...formData,
                        eventTiming: { ...formData.eventTiming!, startTime: time },
                      })
                      if (formData.eventTiming?.endTime) {
                        validateTimes(time, formData.eventTiming.endTime)
                      }
                    }}
                    placeholder="Start"
                    step={15}
                  />

                  <TimePicker
                    label="End Time"
                    value={formData.eventTiming?.endTime}
                    onChange={(time) => {
                      setFormData({
                        ...formData,
                        eventTiming: { ...formData.eventTiming!, endTime: time },
                      })
                      if (formData.eventTiming?.startTime) {
                        validateTimes(formData.eventTiming.startTime, time)
                      }
                    }}
                    placeholder="End"
                    step={15}
                    error={timeError || undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  Set your maximum budget
                </h2>
                <p className="text-foreground-muted text-sm">
                  Artists will bid below this amount
                </p>
              </div>

              <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20">
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Maximum Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl text-foreground-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="10000"
                    value={formData.budget?.max || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: {
                          ...formData.budget!,
                          max: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full h-14 md:h-16 pl-9 md:pl-10 pr-4 rounded-xl bg-surface-elevated border border-white/10 text-2xl md:text-3xl font-bold text-foreground placeholder:text-foreground-subtle focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                  />
                </div>
                {formData.budget?.max ? (
                  <p className="mt-2 text-sm text-foreground-muted">
                    Artists will bid up to{' '}
                    <span className="font-semibold text-violet-400">
                      {formatCurrency(formData.budget.max)}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="p-3 md:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs md:text-sm text-amber-400">
                  <strong>Tip:</strong> A competitive budget attracts more quality bids.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation - Desktop only (inside card) */}
        <div className="hidden md:flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
            isLoading={createGigMutation.isPending}
            rightIcon={step < 4 ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          >
            {step < 4 ? 'Continue' : 'Create Gig'}
          </Button>
        </div>
      </Card>

      {/* Sticky Bottom Navigation - Mobile only */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden z-40">
        <div className="bg-background/80 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex-shrink-0"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              isLoading={createGigMutation.isPending}
              className="flex-1"
              rightIcon={step < 4 ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            >
              {step < 4 ? 'Continue' : 'Create Gig'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
