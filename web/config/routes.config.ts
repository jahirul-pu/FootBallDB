export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard',
  PERSONS: {
    LIST: '/persons',
    NEW: '/persons/new',
    DETAIL: (id: string) => `/persons/${id}`,
    EDIT: (id: string) => `/persons/${id}/edit`,
    APPEARANCES: (id: string) => `/persons/${id}/appearances`,
  },
  TEAMS: {
    LIST: '/teams',
    NEW: '/teams/new',
    DETAIL: (id: string) => `/teams/${id}`,
    EDIT: (id: string) => `/teams/${id}/edit`,
  },
  ORGANIZATIONS: {
    LIST: '/organizations',
    NEW: '/organizations/new',
    DETAIL: (id: string) => `/organizations/${id}`,
    EDIT: (id: string) => `/organizations/${id}/edit`,
  },
  VENUES: {
    LIST: '/venues',
    DETAIL: (id: string) => `/venues/${id}`,
  },
  COMPETITIONS: {
    LIST: '/competitions',
    DETAIL: (id: string) => `/competitions/${id}`,
  },
  MATCHES: {
    LIST: '/matches',
    DETAIL: (id: string) => `/matches/${id}`,
  },
  IMPORT: '/import',
  SEARCH: '/search',
  SETTINGS: '/settings',
} as const;
