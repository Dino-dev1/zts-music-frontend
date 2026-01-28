'use client'

import { atom } from 'jotai'

// Mobile navigation
export const isMobileMenuOpenAtom = atom(false)
export const isMobileNavVisibleAtom = atom(true)

// Modals
export const activeModalAtom = atom<string | null>(null)
export const modalDataAtom = atom<Record<string, unknown> | null>(null)

// Sidebar
export const isSidebarCollapsedAtom = atom(false)

// Theme (future use)
export const themeAtom = atom<'dark' | 'light'>('dark')

// Loading states
export const globalLoadingAtom = atom(false)
export const pageLoadingAtom = atom(false)

// Toast notifications (used with react-hot-toast)
export const toastQueueAtom = atom<Array<{
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}>>([])

// Search
export const globalSearchQueryAtom = atom('')
export const isSearchOpenAtom = atom(false)

// Filters visibility
export const areFiltersVisibleAtom = atom(false)
