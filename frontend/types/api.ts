export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  requestId: string;
}

export interface PaginatedData<T> {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
  details: string[];
}
