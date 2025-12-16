import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, isAppError, internalError } from '../../domain/errors';

const formatError = (err: AppError) => ({
  error: {
    code: err.code,
    message: err.message
  }
});

/**
 * Centralized error formatter for Express.
 */
export const errorHandler = (): ErrorRequestHandler => {
  return (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      const formatted = formatError(
        new AppError(
          'VALIDATION_ERROR',
          err.errors.map((e) => e.message).join('; '),
          422
        )
      );
      return res.status(422).json(formatted);
    }
    if (isAppError(err)) {
      return res.status(err.statusCode).json(formatError(err));
    }
    const internal = internalError('Unexpected error');
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(internal.statusCode).json(formatError(internal));
  };
};

