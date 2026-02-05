'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  MapPin,
  Music,
  Star,
  Edit2,
  Instagram,
  Youtube,
  Link as LinkIcon,
  Camera,
  Check,
  Loader2,
} from 'lucide-react'
import { Card, Button, Input, Badge, Avatar } from '@/components/ui'
import { usersApi } from '@/lib/api'
import { formatCurrency, cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers'
import toast from 'react-hot-toast'

// Backend enum values mapped to display labels
const genres = [
  { value: 'BOLLYWOOD', label: 'Bollywood' },
  { value: 'POP', label: 'Pop' },
  { value: 'ROCK', label: 'Rock' },
  { value: 'CLASSICAL', label: 'Classical' },
  { value: 'SUFI', label: 'Sufi' },
  { value: 'FOLK', label: 'Folk' },
  { value: 'JAZZ', label: 'Jazz' },
  { value: 'BLUES', label: 'Blues' },
  { value: 'HIP_HOP', label: 'Hip Hop' },
  { value: 'EDM', label: 'EDM' },
  { value: 'RETRO', label: 'Retro' },
  { value: 'GHAZAL', label: 'Ghazal' },
  { value: 'PUNJABI', label: 'Punjabi' },
  { value: 'INDIE', label: 'Indie' },
  { value: 'FUSION', label: 'Fusion' },
]

const performanceTypes = [
  { value: 'SOLO_SINGER', label: 'Solo' },
  { value: 'DUO', label: 'Duo' },
  { value: 'BAND', label: 'Band' },
  { value: 'ACOUSTIC', label: 'Acoustic' },
  { value: 'DJ', label: 'DJ' },
  { value: 'INSTRUMENTALIST', label: 'Instrumentalist' },
  { value: 'CLASSICAL', label: 'Classical' },
]

export default function ArtistProfilePage() {
  const { user, refetchUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profile = user?.artistProfile

  // Profile picture upload mutation
  const uploadPictureMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadProfilePicture(file),
    onSuccess: async () => {
      await refetchUser()
      toast.success('Profile picture updated!')
    },
    onError: () => {
      toast.error('Failed to upload profile picture')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      uploadPictureMutation.mutate(file)
    }
  }

  // Form state - use undefined instead of 0 for number fields so inputs show as empty
  const [formData, setFormData] = useState({
    stageName: profile?.stageName || '',
    bio: profile?.bio || '',
    genres: profile?.genres || [],
    performanceTypes: profile?.performanceTypes || [],
    yearsOfExperience: profile?.yearsOfExperience ?? undefined,
    baseRate: profile?.baseRate ?? undefined,
    city: profile?.location?.city || '',
    instagramHandle: profile?.instagramHandle || '',
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      usersApi.updateArtistProfile({
        ...formData,
        yearsOfExperience: formData.yearsOfExperience || 0,
        baseRate: formData.baseRate || 0,
        instruments: profile?.instruments || [],
        languages: profile?.languages || ['ENGLISH'],
        location: {
          city: formData.city,
        },
      }),
    onSuccess: async () => {
      await refetchUser()
      setIsEditing(false)
      toast.success('Profile updated!')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  const toggleGenre = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(value)
        ? prev.genres.filter((g) => g !== value)
        : [...prev.genres, value],
    }))
  }

  const togglePerformanceType = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      performanceTypes: prev.performanceTypes.includes(value)
        ? prev.performanceTypes.filter((t) => t !== value)
        : [...prev.performanceTypes, value],
    }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="gradient" className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar
                src={user?.profilePicture}
                name={user?.name}
                size="2xl"
                showBorder
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPictureMutation.isPending}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
              >
                {uploadPictureMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile?.stageName || user?.name}
                </h1>
                {user?.isVerified && (
                  <Badge variant="primary" size="sm">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-foreground-muted mb-4">
                {profile?.location?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  {profile?.yearsOfExperience || 0} years experience
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  4.9 (28 reviews)
                </span>
              </div>

              <p className="text-foreground-muted mb-4">
                {profile?.bio || 'No bio added yet'}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {profile?.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface text-foreground-muted hover:text-foreground transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    @{profile.instagramHandle}
                  </a>
                )}
              </div>
            </div>

            <Button
              variant={isEditing ? 'primary' : 'secondary'}
              onClick={() => (isEditing ? updateMutation.mutate() : setIsEditing(true))}
              isLoading={updateMutation.isPending}
              leftIcon={isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            >
              {isEditing ? 'Save' : 'Edit Profile'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Profile Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              Basic Info
            </h2>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label="Stage Name"
                    value={formData.stageName}
                    onChange={(e) =>
                      setFormData({ ...formData, stageName: e.target.value })
                    }
                    placeholder="Your stage name"
                  />
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Your city"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    value={formData.yearsOfExperience ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearsOfExperience: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                  />
                  <Input
                    label="Base Rate (per gig)"
                    type="number"
                    value={formData.baseRate ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseRate: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    leftIcon={<span className="text-foreground-muted">₹</span>}
                    placeholder="5000"
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Stage Name</span>
                    <span className="text-foreground font-medium">
                      {profile?.stageName || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Location</span>
                    <span className="text-foreground font-medium">
                      {profile?.location?.city || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Experience</span>
                    <span className="text-foreground font-medium">
                      {profile?.yearsOfExperience || 0} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Base Rate</span>
                    <span className="text-foreground font-medium gradient-text">
                      {formatCurrency(profile?.baseRate || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>

            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={6}
                className="w-full rounded-xl border bg-surface-elevated px-4 py-3 text-foreground placeholder:text-foreground-subtle border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none resize-none"
              />
            ) : (
              <p className="text-foreground-muted">
                {profile?.bio || 'No bio added yet. Tell potential clients about yourself!'}
              </p>
            )}
          </Card>
        </motion.div>

        {/* Genres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-violet-400" />
              Genres
            </h2>

            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const isSelected = isEditing
                  ? formData.genres.includes(genre.value)
                  : profile?.genres?.includes(genre.value)

                return (
                  <button
                    key={genre.value}
                    onClick={() => isEditing && toggleGenre(genre.value)}
                    disabled={!isEditing}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-surface text-foreground-muted border border-white/10',
                      isEditing && 'cursor-pointer hover:border-violet-500/50'
                    )}
                  >
                    {genre.label}
                  </button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Performance Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Performance Types</h2>

            <div className="flex flex-wrap gap-2">
              {performanceTypes.map((type) => {
                const isSelected = isEditing
                  ? formData.performanceTypes.includes(type.value)
                  : profile?.performanceTypes?.includes(type.value)

                return (
                  <button
                    key={type.value}
                    onClick={() => isEditing && togglePerformanceType(type.value)}
                    disabled={!isEditing}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'
                        : 'bg-surface text-foreground-muted border border-white/10',
                      isEditing && 'cursor-pointer hover:border-fuchsia-500/50'
                    )}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="md:col-span-2"
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-violet-400" />
              Social & Links
            </h2>

            {isEditing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Instagram Handle"
                  value={formData.instagramHandle}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramHandle: e.target.value })
                  }
                  placeholder="@yourhandle"
                  leftIcon={<Instagram className="w-4 h-4" />}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile?.instagramHandle ? (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-fuchsia-400" />
                    <span className="text-foreground">@{profile.instagramHandle}</span>
                  </a>
                ) : (
                  <p className="text-foreground-muted">
                    No social links added yet
                  </p>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Cancel Edit Button */}
      {isEditing && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel Editing
          </Button>
        </div>
      )}
    </div>
  )
}
