import { create } from 'zustand';

import type { Session, User } from '@/types';

interface AuthState extends Session {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  clearSession: () => set({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),
}));
