import { DbClient, query } from '../pool';
import { Meal, MealId, UserId } from '../../domain/types';

interface MealRow {
  id: string;
  user_id: string;
  cohort_id: string;
  meal_scan_id: string | null;
  meal_name: string;
  meal_description: string | null;
  meal_type: string | null;
  eaten_at: string;
  energy_level: string | null;
  metabolic_score: string;
  tag_keys: string[];
  explanation_short: string;
  created_at: string;
  updated_at: string;
}

const mapMeal = (row: MealRow): Meal => ({
  id: row.id,
  userId: row.user_id,
  cohortId: row.cohort_id,
  mealScanId: row.meal_scan_id ?? undefined,
  mealName: row.meal_name,
  mealDescription: row.meal_description ?? undefined,
  mealType: row.meal_type ? (row.meal_type as Meal['mealType']) : undefined,
  eatenAt: new Date(row.eaten_at),
  energyLevel: row.energy_level ? (row.energy_level as Meal['energyLevel']) : undefined,
  metabolicScore: Number(row.metabolic_score),
  tagKeys: row.tag_keys ?? [],
  explanationShort: row.explanation_short,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

/**
 * Insert a meal row.
 * @param db - Database client.
 * @param meal - Meal payload.
 */
export const insertMeal = async (
  db: DbClient,
  meal: Omit<Meal, 'createdAt' | 'updatedAt'>
): Promise<Meal> => {
  const result = await query<MealRow>(
    db,
    `INSERT INTO meals (
      id, user_id, cohort_id, meal_scan_id, meal_name, meal_description, meal_type,
      eaten_at, energy_level, metabolic_score, tag_keys, explanation_short
    )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      meal.id,
      meal.userId,
      meal.cohortId,
      meal.mealScanId ?? null,
      meal.mealName,
      meal.mealDescription ?? null,
      meal.mealType ?? null,
      meal.eatenAt.toISOString(),
      meal.energyLevel ?? null,
      meal.metabolicScore,
      meal.tagKeys,
      meal.explanationShort
    ]
  );
  return mapMeal(result.rows[0]);
};

/**
 * Fetch a meal by id for a user.
 * @param db - Database client.
 * @param mealId - Meal id.
 * @param userId - Owner id.
 */
export const getMeal = async (
  db: DbClient,
  mealId: MealId,
  userId: UserId
): Promise<Meal | null> => {
  const result = await query<MealRow>(
    db,
    `SELECT * FROM meals WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [mealId, userId]
  );
  return result.rows[0] ? mapMeal(result.rows[0]) : null;
};

/**
 * List meals with optional date filter and cursor pagination.
 * @param db - Database client.
 * @param userId - Owner id.
 * @param limit - Max rows.
 * @param cursorClause - Cursor SQL fragment.
 * @param params - Additional parameters for cursor.
 * @param date - Optional date filter (YYYY-MM-DD).
 * @param search - Optional search string.
 */
export const listMeals = async (
  db: DbClient,
  userId: UserId,
  limit: number,
  cursorClause: string,
  params: unknown[],
  date?: string,
  search?: string
): Promise<Meal[]> => {
  const conditions = ['user_id = $1'];
  const values: unknown[] = [userId, limit, ...params];
  let idx = values.length + 1;
  if (date) {
    conditions.push(`DATE(eaten_at) = $${idx++}`);
    values.push(date);
  }
  if (search) {
    conditions.push(`meal_name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }
  const result = await query<MealRow>(
    db,
    `SELECT * FROM meals
     WHERE ${conditions.join(' AND ')} ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    values
  );
  return result.rows.map(mapMeal);
};

/**
 * Delete a meal for a user.
 * @param db - Database client.
 * @param mealId - Meal id.
 * @param userId - Owner id.
 */
export const deleteMeal = async (
  db: DbClient,
  mealId: MealId,
  userId: UserId
): Promise<void> => {
  await query(db, `DELETE FROM meals WHERE id = $1 AND user_id = $2`, [
    mealId,
    userId
  ]);
};

