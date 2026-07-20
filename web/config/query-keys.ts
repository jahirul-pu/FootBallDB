export const queryKeys = {
  persons: {
    all: () => ['persons'] as const,
    list: (params: Record<string, unknown>) => ['persons', 'list', params] as const,
    detail: (id: string) => ['persons', 'detail', id] as const,
    slug: (slug: string) => ['persons', 'slug', slug] as const,
  },
  teams: {
    all: () => ['teams'] as const,
    list: (params: Record<string, unknown>) => ['teams', 'list', params] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
    slug: (slug: string) => ['teams', 'slug', slug] as const,
  },
  organizations: {
    all: () => ['organizations'] as const,
    list: (params: Record<string, unknown>) => ['organizations', 'list', params] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
    slug: (slug: string) => ['organizations', 'slug', slug] as const,
  },
  venues: {
    all: () => ['venues'] as const,
    list: (params: Record<string, unknown>) => ['venues', 'list', params] as const,
    detail: (id: string) => ['venues', 'detail', id] as const,
  },
  competitions: {
    all: () => ['competitions'] as const,
    list: (params: Record<string, unknown>) => ['competitions', 'list', params] as const,
    detail: (id: string) => ['competitions', 'detail', id] as const,
  },
  matches: {
    all: () => ['matches'] as const,
    list: (params: Record<string, unknown>) => ['matches', 'list', params] as const,
    detail: (id: string) => ['matches', 'detail', id] as const,
  },
  search: {
    global: (q: string) => ['search', 'global', q] as const,
    autocomplete: (q: string) => ['search', 'autocomplete', q] as const,
  },
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
} as const;
