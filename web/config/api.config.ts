export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  TIMEOUT: 15_000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1_000,
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
} as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  PERSONS: '/persons',
  TEAMS: '/teams',
  ORGANIZATIONS: '/organizations',
  VENUES: '/venues',
  COMPETITIONS: '/competitions',
  MATCHES: '/matches',
  CAREERS: '/careers',
  SEARCH: '/search',
} as const;
