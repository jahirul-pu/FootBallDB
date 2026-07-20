'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ROUTES } from '@/config/routes.config';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Maps raw path segments to human-readable labels. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  persons: 'Persons',
  organizations: 'Organizations',
  teams: 'Teams',
  venues: 'Venues',
  competitions: 'Competitions',
  matches: 'Matches',
  admin: 'Admin',
  users: 'Users',
  roles: 'Roles',
  'audit-log': 'Audit Log',
  settings: 'Settings',
  profile: 'Profile',
  security: 'Security',
  preferences: 'Preferences',
  'api-keys': 'API Keys',
  create: 'Create',
  edit: 'Edit',
  'forgot-password': 'Forgot Password',
  'reset-password': 'Reset Password',
};

function segmentToLabel(segment: string): string {
  // If it looks like a UUID/ID, render as an entity detail label
  const isId = /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);
  if (isId) return 'Detail';
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];

    // Always start at Dashboard if in the app
    const isInApp = segments[0] !== 'login' && segments[0] !== 'forgot-password';
    if (isInApp && segments.length > 0) {
      crumbs.push({ label: 'Home', href: ROUTES.DASHBOARD });
    }

    let cumulativePath = '';
    segments.forEach((segment, index) => {
      cumulativePath += `/${segment}`;
      const isLast = index === segments.length - 1;
      crumbs.push({
        label: segmentToLabel(segment),
        href: isLast ? undefined : cumulativePath,
      });
    });

    return crumbs;
  }, [pathname]);
}
