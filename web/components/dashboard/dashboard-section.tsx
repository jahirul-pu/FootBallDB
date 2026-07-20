'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { fadeVariants } from '@/lib/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Divider } from '@/components/ui/divider';

// ─── Dashboard Section ────────────────────────────────────────────────────────

export interface DashboardSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  error?: Error | null;
  onRetry?: () => void;
}

export function DashboardSection({
  title,
  description,
  actions,
  children,
  className,
  noPadding = false,
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  error,
  onRetry,
}: DashboardSectionProps) {
  return (
    <motion.section
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'bg-card rounded-xl border shadow-sm',
        !noPadding && 'overflow-hidden',
        className,
      )}
    >
      {/* Section Header */}
      {(title || actions) && (
        <>
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              {title && <h2 className="text-foreground text-sm font-semibold">{title}</h2>}
              {description && <p className="text-muted-foreground text-xs">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
          <Divider />
        </>
      )}

      {/* Body */}
      <div className={cn(!noPadding && 'p-5')}>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load"
            message={error.message}
            onRetry={onRetry}
            className="border-none shadow-none"
          />
        ) : isEmpty ? (
          <EmptyState
            title={emptyTitle ?? 'No data'}
            description={emptyDescription}
            className="border-none shadow-none"
          />
        ) : (
          children
        )}
      </div>
    </motion.section>
  );
}

// ─── Dashboard Grid ───────────────────────────────────────────────────────────

export interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function DashboardGrid({ children, className, columns = 2 }: DashboardGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  };
  return <div className={cn('grid gap-5', colClasses[columns], className)}>{children}</div>;
}

// ─── Comparison Card ─────────────────────────────────────────────────────────

export interface ComparisonCardProps {
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
  unit?: string;
  className?: string;
}

export function ComparisonCard({
  labelA,
  valueA,
  labelB,
  valueB,
  unit,
  className,
}: ComparisonCardProps) {
  const total = valueA + valueB || 1;
  const pctA = Math.round((valueA / total) * 100);
  const pctB = 100 - pctA;

  return (
    <div className={cn('bg-card space-y-3 rounded-xl border p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{labelA}</span>
        <span>{labelB}</span>
      </div>

      {/* Bar */}
      <div className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pctA}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-l-full bg-[var(--fb-team-home-bg)]"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pctB}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-r-full bg-[var(--fb-team-away-bg)]"
        />
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-sm tabular-nums">
        <span>
          {valueA}
          {unit && <span className="ml-0.5 text-xs">{unit}</span>}
        </span>
        <span>
          {valueB}
          {unit && <span className="ml-0.5 text-xs">{unit}</span>}
        </span>
      </div>
    </div>
  );
}
