import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  MapPin,
  Trophy,
  Swords,
  Settings,
  ShieldCheck,
  FileText,
  KeyRound,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes.config';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
  isExternal?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  requiredRoles?: string[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'entities',
    label: 'Football Entities',
    items: [
      {
        id: 'persons',
        label: 'Persons',
        href: ROUTES.PERSONS,
        icon: Users,
        requiredPermissions: ['persons:read'],
      },
      {
        id: 'organizations',
        label: 'Organizations',
        href: ROUTES.ORGANIZATIONS,
        icon: Building2,
        requiredPermissions: ['organizations:read'],
      },
      {
        id: 'teams',
        label: 'Teams',
        href: ROUTES.TEAMS,
        icon: Shield,
        requiredPermissions: ['teams:read'],
      },
      {
        id: 'venues',
        label: 'Venues',
        href: ROUTES.VENUES,
        icon: MapPin,
        requiredPermissions: ['venues:read'],
      },
      {
        id: 'competitions',
        label: 'Competitions',
        href: ROUTES.COMPETITIONS,
        icon: Trophy,
        requiredPermissions: ['competitions:read'],
      },
      {
        id: 'matches',
        label: 'Matches',
        href: ROUTES.MATCHES,
        icon: Swords,
        requiredPermissions: ['matches:read'],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    items: [
      {
        id: 'admin-root',
        label: 'Admin Panel',
        href: ROUTES.ADMIN,
        icon: ShieldCheck,
        requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
        children: [
          {
            id: 'admin-users',
            label: 'Users',
            href: ROUTES.ADMIN_USERS,
            icon: Users,
          },
          {
            id: 'admin-roles',
            label: 'Roles',
            href: ROUTES.ADMIN_ROLES,
            icon: KeyRound,
          },
          {
            id: 'admin-audit',
            label: 'Audit Log',
            href: ROUTES.ADMIN_AUDIT_LOG,
            icon: FileText,
          },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];
