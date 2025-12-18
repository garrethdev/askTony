import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchProfile, saveProfile } from '../../services/profile';
import { notFound } from '../../domain/errors';
import { profileResponse, profileUpdateRequest } from '../contracts/v1/profile';

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
    res.json(profileResponse.parse(profile));
  };

  /**
   * Update profile fields.
   */
  const handleUpdateProfile: RequestHandler = async (req, res) => {
    const input = profileUpdateRequest.parse(req.body);
    const current = await fetchProfile({ db: deps.db }, req.user!.userId);
    if (!current) throw notFound('Profile not found');
    const profile = await saveProfile(
      { db: deps.db },
      {
        userId: req.user!.userId,
        nickname: input.nickname ?? current.nickname,
        username: input.username ?? current.username,
        avatarId: input.avatar_id ?? current.avatarId,
        timezone: input.timezone ?? current.timezone
      }
    );
    res.json(profileResponse.parse(profile));
  };

  router.get('/profile', requireUser(), asyncHandler(handleGetProfile));
  router.put('/profile', requireUser(), asyncHandler(handleUpdateProfile));

  return router;
};

