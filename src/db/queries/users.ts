import { DbClient, query } from '../pool';
import { User, UserId, UserOnboarding, UserProfile, UserSettings } from '../../domain/types';

interface UserRow {
  id: string;
  email: string | null;
  auth_provider: string;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  nickname: string;
  username: string;
  avatar_id: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface SettingsRow {
  user_id: string;
  reminders_enabled_meals: boolean;
  reminders_enabled_body_checkin: boolean;
  created_at: string;
  updated_at: string;
}

interface OnboardingRow {
  user_id: string;
  main_reason_key: string;
  main_challenges_keys: string[];
  eating_pattern_key: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  authProvider: row.auth_provider as User['authProvider'],
  createdAt: new Date(row.created_at)
});

const mapProfile = (row: ProfileRow): UserProfile => ({
  userId: row.user_id,
  nickname: row.nickname,
  username: row.username,
  avatarId: row.avatar_id,
  timezone: row.timezone,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapSettings = (row: SettingsRow): UserSettings => ({
  userId: row.user_id,
  remindersEnabledMeals: row.reminders_enabled_meals,
  remindersEnabledBodyCheckin: row.reminders_enabled_body_checkin,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapOnboarding = (row: OnboardingRow): UserOnboarding => ({
  userId: row.user_id,
  mainReasonKey: row.main_reason_key,
  mainChallengesKeys: row.main_challenges_keys,
  eatingPatternKey: row.eating_pattern_key,
  completedAt: row.completed_at ? new Date(row.completed_at) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

export const insertUser = async (
  db: DbClient,
  params: { id: string; email: string; authProvider: User['authProvider'] }
): Promise<User> => {
  const result = await query<UserRow>(
    db,
    `INSERT INTO users (id, email, auth_provider)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [params.id, params.email, params.authProvider]
  );
  return mapUser(result.rows[0]);
};

export const findUserByEmail = async (db: DbClient, email: string): Promise<User | null> => {
  const result = await query<UserRow>(
    db,
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
};

export const findUserById = async (db: DbClient, userId: UserId): Promise<User | null> => {
  const result = await query<UserRow>(
    db,
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
};

export const upsertProfile = async (
  db: DbClient,
  profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>
): Promise<UserProfile> => {
  const result = await query<ProfileRow>(
    db,
    `INSERT INTO user_profile (user_id, nickname, username, avatar_id, timezone)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
       SET nickname = EXCLUDED.nickname,
           username = EXCLUDED.username,
           avatar_id = EXCLUDED.avatar_id,
           timezone = EXCLUDED.timezone,
           updated_at = now()
     RETURNING *`,
    [profile.userId, profile.nickname, profile.username, profile.avatarId, profile.timezone]
  );
  return mapProfile(result.rows[0]);
};

export const getProfile = async (db: DbClient, userId: UserId): Promise<UserProfile | null> => {
  const result = await query<ProfileRow>(
    db,
    `SELECT * FROM user_profile WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
};

export const findProfileByUsername = async (
  db: DbClient,
  username: string
): Promise<UserProfile | null> => {
  const result = await query<ProfileRow>(
    db,
    `SELECT * FROM user_profile WHERE username = $1 LIMIT 1`,
    [username]
  );
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
};

export const getSettings = async (
  db: DbClient,
  userId: UserId
): Promise<UserSettings | null> => {
  const result = await query<SettingsRow>(
    db,
    `SELECT * FROM user_settings WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
};

export const upsertSettings = async (
  db: DbClient,
  settings: Omit<UserSettings, 'createdAt' | 'updatedAt'>
): Promise<UserSettings> => {
  const result = await query<SettingsRow>(
    db,
    `INSERT INTO user_settings (user_id, reminders_enabled_meals, reminders_enabled_body_checkin)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET reminders_enabled_meals = COALESCE(EXCLUDED.reminders_enabled_meals, user_settings.reminders_enabled_meals),
           reminders_enabled_body_checkin = COALESCE(EXCLUDED.reminders_enabled_body_checkin, user_settings.reminders_enabled_body_checkin),
           updated_at = now()
     RETURNING *`,
    [
      settings.userId,
      settings.remindersEnabledMeals,
      settings.remindersEnabledBodyCheckin
    ]
  );
  return mapSettings(result.rows[0]);
};

export const getOnboarding = async (
  db: DbClient,
  userId: UserId
): Promise<UserOnboarding | null> => {
  const result = await query<OnboardingRow>(
    db,
    `SELECT * FROM user_onboarding WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapOnboarding(result.rows[0]) : null;
};

export const upsertOnboarding = async (
  db: DbClient,
  userId: UserId,
  patch: Partial<Omit<UserOnboarding, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserOnboarding> => {
  const result = await query<OnboardingRow>(
    db,
    `INSERT INTO user_onboarding (user_id, main_reason_key, main_challenges_keys, eating_pattern_key, completed_at)
     VALUES ($1, COALESCE($2, ''), COALESCE($3, '{}'), COALESCE($4, ''), $5)
     ON CONFLICT (user_id) DO UPDATE
       SET main_reason_key = COALESCE($2, user_onboarding.main_reason_key),
           main_challenges_keys = COALESCE($3, user_onboarding.main_challenges_keys),
           eating_pattern_key = COALESCE($4, user_onboarding.eating_pattern_key),
           completed_at = COALESCE($5, user_onboarding.completed_at),
           updated_at = now()
     RETURNING *`,
    [
      userId,
      patch.mainReasonKey ?? null,
      patch.mainChallengesKeys ?? null,
      patch.eatingPatternKey ?? null,
      patch.completedAt ? patch.completedAt.toISOString() : null
    ]
  );
  return mapOnboarding(result.rows[0]);
};

