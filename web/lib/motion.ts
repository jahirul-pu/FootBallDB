import type { Transition, Variants } from 'motion/react';

// =============================================================================
// Springs
// =============================================================================
export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  smooth: { type: 'spring', stiffness: 260, damping: 26 } satisfies Transition,
  gentle: { type: 'spring', stiffness: 150, damping: 20 } satisfies Transition,
} as const;

// =============================================================================
// Durations
// =============================================================================
export const durations = {
  instant: 0.05,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  verySlow: 0.5,
} as const;

// =============================================================================
// Easings
// =============================================================================
export const easings = {
  out: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
  in: [0.4, 0.0, 1.0, 1.0] as [number, number, number, number],
  inOut: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
} as const;

// =============================================================================
// Variants
// =============================================================================

/** Simple opacity fade */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.normal, ease: easings.out } },
  exit: { opacity: 0, transition: { duration: durations.fast, ease: easings.in } },
};

/** Slide up from below + fade — default page/card entry */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.normal, ease: easings.out } },
  exit: { opacity: 0, y: 8, transition: { duration: durations.fast, ease: easings.in } },
};

/** Slide down from above + fade — dropdowns, tooltips */
export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.fast, ease: easings.out } },
  exit: { opacity: 0, y: -8, transition: { duration: durations.fast, ease: easings.in } },
};

/** Scale from center + fade — modals, popovers */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: springs.smooth },
  exit: { opacity: 0, scale: 0.96, transition: { duration: durations.fast, ease: easings.in } },
};

/** Slide in from right — drawers, sheets */
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0, transition: springs.snappy },
  exit: { opacity: 0, x: '100%', transition: { duration: durations.normal, ease: easings.in } },
};

/** Slide in from left — left drawers */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: '-100%' },
  visible: { opacity: 1, x: 0, transition: springs.snappy },
  exit: { opacity: 0, x: '-100%', transition: { duration: durations.normal, ease: easings.in } },
};

/** Staggered list container */
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

/** Individual list item — used inside listContainerVariants */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.normal, ease: easings.out } },
};

/** Table row stagger — lighter than list, faster stagger */
export const tableRowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.fast } },
};

/** Card hover — extremely subtle scale, preserves layout */
export const cardHoverVariants = {
  rest: { scale: 1, boxShadow: 'var(--shadow-sm)' },
  hover: {
    scale: 1.005,
    boxShadow: 'var(--shadow-md)',
    transition: { duration: durations.fast, ease: easings.out },
  },
} as const;

/** Button press — slight scale-down on press */
export const buttonTapVariants = {
  whileTap: { scale: 0.97, transition: { duration: durations.instant } },
} as const;

/** Form validation shake */
export const shakeVariants: Variants = {
  shake: {
    x: [-4, 4, -4, 4, -2, 2, -1, 1, 0],
    transition: { duration: 0.4 },
  },
};
