import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  function hasRole(...roles: string[]): boolean {
    if (!user) return false;
    const userRoles = user.roles.map((r) => r.name);
    return roles.some((role) => userRoles.includes(role));
  }

  function hasPermission(resource: string, action: string): boolean {
    if (!user) return false;
    return user.roles.some((role) =>
      role.permissions.some((p) => p.resource === resource && p.action === action),
    );
  }

  return { user, isAuthenticated, isLoading, hasRole, hasPermission };
}
