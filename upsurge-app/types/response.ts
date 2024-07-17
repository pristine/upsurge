export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}
