import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { API_CONFIG, ENDPOINTS } from '@/config/api.config';
import { parseApiError } from '@/utils/error';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': API_CONFIG.VERSION,
  },
});

// Request interceptor — attach correlation ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['X-Request-ID'] = crypto.randomUUID();
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — handle 401 token refresh + error normalization
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Silent token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post(ENDPOINTS.AUTH.REFRESH);
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Redirect to login preserving current URL
        if (typeof window !== 'undefined') {
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?returnUrl=${returnUrl}`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show toast for 5xx server errors
    if (error.response && error.response.status >= 500) {
      const apiError = parseApiError(error);
      toast.error('Server Error', {
        description: apiError.message,
      });
    }

    return Promise.reject(error);
  },
);

// Typed request helpers
export const httpGet = <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
  api.get<T>(url, { params }).then((r) => r.data);

export const httpPost = <T>(url: string, data?: unknown): Promise<T> =>
  api.post<T>(url, data).then((r) => r.data);

export const httpPatch = <T>(url: string, data?: unknown): Promise<T> =>
  api.patch<T>(url, data).then((r) => r.data);

export const httpDelete = <T>(url: string): Promise<T> => api.delete<T>(url).then((r) => r.data);
