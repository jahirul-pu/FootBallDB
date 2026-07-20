'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Star, StarOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import type { NavItem } from '@/config/navigation.config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useIsActive(href?: string): boolean {
  const pathname = usePathname();
  if (!href) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function useHasAccess(item: NavItem): boolean {
  const { hasRole, hasPermission } = useAuthStore();
  if (item.requiredRoles?.length) {
    if (!item.requiredRoles.some(hasRole)) return false;
  }
  if (item.requiredPermissions?.length) {
    if (!item.requiredPermissions.every(hasPermission)) return false;
  }
  return true;
}

// ─── Leaf Nav Item ────────────────────────────────────────────────────────────

interface NavLeafProps {
  item: NavItem;
  isCollapsed: boolean;
  depth?: number;
}

export function NavLeaf({ item, isCollapsed, depth = 0 }: NavLeafProps) {
  const hasAccess = useHasAccess(item);
  const isActive = useIsActive(item.href);
  const { favorites, toggleFavorite, addRecentPage } = useSidebarStore();
  const isFavorited = favorites.includes(item.id);

  if (!hasAccess) return null;

  const Icon = item.icon as LucideIcon | undefined;
  const paddingLeft = depth > 0 ? `${16 + depth * 12}px` : undefined;

  const content = (
    <Link
      href={item.href ?? '#'}
      onClick={() => item.href && addRecentPage(item.href, item.label)}
      style={{ paddingLeft }}
      className={cn(
        'group relative flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors outline-none',
        'focus-visible:ring-ring focus-visible:ring-2',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        isCollapsed && depth === 0 && 'justify-center px-2',
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="bg-primary absolute top-1 left-0 h-7 w-0.5 rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
          )}
        />
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
              {item.badge}
            </Badge>
          )}
          {/* Favorite toggle — visible on hover */}
          <button
            type="button"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className="hover:text-primary ml-1 hidden h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:flex group-hover:opacity-100"
          >
            {isFavorited ? (
              <Star className="fill-primary text-primary h-3.5 w-3.5" />
            ) : (
              <StarOff className="h-3.5 w-3.5" />
            )}
          </button>
        </>
      )}
    </Link>
  );

  if (isCollapsed && depth === 0) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge !== undefined && <Badge variant="secondary">{item.badge}</Badge>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ─── Nested Nav Item (with children) ─────────────────────────────────────────

interface NavBranchProps {
  item: NavItem;
  isCollapsed: boolean;
}

export function NavBranch({ item, isCollapsed }: NavBranchProps) {
  const hasAccess = useHasAccess(item);
  const isAnyChildActive = item.children?.some((c) => useIsActive(c.href)) ?? false;
  const [isOpen, setIsOpen] = React.useState(isAnyChildActive);

  if (!hasAccess || !item.children?.length) return null;

  const Icon = item.icon as LucideIcon | undefined;

  const trigger = (
    <button
      type="button"
      onClick={() => setIsOpen((o) => !o)}
      className={cn(
        'flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors outline-none',
        'focus-visible:ring-ring focus-visible:ring-2',
        isAnyChildActive || isOpen
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        isCollapsed && 'justify-center px-2',
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </>
      )}
    </button>
  );

  return (
    <div>
      {isCollapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      {!isCollapsed && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="children"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5">
                {item.children.map((child) =>
                  child.children?.length ? (
                    <NavBranch key={child.id} item={child} isCollapsed={false} />
                  ) : (
                    <NavLeaf key={child.id} item={child} isCollapsed={false} depth={1} />
                  ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
