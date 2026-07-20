import * as React from 'react';
import { cn } from '@/utils/cn';
import { ErrorState } from '@/components/ui/error-state';

export interface ErrorLayoutProps {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
}

export function ErrorLayout({ error, reset, className }: ErrorLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background flex min-h-screen flex-col items-center justify-center p-6',
        className,
      )}
    >
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong!"
          message={error.message || 'An unexpected error occurred in the application.'}
          onRetry={reset}
        />
        {error.digest && (
          <p className="text-muted-foreground mt-4 text-center text-xs">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
