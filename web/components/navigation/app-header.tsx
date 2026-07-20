'use client';

import * as React from 'react';
import { Menu, Search } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { AppBreadcrumbs } from './app-breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { NotificationCenter } from './notification-center';
import { ProfileMenu } from './profile-menu';
import { QuickActions } from './quick-actions';

export function AppHeader() {
  const { setMobileOpen } = useSidebarStore();
  const { open: openSearch } = useCommandPaletteStore();

  // Subtle shadow on scroll
  const { scrollY } = useScroll();
  const headerShadow = useTransform(
    scrollY,
    [0, 20],
    ['0 0 0 0 transparent', '0 1px 0 0 hsl(var(--border))'],
  );

  // Global keyboard shortcut: Ctrl/Cmd + K → open search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openSearch]);

  return (
    <TooltipProvider>
      <motion.header
        style={{ boxShadow: headerShadow }}
        className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-[var(--z-header)] flex h-14 w-full items-center gap-3 border-b px-4 backdrop-blur"
      >
        {/* ── Left: Mobile menu + breadcrumbs ──────────────────────────── */}
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {/* Mobile hamburger — only on small screens */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-8 w-8 shrink-0 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <AppBreadcrumbs className="hidden sm:block" />
        </div>

        {/* ── Right: Actions cluster ─────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Global Search trigger */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={openSearch}
                aria-label="Open search"
                className="text-muted-foreground hover:text-foreground h-9 w-9"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Search
              <kbd className="bg-muted text-muted-foreground ml-2 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </TooltipContent>
          </Tooltip>

          <QuickActions />
          <NotificationCenter />
          <ThemeToggle />

          {/* Divider */}
          <div className="bg-border mx-1 h-6 w-px" />

          <ProfileMenu />
        </div>
      </motion.header>
    </TooltipProvider>
  );
}
