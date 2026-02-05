'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  MapPin,
  Mail,
  Phone,
  Building2,
  Edit2,
  Camera,
  Check,
  Calendar,
  Loader2,
} from 'lucide-react'
import { Card, Button, Input, Badge, Avatar } from '@/components/ui'
import { usersApi, gigsApi } from '@/lib/api'
import { useAuth } from '@/lib/providers'
import toast from 'react-hot-toast'

export default function ClientProfilePage() {
  const { user, refetchUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Fetch gigs to calculate stats
  const { data: gigsData } = useQuery({
    queryKey: ['gigs', 'my'],
    queryFn: () => gigsApi.getMyGigs(),
  })

  const myGigs = gigsData?.data || []
  const totalGigs = myGigs.length
  const completedGigs = myGigs.filter((g) => g.status === 'COMPLETED').length
  const bookedGigs = myGigs.filter((g) => g.status === 'BOOKED').length

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    companyName: user?.clientProfile?.companyName || '',
    city: user?.clientProfile?.location?.city || '',
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      usersApi.updateMe({
        name: formData.name,
        clientProfile: {
          companyName: formData.companyName,
          location: {
            city: formData.city,
          },
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
                  {user?.name}
                </h1>
                {user?.isVerified && (
                  <Badge variant="primary" size="sm">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-foreground-muted mb-4">
                {user?.clientProfile?.companyName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {user.clientProfile.companyName}
                  </span>
                )}
                {user?.clientProfile?.location?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.clientProfile.location.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                </span>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-foreground-muted">
                <span>{totalGigs} gigs posted</span>
                <span>{completedGigs} completed</span>
                <span>{bookedGigs} upcoming</span>
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
              <User className="w-5 h-5 text-fuchsia-400" />
              Basic Info
            </h2>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                  <Input
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Your company or organization"
                    leftIcon={<Building2 className="w-4 h-4" />}
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
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Name</span>
                    <span className="text-foreground font-medium">
                      {user?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Company</span>
                    <span className="text-foreground font-medium">
                      {user?.clientProfile?.companyName || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Location</span>
                    <span className="text-foreground font-medium">
                      {user?.clientProfile?.location?.city || '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-fuchsia-400" />
              Contact Info
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                <Mail className="w-5 h-5 text-foreground-muted" />
                <div>
                  <p className="text-xs text-foreground-muted">Email</p>
                  <p className="text-foreground font-medium">{user?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                <Phone className="w-5 h-5 text-foreground-muted" />
                <div>
                  <p className="text-xs text-foreground-muted">Phone</p>
                  <p className="text-foreground font-medium">{user?.phone || user?.phoneNumber || '-'}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity Overview</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface text-center">
                <p className="text-3xl font-bold gradient-text mb-1">{totalGigs}</p>
                <p className="text-sm text-foreground-muted">Gigs Posted</p>
              </div>
              <div className="p-4 rounded-xl bg-surface text-center">
                <p className="text-3xl font-bold text-emerald-400 mb-1">{completedGigs}</p>
                <p className="text-sm text-foreground-muted">Completed</p>
              </div>
              <div className="p-4 rounded-xl bg-surface text-center">
                <p className="text-3xl font-bold text-amber-400 mb-1">{bookedGigs}</p>
                <p className="text-sm text-foreground-muted">Upcoming</p>
              </div>
              <div className="p-4 rounded-xl bg-surface text-center">
                <p className="text-3xl font-bold text-violet-400 mb-1">
                  {myGigs.filter((g) => g.status === 'LIVE').length}
                </p>
                <p className="text-sm text-foreground-muted">Active</p>
              </div>
            </div>
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
