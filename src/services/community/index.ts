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
import { getCurrentCohort } from '../cohorts';
import { query } from '../../db/pool';

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
  body: string
): Promise<Reflection> => {
  const cohort = await getCurrentCohort({ db: deps.db }, userId);
  if (!cohort) throw notFound('No cohort');
  return insertReflection(deps.db, {
    id: deps.idGen.newId(),
    userId,
    cohortId: cohort.id,
    body
  });
};

/**
 * List reflections with cursor pagination.
 * @param deps - Dependencies.
 * @param weekStart - Week start date.
 * @param limit - Page size.
 * @param cursor - Optional cursor string.
 */
export const listWeeklyReflections = async (
  deps: CommunityDeps,
  userId: UserId,
  limit: number,
  cursor?: string
): Promise<{ items: Reflection[]; nextCursor?: string }> => {
  const cohort = await getCurrentCohort({ db: deps.db }, userId);
  if (!cohort) throw notFound('No cohort');
  const { clause, params } = cursorClause(cursor);
  const reflections = await listReflections(deps.db, cohort.id, limit, clause, params);
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
  userId: UserId,
  limit: number,
  cursor?: string
): Promise<{ items: any[]; nextCursor?: string }> => {
  const cohort = await getCurrentCohort({ db: deps.db }, userId);
  if (!cohort) throw notFound('No cohort');
  const { clause, params } = cursorClause(cursor);
  const meals = await listCommunityMeals(deps.db, cohort.id, limit, clause, params);
  const next =
    meals.length === limit
      ? encodeCursor({
          createdAt: meals[meals.length - 1].createdAt.toISOString(),
          id: meals[meals.length - 1].id
        })
      : undefined;
  return { items: meals, nextCursor: next };
};

const pointsForWeek = async (db: any, cohortId: string, weekStart: string) => {
  const meals = await query<{ user_id: string; cnt: string }>(
    db,
    `SELECT user_id, COUNT(*) as cnt
     FROM meals
     WHERE cohort_id = $1 AND DATE_TRUNC('week', eaten_at) = DATE_TRUNC('week', $2::date)
     GROUP BY user_id`,
    [cohortId, weekStart]
  );
  const reflections = await query<{ user_id: string; cnt: string }>(
    db,
    `SELECT user_id, COUNT(*) as cnt
     FROM reflections
     WHERE cohort_id = $1 AND DATE_TRUNC('week', created_at) = DATE_TRUNC('week', $2::date)
     GROUP BY user_id`,
    [cohortId, weekStart]
  );
  const reactions = await query<{ actor_user_id: string; cnt: string }>(
    db,
    `SELECT actor_user_id, COUNT(*) as cnt
     FROM reactions
     WHERE cohort_id = $1 AND DATE_TRUNC('week', created_at) = DATE_TRUNC('week', $2::date)
     GROUP BY actor_user_id`,
    [cohortId, weekStart]
  );
  const scores = new Map<string, number>();
  meals.rows.forEach((r) => scores.set(r.user_id, (scores.get(r.user_id) ?? 0) + Number(r.cnt) * 10));
  reflections.rows.forEach((r) =>
    scores.set(r.user_id, (scores.get(r.user_id) ?? 0) + Number(r.cnt) * 5)
  );
  reactions.rows.forEach((r) =>
    scores.set(r.actor_user_id, (scores.get(r.actor_user_id) ?? 0) + Number(r.cnt) * 1)
  );
  return scores;
};

export const leaderboardForWeek = async (
  deps: CommunityDeps,
  userId: UserId,
  weekStart: string
): Promise<{ rows: { username: string; points: number; rank: number }[]; yourRank: number }> => {
  const cohort = await getCurrentCohort({ db: deps.db }, userId);
  if (!cohort) throw notFound('No cohort');
  const points = await pointsForWeek(deps.db, cohort.id, weekStart);
  const rows = Array.from(points.entries())
    .map(([uid, pts]) => ({ username: uid, points: pts }))
    .sort((a, b) => b.points - a.points)
    .map((row, idx) => ({ ...row, rank: idx + 1 }));
  const your = rows.find((r) => r.username === userId);
  return { rows, yourRank: your ? your.rank : 0 };
};

/**
 * Upsert a support reaction.
 * @param deps - Dependencies.
 * @param reaction - Reaction payload.
 */
export const supportReaction = async (
  deps: CommunityDeps,
  reaction: Omit<Reaction, 'createdAt' | 'id' | 'cohortId'>
): Promise<Reaction> => {
  const cohort = await getCurrentCohort({ db: deps.db }, reaction.actorUserId);
  if (!cohort) throw notFound('No cohort');
  return upsertReaction(deps.db, { ...reaction, cohortId: cohort.id });
};

/**
 * Remove a reaction.
 * @param deps - Dependencies.
 * @param reaction - Reaction selector.
 */
export const removeReaction = async (
  deps: CommunityDeps,
  reaction: Pick<Reaction, 'actorUserId' | 'targetType' | 'targetId'>
): Promise<void> => deleteReaction(deps.db, reaction);

