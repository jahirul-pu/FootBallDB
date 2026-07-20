import { ENDPOINTS } from '@/config/api.config';
import { api } from '@/lib/axios';
import type { AuthTokens, User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  login: (payload: LoginPayload): Promise<AuthTokens> =>
    api.post<AuthTokens>(ENDPOINTS.AUTH.LOGIN, payload).then((r) => r.data),

  logout: (): Promise<void> => api.post(ENDPOINTS.AUTH.LOGOUT).then(() => undefined),

  refresh: (): Promise<AuthTokens> =>
    api.post<AuthTokens>(ENDPOINTS.AUTH.REFRESH).then((r) => r.data),

  getProfile: (): Promise<User> => api.get<User>(ENDPOINTS.AUTH.PROFILE).then((r) => r.data),
};
