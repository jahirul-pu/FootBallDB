import * as React from 'react';
import { cn } from '@/utils/cn';

interface BaseEventProps {
  minute: number;
  player: string;
  isHome: boolean;
  className?: string;
}

export function GoalEvent({ minute, player, isHome, className }: BaseEventProps) {
  return (
    <div
      className={cn('flex items-center gap-3', isHome ? 'flex-row' : 'flex-row-reverse', className)}
    >
      <span className="text-muted-foreground text-xs font-bold">{minute}'</span>
      <span className="text-sm font-medium">{player}</span>
      <span className="text-sm" title="Goal">
        ⚽
      </span>
    </div>
  );
}

export function CardEvent({
  minute,
  player,
  isHome,
  type,
  className,
}: BaseEventProps & { type: 'yellow' | 'red' }) {
  return (
    <div
      className={cn('flex items-center gap-3', isHome ? 'flex-row' : 'flex-row-reverse', className)}
    >
      <span className="text-muted-foreground text-xs font-bold">{minute}'</span>
      <span className="text-sm font-medium">{player}</span>
      <div
        className={cn('h-4 w-3 rounded-sm', type === 'yellow' ? 'bg-yellow-400' : 'bg-red-500')}
        title={type === 'yellow' ? 'Yellow Card' : 'Red Card'}
      />
    </div>
  );
}

export function SubEvent({
  minute,
  playerIn,
  playerOut,
  isHome,
  className,
}: Omit<BaseEventProps, 'player'> & { playerIn: string; playerOut: string }) {
  return (
    <div
      className={cn('flex items-center gap-3', isHome ? 'flex-row' : 'flex-row-reverse', className)}
    >
      <span className="text-muted-foreground text-xs font-bold">{minute}'</span>
      <div className={cn('flex flex-col', isHome ? 'items-start' : 'items-end')}>
        <span className="text-success text-sm font-medium">↑ {playerIn}</span>
        <span className="text-danger-base text-sm">↓ {playerOut}</span>
      </div>
    </div>
  );
}
