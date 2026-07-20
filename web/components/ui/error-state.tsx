import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './button';
import { H3, P } from './typography';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this data.',
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border p-8 text-center',
        className,
      )}
      {...props}
    >
      <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive h-6 w-6" />
      </div>
      <H3 className="text-destructive mt-4 border-none">{title}</H3>
      <P className="text-muted-foreground mt-2">{message}</P>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
