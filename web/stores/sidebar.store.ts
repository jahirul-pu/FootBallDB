import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  expandedGroups: string[];
  favorites: string[];
  recentPages: { href: string; label: string; timestamp: number }[];

  // Actions
  toggleCollapse: () => void;
  setCollapsed: (value: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (value: boolean) => void;
  toggleGroup: (groupId: string) => void;
  toggleFavorite: (itemId: string) => void;
  addRecentPage: (href: string, label: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobileOpen: false,
      expandedGroups: ['overview', 'entities'],
      favorites: [],
      recentPages: [],

      toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),

      setCollapsed: (value) => set({ isCollapsed: value }),

      toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),

      setMobileOpen: (value) => set({ isMobileOpen: value }),

      toggleGroup: (groupId) =>
        set((s) => ({
          expandedGroups: s.expandedGroups.includes(groupId)
            ? s.expandedGroups.filter((id) => id !== groupId)
            : [...s.expandedGroups, groupId],
        })),

      toggleFavorite: (itemId) =>
        set((s) => ({
          favorites: s.favorites.includes(itemId)
            ? s.favorites.filter((id) => id !== itemId)
            : [...s.favorites, itemId],
        })),

      addRecentPage: (href, label) =>
        set((s) => {
          const filtered = s.recentPages.filter((p) => p.href !== href);
          return {
            recentPages: [{ href, label, timestamp: Date.now() }, ...filtered].slice(0, 8),
          };
        }),
    }),
    {
      name: 'footballdb-sidebar',
      partialize: (s) => ({
        isCollapsed: s.isCollapsed,
        expandedGroups: s.expandedGroups,
        favorites: s.favorites,
        recentPages: s.recentPages,
      }),
    },
  ),
);
