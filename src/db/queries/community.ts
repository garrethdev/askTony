import { DbClient, query } from '../pool';
import {
  Meal,
  Reflection,
  ReflectionId,
  UserId,
  Reaction
} from '../../domain/types';

interface ReflectionRow {
  id: string;
  user_id: string;
  week_start: string;
  body: string;
  created_at: string;
}

interface ReactionRow {
  user_id: string;
  target_type: 'meal' | 'reflection';
  target_id: string;
  created_at: string;
}

const mapReflection = (row: ReflectionRow): Reflection => ({
  id: row.id,
  userId: row.user_id,
  weekStart: row.week_start,
  body: row.body,
  createdAt: new Date(row.created_at)
});

const mapReaction = (row: ReactionRow): Reaction => ({
  userId: row.user_id,
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
  reflection: Omit<Reflection, 'createdAt'>
): Promise<Reflection> => {
  const result = await query<ReflectionRow>(
    db,
    `INSERT INTO reflections (id, user_id, week_start, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [reflection.id, reflection.userId, reflection.weekStart, reflection.body]
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
  weekStart: string,
  limit: number,
  cursorClause: string,
  params: unknown[]
): Promise<Reflection[]> => {
  const result = await query<ReflectionRow>(
    db,
    `SELECT * FROM reflections
     WHERE week_start = $1 ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [weekStart, limit, ...params]
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
  weekStart: string,
  limit: number,
  cursorClause: string,
  params: unknown[]
): Promise<Meal[]> => {
  const result = await query(
    db,
    `SELECT * FROM meals
     WHERE DATE_TRUNC('week', consumed_at) = DATE_TRUNC('week', $1::date)
     ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [weekStart, limit, ...params]
  );
  return (result.rows as any[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    scanId: row.scan_id ?? undefined,
    description: row.description,
    tags: row.tags ?? [],
    score: row.score,
    consumedAt: new Date(row.consumed_at),
    createdAt: new Date(row.created_at)
  }));
};

/**
 * Upsert a support reaction.
 * @param db - Database client.
 * @param reaction - Reaction payload.
 */
export const upsertReaction = async (
  db: DbClient,
  reaction: Omit<Reaction, 'createdAt'>
): Promise<Reaction> => {
  const result = await query<ReactionRow>(
    db,
    `INSERT INTO reactions (user_id, target_type, target_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, target_type, target_id) DO UPDATE
       SET created_at = now()
     RETURNING *`,
    [reaction.userId, reaction.targetType, reaction.targetId]
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
  reaction: Pick<Reaction, 'userId' | 'targetType' | 'targetId'>
): Promise<void> => {
  await query(
    db,
    `DELETE FROM reactions WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [reaction.userId, reaction.targetType, reaction.targetId]
  );
};

