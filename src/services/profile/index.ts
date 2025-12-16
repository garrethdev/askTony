import { DbClient } from '../../db/pool';
import { UserId, UserProfile, UserSettings } from '../../domain/types';
import { getProfile, upsertProfile, getSettings, upsertSettings } from '../../db/queries/users';

export interface ProfileDeps {
  db: DbClient;
}

/**
 * Fetch a user's profile.
 * @param deps - Dependencies.
 * @param userId - User id.
 */
export const fetchProfile = async (
  deps: ProfileDeps,
  userId: UserId
): Promise<UserProfile | null> => getProfile(deps.db, userId);

/**
 * Update or create a profile.
 * @param deps - Dependencies.
 * @param profile - Profile payload.
 */
export const saveProfile = async (
  deps: ProfileDeps,
  profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>
): Promise<UserProfile> => upsertProfile(deps.db, profile);

/**
 * Fetch settings for a user.
 * @param deps - Dependencies.
 * @param userId - User id.
 */
export const fetchSettings = async (
  deps: ProfileDeps,
  userId: UserId
): Promise<UserSettings | null> => getSettings(deps.db, userId);

/**
 * Update reminders settings.
 * @param deps - Dependencies.
 * @param settings - Settings payload.
 */
export const saveSettings = async (
  deps: ProfileDeps,
  settings: Omit<UserSettings, 'createdAt' | 'updatedAt'>
): Promise<UserSettings> => upsertSettings(deps.db, settings);

