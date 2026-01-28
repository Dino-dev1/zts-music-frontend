'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

function GoBackButton() {
  const router = useRouter()
  return (
    <Button
      variant="secondary"
      leftIcon={<ArrowLeft className="w-4 h-4" />}
      onClick={() => router.back()}
    >
      Go Back
    </Button>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        {/* 404 Text */}
        <div className="mb-6">
          <span className="text-8xl font-bold gradient-text">404</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-foreground-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />} asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <GoBackButton />
        </div>
      </div>
    </div>
  )
}
