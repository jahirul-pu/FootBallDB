import type { RequestParams } from '@/types';
import { httpDelete, httpGet, httpPatch, httpPost } from '@/lib/axios';
import { ENDPOINTS } from '@/config/api.config';
import type { PaginatedResult } from '@/types';

// Placeholder types — replaced by feature-level types once PersonsModule is implemented
export interface PersonResponse {
  id: string;
  primaryName: string;
  slug?: string;
  birthYear: number;
  birthMonth?: number;
  birthDay?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const personsService = {
  getAll: (params?: RequestParams): Promise<PaginatedResult<PersonResponse>> =>
    httpGet(ENDPOINTS.PERSONS, params as Record<string, unknown>),

  getById: (id: string): Promise<PersonResponse> => httpGet(`${ENDPOINTS.PERSONS}/${id}`),

  getBySlug: (slug: string): Promise<PersonResponse> =>
    httpGet(`${ENDPOINTS.PERSONS}/slug/${slug}`),

  create: (data: Record<string, unknown>): Promise<PersonResponse> =>
    httpPost(ENDPOINTS.PERSONS, data),

  update: (id: string, data: Record<string, unknown>): Promise<PersonResponse> =>
    httpPatch(`${ENDPOINTS.PERSONS}/${id}`, data),

  remove: (id: string): Promise<void> => httpDelete(`${ENDPOINTS.PERSONS}/${id}`),

  restore: (id: string): Promise<void> => httpPost(`${ENDPOINTS.PERSONS}/${id}/restore`),
};
