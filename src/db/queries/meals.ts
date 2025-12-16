import { DbClient, query } from '../pool';
import { Meal, MealId, ScanId, UserId } from '../../domain/types';

interface MealRow {
  id: string;
  user_id: string;
  scan_id: string | null;
  description: string;
  tags: string[];
  score: number;
  consumed_at: string;
  created_at: string;
}

const mapMeal = (row: MealRow): Meal => ({
  id: row.id,
  userId: row.user_id,
  scanId: row.scan_id ?? undefined,
  description: row.description,
  tags: row.tags ?? [],
  score: row.score,
  consumedAt: new Date(row.consumed_at),
  createdAt: new Date(row.created_at)
});

/**
 * Insert a meal row.
 * @param db - Database client.
 * @param meal - Meal payload.
 */
export const insertMeal = async (
  db: DbClient,
  meal: Omit<Meal, 'createdAt'>
): Promise<Meal> => {
  const result = await query<MealRow>(
    db,
    `INSERT INTO meals (id, user_id, scan_id, description, tags, score, consumed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      meal.id,
      meal.userId,
      meal.scanId ?? null,
      meal.description,
      meal.tags,
      meal.score,
      meal.consumedAt.toISOString()
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
    conditions.push(`DATE(consumed_at) = $${idx++}`);
    values.push(date);
  }
  if (search) {
    conditions.push(`description ILIKE $${idx++}`);
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

