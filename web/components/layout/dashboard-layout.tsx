import * as React from 'react';
import { cn } from '@/utils/cn';

export interface DashboardLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * High-level structural layout for the authenticated dashboard.
 * Expects Sidebar and Header components to be passed in or composed within.
 */
export function DashboardLayout({ sidebar, header, children, className }: DashboardLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground flex h-screen w-full overflow-hidden',
        className,
      )}
    >
      {sidebar && <div className="bg-muted/20 hidden border-r md:block">{sidebar}</div>}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header && <div className="z-10 shrink-0">{header}</div>}
        <main className="bg-muted/10 flex-1 overflow-x-hidden overflow-y-auto pb-16 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
