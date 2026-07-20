/**
 * Centralised route definitions for the entire application.
 * Used by the sidebar, breadcrumbs, guards, and link helpers.
 */

export const ROUTES = {
  // ─── Public ────────────────────────────────────────────────────────────────
  HOME: '/',
  MAINTENANCE: '/maintenance',

  // ─── Auth ──────────────────────────────────────────────────────────────────
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // ─── Error ─────────────────────────────────────────────────────────────────
  NOT_FOUND: '/404',
  FORBIDDEN: '/forbidden',
  SERVER_ERROR: '/server-error',

  // ─── App Root ──────────────────────────────────────────────────────────────
  DASHBOARD: '/dashboard',

  // ─── Persons ───────────────────────────────────────────────────────────────
  PERSONS: '/persons',
  PERSON_DETAIL: (id: string) => `/persons/${id}`,
  PERSON_CREATE: '/persons/create',
  PERSON_EDIT: (id: string) => `/persons/${id}/edit`,

  // ─── Organizations ─────────────────────────────────────────────────────────
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_DETAIL: (id: string) => `/organizations/${id}`,
  ORGANIZATION_CREATE: '/organizations/create',
  ORGANIZATION_EDIT: (id: string) => `/organizations/${id}/edit`,

  // ─── Teams ─────────────────────────────────────────────────────────────────
  TEAMS: '/teams',
  TEAM_DETAIL: (id: string) => `/teams/${id}`,
  TEAM_CREATE: '/teams/create',
  TEAM_EDIT: (id: string) => `/teams/${id}/edit`,

  // ─── Venues ────────────────────────────────────────────────────────────────
  VENUES: '/venues',
  VENUE_DETAIL: (id: string) => `/venues/${id}`,
  VENUE_CREATE: '/venues/create',
  VENUE_EDIT: (id: string) => `/venues/${id}/edit`,

  // ─── Competitions ──────────────────────────────────────────────────────────
  COMPETITIONS: '/competitions',
  COMPETITION_DETAIL: (id: string) => `/competitions/${id}`,
  COMPETITION_CREATE: '/competitions/create',
  COMPETITION_EDIT: (id: string) => `/competitions/${id}/edit`,

  // ─── Matches ───────────────────────────────────────────────────────────────
  MATCHES: '/matches',
  MATCH_DETAIL: (id: string) => `/matches/${id}`,
  MATCH_CREATE: '/matches/create',
  MATCH_EDIT: (id: string) => `/matches/${id}/edit`,

  // ─── Admin ─────────────────────────────────────────────────────────────────
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  ADMIN_SETTINGS: '/admin/settings',

  // ─── Settings ──────────────────────────────────────────────────────────────
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_PREFERENCES: '/settings/preferences',
  SETTINGS_API_KEYS: '/settings/api-keys',
} as const;
