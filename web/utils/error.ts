import type { ApiError } from '@/types';

export function parseApiError(error: unknown): ApiError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object'
  ) {
    const resp = (error as { response: { data: unknown } }).response;
    const data = resp.data as Partial<ApiError>;
    return {
      statusCode: data.statusCode ?? 500,
      message: data.message ?? 'An unexpected error occurred',
      code: data.code ?? 'UNKNOWN_ERROR',
      path: data.path ?? '',
      timestamp: data.timestamp ?? new Date().toISOString(),
    };
  }
  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    path: '',
    timestamp: new Date().toISOString(),
  };
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}
