import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { getCurrentCohort, getCohortMembers } from '../../services/cohorts';
import { cohortMembersSchema } from '../validators/cohort';
import { notFound } from '../../domain/errors';

/**
 * Build cohort routes.
 * @param deps - Route dependencies.
 */
export const cohortRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Get the current cohort for the user.
   */
  const handleCurrent: RequestHandler = async (req, res) => {
    const cohort = await getCurrentCohort({ db: deps.db }, req.user!.userId);
    if (!cohort) throw notFound('No cohort found');
    res.json(cohort);
  };

  /**
   * List cohort members.
   */
  const handleMembers: RequestHandler = async (req, res) => {
    const query = cohortMembersSchema.parse(req.query);
    const cohort = await getCurrentCohort({ db: deps.db }, req.user!.userId);
    if (!cohort) throw notFound('No cohort found');
    const members = await getCohortMembers({ db: deps.db }, cohort.id, query.limit);
    res.json({ cohortId: cohort.id, members });
  };

  router.get('/cohort/current', requireUser(), asyncHandler(handleCurrent));
  router.get('/cohort/members', requireUser(), asyncHandler(handleMembers));

  return router;
};

