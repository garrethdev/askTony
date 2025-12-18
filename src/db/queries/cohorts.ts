import { DbClient, query } from '../pool';
import { Cohort, CohortId, UserId, UserProfile } from '../../domain/types';

interface CohortRow {
  id: string;
  cohort_key: string;
  week_start: string;
  created_at: string;
}

interface MemberRow {
  user_id: string;
  nickname: string;
  username: string;
  avatar_id: string;
}

const mapCohort = (row: CohortRow): Cohort => ({
  id: row.id,
  cohortKey: row.cohort_key,
  weekStart: row.week_start,
  createdAt: new Date(row.created_at)
});

const mapMember = (row: MemberRow): UserProfile => ({
  userId: row.user_id,
  nickname: row.nickname,
  username: row.username,
  avatarId: row.avatar_id,
  timezone: '',
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * Fetch the current cohort for a user, preferring active cohorts.
 * @param db - Database client.
 * @param userId - User id.
 */
export const getCurrentCohortForUser = async (
  db: DbClient,
  userId: UserId
): Promise<Cohort | null> => {
  const result = await query<CohortRow>(
    db,
    `SELECT c.id, c.cohort_key, c.week_start, c.created_at
     FROM cohorts c
     JOIN cohort_memberships m ON m.cohort_id = c.id
     WHERE m.user_id = $1 AND m.left_at IS NULL
     ORDER BY c.week_start DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapCohort(result.rows[0]) : null;
};

export const findCohortByKeyAndWeek = async (
  db: DbClient,
  cohortKey: string,
  weekStart: string
): Promise<Cohort | null> => {
  const result = await query<CohortRow>(
    db,
    `SELECT * FROM cohorts WHERE cohort_key = $1 AND week_start = $2 LIMIT 1`,
    [cohortKey, weekStart]
  );
  return result.rows[0] ? mapCohort(result.rows[0]) : null;
};

export const insertCohort = async (
  db: DbClient,
  cohortKey: string,
  weekStart: string
): Promise<Cohort> => {
  const result = await query<CohortRow>(
    db,
    `INSERT INTO cohorts (cohort_key, week_start)
     VALUES ($1, $2)
     RETURNING *`,
    [cohortKey, weekStart]
  );
  return mapCohort(result.rows[0]);
};

export const upsertMembership = async (
  db: DbClient,
  cohortId: CohortId,
  userId: UserId
): Promise<void> => {
  await query(
    db,
    `INSERT INTO cohort_memberships (cohort_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (cohort_id, user_id) DO UPDATE
       SET left_at = NULL`,
    [cohortId, userId]
  );
};

/**
 * List cohort members with pagination.
 * @param db - Database client.
 * @param cohortId - Cohort id.
 * @param limit - Max rows.
 */
export const listCohortMembers = async (
  db: DbClient,
  cohortId: CohortId,
  limit: number
): Promise<UserProfile[]> => {
  const result = await query<MemberRow>(
    db,
    `SELECT u.id as user_id, p.nickname, p.username, p.avatar_id
     FROM cohort_memberships m
     JOIN users u ON u.id = m.user_id
     JOIN user_profile p ON p.user_id = u.id
     WHERE m.cohort_id = $1 AND m.left_at IS NULL
     ORDER BY m.joined_at DESC
     LIMIT $2`,
    [cohortId, limit]
  );
  return result.rows.map(mapMember);
};

