import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string, formatStr = 'PPP'): string {
  return format(parseISO(dateString), formatStr)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10))
  return format(date, 'h:mm a')
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

export function formatEventDate(dateString: string): string {
  const date = parseISO(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }
  return format(date, 'EEE, MMM d')
}

export function formatDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  const startTotal = startHours * 60 + startMinutes
  const endTotal = endHours * 60 + endMinutes
  const diff = endTotal - startTotal

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}hr`
  return `${hours}hr ${minutes}min`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-zinc-500/20 text-zinc-400',
    LIVE: 'bg-emerald-500/20 text-emerald-400',
    BOOKED: 'bg-violet-500/20 text-violet-400',
    CLOSED: 'bg-amber-500/20 text-amber-400',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
    CANCELLED: 'bg-rose-500/20 text-rose-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
    ACCEPTED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-rose-500/20 text-rose-400',
    WITHDRAWN: 'bg-zinc-500/20 text-zinc-400',
  }
  return colors[status] || 'bg-zinc-500/20 text-zinc-400'
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    SOLO_VOCALIST: '🎤',
    LIVE_BAND: '🎸',
    DJ: '🎧',
    ACOUSTIC: '🪕',
    CLASSICAL: '🎻',
    JAZZ: '🎷',
    ELECTRONIC: '🎹',
    TRADITIONAL: '🪘',
    COVER_BAND: '🎵',
    ORIGINAL_ARTIST: '⭐',
  }
  return icons[category] || '🎵'
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    SOLO_VOCALIST: 'Solo Vocalist',
    LIVE_BAND: 'Live Band',
    DJ: 'DJ',
    ACOUSTIC: 'Acoustic',
    CLASSICAL: 'Classical',
    JAZZ: 'Jazz',
    ELECTRONIC: 'Electronic',
    TRADITIONAL: 'Traditional',
    COVER_BAND: 'Cover Band',
    ORIGINAL_ARTIST: 'Original Artist',
  }
  return labels[category] || category
}
