'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, ArrowRight, X, CornerDownLeft, Hash } from 'lucide-react';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { COMMAND_REGISTRY } from '@/config/commands.config';
import type { CommandItem } from '@/stores/command-palette.store';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreMatch(item: CommandItem, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const desc = item.description?.toLowerCase() ?? '';
  const keywords = item.keywords?.join(' ').toLowerCase() ?? '';

  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (desc.includes(q)) return 40;
  if (keywords.includes(q)) return 20;
  return 0;
}

function groupItems(items: CommandItem[]): Record<string, CommandItem[]> {
  return items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

// ─── CommandItem Row ──────────────────────────────────────────────────────────

interface CommandRowProps {
  item: CommandItem;
  isSelected: boolean;
  onSelect: () => void;
}

function CommandRow({ item, isSelected, onSelect }: CommandRowProps) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none',
        isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent',
      )}
    >
      {Icon && (
        <div
          className={cn(
            'bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
            isSelected && 'border-primary/30 bg-primary/10 text-primary',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
        <span className="font-medium">{item.label}</span>
        {item.description && (
          <span className="text-muted-foreground truncate text-xs">{item.description}</span>
        )}
      </div>
      {item.shortcut && (
        <div className="flex shrink-0 gap-1">
          {item.shortcut.map((key) => (
            <kbd
              key={key}
              className="bg-muted text-muted-foreground flex h-5 min-w-[20px] items-center justify-center rounded border px-1.5 font-mono text-[10px]"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
      {isSelected && <CornerDownLeft className="text-primary ml-1 h-3.5 w-3.5 shrink-0" />}
    </button>
  );
}

// ─── CommandPalette ───────────────────────────────────────────────────────────

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, query, setQuery, recentSearches, addRecentSearch } =
    useCommandPaletteStore();

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Filter and score commands
  const filteredItems = React.useMemo(() => {
    const scored = COMMAND_REGISTRY.map((item) => ({
      item,
      score: scoreMatch(item, query),
    }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);

    return scored;
  }, [query]);

  const grouped = React.useMemo(() => groupItems(filteredItems), [filteredItems]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) handleSelect(selected);
      } else if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (item: CommandItem) => {
    if (query.trim()) addRecentSearch(query.trim());
    if (item.href) router.push(item.href);
    if (item.action) item.action();
    close();
  };

  // Flat index for keyboard navigation
  let flatIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPortal>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[var(--z-modal)] bg-black/60"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[15%] left-1/2 z-[var(--z-modal)] w-full max-w-xl -translate-x-1/2"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="bg-background overflow-hidden rounded-xl border shadow-[var(--shadow-elevation-modal)]">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Search className="text-muted-foreground h-4 w-4 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, actions, entities…"
                  className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
                  aria-label="Search command palette"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-muted-foreground hover:text-foreground rounded p-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd className="bg-muted text-muted-foreground hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:block">
                  ESC
                </kbd>
              </div>

              <ScrollArea className="max-h-[420px]">
                <div className="p-2">
                  {/* Recent searches — shown when no query */}
                  {!query && recentSearches.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-muted-foreground/60 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                          <Clock className="h-3 w-3" />
                          Recent
                        </span>
                        <button
                          type="button"
                          onClick={() => useCommandPaletteStore.getState().clearRecentSearches()}
                          className="text-muted-foreground hover:text-foreground text-[10px]"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((r) => (
                        <button
                          key={r.timestamp}
                          type="button"
                          onClick={() => setQuery(r.query)}
                          className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm"
                        >
                          <Clock className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{r.query}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}
                      <div className="bg-border my-2 h-px" />
                    </div>
                  )}

                  {/* Grouped results */}
                  {Object.entries(grouped).map(([group, items]) => (
                    <div key={group} className="mb-3">
                      <div className="px-2 py-1">
                        <span className="text-muted-foreground/60 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                          <Hash className="h-3 w-3" />
                          {group}
                        </span>
                      </div>
                      {items.map((item) => {
                        const currentIndex = flatIndex++;
                        return (
                          <CommandRow
                            key={item.id}
                            item={item}
                            isSelected={currentIndex === selectedIndex}
                            onSelect={() => handleSelect(item)}
                          />
                        );
                      })}
                    </div>
                  ))}

                  {/* Empty state */}
                  {query && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <Search className="text-muted-foreground/30 h-8 w-8" />
                      <p className="text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
                      <p className="text-muted-foreground text-xs">
                        Try searching for a page, entity, or action.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer hint */}
              <div className="text-muted-foreground flex items-center gap-4 border-t px-4 py-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <kbd className="bg-muted rounded border px-1 py-0.5 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-muted rounded border px-1 py-0.5 font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-muted rounded border px-1 py-0.5 font-mono">ESC</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}
