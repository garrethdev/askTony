import { DbClient, query } from '../pool';
import { Cohort, CohortId, UserId, UserProfile } from '../../domain/types';

interface CohortRow {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
}

interface MemberRow {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

const mapCohort = (row: CohortRow): Cohort => ({
  id: row.id,
  name: row.name,
  startsAt: new Date(row.starts_at),
  endsAt: new Date(row.ends_at)
});

const mapMember = (row: MemberRow): UserProfile => ({
  userId: row.user_id,
  name: row.name,
  avatarUrl: row.avatar_url ?? undefined,
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
    `SELECT c.id, c.name, c.starts_at, c.ends_at
     FROM cohorts c
     JOIN cohort_memberships m ON m.cohort_id = c.id
     WHERE m.user_id = $1
     ORDER BY c.starts_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapCohort(result.rows[0]) : null;
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
    `SELECT u.id as user_id, p.name, p.avatar_url
     FROM cohort_memberships m
     JOIN users u ON u.id = m.user_id
     LEFT JOIN user_profile p ON p.user_id = u.id
     WHERE m.cohort_id = $1
     ORDER BY m.joined_at DESC
     LIMIT $2`,
    [cohortId, limit]
  );
  return result.rows.map(mapMember);
};

