'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { listContainerVariants, listItemVariants } from '@/lib/motion';

// ─── Metric Tile ──────────────────────────────────────────────────────────────

export interface MetricTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  description?: string;
  className?: string;
  isLoading?: boolean;
  accentColor?: string;
}

export function MetricTile({
  label,
  value,
  icon,
  trend,
  description,
  className,
  isLoading,
  accentColor,
}: MetricTileProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };
  const trendArrows = { up: '↑', down: '↓', neutral: '→' };

  return (
    <motion.div
      variants={listItemVariants}
      className={cn(
        'bg-card relative overflow-hidden rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* Accent strip */}
      {accentColor && (
        <div
          className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {label}
          </p>
          {isLoading ? (
            <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
          ) : (
            <p className="text-foreground text-3xl font-black tabular-nums">{value}</p>
          )}
          <div className="flex items-center gap-2">
            {trend && (
              <span className={cn('text-xs font-semibold', trendColors[trend.direction])}>
                {trendArrows[trend.direction]} {trend.value}
              </span>
            )}
            {description && <span className="text-muted-foreground text-xs">{description}</span>}
          </div>
        </div>
        {icon && (
          <div className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Metric Grid ──────────────────────────────────────────────────────────────

export interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function MetricGrid({ children, columns = 4, className }: MetricGridProps) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-4', colClasses[columns], className)}
    >
      {children}
    </motion.div>
  );
}
