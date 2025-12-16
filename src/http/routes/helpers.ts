import { RequestHandler } from 'express';

/**
 * Wrap an async route handler and forward errors to Express.
 * @param handler - Async request handler.
 */
export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

