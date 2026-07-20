import * as React from 'react';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

interface PlayerNode {
  id: string;
  name: string;
  number?: number;
  x: number; // 0-100 (width percentage)
  y: number; // 0-100 (height percentage, 0 is away side, 100 is home side)
}

interface FormationViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  homePlayers: PlayerNode[];
  awayPlayers?: PlayerNode[];
  orientation?: 'vertical' | 'horizontal';
}

export function FormationViewer({
  homePlayers,
  awayPlayers = [],
  orientation = 'vertical',
  className,
  ...props
}: FormationViewerProps) {
  // Pitch styling uses football-specific semantic tokens
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-[var(--fb-pitch-grass)] shadow-inner',
        orientation === 'vertical' ? 'aspect-[2/3] w-full max-w-md' : 'aspect-[3/2] w-full',
        className,
      )}
      {...props}
    >
      {/* Pitch Markings */}
      <div className="absolute inset-4 border-2 border-[var(--fb-pitch-lines)]" />
      {/* Center Line */}
      <div
        className={cn(
          'absolute border-[var(--fb-pitch-lines)]',
          orientation === 'vertical'
            ? 'top-1/2 right-4 left-4 border-t-2'
            : 'top-4 bottom-4 left-1/2 border-l-2',
        )}
      />
      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--fb-pitch-lines)]" />

      {/* Penalty Areas (Home - Bottom) */}
      <div
        className={cn(
          'absolute border-2 border-[var(--fb-pitch-lines)]',
          orientation === 'vertical'
            ? 'bottom-4 left-1/2 h-1/6 w-1/2 -translate-x-1/2 border-b-0'
            : 'top-1/2 left-4 h-1/2 w-1/6 -translate-y-1/2 border-l-0',
        )}
      />

      {/* Penalty Areas (Away - Top) */}
      {awayPlayers.length > 0 && (
        <div
          className={cn(
            'absolute border-2 border-[var(--fb-pitch-lines)]',
            orientation === 'vertical'
              ? 'top-4 left-1/2 h-1/6 w-1/2 -translate-x-1/2 border-t-0'
              : 'top-1/2 right-4 h-1/2 w-1/6 -translate-y-1/2 border-r-0',
          )}
        />
      )}

      {/* Players Rendering */}
      {[...homePlayers, ...awayPlayers].map((player, idx) => {
        const isHome = idx < homePlayers.length;

        return (
          <div
            key={player.id}
            className="absolute flex flex-col items-center justify-center gap-1 transition-transform hover:scale-110"
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md',
                isHome
                  ? 'border-[var(--fb-team-home-fg)] bg-[var(--fb-team-home-bg)] text-[var(--fb-team-home-fg)]'
                  : 'border-[var(--fb-team-away-fg)] bg-[var(--fb-team-away-bg)] text-[var(--fb-team-away-fg)]',
              )}
            >
              {player.number ? (
                <span className="text-xs font-bold">{player.number}</span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {player.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
