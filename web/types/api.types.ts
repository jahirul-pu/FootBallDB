export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string;
  code: string;
  path: string;
  timestamp: string;
}

export interface RequestParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  cursor?: string;
  filters?: Record<string, unknown>;
}
