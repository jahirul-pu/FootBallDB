import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

export interface LoadingLayoutProps {
  message?: string;
  className?: string;
}

export function LoadingLayout({ message, className }: LoadingLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground flex min-h-screen w-full flex-col items-center justify-center gap-4',
        className,
      )}
    >
      <Spinner size="xl" />
      {message && <p className="text-muted-foreground animate-pulse text-sm">{message}</p>}
    </div>
  );
}
