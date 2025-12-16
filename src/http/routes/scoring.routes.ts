import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { manualMealSchema, compareSchema } from '../validators/scoring';
import { compareScoreToBaseline, scoreManualMeal } from '../../services/scoring';

/**
 * Build scoring routes.
 * @param deps - Route dependencies.
 */
export const scoringRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Score a manual meal payload.
   */
  const handleManualMeal: RequestHandler = async (req, res) => {
    const input = manualMealSchema.parse(req.body);
    const scored = scoreManualMeal(input);
    res.json(scored);
  };

  /**
   * Compare a meal or scan to baseline.
   */
  const handleCompare: RequestHandler = async (req, res) => {
    const query = compareSchema.parse(req.query);
    const comparison = await compareScoreToBaseline(deps.db, {
      entityType: query.entity_type,
      entityId: query.entity_id,
      baselineDays: query.baseline_days,
      userId: req.user!.userId
    });
    res.json(comparison);
  };

  router.post('/scoring/manual-meal', requireUser(), asyncHandler(handleManualMeal));
  router.get('/scoring/compare', requireUser(), asyncHandler(handleCompare));

  return router;
};

