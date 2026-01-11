import express, { Application } from 'express';
import { API_PREFIX } from './config/constants';
import { requestLogger } from './http/middleware/requestLogger';
import { authMiddleware } from './http/middleware/auth';
import { errorHandler } from './http/middleware/errorHandler';
import { registerRoutes } from './http/routes';
import { RouteDeps } from './http/routes/context';
import { setupSwagger } from './http/swagger';

/**
 * Build and configure the Express app.
 * @param deps Application dependencies.
 * @returns Configured Express application.
 */
export const createApp = (deps: RouteDeps): Application => {
  const app = express();
  app.use(express.json());
  app.use(requestLogger());
  setupSwagger(app);
  app.use(authMiddleware(deps.jwtSecret));
  app.use(API_PREFIX, registerRoutes(deps));
  app.use(errorHandler());
  return app;
};

