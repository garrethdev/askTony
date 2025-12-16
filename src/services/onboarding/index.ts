import { DbClient } from '../../db/pool';
import { UserOnboarding, UserId } from '../../domain/types';
import { upsertOnboarding, getOnboarding } from '../../db/queries/users';

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

