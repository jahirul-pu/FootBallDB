import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROUTES } from '@/config/routes.config';
import type { LucideIcon } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  group: string;
  icon?: LucideIcon;
  href?: string;
  shortcut?: string[];
  action?: () => void;
  keywords?: string[];
}

export interface RecentSearch {
  query: string;
  timestamp: number;
}

interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  recentSearches: RecentSearch[];

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>()(
  persist(
    (set) => ({
      isOpen: false,
      query: '',
      recentSearches: [],

      open: () => set({ isOpen: true, query: '' }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setQuery: (query) => set({ query }),

      addRecentSearch: (query) =>
        set((s) => {
          if (!query.trim()) return s;
          const filtered = s.recentSearches.filter((r) => r.query !== query);
          return {
            recentSearches: [{ query, timestamp: Date.now() }, ...filtered].slice(0, 8),
          };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'footballdb-command-palette',
      partialize: (s) => ({ recentSearches: s.recentSearches }),
    },
  ),
);
