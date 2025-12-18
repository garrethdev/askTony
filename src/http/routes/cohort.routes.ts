import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { getCurrentCohort, getCohortMembers } from '../../services/cohorts';
import { notFound } from '../../domain/errors';
import {
  cohortCurrentResponse,
  cohortMembersQuery,
  cohortMembersResponse
} from '../contracts/v1/cohort';

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
    res.json(
      cohortCurrentResponse.parse({
        cohort_id: cohort.id,
        week_start: cohort.weekStart,
        cohort_key: cohort.cohortKey
      })
    );
  };

  /**
   * List cohort members.
   */
  const handleMembers: RequestHandler = async (req, res) => {
    const query = cohortMembersQuery.parse(req.query);
    const cohort = await getCurrentCohort({ db: deps.db }, req.user!.userId);
    if (!cohort) throw notFound('No cohort found');
    const members = await getCohortMembers({ db: deps.db }, cohort.id, query.limit);
    res.json(
      cohortMembersResponse.parse({
        members: members.map((m) => ({
          nickname: m.nickname,
          username: m.username,
          avatar_id: m.avatarId
        }))
      })
    );
  };

  router.get('/cohort/current', requireUser(), asyncHandler(handleCurrent));
  router.get('/cohort/members', requireUser(), asyncHandler(handleMembers));

  return router;
};

