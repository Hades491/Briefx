'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[Error Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {error.message && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-destructive font-mono text-left">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
