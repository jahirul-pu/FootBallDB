import * as React from 'react';
import { cn } from '@/utils/cn';
import { TeamCrest } from './team-crest';

interface MatchScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  homeTeam: { name: string; crestUrl?: string; score?: number };
  awayTeam: { name: string; crestUrl?: string; score?: number };
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  time?: string;
  isCompact?: boolean;
}

export function MatchScore({
  homeTeam,
  awayTeam,
  status,
  time,
  isCompact = false,
  className,
  ...props
}: MatchScoreProps) {
  const hasScore = homeTeam.score !== undefined && awayTeam.score !== undefined;

  if (isCompact) {
    return (
      <div
        className={cn(
          'bg-card flex items-center justify-between rounded-lg border p-3 shadow-sm',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <TeamCrest name={homeTeam.name} url={homeTeam.crestUrl} size="sm" />
          <span className="text-sm font-medium">{homeTeam.name}</span>
        </div>

        <div className="flex flex-col items-center justify-center px-4">
          {hasScore ? (
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{homeTeam.score}</span>
              <span className="text-muted-foreground">-</span>
              <span>{awayTeam.score}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs font-semibold">{time || 'TBD'}</span>
          )}
          {status === 'LIVE' && (
            <span className="text-danger-base mt-1 animate-pulse text-[10px] font-bold">LIVE</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{awayTeam.name}</span>
          <TeamCrest name={awayTeam.name} url={awayTeam.crestUrl} size="sm" />
        </div>
      </div>
    );
  }

  // Full Layout
  return (
    <div
      className={cn(
        'bg-card flex flex-col items-center justify-center rounded-xl border p-6 shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
        {status === 'LIVE' ? (
          <span className="text-danger-base animate-pulse">● Live {time}</span>
        ) : status === 'FINISHED' ? (
          'Full Time'
        ) : (
          time || 'Scheduled'
        )}
      </div>

      <div className="flex w-full items-center justify-center gap-8">
        <div className="flex flex-1 flex-col items-center gap-3">
          <TeamCrest name={homeTeam.name} url={homeTeam.crestUrl} size="xl" />
          <span className="text-center text-lg leading-tight font-bold">{homeTeam.name}</span>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          {hasScore ? (
            <div className="flex items-center gap-4 text-4xl font-black tracking-tighter tabular-nums">
              <span>{homeTeam.score}</span>
              <span className="text-muted-foreground opacity-50">:</span>
              <span>{awayTeam.score}</span>
            </div>
          ) : (
            <div className="text-muted-foreground text-2xl font-bold">VS</div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3">
          <TeamCrest name={awayTeam.name} url={awayTeam.crestUrl} size="xl" />
          <span className="text-center text-lg leading-tight font-bold">{awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
}
