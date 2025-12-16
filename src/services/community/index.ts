import { DbClient } from '../../db/pool';
import {
  insertReflection,
  listReflections,
  deleteReflection,
  listCommunityMeals,
  upsertReaction,
  deleteReaction
} from '../../db/queries/community';
import { IdGenerator } from '../../domain/ids';
import { Clock } from '../../domain/time';
import { Reaction, Reflection, ReflectionId, UserId } from '../../domain/types';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import { notFound } from '../../domain/errors';

export interface CommunityDeps {
  db: DbClient;
  idGen: IdGenerator;
  clock: Clock;
}

const cursorClause = (cursor?: string): { clause: string; params: unknown[] } => {
  if (!cursor) return { clause: '', params: [] };
  const payload = decodeCursor(cursor);
  return { clause: `AND (created_at, id) < ($3, $4)`, params: [payload.createdAt, payload.id] };
};

/**
 * Create a weekly reflection.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param weekStart - Week start date.
 * @param body - Reflection body.
 */
export const createReflection = async (
  deps: CommunityDeps,
  userId: UserId,
  weekStart: string,
  body: string
): Promise<Reflection> =>
  insertReflection(deps.db, {
    id: deps.idGen.newId(),
    userId,
    weekStart,
    body
  });

/**
 * List reflections with cursor pagination.
 * @param deps - Dependencies.
 * @param weekStart - Week start date.
 * @param limit - Page size.
 * @param cursor - Optional cursor string.
 */
export const listWeeklyReflections = async (
  deps: CommunityDeps,
  weekStart: string,
  limit: number,
  cursor?: string
): Promise<{ items: Reflection[]; nextCursor?: string }> => {
  const { clause, params } = cursorClause(cursor);
  const reflections = await listReflections(deps.db, weekStart, limit, clause, params);
  const next =
    reflections.length === limit
      ? encodeCursor({
          createdAt: reflections[reflections.length - 1].createdAt.toISOString(),
          id: reflections[reflections.length - 1].id
        })
      : undefined;
  return { items: reflections, nextCursor: next };
};

/**
 * Remove a reflection owned by a user.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param reflectionId - Reflection id.
 */
export const removeReflection = async (
  deps: CommunityDeps,
  userId: UserId,
  reflectionId: ReflectionId
): Promise<void> => deleteReflection(deps.db, reflectionId, userId);

/**
 * List community meals for the week.
 * @param deps - Dependencies.
 * @param weekStart - Week start date.
 * @param limit - Page size.
 * @param cursor - Optional cursor.
 */
export const listMealsForWeek = async (
  deps: CommunityDeps,
  weekStart: string,
  limit: number,
  cursor?: string
): Promise<{ items: any[]; nextCursor?: string }> => {
  const { clause, params } = cursorClause(cursor);
  const meals = await listCommunityMeals(deps.db, weekStart, limit, clause, params);
  const next =
    meals.length === limit
      ? encodeCursor({
          createdAt: meals[meals.length - 1].createdAt.toISOString(),
          id: meals[meals.length - 1].id
        })
      : undefined;
  return { items: meals, nextCursor: next };
};

/**
 * Upsert a support reaction.
 * @param deps - Dependencies.
 * @param reaction - Reaction payload.
 */
export const supportReaction = async (
  deps: CommunityDeps,
  reaction: Omit<Reaction, 'createdAt'>
): Promise<Reaction> => upsertReaction(deps.db, reaction);

/**
 * Remove a reaction.
 * @param deps - Dependencies.
 * @param reaction - Reaction selector.
 */
export const removeReaction = async (
  deps: CommunityDeps,
  reaction: Pick<Reaction, 'userId' | 'targetType' | 'targetId'>
): Promise<void> => deleteReaction(deps.db, reaction);

