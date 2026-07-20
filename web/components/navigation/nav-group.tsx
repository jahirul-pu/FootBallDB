'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { NavLeaf, NavBranch } from './nav-item';
import type { NavGroup as NavGroupType } from '@/config/navigation.config';

interface NavGroupProps {
  group: NavGroupType;
  isCollapsed: boolean;
}

export function NavGroup({ group, isCollapsed }: NavGroupProps) {
  const { expandedGroups, toggleGroup } = useSidebarStore();
  const { hasRole } = useAuthStore();
  const isExpanded = expandedGroups.includes(group.id);

  // RBAC: hide the entire group if user lacks required role
  if (group.requiredRoles?.length) {
    const canView = group.requiredRoles.some(hasRole);
    if (!canView) return null;
  }

  return (
    <div className="space-y-0.5">
      {/* Group label — only shown when expanded */}
      {!isCollapsed && (
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          className={cn(
            'flex w-full items-center justify-between px-3 py-1.5 text-left',
            'text-muted-foreground/60 text-xs font-semibold tracking-wider uppercase',
            'hover:text-muted-foreground transition-colors focus-visible:outline-none',
          )}
          aria-expanded={isExpanded}
        >
          <span className="truncate">{group.label}</span>
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        </button>
      )}

      {/* Collapsed: always show items; Expanded: show when group is open */}
      <AnimatePresence initial={false}>
        {(isCollapsed || isExpanded) && (
          <motion.div
            key={`group-${group.id}`}
            initial={!isCollapsed ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={!isCollapsed ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="space-y-0.5 overflow-hidden"
          >
            {group.items.map((item) =>
              item.children?.length ? (
                <NavBranch key={item.id} item={item} isCollapsed={isCollapsed} />
              ) : (
                <NavLeaf key={item.id} item={item} isCollapsed={isCollapsed} />
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed: render a thin divider between groups */}
      {isCollapsed && <div className="bg-border mx-auto my-2 h-px w-5" />}
    </div>
  );
}
