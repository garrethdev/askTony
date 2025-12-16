import { RequestHandler } from 'express';

/**
 * Lightweight request logger.
 */
export const requestLogger = (): RequestHandler => {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  };
};

