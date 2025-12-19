import { DbClient } from '../../db/pool';
import { IdGenerator } from '../../domain/ids';
import { Clock } from '../../domain/time';
import { Meal, MealId, UserId, ScanId } from '../../domain/types';
import { insertMeal, getMeal as fetchMeal, listMeals, deleteMeal } from '../../db/queries/meals';
import { getScan } from '../../db/queries/scans';
import { badRequest, notFound } from '../../domain/errors';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import { getCurrentCohort } from '../cohorts';
import { analyzeManualMealV1 } from '../ai/analyzeManualMealV1';
import { getAllowedTags } from '../ai/allowedTags';
import { FakeLlmClient } from '../ai/FakeLlmClient';
import { mapAnalysisToStorage } from '../ai/mappers';

export interface MealDeps {
  db: DbClient;
  idGen: IdGenerator;
  clock: Clock;
}

const cursorClause = (cursor?: string): { clause: string; params: unknown[] } => {
  if (!cursor) return { clause: '', params: [] };
  const payload = decodeCursor(cursor);
  return {
    clause: `AND (created_at, id) < ($3, $4)`,
    params: [payload.createdAt, payload.id]
  };
};

/**
 * Create a meal from an existing scan.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param scanId - Scan identifier.
 * @param description - Meal description.
 */
export const createMealFromScan = async (
  deps: MealDeps,
  userId: UserId,
  scanId: ScanId,
  mealName: string,
  mealType?: Meal['mealType'],
  eatenAt?: string,
  energyLevel?: Meal['energyLevel']
): Promise<Meal> => {
  const scan = await getScan(deps.db, scanId, userId);
  if (!scan) throw notFound('Scan not found');
  const cohort = await getCurrentCohort({ db: deps.db }, userId);
  if (!cohort) throw badRequest('No cohort');
  const scored = {
    metabolic_score: scan.metabolicScore ?? 5,
    tag_keys: scan.tagKeys ?? [],
    explanation_short: scan.explanationShort ?? 'Scored from scan'
  };
  return insertMeal(deps.db, {
    id: deps.idGen.newId(),
    userId,
    cohortId: cohort.id,
    mealScanId: scanId,
    mealName,
    mealDescription: undefined,
    mealType,
    eatenAt: eatenAt ? new Date(eatenAt) : deps.clock.now(),
    energyLevel,
    metabolicScore: scored.metabolic_score,
    tagKeys: scored.tag_keys,
    explanationShort: scored.explanation_short
  });
};

/**
 * Create a manual meal entry.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param description - Meal description.
 * @param tags - Optional tags.
 */
export const createManualMeal = async (
  deps: MealDeps,
  userId: UserId,
  mealName: string,
  mealDescription?: string,
  mealType?: Meal['mealType'],
  eatenAt?: string,
  energyLevel?: Meal['energyLevel']
): Promise<Meal> => {
  const cohort = await getCurrentCohort({ db: deps.db }, userId);
  if (!cohort) throw badRequest('No cohort');
  const allowedTags = await getAllowedTags(deps.db);
  const llm = new FakeLlmClient();
  const analysis = await analyzeManualMealV1(llm, {
    allowedTags,
    mealName,
    mealDescription,
    mealType: mealType ?? null,
    energyLevel: energyLevel ?? null,
    locale: 'en-US'
  });
  const mapped = mapAnalysisToStorage(analysis);
  return insertMeal(deps.db, {
    id: deps.idGen.newId(),
    userId,
    cohortId: cohort.id,
    mealScanId: undefined,
    mealName,
    mealDescription,
    mealType,
    eatenAt: eatenAt ? new Date(eatenAt) : deps.clock.now(),
    energyLevel,
    metabolicScore: mapped.contractFields.metabolicScore,
    tagKeys: mapped.contractFields.tagKeys,
    explanationShort: mapped.contractFields.explanationShort,
    analysisPayload: mapped.analysisPayload
  });
};

/**
 * Fetch a meal by id.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param mealId - Meal identifier.
 */
export const getMealById = async (
  deps: MealDeps,
  userId: UserId,
  mealId: MealId
): Promise<Meal> => {
  const meal = await fetchMeal(deps.db, mealId, userId);
  if (!meal) {
    throw notFound('Meal not found');
  }
  return meal;
};

/**
 * List meals for a user with cursor pagination.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param limit - Page size.
 * @param cursor - Optional cursor string.
 * @param date - Optional date filter.
 * @param search - Optional search string.
 */
export const listUserMeals = async (
  deps: MealDeps,
  userId: UserId,
  limit: number,
  cursor?: string,
  date?: string,
  search?: string
): Promise<{ items: Meal[]; nextCursor?: string }> => {
  const { clause, params } = cursorClause(cursor);
  const meals = await listMeals(deps.db, userId, limit, clause, params, date, search);
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
 * Remove a meal.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param mealId - Meal identifier.
 */
export const removeMeal = async (
  deps: MealDeps,
  userId: UserId,
  mealId: MealId
): Promise<void> => deleteMeal(deps.db, mealId, userId);

