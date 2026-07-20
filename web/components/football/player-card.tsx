import * as React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { MotionCard, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlayerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  number?: number;
  position?: string;
  nationality?: string;
  photoUrl?: string;
  teamName?: string;
  rating?: number;
}

export function PlayerCard({
  name,
  number,
  position,
  nationality,
  photoUrl,
  teamName,
  rating,
  className,
  ...props
}: PlayerCardProps) {
  return (
    <MotionCard className={cn('overflow-hidden', className)} {...props}>
      <div className="bg-secondary/50 relative h-48 w-full">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <User className="h-16 w-16 opacity-20" />
          </div>
        )}

        {/* Number Overlay */}
        {number && (
          <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
            <span className="text-4xl font-black italic">{number}</span>
          </div>
        )}

        {/* Rating Overlay */}
        {rating && (
          <div className="bg-primary text-primary-foreground absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-lg">
            {rating}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="leading-none font-bold tracking-tight">{name}</h3>
            {teamName && <p className="text-muted-foreground mt-1 text-sm">{teamName}</p>}
          </div>
          {nationality && (
            <span className="text-sm font-medium" title={nationality}>
              {nationality}
            </span>
          )}
        </div>

        {position && (
          <div className="mt-4">
            <Badge variant="secondary" className="font-mono">
              {position}
            </Badge>
          </div>
        )}
      </CardContent>
    </MotionCard>
  );
}
