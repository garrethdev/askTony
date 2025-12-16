import { DbClient } from '../../db/pool';
import { Cohort, CohortId, UserId, UserProfile } from '../../domain/types';
import { getCurrentCohortForUser, listCohortMembers } from '../../db/queries/cohorts';

export interface CohortDeps {
  db: DbClient;
}

/**
 * Fetch the user's current cohort if any.
 * @param deps - Dependencies.
 * @param userId - User id.
 */
export const getCurrentCohort = async (
  deps: CohortDeps,
  userId: UserId
): Promise<Cohort | null> => getCurrentCohortForUser(deps.db, userId);

/**
 * List members of a cohort.
 * @param deps - Dependencies.
 * @param cohortId - Cohort identifier.
 * @param limit - Max members to return.
 */
export const getCohortMembers = async (
  deps: CohortDeps,
  cohortId: CohortId,
  limit: number
): Promise<UserProfile[]> => listCohortMembers(deps.db, cohortId, limit);

