'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import logger from '@/lib/logger'; // Import the logger

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Unhandled error caught by global ErrorBoundary:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
        <p className="text-lg mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        {error?.message && (
          <p className="text-sm text-muted-foreground mb-6">
            <span className="font-semibold">Error details:</span> {error.message}
          </p>
        )}
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="destructive"
          size="lg"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
