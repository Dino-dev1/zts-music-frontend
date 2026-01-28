'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const badgeVariants = {
  default: 'bg-white/10 text-foreground-muted',
  secondary: 'bg-surface-elevated text-foreground border border-white/10',
  primary: 'bg-violet-500/20 text-violet-400',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
  error: 'bg-rose-500/20 text-rose-400',
  info: 'bg-blue-500/20 text-blue-400',
}

const badgeSizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Status badge with dot indicator
export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    DRAFT: { variant: 'default', label: 'Draft' },
    LIVE: { variant: 'success', label: 'Live' },
    BOOKED: { variant: 'primary', label: 'Booked' },
    CLOSED: { variant: 'warning', label: 'Closed' },
    COMPLETED: { variant: 'info', label: 'Completed' },
    CANCELLED: { variant: 'error', label: 'Cancelled' },
    PENDING: { variant: 'warning', label: 'Pending' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    REJECTED: { variant: 'error', label: 'Rejected' },
    WITHDRAWN: { variant: 'default', label: 'Withdrawn' },
    PENDING_PAYMENT: { variant: 'warning', label: 'Awaiting Payment' },
    ESCROW: { variant: 'info', label: 'In Escrow' },
    RELEASED: { variant: 'success', label: 'Released' },
    DISPUTED: { variant: 'error', label: 'Disputed' },
    REFUNDED: { variant: 'default', label: 'Refunded' },
  }

  const config = statusConfig[status] || { variant: 'default' as const, label: status }

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </Badge>
  )
}
