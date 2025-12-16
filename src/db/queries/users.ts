import { DbClient, query } from '../pool';
import {
  User,
  UserId,
  UserOnboarding,
  UserProfile,
  UserSettings
} from '../../domain/types';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface SettingsRow {
  user_id: string;
  reminders_enabled: boolean;
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
}

interface OnboardingRow {
  user_id: string;
  main_reason: string | null;
  challenges: string[];
  eating_pattern: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  createdAt: new Date(row.created_at)
});

const mapProfile = (row: ProfileRow): UserProfile => ({
  userId: row.user_id,
  name: row.name,
  avatarUrl: row.avatar_url ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapSettings = (row: SettingsRow): UserSettings => ({
  userId: row.user_id,
  remindersEnabled: row.reminders_enabled,
  reminderTime: row.reminder_time ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapOnboarding = (row: OnboardingRow): UserOnboarding => ({
  userId: row.user_id,
  mainReason: row.main_reason ?? undefined,
  challenges: row.challenges ?? [],
  eatingPattern: row.eating_pattern ?? undefined,
  completed: row.completed,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

/**
 * Insert a new user row.
 * @param db - Database client.
 * @param user - User properties to persist.
 */
export const insertUser = async (
  db: DbClient,
  user: Omit<User, 'createdAt'>
): Promise<User> => {
  const result = await query<UserRow>(
    db,
    `INSERT INTO users (id, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user.id, user.email, user.passwordHash]
  );
  return mapUser(result.rows[0]);
};

/**
 * Find a user by email.
 * @param db - Database client.
 * @param email - User email.
 */
export const findUserByEmail = async (
  db: DbClient,
  email: string
): Promise<User | null> => {
  const result = await query<UserRow>(
    db,
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
};

/**
 * Find a user by id.
 * @param db - Database client.
 * @param userId - User id.
 */
export const findUserById = async (
  db: DbClient,
  userId: UserId
): Promise<User | null> => {
  const result = await query<UserRow>(
    db,
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
};

/**
 * Upsert a user profile row.
 * @param db - Database client.
 * @param profile - Profile payload.
 */
export const upsertProfile = async (
  db: DbClient,
  profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>
): Promise<UserProfile> => {
  const result = await query<ProfileRow>(
    db,
    `INSERT INTO user_profile (user_id, name, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = now()
     RETURNING *`,
    [profile.userId, profile.name, profile.avatarUrl ?? null]
  );
  return mapProfile(result.rows[0]);
};

/**
 * Get a user profile by user id.
 * @param db - Database client.
 * @param userId - User id.
 */
export const getProfile = async (
  db: DbClient,
  userId: UserId
): Promise<UserProfile | null> => {
  const result = await query<ProfileRow>(
    db,
    `SELECT * FROM user_profile WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
};

/**
 * Get user settings.
 * @param db - Database client.
 * @param userId - User id.
 */
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

/**
 * Upsert user settings.
 * @param db - Database client.
 * @param settings - Settings payload.
 */
export const upsertSettings = async (
  db: DbClient,
  settings: Omit<UserSettings, 'createdAt' | 'updatedAt'>
): Promise<UserSettings> => {
  const result = await query<SettingsRow>(
    db,
    `INSERT INTO user_settings (user_id, reminders_enabled, reminder_time)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET reminders_enabled = EXCLUDED.reminders_enabled,
           reminder_time = EXCLUDED.reminder_time,
           updated_at = now()
     RETURNING *`,
    [settings.userId, settings.remindersEnabled, settings.reminderTime ?? null]
  );
  return mapSettings(result.rows[0]);
};

/**
 * Fetch onboarding state for a user.
 * @param db - Database client.
 * @param userId - User id.
 */
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

/**
 * Upsert onboarding fields for a user.
 * @param db - Database client.
 * @param patch - Partial onboarding payload.
 */
export const upsertOnboarding = async (
  db: DbClient,
  userId: UserId,
  patch: Partial<Omit<UserOnboarding, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserOnboarding> => {
  const result = await query<OnboardingRow>(
    db,
    `INSERT INTO user_onboarding (user_id, main_reason, challenges, eating_pattern, completed)
     VALUES ($1, $2, COALESCE($3, '{}'), $4, COALESCE($5, false))
     ON CONFLICT (user_id) DO UPDATE
       SET main_reason = COALESCE($2, user_onboarding.main_reason),
           challenges = COALESCE($3, user_onboarding.challenges),
           eating_pattern = COALESCE($4, user_onboarding.eating_pattern),
           completed = COALESCE($5, user_onboarding.completed),
           updated_at = now()
     RETURNING *`,
    [
      userId,
      patch.mainReason ?? null,
      patch.challenges ?? null,
      patch.eatingPattern ?? null,
      patch.completed ?? null
    ]
  );
  return mapOnboarding(result.rows[0]);
};

