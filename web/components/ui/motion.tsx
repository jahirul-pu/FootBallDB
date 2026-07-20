'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, AnimatePresence } from 'motion/react';
import {
  fadeVariants,
  slideUpVariants,
  scaleVariants,
  listContainerVariants,
  listItemVariants,
} from '@/lib/motion';

export const MotionFade = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  ),
);
MotionFade.displayName = 'MotionFade';

export const MotionSlideUp = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  ),
);
MotionSlideUp.displayName = 'MotionSlideUp';

export const MotionScale = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={scaleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  ),
);
MotionScale.displayName = 'MotionScale';

export const MotionList = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  ),
);
MotionList.displayName = 'MotionList';

export const MotionListItem = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={listItemVariants} {...props}>
      {children}
    </motion.div>
  ),
);
MotionListItem.displayName = 'MotionListItem';

export function MotionPresence({ children }: { children: React.ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
