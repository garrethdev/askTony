import { Router } from 'express';
import { RouteDeps } from './context';
import { authRoutes } from './auth.routes';
import { profileRoutes } from './profile.routes';
import { settingsRoutes } from './settings.routes';
import { onboardingRoutes } from './onboarding.routes';
import { cohortRoutes } from './cohort.routes';
import { scoringRoutes } from './scoring.routes';
import { scansRoutes } from './scans.routes';
import { mealsRoutes } from './meals.routes';
import { bodyCheckinsRoutes } from './bodyCheckins.routes';
import { progressRoutes } from './progress.routes';
import { weightRoutes } from './weight.routes';
import { communityRoutes } from './community.routes';

/**
 * Mount all route groups.
 * @param deps - Route dependencies.
 */
export const registerRoutes = (deps: RouteDeps): Router => {
  const router = Router();
  router.use(authRoutes(deps));
  router.use(profileRoutes(deps));
  router.use(settingsRoutes(deps));
  router.use(onboardingRoutes(deps));
  router.use(cohortRoutes(deps));
  router.use(scoringRoutes(deps));
  router.use(scansRoutes(deps));
  router.use(mealsRoutes(deps));
  router.use(bodyCheckinsRoutes(deps));
  router.use(progressRoutes(deps));
  router.use(weightRoutes(deps));
  router.use(communityRoutes(deps));
  return router;
};

