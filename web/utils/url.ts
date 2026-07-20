import type { RequestParams } from '@/types';

export function buildSearchParams(params: RequestParams): URLSearchParams {
  const search = new URLSearchParams();

  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.sort) search.set('sort', params.sort);
  if (params.q) search.set('q', params.q);
  if (params.cursor) search.set('cursor', params.cursor);

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(`filters[${key}]`, String(value));
      }
    });
  }

  return search;
}
