import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ContentLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  containerSize?: 'default' | 'narrow' | 'wide' | 'fluid';
}

export function ContentLayout({
  children,
  header,
  className,
  containerSize = 'default',
}: ContentLayoutProps) {
  const containerClasses = {
    default: 'max-w-7xl',
    narrow: 'max-w-5xl',
    wide: 'max-w-[1600px]',
    fluid: 'max-w-none',
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {header && <div className="shrink-0">{header}</div>}
      <div className={cn('mx-auto w-full flex-1 p-6 md:p-8', containerClasses[containerSize])}>
        {children}
      </div>
    </div>
  );
}
