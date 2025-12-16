import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../../domain/errors';

export interface AuthContext {
  userId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthContext;
  }
}

/**
 * Parse bearer tokens and attach user context if valid.
 * @param jwtSecret - Signing secret.
 */
export const authMiddleware = (jwtSecret: string): RequestHandler => {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header) return next();
    const [, token] = header.split(' ');
    if (!token) return next();
    try {
      const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
      if (payload.sub) {
        req.user = { userId: String(payload.sub) };
      }
      return next();
    } catch (err) {
      return next(unauthorized('Invalid token'));
    }
  };
};

/**
 * Ensure a user is present on the request.
 */
export const requireUser = (): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(unauthorized('Authentication required'));
    }
    return next();
  };
};

