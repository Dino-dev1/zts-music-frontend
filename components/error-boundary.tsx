'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mb-6 mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-foreground-muted mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Page
              </Button>
              <Button
                variant="ghost"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Try Again
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left p-4 rounded-xl bg-surface-elevated border border-white/5">
                <summary className="text-sm text-foreground-muted cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-rose-400 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary wrapper for async errors
export function AsyncBoundary({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}
