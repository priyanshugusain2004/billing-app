/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Response formatter
 */
export const successResponse = (data: any, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, code?: string) => ({
  success: false,
  message,
  code,
});
