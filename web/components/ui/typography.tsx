import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// ============================================================================
// Typography Variants (cva)
// ============================================================================

export const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      display: 'scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-6xl',
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      blockquote: 'mt-6 border-l-2 border-border pl-6 italic text-muted-foreground',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2',
      inlineCode:
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold text-foreground',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      caption: 'text-xs text-muted-foreground',
      label:
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      tableText: 'text-sm font-medium',
      metricText: 'text-3xl font-bold tracking-tight text-foreground',
      statistics: 'text-2xl font-semibold tracking-tight text-foreground',
      timelineText: 'text-sm text-muted-foreground font-mono',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

// ============================================================================
// Components
// ============================================================================

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

/**
 * Base Typography component for highly customized text.
 * Prefer specific components (H1, P, etc.) when possible.
 */
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as ? as : 'p';
    return (
      <Comp
        ref={ref as React.Ref<any>}
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
Typography.displayName = 'Typography';

export const TextDisplay = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1 ref={ref} className={cn(typographyVariants({ variant: 'display', className }))} {...props} />
));
TextDisplay.displayName = 'TextDisplay';

export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn(typographyVariants({ variant: 'h1', className }))} {...props} />
  ),
);
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn(typographyVariants({ variant: 'h2', className }))} {...props} />
  ),
);
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(typographyVariants({ variant: 'h3', className }))} {...props} />
  ),
);
H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4 ref={ref} className={cn(typographyVariants({ variant: 'h4', className }))} {...props} />
  ),
);
H4.displayName = 'H4';

export const P = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(typographyVariants({ variant: 'p', className }))} {...props} />
  ),
);
P.displayName = 'P';

export const Caption = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(typographyVariants({ variant: 'caption', className }))}
      {...props}
    />
  ),
);
Caption.displayName = 'Caption';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn(typographyVariants({ variant: 'label', className }))} {...props} />
));
Label.displayName = 'Label';

export const InlineCode = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(typographyVariants({ variant: 'inlineCode', className }))}
      {...props}
    />
  ),
);
InlineCode.displayName = 'InlineCode';

// Domain Specific
export const TableText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(typographyVariants({ variant: 'tableText', className }))}
      {...props}
    />
  ),
);
TableText.displayName = 'TableText';

export const MetricText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(typographyVariants({ variant: 'metricText', className }))}
      {...props}
    />
  ),
);
MetricText.displayName = 'MetricText';

export const StatisticsText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(typographyVariants({ variant: 'statistics', className }))}
    {...props}
  />
));
StatisticsText.displayName = 'StatisticsText';

export const TimelineText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(typographyVariants({ variant: 'timelineText', className }))}
    {...props}
  />
));
TimelineText.displayName = 'TimelineText';
