'use client';

/**
 * (auth) route group layout — guest-only guard.
 * Redirects authenticated users away from login/register pages.
 */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { AuthLayout } from '@/components/layout/auth-layout';
import { LoadingLayout } from '@/components/layout/loading-layout';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  React.useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return <LoadingLayout />;
  }

  // Don't render children if authenticated (avoid flash before redirect)
  if (isAuthenticated) {
    return <LoadingLayout />;
  }

  return <AuthLayout>{children}</AuthLayout>;
}
