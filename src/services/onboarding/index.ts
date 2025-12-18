import { DbClient } from '../../db/pool';
import { UserOnboarding, UserId } from '../../domain/types';
import { upsertOnboarding, getOnboarding } from '../../db/queries/users';
import {
  findCohortByKeyAndWeek,
  insertCohort,
  upsertMembership
} from '../../db/queries/cohorts';
import { weekStartMonday } from '../../utils/time';

export interface OnboardingDeps {
  db: DbClient;
}

/**
 * Fetch onboarding state for a user.
 * @param deps - Dependencies.
 * @param userId - User id.
 */
export const fetchOnboarding = async (
  deps: OnboardingDeps,
  userId: UserId
): Promise<UserOnboarding | null> => getOnboarding(deps.db, userId);

/**
 * Update onboarding properties.
 * @param deps - Dependencies.
 * @param userId - User id.
 * @param patch - Partial onboarding fields.
 */
export const updateOnboarding = async (
  deps: OnboardingDeps,
  userId: UserId,
  patch: Partial<Omit<UserOnboarding, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserOnboarding> => upsertOnboarding(deps.db, userId, patch);

export const completeOnboarding = async (
  deps: OnboardingDeps,
  userId: UserId,
  timezone: string
): Promise<{ completed_at: string; cohort_id: string; week_start: string }> => {
  const current = await getOnboarding(deps.db, userId);
  if (!current) {
    throw new Error('Onboarding not started');
  }
  const mainReason = current.mainReasonKey ?? '';
  const firstChallenge = current.mainChallengesKeys[0] ?? 'none';
  const cohortKey = `${mainReason}:${firstChallenge}`;
  const now = new Date();
  const weekStart = weekStartMonday(now, timezone);
  const cohort =
    (await findCohortByKeyAndWeek(deps.db, cohortKey, weekStart)) ??
    (await insertCohort(deps.db, cohortKey, weekStart));

  await upsertMembership(deps.db, cohort.id, userId);
  await upsertOnboarding(deps.db, userId, { completedAt: now });

  return {
    completed_at: now.toISOString(),
    cohort_id: cohort.id,
    week_start: weekStart
  };
};

