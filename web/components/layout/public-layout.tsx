import * as React from 'react';
import { cn } from '@/utils/cn';

export interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicLayout({ children, className }: PublicLayoutProps) {
  return (
    <div
      className={cn('bg-background text-foreground relative flex min-h-screen flex-col', className)}
    >
      <main className="flex-1">{children}</main>
    </div>
  );
}
