import * as React from 'react';
import { cn } from '@/utils/cn';
import { H3, P } from './typography';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in-50 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center',
        className,
      )}
      {...props}
    >
      <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        {icon || <Inbox className="text-muted-foreground h-6 w-6" />}
      </div>
      <H3 className="mt-4 border-none">{title}</H3>
      {description && <P className="text-muted-foreground mt-2">{description}</P>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
