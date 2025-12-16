import { Router, RequestHandler } from 'express';
import { signupSchema, loginSchema } from '../validators/auth';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { signup, login, logout, session } from '../../services/auth';
import { requireUser } from '../middleware/auth';

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
    const input = signupSchema.parse(req.body);
    const result = await signup(
      {
        db: deps.db,
        clock: deps.clock,
        idGen: deps.idGen,
        jwtSecret: deps.jwtSecret,
        bcryptRounds: deps.bcryptRounds
      },
      input.email,
      input.password,
      input.name
    );
    res.status(201).json(result);
  };

  /**
   * Handle user login.
   */
  const handleLogin: RequestHandler = async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await login(
      {
        db: deps.db,
        clock: deps.clock,
        idGen: deps.idGen,
        jwtSecret: deps.jwtSecret,
        bcryptRounds: deps.bcryptRounds
      },
      input.email,
      input.password
    );
    res.json(result);
  };

  /**
   * Handle logout (stateless).
   */
  const handleLogout: RequestHandler = async (_req, res) => {
    await logout({
      db: deps.db,
      clock: deps.clock,
      idGen: deps.idGen,
      jwtSecret: deps.jwtSecret,
      bcryptRounds: deps.bcryptRounds
    });
    res.status(204).send();
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
        jwtSecret: deps.jwtSecret,
        bcryptRounds: deps.bcryptRounds
      },
      req.user!.userId
    );
    res.json({ user });
  };

  router.post('/auth/signup', asyncHandler(handleSignup));
  router.post('/auth/login', asyncHandler(handleLogin));
  router.post('/auth/logout', requireUser(), asyncHandler(handleLogout));
  router.get('/auth/session', requireUser(), asyncHandler(handleSession));

  return router;
};

