'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactElement, cloneElement, isValidElement } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  asChild?: boolean
}

const buttonVariants = {
  primary:
    'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
  secondary:
    'bg-surface-elevated hover:bg-surface-overlay text-foreground border border-white/10 hover:border-white/20',
  ghost: 'bg-transparent hover:bg-white/5 text-foreground-muted hover:text-foreground',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40',
  outline:
    'bg-transparent border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
  xl: 'h-14 px-8 text-lg gap-3 rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const buttonClassName = cn(
      'relative inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'active:scale-[0.98]',
      buttonVariants[variant],
      buttonSizes[size],
      fullWidth && 'w-full',
      className
    )

    // If asChild is true, merge props with the child element
    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<any>, {
        className: cn(buttonClassName, (children as ReactElement<any>).props.className),
        ref,
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonClassName}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {asChild ? children : children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
