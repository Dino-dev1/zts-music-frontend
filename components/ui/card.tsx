'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  overflow?: 'hidden' | 'visible'
}

const cardVariants = {
  default: 'bg-surface border border-white/5',
  elevated: 'bg-surface-elevated border border-white/10 shadow-xl',
  gradient: 'gradient-border',
  glass: 'glass border border-white/10',
}

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', padding = 'md', hoverable = false, overflow = 'hidden', children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible',
          cardVariants[variant],
          cardPadding[padding],
          hoverable &&
            'transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Animated card with hover effects
export function AnimatedCard({
  className,
  children,
  variant = 'default',
  padding = 'md',
  hoverable,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'rounded-2xl overflow-hidden',
        cardVariants[variant],
        cardPadding[padding],
        'transition-shadow duration-300 hover:shadow-xl hover:shadow-violet-500/10',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Card header component
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

// Card title component
export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

// Card description
export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-foreground-muted mt-1', className)} {...props}>
      {children}
    </p>
  )
}

// Card content
export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

// Card footer
export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-white/5 flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}
