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
  UserPlus,
  Plus,
  Upload,
  Moon,
  Sun,
  KeyRound,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/config/routes.config';
import type { CommandItem } from '@/stores/command-palette.store';

/**
 * Static command registry.
 * Dynamic entity search results are injected at runtime by the CommandPalette component.
 */
export const COMMAND_REGISTRY: CommandItem[] = [
  // ── Navigation ────────────────────────────────────────────────────────
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    group: 'Navigation',
    icon: LayoutDashboard,
    href: ROUTES.DASHBOARD,
    keywords: ['home', 'overview'],
  },
  {
    id: 'nav-persons',
    label: 'Persons',
    description: 'Browse all players, coaches & staff',
    group: 'Navigation',
    icon: Users,
    href: ROUTES.PERSONS,
    keywords: ['player', 'coach', 'staff', 'people'],
  },
  {
    id: 'nav-organizations',
    label: 'Organizations',
    description: 'Browse clubs & governing bodies',
    group: 'Navigation',
    icon: Building2,
    href: ROUTES.ORGANIZATIONS,
    keywords: ['club', 'fa', 'federation', 'association'],
  },
  {
    id: 'nav-teams',
    label: 'Teams',
    description: 'Browse all registered teams',
    group: 'Navigation',
    icon: Shield,
    href: ROUTES.TEAMS,
    keywords: ['squad', 'club team'],
  },
  {
    id: 'nav-venues',
    label: 'Venues',
    description: 'Stadiums and training grounds',
    group: 'Navigation',
    icon: MapPin,
    href: ROUTES.VENUES,
    keywords: ['stadium', 'ground', 'pitch'],
  },
  {
    id: 'nav-competitions',
    label: 'Competitions',
    description: 'Leagues, cups and tournaments',
    group: 'Navigation',
    icon: Trophy,
    href: ROUTES.COMPETITIONS,
    keywords: ['league', 'cup', 'tournament', 'championship'],
  },
  {
    id: 'nav-matches',
    label: 'Matches',
    description: 'Fixtures and results',
    group: 'Navigation',
    icon: Swords,
    href: ROUTES.MATCHES,
    keywords: ['fixture', 'result', 'game'],
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    group: 'Navigation',
    icon: Settings,
    href: ROUTES.SETTINGS,
    shortcut: ['g', 's'],
  },

  // ── Create ────────────────────────────────────────────────────────────
  {
    id: 'create-person',
    label: 'Create Person',
    description: 'Add a new player, coach or staff member',
    group: 'Create',
    icon: UserPlus,
    href: ROUTES.PERSON_CREATE,
    keywords: ['new player', 'add player', 'add person'],
  },
  {
    id: 'create-team',
    label: 'Create Team',
    description: 'Register a new team',
    group: 'Create',
    icon: Shield,
    href: ROUTES.TEAM_CREATE,
    keywords: ['new team', 'add team', 'register team'],
  },
  {
    id: 'create-org',
    label: 'Create Organization',
    description: 'Add a new club or federation',
    group: 'Create',
    icon: Building2,
    href: ROUTES.ORGANIZATION_CREATE,
    keywords: ['new club', 'new org', 'add organization'],
  },

  // ── Admin ────────────────────────────────────────────────────────────
  {
    id: 'admin-users',
    label: 'Manage Users',
    group: 'Admin',
    icon: ShieldCheck,
    href: ROUTES.ADMIN_USERS,
    keywords: ['user management', 'accounts'],
  },
  {
    id: 'admin-roles',
    label: 'Manage Roles',
    group: 'Admin',
    icon: KeyRound,
    href: ROUTES.ADMIN_ROLES,
  },
  {
    id: 'admin-audit',
    label: 'Audit Log',
    group: 'Admin',
    icon: FileText,
    href: ROUTES.ADMIN_AUDIT_LOG,
    keywords: ['log', 'history', 'audit trail'],
  },
];
