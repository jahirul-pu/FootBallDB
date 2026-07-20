'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { fadeVariants, slideUpVariants } from '@/lib/motion';

// ─── Page Header ─────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // toolbar actions
  className?: string;
  breadcrumb?: React.ReactNode;
  badge?: React.ReactNode;
  animate?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
  breadcrumb,
  badge,
  animate = true,
}: PageHeaderProps) {
  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate
    ? {
        variants: slideUpVariants,
        initial: 'hidden',
        animate: 'visible',
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn('bg-background flex flex-col gap-4 border-b px-6 py-5 md:px-8', className)}
    >
      {breadcrumb && <div>{breadcrumb}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>

        {/* Toolbar */}
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
    </Wrapper>
  );
}

// ─── Page Toolbar ─────────────────────────────────────────────────────────────

export interface PageToolbarProps {
  children: React.ReactNode;
  className?: string;
  /** Push right-side children to the end */
  trailing?: React.ReactNode;
}

export function PageToolbar({ children, className, trailing }: PageToolbarProps) {
  return (
    <div
      className={cn(
        'bg-background/70 flex flex-wrap items-center gap-2 border-b px-6 py-2.5 backdrop-blur md:px-8',
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </div>
  );
}

// ─── Statistics Row ───────────────────────────────────────────────────────────

export interface StatItem {
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon?: React.ReactNode;
}

export interface StatisticsRowProps {
  stats: StatItem[];
  className?: string;
  isLoading?: boolean;
}

export function StatisticsRow({ stats, className, isLoading }: StatisticsRowProps) {
  return (
    <div
      className={cn(
        'grid gap-4 px-6 py-5 md:px-8',
        stats.length <= 2 && 'grid-cols-2',
        stats.length === 3 && 'grid-cols-3',
        stats.length === 4 && 'grid-cols-2 md:grid-cols-4',
        stats.length > 4 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
        className,
      )}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: i * 0.05 }}
          className="bg-card flex flex-col gap-1 rounded-xl border p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {stat.label}
            </span>
            {stat.icon && <span className="text-muted-foreground">{stat.icon}</span>}
          </div>
          {isLoading ? (
            <div className="bg-muted h-7 w-20 animate-pulse rounded" />
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-foreground text-2xl font-bold tabular-nums">{stat.value}</span>
              {stat.change && (
                <span
                  className={cn(
                    'mb-0.5 text-xs font-medium',
                    stat.change.positive ? 'text-success' : 'text-destructive',
                  )}
                >
                  {stat.change.positive ? '↑' : '↓'} {stat.change.value}
                </span>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Content Section ──────────────────────────────────────────────────────────

export interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ContentSection({ children, className, noPadding = false }: ContentSectionProps) {
  return (
    <div className={cn('flex-1', !noPadding && 'px-6 py-5 md:px-8', className)}>{children}</div>
  );
}

// ─── Split View ───────────────────────────────────────────────────────────────

export interface SplitViewProps {
  main: React.ReactNode;
  aside: React.ReactNode;
  className?: string;
  asideWidth?: 'sm' | 'md' | 'lg';
}

export function SplitView({ main, aside, className, asideWidth = 'md' }: SplitViewProps) {
  const asideClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };

  return (
    <div className={cn('flex flex-1 overflow-hidden', className)}>
      <div className="flex-1 overflow-y-auto">{main}</div>
      <aside
        className={cn(
          'hidden shrink-0 overflow-y-auto border-l lg:block',
          asideClasses[asideWidth],
        )}
      >
        {aside}
      </aside>
    </div>
  );
}

// ─── Sidebar Panel ────────────────────────────────────────────────────────────

export interface SidebarPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarPanel({ title, children, className }: SidebarPanelProps) {
  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {title && (
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
