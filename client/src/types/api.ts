export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
}
