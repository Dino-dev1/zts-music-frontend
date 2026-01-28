'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { User } from '@/lib/types'

// Persisted atoms
export const accessTokenAtom = atomWithStorage<string | null>('accessToken', null)
export const refreshTokenAtom = atomWithStorage<string | null>('refreshToken', null)

// Session atoms
export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)

// Role helpers (case-insensitive comparison)
export const isArtistAtom = atom((get) => get(userAtom)?.role?.toUpperCase() === 'ARTIST')
export const isClientAtom = atom((get) => get(userAtom)?.role?.toUpperCase() === 'CLIENT')
export const isAdminAtom = atom((get) => get(userAtom)?.role?.toUpperCase() === 'ADMIN')

// Derived atoms
export const userRoleAtom = atom((get) => get(userAtom)?.role ?? null)
export const userNameAtom = atom((get) => get(userAtom)?.name ?? '')
export const userIdAtom = atom((get) => get(userAtom)?.id ?? null)

// Artist profile helpers
export const artistProfileAtom = atom((get) => get(userAtom)?.artistProfile ?? null)
export const isOnboardingCompleteAtom = atom(
  (get) => get(userAtom)?.artistProfile?.onboardingComplete ?? false
)
