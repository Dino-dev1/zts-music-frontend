'use client'

import { type HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showBorder?: boolean
  isOnline?: boolean
}

const avatarSizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
}

const imageSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
}

export function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  showBorder = false,
  isOnline,
  className,
  ...props
}: AvatarProps) {
  const initials = name ? getInitials(name) : '?'

  return (
    <div className={cn('relative inline-flex', className)} {...props}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-semibold text-white',
          avatarSizes[size],
          showBorder && 'ring-2 ring-surface ring-offset-2 ring-offset-background'
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            isOnline ? 'bg-emerald-500' : 'bg-zinc-500'
          )}
        />
      )}
    </div>
  )
}

// Avatar group for showing multiple avatars
export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className,
}: {
  avatars: Array<{ src?: string; name: string }>
  max?: number
  size?: AvatarProps['size']
  className?: string
}) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = Math.max(0, avatars.length - max)

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          showBorder
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative rounded-full bg-surface-elevated flex items-center justify-center font-medium text-foreground-muted ring-2 ring-surface',
            avatarSizes[size ?? 'md']
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
