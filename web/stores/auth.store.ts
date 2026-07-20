import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@/types';

interface AuthState extends Session {
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setInitialized: (value: boolean) => void;
  clearSession: () => void;
  logout: () => Promise<void>;

  // RBAC helpers
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      clearSession: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        }),

      logout: async () => {
        // Concrete implementation will be done in the Auth module.
        // Clears local state immediately for instant UI response.
        get().clearSession();
      },

      hasRole: (role: string) => {
        const user = get().user;
        if (!user) return false;
        // User.role is a string (e.g. "ADMIN") in the current type definitions.
        return user.role === role;
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        // Permissions array will be populated by the auth provider on login.
        return (user as any).permissions?.includes(permission) ?? false;
      },
    }),
    {
      name: 'footballdb-auth',
      partialize: (s) => ({
        user: s.user,
        tokens: s.tokens,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
