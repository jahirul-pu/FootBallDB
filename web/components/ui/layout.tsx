import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// --- Container ---
export const containerVariants = cva('mx-auto w-full px-4 md:px-8', {
  variants: {
    size: {
      sm: 'max-w-[var(--spacing-container-sm)]',
      md: 'max-w-[var(--spacing-container-md)]',
      lg: 'max-w-[var(--spacing-container-lg)]',
      xl: 'max-w-[var(--spacing-container-xl)]',
      '2xl': 'max-w-[var(--spacing-container-2xl)]',
      full: 'max-w-none',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(containerVariants({ size, className }))} {...props} />
  ),
);
Container.displayName = 'Container';

// --- Stack ---
export const stackVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    spacing: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
      12: 'gap-12',
    },
  },
  defaultVariants: {
    direction: 'col',
    align: 'start',
    justify: 'start',
    spacing: 4,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, align, justify, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ direction, align, justify, spacing, className }))}
      {...props}
    />
  ),
);
Stack.displayName = 'Stack';

// --- Section ---
export const Section = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <section ref={ref} className={cn('py-8 md:py-12 lg:py-16', className)} {...props} />
  ),
);
Section.displayName = 'Section';
