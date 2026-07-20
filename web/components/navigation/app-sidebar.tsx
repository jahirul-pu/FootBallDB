'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen, Star, Clock, ChevronsUpDown, Database } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Divider } from '@/components/ui/divider';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { NAV_GROUPS } from '@/config/navigation.config';
import { ROUTES } from '@/config/routes.config';
import { NavGroup } from './nav-group';
import { NavLeaf } from './nav-item';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;

// ─── Workspace Switcher ───────────────────────────────────────────────────────

function WorkspaceSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const { user } = useAuthStore();

  const trigger = (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium',
        'border-border bg-background hover:bg-accent border transition-colors',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        isCollapsed && 'justify-center px-2',
      )}
      aria-label="Switch workspace"
    >
      <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold">
        {user?.firstName?.[0] ?? 'F'}
      </div>
      {!isCollapsed && (
        <>
          <div className="flex flex-1 flex-col items-start overflow-hidden">
            <span className="text-foreground truncate text-xs font-semibold">FootballDB</span>
            <span className="text-muted-foreground truncate text-[10px]">Personal workspace</span>
          </div>
          <ChevronsUpDown className="text-muted-foreground ml-auto h-4 w-4 shrink-0" />
        </>
      )}
    </button>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side="right">FootballDB workspace</TooltipContent>
      </Tooltip>
    );
  }

  return trigger;
}

// ─── Favorites Section ────────────────────────────────────────────────────────

function FavoritesSection({ isCollapsed }: { isCollapsed: boolean }) {
  const { favorites } = useSidebarStore();
  // Flatten all nav items to find favorited ones
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const favItems = allItems.filter((item) => favorites.includes(item.id));

  if (favItems.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {!isCollapsed && (
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          <Star className="text-muted-foreground/60 h-3 w-3" />
          <span className="text-muted-foreground/60 text-xs font-semibold tracking-wider uppercase">
            Favorites
          </span>
        </div>
      )}
      {favItems.map((item) => (
        <NavLeaf key={item.id} item={item} isCollapsed={isCollapsed} />
      ))}
    </div>
  );
}

// ─── Recent Pages Section ─────────────────────────────────────────────────────

function RecentSection({ isCollapsed }: { isCollapsed: boolean }) {
  const { recentPages } = useSidebarStore();

  if (recentPages.length === 0 || isCollapsed) return null;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <Clock className="text-muted-foreground/60 h-3 w-3" />
        <span className="text-muted-foreground/60 text-xs font-semibold tracking-wider uppercase">
          Recent
        </span>
      </div>
      {recentPages.slice(0, 5).map((page) => (
        <Link
          key={page.href}
          href={page.href}
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-8 items-center gap-3 rounded-md px-3 text-sm transition-colors"
        >
          <span className="truncate">{page.label}</span>
        </Link>
      ))}
    </div>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const pathname = usePathname();

  // Track page visits for "recent" feature
  const { addRecentPage } = useSidebarStore();
  const prevPathnameRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (pathname && pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      // Find the matching nav item label
      const allItems = NAV_GROUPS.flatMap((g) => g.items);
      const match = allItems.find((item) => item.href === pathname);
      if (match) addRecentPage(pathname, match.label);
    }
  }, [pathname, addRecentPage]);

  return (
    <TooltipProvider>
      <motion.div
        data-collapsed={isCollapsed}
        animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="group/sidebar bg-background relative flex h-full flex-col overflow-hidden"
        style={{ minWidth: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-3">
          <AnimatePresence mode="wait" initial={false}>
            {!isCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md">
                  <Database className="h-4 w-4" />
                </div>
                <span className="text-foreground text-sm font-bold tracking-tight">FootballDB</span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-primary text-primary-foreground mx-auto flex h-7 w-7 items-center justify-center rounded-md"
              >
                <Database className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="text-muted-foreground h-7 w-7 shrink-0"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* ── Workspace Switcher ─────────────────────────────────────────── */}
        <div className="shrink-0 p-3">
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* ── Scrollable Nav Body ────────────────────────────────────────── */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4 py-2">
            <FavoritesSection isCollapsed={isCollapsed} />

            {NAV_GROUPS.map((group) => (
              <NavGroup key={group.id} group={group} isCollapsed={isCollapsed} />
            ))}

            {!isCollapsed && (
              <>
                <Divider />
                <RecentSection isCollapsed={isCollapsed} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* ── Expand trigger when collapsed ──────────────────────────────── */}
        {isCollapsed && (
          <div className="shrink-0 border-t p-3">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="text-muted-foreground h-9 w-9"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}
