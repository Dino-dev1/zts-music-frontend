'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground-muted mb-2">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-12 w-full rounded-xl border bg-surface-elevated px-4 py-3',
              'text-foreground placeholder:text-foreground-subtle',
              'border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
              'transition-all duration-200 outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-foreground-subtle">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
