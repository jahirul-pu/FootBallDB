import * as React from 'react';
import { cn } from '@/utils/cn';

export interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
}

export function AuthLayout({ children, className, illustration }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8">
        <div
          className={cn(
            'mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]',
            className,
          )}
        >
          {children}
        </div>
      </div>
      <div className="bg-muted hidden items-center justify-center lg:flex">
        {illustration ? (
          illustration
        ) : (
          <div className="h-full w-full bg-[url('/placeholder-stadium.webp')] bg-cover bg-center opacity-80 mix-blend-multiply dark:mix-blend-overlay" />
        )}
      </div>
    </div>
  );
}
