import * as React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TeamCrestProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function TeamCrest({ url, name, size = 'md', className, ...props }: TeamCrestProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={cn(
        'bg-secondary text-secondary-foreground relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {url ? (
        // Using standard img for DS simplicity; in production use Next/Image
        <img src={url} alt={`${name} crest`} className="h-full w-full object-contain" />
      ) : (
        <Shield className="h-1/2 w-1/2 opacity-50" />
      )}
    </div>
  );
}
