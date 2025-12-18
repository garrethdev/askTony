import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchOnboarding, updateOnboarding, completeOnboarding } from '../../services/onboarding';
import {
  onboardingResponse,
  onboardingReasonRequest,
  onboardingChallengesRequest,
  onboardingEatingPatternRequest,
  onboardingCompleteResponse,
  onboardingReasonResponse,
  onboardingChallengesResponse,
  onboardingEatingPatternResponse
} from '../contracts/v1/onboarding';
import { fetchProfile } from '../../services/profile';

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
    const payload = state
      ? {
          main_reason_key: state.mainReasonKey,
          main_challenges_keys: state.mainChallengesKeys,
          eating_pattern_key: state.eatingPatternKey,
          completed_at: state.completedAt ? state.completedAt.toISOString() : null
        }
      : {
          main_reason_key: null,
          main_challenges_keys: [],
          eating_pattern_key: null,
          completed_at: null
        };
    res.json(onboardingResponse.parse(payload));
  };

  /**
   * Update main reason.
   */
  const handleReason: RequestHandler = async (req, res) => {
    const input = onboardingReasonRequest.parse(req.body);
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { mainReasonKey: input.main_reason_key }
    );
    res.json(onboardingReasonResponse.parse({ main_reason_key: state.mainReasonKey }));
  };

  /**
   * Update challenges.
   */
  const handleChallenges: RequestHandler = async (req, res) => {
    const input = onboardingChallengesRequest.parse(req.body);
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { mainChallengesKeys: input.main_challenges_keys }
    );
    res.json(
      onboardingChallengesResponse.parse({
        main_challenges_keys: state.mainChallengesKeys
      })
    );
  };

  /**
   * Update eating pattern.
   */
  const handleEatingPattern: RequestHandler = async (req, res) => {
    const input = onboardingEatingPatternRequest.parse(req.body);
    const state = await updateOnboarding(
      { db: deps.db },
      req.user!.userId,
      { eatingPatternKey: input.eating_pattern_key }
    );
    res.json(
      onboardingEatingPatternResponse.parse({ eating_pattern_key: state.eatingPatternKey })
    );
  };

  /**
   * Mark onboarding complete.
   */
  const handleComplete: RequestHandler = async (req, res) => {
    const profile = await fetchProfile({ db: deps.db }, req.user!.userId);
    const timezone = profile?.timezone ?? 'UTC';
    const result = await completeOnboarding({ db: deps.db }, req.user!.userId, timezone);
    res.json(onboardingCompleteResponse.parse(result));
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

