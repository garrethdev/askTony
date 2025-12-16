import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchProfile, saveProfile } from '../../services/profile';
import { updateProfileSchema } from '../validators/profile';
import { notFound } from '../../domain/errors';

/**
 * Build profile routes.
 * @param deps - Route dependencies.
 */
export const profileRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Get current user profile.
   */
  const handleGetProfile: RequestHandler = async (req, res) => {
    const profile = await fetchProfile({ db: deps.db }, req.user!.userId);
    if (!profile) throw notFound('Profile not found');
    res.json(profile);
  };

  /**
   * Update profile fields.
   */
  const handleUpdateProfile: RequestHandler = async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const profile = await saveProfile(
      { db: deps.db },
      {
        userId: req.user!.userId,
        name: input.name,
        avatarUrl: input.avatarUrl
      }
    );
    res.json(profile);
  };

  router.get('/profile', requireUser(), asyncHandler(handleGetProfile));
  router.put('/profile', requireUser(), asyncHandler(handleUpdateProfile));

  return router;
};

