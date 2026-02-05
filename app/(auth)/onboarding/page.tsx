'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Check,
  Building2,
  Music,
} from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { usersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refetchUser } = useAuth()

  // Get role from URL param first, then user role, default to artist
  const urlRole = searchParams.get('role')
  const role = urlRole
    ? urlRole.toLowerCase()
    : (user?.role?.toLowerCase() || 'artist')

  const isArtist = role === 'artist'

  const [step, setStep] = useState(1)
  // Artist: 1 step, Client: 2 steps
  const totalSteps = isArtist ? 1 : 2

  // Artist form state - simplified to just essentials
  const [artistData, setArtistData] = useState({
    stageName: '',
    city: '',
    yearsOfExperience: 0,
  })

  // Client form state
  const [clientData, setClientData] = useState({
    companyName: '',
    city: '',
  })

  const artistMutation = useMutation({
    mutationFn: () =>
      usersApi.updateArtistProfile({
        stageName: artistData.stageName,
        yearsOfExperience: artistData.yearsOfExperience,
        location: { city: artistData.city },
        // Defaults for optional fields - can be filled later
        bio: '',
        genres: [],
        performanceTypes: [],
        instruments: [],
        baseRate: 0,
        languages: ['ENGLISH'],
        onboardingComplete: true,
      }),
    onSuccess: async () => {
      await refetchUser()
      toast.success('Profile setup complete!')
      router.push('/artist')
    },
    onError: () => {
      toast.error('Failed to save profile')
    },
  })

  const clientMutation = useMutation({
    mutationFn: () =>
      usersApi.updateProfile({
        companyName: clientData.companyName,
        city: clientData.city,
      }),
    onSuccess: async () => {
      await refetchUser()
      toast.success('Profile setup complete!')
      router.push('/client')
    },
    onError: () => {
      toast.error('Failed to save profile')
    },
  })

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Submit
      if (isArtist) {
        artistMutation.mutate()
      } else {
        clientMutation.mutate()
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    if (isArtist) {
      return artistData.stageName.length >= 2 && artistData.city.length >= 2
    } else {
      switch (step) {
        case 1:
          return clientData.city.length >= 2
        case 2:
          return true
        default:
          return false
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to ZTS Music
          </h1>
          <p className="text-foreground-muted">
            {isArtist
              ? "Let's set up your artist profile"
              : "Let's set up your account"}
          </p>
        </motion.div>

        {/* Progress - only show for client (multi-step) */}
        {totalSteps > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i + 1 === step
                    ? 'w-8 bg-violet-500'
                    : i + 1 < step
                    ? 'w-2 bg-violet-500'
                    : 'w-2 bg-white/10'
                )}
              />
            ))}
          </div>
        )}

        {/* Form Card */}
        <Card variant="elevated" className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isArtist ? (
                // Artist: Single step with essentials
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                      <Music className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Quick Setup
                    </h2>
                    <p className="text-foreground-muted text-sm mt-1">
                      Just the basics to get you started
                    </p>
                  </div>

                  <Input
                    label="Stage Name"
                    placeholder="Your artist or band name"
                    value={artistData.stageName}
                    onChange={(e) =>
                      setArtistData({ ...artistData, stageName: e.target.value })
                    }
                  />

                  <Input
                    label="City"
                    placeholder="Where are you based?"
                    value={artistData.city}
                    onChange={(e) =>
                      setArtistData({ ...artistData, city: e.target.value })
                    }
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />

                  <Input
                    label="Years of Experience"
                    type="number"
                    placeholder="0"
                    value={artistData.yearsOfExperience || ''}
                    onChange={(e) =>
                      setArtistData({
                        ...artistData,
                        yearsOfExperience: parseInt(e.target.value) || 0,
                      })
                    }
                  />

                  <p className="text-xs text-foreground-subtle text-center">
                    You can complete your full profile later with genres, instruments, and more.
                  </p>
                </div>
              ) : (
                <>
                  {/* Client Step 1: Basic Info */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
                          <Building2 className="w-8 h-8 text-fuchsia-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">
                          Your Organization
                        </h2>
                        <p className="text-foreground-muted text-sm mt-1">
                          Tell us about your company or venue
                        </p>
                      </div>

                      <Input
                        label="Company / Venue Name (optional)"
                        placeholder="Your organization name"
                        value={clientData.companyName}
                        onChange={(e) =>
                          setClientData({ ...clientData, companyName: e.target.value })
                        }
                        leftIcon={<Building2 className="w-4 h-4" />}
                      />

                      <Input
                        label="City"
                        placeholder="Where are you located?"
                        value={clientData.city}
                        onChange={(e) =>
                          setClientData({ ...clientData, city: e.target.value })
                        }
                        leftIcon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                  )}

                  {/* Client Step 2: Confirmation */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">
                          You&apos;re All Set!
                        </h2>
                        <p className="text-foreground-muted text-sm mt-1">
                          Ready to start posting gigs
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface border border-white/5">
                        <h3 className="font-medium text-foreground mb-2">What you can do:</h3>
                        <ul className="space-y-2 text-sm text-foreground-muted">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Post gigs and receive bids from artists
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Browse artist profiles and portfolios
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Secure payments through escrow
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            Leave reviews after events
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {totalSteps > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div /> // Spacer for single-step flow
            )}

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              isLoading={artistMutation.isPending || clientMutation.isPending}
              rightIcon={
                step < totalSteps ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )
              }
            >
              {step < totalSteps ? 'Continue' : "Let's Go"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
