'use client';

import { useEffect } from 'react';

import { ENDPOINTS } from '@/config/api.config';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types';

/**
 * AuthProvider — Bootstraps the auth session on app load by fetching
 * the current user profile. The actual tokens are managed via HttpOnly
 * cookies by the backend. This provider only hydrates the client-side state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setAuthenticated } = useAuthStore();

  useEffect(() => {
    async function hydrateSession() {
      try {
        const user = await api.get<User>(ENDPOINTS.AUTH.PROFILE).then((r) => r.data);
        setUser(user);
        setAuthenticated(true);
      } catch {
        // No valid session — leave as unauthenticated
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    hydrateSession();
  }, [setUser, setLoading, setAuthenticated]);

  return <>{children}</>;
}
