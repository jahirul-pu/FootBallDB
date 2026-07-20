'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

const MAX_VISIBLE = 3; // Show at most N items before collapsing to ellipsis

export function AppBreadcrumbs({ className }: { className?: string }) {
  const crumbs = useBreadcrumbs();

  if (crumbs.length <= 1) return null;

  // Collapse middle items if too long
  const shouldCollapse = crumbs.length > MAX_VISIBLE + 1;
  const visibleCrumbs = shouldCollapse ? [crumbs[0], null, ...crumbs.slice(-MAX_VISIBLE)] : crumbs;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={crumbs.map((c) => c?.label).join('-')}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className={className}
      >
        <Breadcrumb>
          <BreadcrumbList>
            {visibleCrumbs.map((crumb, index) => {
              if (crumb === null) {
                return (
                  <React.Fragment key="ellipsis">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              }

              const isLast = index === visibleCrumbs.length - 1;

              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href && !isLast ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="flex items-center gap-1">
                          {index === 0 && <Home className="h-3.5 w-3.5" />}
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="flex items-center gap-1">
                        {index === 0 && <Home className="h-3.5 w-3.5" />}
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>
    </AnimatePresence>
  );
}
