'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

export interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireRoles?: string[];
  requirePermissions?: string[];
}

/**
 * Client-side layout that enforces authentication and optional RBAC.
 * Wraps dashboard-layout.
 */
export function ProtectedLayout({
  children,
  requireRoles,
  requirePermissions,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, hasRole, hasPermission } = useAuthStore();
  const [isAuthorizing, setIsAuthorizing] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireRoles && requireRoles.length > 0) {
      const hasRequiredRole = requireRoles.some(hasRole);
      if (!hasRequiredRole) {
        setAuthError('You do not have the required role to access this area.');
        setIsAuthorizing(false);
        return;
      }
    }

    if (requirePermissions && requirePermissions.length > 0) {
      const hasRequiredPerm = requirePermissions.every(hasPermission);
      if (!hasRequiredPerm) {
        setAuthError('You do not have the required permissions to access this area.');
        setIsAuthorizing(false);
        return;
      }
    }

    setIsAuthorizing(false);
  }, [
    isInitialized,
    isAuthenticated,
    requireRoles,
    requirePermissions,
    pathname,
    router,
    hasRole,
    hasPermission,
  ]);

  if (!isInitialized || isAuthorizing) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center p-6">
        <ErrorState title="Access Denied" message={authError} onRetry={() => router.push('/')} />
      </div>
    );
  }

  return <>{children}</>;
}
