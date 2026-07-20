import * as React from 'react';
import { cn } from '@/utils/cn';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        'bg-background flex h-screen w-[var(--spacing-sidebar-width)] flex-col border-r',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex h-16 shrink-0 items-center border-b px-6', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1 overflow-y-auto py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-auto shrink-0 border-t p-4', className)} {...props}>
      {children}
    </div>
  );
}
