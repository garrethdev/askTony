import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { signup, login, logout, session } from '../../services/auth';
import { requireUser } from '../middleware/auth';
import {
  signupRequest,
  signupResponse,
  loginRequest,
  loginResponse,
  logoutResponse,
  sessionResponse
} from '../contracts/v1/auth';

/**
 * Build auth routes.
 * @param deps - Route dependencies.
 */
export const authRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Handle user signup.
   */
  const handleSignup: RequestHandler = async (req, res) => {
    const input = signupRequest.parse(req.body);
    const result = await signup(
      {
        db: deps.db,
        clock: deps.clock,
        idGen: deps.idGen,
        jwtSecret: deps.jwtSecret
      },
      input.email,
      input.password,
      input.nickname,
      input.username,
      input.avatar_id,
      input.timezone
    );
    const validated = signupResponse.parse(result);
    res.status(201).json(validated);
  };

  /**
   * Handle user login.
   */
  const handleLogin: RequestHandler = async (req, res) => {
    const input = loginRequest.parse(req.body);
    const result = await login(
      {
        db: deps.db,
        clock: deps.clock,
        idGen: deps.idGen,
        jwtSecret: deps.jwtSecret
      },
      input.email,
      input.password
    );
    res.json(loginResponse.parse(result));
  };

  /**
   * Handle logout (stateless).
   */
  const handleLogout: RequestHandler = async (_req, res) => {
    await logout({
      db: deps.db,
      clock: deps.clock,
      idGen: deps.idGen,
      jwtSecret: deps.jwtSecret
    });
    res.json(logoutResponse.parse({ ok: true }));
  };

  /**
   * Return current session user.
   */
  const handleSession: RequestHandler = async (req, res) => {
    const user = await session(
      {
        db: deps.db,
        clock: deps.clock,
        idGen: deps.idGen,
        jwtSecret: deps.jwtSecret
      },
      req.user!.userId
    );
    res.json(sessionResponse.parse(user));
  };

  router.post('/auth/signup', asyncHandler(handleSignup));
  router.post('/auth/login', asyncHandler(handleLogin));
  router.post('/auth/logout', requireUser(), asyncHandler(handleLogout));
  router.get('/auth/session', requireUser(), asyncHandler(handleSession));

  return router;
};

