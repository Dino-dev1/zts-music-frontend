'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Oops! Something went wrong
        </h1>

        {/* Description */}
        <p className="text-foreground-muted mb-8">
          We encountered an unexpected error. Don&apos;t worry, our team has been
          notified and is working on a fix.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Home className="w-4 h-4" />}
            asChild
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left p-4 rounded-xl bg-surface-elevated border border-white/5">
            <summary className="text-sm text-foreground-muted cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="mt-3 text-xs text-rose-400 overflow-auto whitespace-pre-wrap">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
