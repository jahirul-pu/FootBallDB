'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, UserPlus, Building2, Shield, Search, Upload, Settings, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { ROUTES } from '@/config/routes.config';
import Link from 'next/link';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color?: string;
}

export function QuickActions() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { open: openSearch } = useCommandPaletteStore();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const actions: QuickAction[] = [
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="h-4 w-4" />,
      onClick: () => {
        openSearch();
        setIsOpen(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'create-person',
      label: 'Create Person',
      icon: <UserPlus className="h-4 w-4" />,
      href: ROUTES.PERSON_CREATE,
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      id: 'create-team',
      label: 'Create Team',
      icon: <Shield className="h-4 w-4" />,
      href: ROUTES.TEAM_CREATE,
      color: 'bg-violet-500 hover:bg-violet-600',
    },
    {
      id: 'create-org',
      label: 'Create Organization',
      icon: <Building2 className="h-4 w-4" />,
      href: ROUTES.ORGANIZATION_CREATE,
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      id: 'import',
      label: 'Import Data',
      icon: <Upload className="h-4 w-4" />,
      href: ROUTES.ADMIN,
      color: 'bg-rose-500 hover:bg-rose-600',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      href: ROUTES.SETTINGS,
      color: 'bg-slate-500 hover:bg-slate-600',
    },
  ];

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Quick actions"
            aria-expanded={isOpen}
            className={cn(
              'text-muted-foreground hover:text-foreground h-9 w-9 transition-transform duration-200',
              isOpen && 'text-foreground rotate-45',
            )}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Quick actions (Alt+A)</TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="quick-actions-panel"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="bg-popover absolute top-full right-0 z-[var(--z-dropdown)] mt-2 w-52 origin-top-right rounded-xl border p-1.5 shadow-[var(--shadow-elevation-card)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                <Zap className="h-3 w-3" />
                Quick Actions
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="bg-border my-1 h-px" />

            {/* Actions list */}
            <div className="space-y-0.5">
              {actions.map((action, i) => {
                const inner = (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.12 }}
                  >
                    <button
                      type="button"
                      onClick={action.onClick}
                      className="text-popover-foreground hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white shadow-sm',
                          action.color,
                        )}
                      >
                        {action.icon}
                      </span>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  </motion.div>
                );

                if (action.href) {
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {inner}
                    </Link>
                  );
                }
                return inner;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
