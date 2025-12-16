/**
 * Application-level error with HTTP status and machine-readable code.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Determine whether an error is an AppError instance.
 * @param err - Unknown error value.
 */
export const isAppError = (err: unknown): err is AppError =>
  err instanceof AppError;

/**
 * Create a 400 Bad Request error.
 * @param message - Human-readable description.
 */
export const badRequest = (message: string): AppError =>
  new AppError('BAD_REQUEST', message, 400);

/**
 * Create a 401 Unauthorized error.
 * @param message - Human-readable description.
 */
export const unauthorized = (message: string): AppError =>
  new AppError('UNAUTHORIZED', message, 401);

/**
 * Create a 403 Forbidden error.
 * @param message - Human-readable description.
 */
export const forbidden = (message: string): AppError =>
  new AppError('FORBIDDEN', message, 403);

/**
 * Create a 404 Not Found error.
 * @param message - Human-readable description.
 */
export const notFound = (message: string): AppError =>
  new AppError('NOT_FOUND', message, 404);

/**
 * Create a 409 Conflict error.
 * @param message - Human-readable description.
 */
export const conflict = (message: string): AppError =>
  new AppError('CONFLICT', message, 409);

/**
 * Create a 422 Validation error.
 * @param message - Human-readable description.
 */
export const validationError = (message: string): AppError =>
  new AppError('VALIDATION_ERROR', message, 422);

/**
 * Create a 500 Internal Server error.
 * @param message - Human-readable description.
 */
export const internalError = (message: string): AppError =>
  new AppError('INTERNAL_ERROR', message, 500);

