import * as React from 'react';
import { cn } from '@/utils/cn';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  sticky?: boolean;
}

export function Header({ className, children, sticky = true, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur',
        sticky && 'sticky top-0 z-[var(--z-header)]',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}
