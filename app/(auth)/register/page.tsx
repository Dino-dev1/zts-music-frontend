'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, Mail, ArrowRight, Mic2, Building2, User } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/lib/providers'
import { authApi } from '@/lib/api'
import { initRecaptcha, sendOtp, verifyOtp, resetPhoneAuth } from '@/lib/firebase/phone-auth'
import { signInWithGoogle } from '@/lib/firebase/google-auth'
import '@/lib/firebase/init' // Initialize Firebase on import
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { UserRole } from '@/lib/types'

type AuthMethod = 'phone' | 'google'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [roleParam] = useQueryState('role')

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    roleParam === 'artist' ? 'artist' : roleParam === 'client' ? 'client' : null
  )
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'role' | 'details' | 'otp'>('role')
  const [isLoading, setIsLoading] = useState(false)
  const recaptchaInitialized = useRef(false)

  useEffect(() => {
    // Initialize recaptcha on mount for phone auth
    if (authMethod === 'phone' && step === 'details' && !recaptchaInitialized.current) {
      initRecaptcha('recaptcha-container')
      recaptchaInitialized.current = true
    }

    return () => {
      resetPhoneAuth()
      recaptchaInitialized.current = false
    }
  }, [authMethod, step])

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('details')
  }

  const handleSendOtp = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    // Format phone number with country code if not present
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`

    setIsLoading(true)
    try {
      await sendOtp(formattedPhone)
      setStep('otp')
      toast.success('OTP sent to your phone')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    setIsLoading(true)
    try {
      // Verify OTP with Firebase
      const result = await verifyOtp(otp)

      // Format phone number with country code
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`

      // Send Firebase token to backend for verification with role and name
      const response = await authApi.verifyPhone(result.idToken, formattedPhone, selectedRole!, name)

      login(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        response.user
      )

      toast.success('Account created successfully!')

      // Redirect to onboarding or dashboard
      const userRole = response.user.role?.toUpperCase()
      const redirectUrl = response.isNewUser
        ? `/onboarding?role=${userRole}`
        : userRole === 'ARTIST' ? '/artist' : userRole === 'ADMIN' ? '/admin' : '/client'

      router.push(redirectUrl)
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    if (!selectedRole) {
      toast.error('Please select a role first')
      return
    }
    setIsLoading(true)
    try {
      // Sign in with Google via Firebase
      const result = await signInWithGoogle()

      // Send Firebase token to backend for verification with role
      const response = await authApi.verifyGoogle(result.idToken, selectedRole, name || undefined)

      login(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        response.user
      )

      toast.success('Account created successfully!')

      // Redirect to onboarding or dashboard
      const userRole = response.user.role?.toUpperCase()
      const redirectUrl = response.isNewUser
        ? `/onboarding?role=${userRole}`
        : userRole === 'ARTIST' ? '/artist' : userRole === 'ADMIN' ? '/admin' : '/client'

      router.push(redirectUrl)
    } catch (error: any) {
      toast.error(error.message || 'Google registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {step === 'role' && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-foreground-muted">How will you use ZTS Music?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('artist')}
              className={cn(
                'w-full p-6 rounded-2xl border-2 transition-all text-left',
                'hover:border-violet-500/50 hover:bg-violet-500/5',
                selectedRole === 'artist'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-surface'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center shrink-0">
                  <Mic2 className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">I&apos;m an Artist</h3>
                  <p className="text-sm text-foreground-muted">
                    Browse gigs, place competitive bids, and get booked for events
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('client')}
              className={cn(
                'w-full p-6 rounded-2xl border-2 transition-all text-left',
                'hover:border-violet-500/50 hover:bg-violet-500/5',
                selectedRole === 'client'
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-surface'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">I&apos;m Hiring Artists</h3>
                  <p className="text-sm text-foreground-muted">
                    Post gigs, receive bids, and book talented artists for your events
                  </p>
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {step === 'details' && (
        <>
          <button
            onClick={() => setStep('role')}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              {selectedRole === 'artist' ? (
                <Mic2 className="w-6 h-6 text-violet-400" />
              ) : (
                <Building2 className="w-6 h-6 text-violet-400" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {selectedRole === 'artist' ? 'Artist Registration' : 'Client Registration'}
            </h1>
            <p className="text-foreground-muted">Enter your details to get started</p>
          </div>

          {/* Auth method tabs */}
          <div className="flex gap-2 p-1 mb-6 bg-surface rounded-xl">
            <button
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                authMethod === 'phone'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                authMethod === 'google'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              Google
            </button>
          </div>

          {authMethod === 'phone' ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSendOtp}
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              onClick={handleGoogleRegister}
              isLoading={isLoading}
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              Continue with Google
            </Button>
          )}
        </>
      )}

      {step === 'otp' && (
        <>
          <button
            onClick={() => setStep('details')}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify your phone</h1>
            <p className="text-foreground-muted">
              Enter the 6-digit code sent to <span className="text-foreground">{phone}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
            />
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleVerifyOtp}
              isLoading={isLoading}
            >
              Verify & Create Account
            </Button>
            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full text-center text-sm text-foreground-muted hover:text-foreground"
            >
              Didn&apos;t receive code? Resend
            </button>
          </div>
        </>
      )}

      {/* Recaptcha container for Firebase phone auth */}
      <div id="recaptcha-container" />

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-foreground-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Terms */}
      <p className="mt-6 text-xs text-foreground-subtle text-center">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-foreground-muted">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-foreground-muted">
          Privacy Policy
        </Link>
      </p>
    </motion.div>
  )
}
