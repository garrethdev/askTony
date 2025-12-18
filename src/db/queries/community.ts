import { DbClient, query } from '../pool';
import { Meal, Reflection, ReflectionId, UserId, Reaction, CohortId } from '../../domain/types';

interface ReflectionRow {
  id: string;
  user_id: string;
  cohort_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface ReactionRow {
  id: string;
  cohort_id: string;
  actor_user_id: string;
  target_type: 'meal' | 'reflection';
  target_id: string;
  created_at: string;
}

const mapReflection = (row: ReflectionRow): Reflection => ({
  id: row.id,
  userId: row.user_id,
  cohortId: row.cohort_id,
  body: row.body,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const mapReaction = (row: ReactionRow): Reaction => ({
  id: row.id,
  cohortId: row.cohort_id,
  actorUserId: row.actor_user_id,
  targetType: row.target_type,
  targetId: row.target_id,
  createdAt: new Date(row.created_at)
});

/**
 * Insert a reflection.
 * @param db - Database client.
 * @param reflection - Reflection payload.
 */
export const insertReflection = async (
  db: DbClient,
  reflection: Omit<Reflection, 'createdAt' | 'updatedAt'>
): Promise<Reflection> => {
  const result = await query<ReflectionRow>(
    db,
    `INSERT INTO reflections (id, user_id, cohort_id, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [reflection.id, reflection.userId, reflection.cohortId, reflection.body]
  );
  return mapReflection(result.rows[0]);
};

/**
 * List reflections for a week with cursor pagination.
 * @param db - Database client.
 * @param weekStart - ISO date string.
 * @param limit - Max rows.
 * @param cursorClause - Cursor SQL.
 * @param params - Cursor params.
 */
export const listReflections = async (
  db: DbClient,
  cohortId: CohortId,
  limit: number,
  cursorClause: string,
  params: unknown[]
): Promise<Reflection[]> => {
  const result = await query<ReflectionRow>(
    db,
    `SELECT * FROM reflections
     WHERE cohort_id = $1 ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [cohortId, limit, ...params]
  );
  return result.rows.map(mapReflection);
};

/**
 * Delete a reflection owned by a user.
 * @param db - Database client.
 * @param reflectionId - Reflection id.
 * @param userId - Owner id.
 */
export const deleteReflection = async (
  db: DbClient,
  reflectionId: ReflectionId,
  userId: UserId
): Promise<void> => {
  await query(db, `DELETE FROM reflections WHERE id = $1 AND user_id = $2`, [
    reflectionId,
    userId
  ]);
};

/**
 * List community meals for a week with cursor pagination.
 * @param db - Database client.
 * @param weekStart - ISO date string.
 * @param limit - Max rows.
 * @param cursorClause - Cursor SQL.
 * @param params - Cursor params.
 */
export const listCommunityMeals = async (
  db: DbClient,
  cohortId: CohortId,
  limit: number,
  cursorClause: string,
  params: unknown[]
): Promise<Meal[]> => {
  const result = await query(
    db,
    `SELECT * FROM meals
     WHERE cohort_id = $1
     ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [cohortId, limit, ...params]
  );
  return (result.rows as any[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    cohortId: row.cohort_id,
    mealScanId: row.meal_scan_id ?? undefined,
    mealName: row.meal_name,
    mealDescription: row.meal_description ?? undefined,
    mealType: row.meal_type ?? undefined,
    eatenAt: new Date(row.eaten_at),
    energyLevel: row.energy_level ?? undefined,
    metabolicScore: Number(row.metabolic_score),
    tagKeys: row.tag_keys ?? [],
    explanationShort: row.explanation_short,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }));
};

/**
 * Upsert a support reaction.
 * @param db - Database client.
 * @param reaction - Reaction payload.
 */
export const upsertReaction = async (
  db: DbClient,
  reaction: Omit<Reaction, 'createdAt' | 'id'>
): Promise<Reaction> => {
  const result = await query<ReactionRow>(
    db,
    `INSERT INTO reactions (cohort_id, actor_user_id, target_type, target_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (actor_user_id, target_type, target_id) DO UPDATE
       SET created_at = now()
     RETURNING *`,
    [reaction.cohortId, reaction.actorUserId, reaction.targetType, reaction.targetId]
  );
  return mapReaction(result.rows[0]);
};

/**
 * Delete a reaction.
 * @param db - Database client.
 * @param reaction - Reaction identifier.
 */
export const deleteReaction = async (
  db: DbClient,
  reaction: Pick<Reaction, 'actorUserId' | 'targetType' | 'targetId'>
): Promise<void> => {
  await query(
    db,
    `DELETE FROM reactions WHERE actor_user_id = $1 AND target_type = $2 AND target_id = $3`,
    [reaction.actorUserId, reaction.targetType, reaction.targetId]
  );
};

