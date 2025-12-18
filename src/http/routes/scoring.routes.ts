import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { compareScoreToBaseline, scoreManualMeal } from '../../services/scoring';
import {
  scoringManualMealRequest,
  scoringManualMealResponse,
  scoringCompareQuery,
  scoringCompareResponse
} from '../contracts/v1/scoring';
import { buildTagCategoryMap } from '../../services/tags';
import { getCurrentCohort } from '../../services/cohorts';

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
    const input = scoringManualMealRequest.parse(req.body);
    const scored = scoreManualMeal(input);
    res.json(scoringManualMealResponse.parse(scored));
  };

  /**
   * Compare a meal or scan to baseline.
   */
  const handleCompare: RequestHandler = async (req, res) => {
    const query = scoringCompareQuery.parse(req.query);
    const cohort = await getCurrentCohort({ db: deps.db }, req.user!.userId);
    const tagMap = await buildTagCategoryMap(deps.db);
    const comparison = await compareScoreToBaseline(
      deps.db,
      {
        entityType: query.entity_type,
        entityId: query.entity_id,
        baselineDays: query.baseline_days,
        userId: req.user!.userId,
        cohortId: cohort?.id ?? ''
      },
      tagMap
    );
    res.json(scoringCompareResponse.parse(comparison));
  };

  router.post('/scoring/manual-meal', requireUser(), asyncHandler(handleManualMeal));
  router.get('/scoring/compare', requireUser(), asyncHandler(handleCompare));

  return router;
};

