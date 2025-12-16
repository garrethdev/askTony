import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchOnboarding, updateOnboarding } from '../../services/onboarding';
import {
  onboardingChallengesSchema,
  onboardingEatingPatternSchema,
  onboardingReasonSchema
} from '../validators/onboarding';

/**
 * Build onboarding routes.
 * @param deps - Route dependencies.
 */
export const onboardingRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Get onboarding state.
   */
  const handleGet: RequestHandler = async (req, res) => {
    const state = await fetchOnboarding({ db: deps.db }, req.user!.userId);
    res.json(state ?? { completed: false, challenges: [] });
  };

  /**
   * Update main reason.
   */
  const handleReason: RequestHandler = async (req, res) => {
    const input = onboardingReasonSchema.parse(req.body);
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { mainReason: input.mainReason }
    );
    res.json(state);
  };

  /**
   * Update challenges.
   */
  const handleChallenges: RequestHandler = async (req, res) => {
    const input = onboardingChallengesSchema.parse(req.body);
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { challenges: input.challenges }
    );
    res.json(state);
  };

  /**
   * Update eating pattern.
   */
  const handleEatingPattern: RequestHandler = async (req, res) => {
    const input = onboardingEatingPatternSchema.parse(req.body);
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { eatingPattern: input.eatingPattern }
    );
    res.json(state);
  };

  /**
   * Mark onboarding complete.
   */
  const handleComplete: RequestHandler = async (req, res) => {
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { completed: true }
    );
    res.json(state);
  };

  router.get('/onboarding', requireUser(), asyncHandler(handleGet));
  router.put('/onboarding/main-reason', requireUser(), asyncHandler(handleReason));
  router.put('/onboarding/challenges', requireUser(), asyncHandler(handleChallenges));
  router.put(
    '/onboarding/eating-pattern',
    requireUser(),
    asyncHandler(handleEatingPattern)
  );
  router.post('/onboarding/complete', requireUser(), asyncHandler(handleComplete));

  return router;
};

