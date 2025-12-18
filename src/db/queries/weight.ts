import { DbClient, query } from '../pool';
import { UserId, WeightEntry, WeightGoal } from '../../domain/types';

interface WeightGoalRow {
  user_id: string;
  goal_weight_kg: string;
  updated_at: string;
}

interface WeightEntryRow {
  user_id: string;
  measured_at: string;
  weight_kg: string;
  created_at: string;
}

const mapGoal = (row: WeightGoalRow): WeightGoal => ({
  userId: row.user_id,
  goalWeightKg: Number(row.goal_weight_kg),
  createdAt: new Date(),
  updatedAt: new Date(row.updated_at)
});

const mapEntry = (row: WeightEntryRow): WeightEntry => ({
  userId: row.user_id,
  measuredAt: row.measured_at,
  weightKg: Number(row.weight_kg),
  createdAt: new Date(row.created_at)
});

/**
 * Upsert a user's weight goal.
 * @param db - Database client.
 * @param goal - Goal payload.
 */
export const upsertWeightGoal = async (
  db: DbClient,
  goal: Omit<WeightGoal, 'updatedAt' | 'createdAt'>
): Promise<WeightGoal> => {
  const result = await query<WeightGoalRow>(
    db,
    `INSERT INTO weight_goals (user_id, goal_weight_kg)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE
       SET goal_weight_kg = EXCLUDED.goal_weight_kg,
           updated_at = now()
     RETURNING *`,
    [goal.userId, goal.goalWeightKg]
  );
  return mapGoal(result.rows[0]);
};

/**
 * Get a user's weight goal.
 * @param db - Database client.
 * @param userId - User id.
 */
export const getWeightGoal = async (
  db: DbClient,
  userId: UserId
): Promise<WeightGoal | null> => {
  const result = await query<WeightGoalRow>(
    db,
    `SELECT * FROM weight_goals WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapGoal(result.rows[0]) : null;
};

/**
 * Insert a weight entry.
 * @param db - Database client.
 * @param entry - Entry payload.
 */
export const insertWeightEntry = async (
  db: DbClient,
  entry: WeightEntry
): Promise<WeightEntry> => {
  const result = await query<WeightEntryRow>(
    db,
    `INSERT INTO weight_entries (user_id, measured_at, weight_kg)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, measured_at) DO UPDATE
       SET weight_kg = EXCLUDED.weight_kg
     RETURNING *`,
    [entry.userId, entry.measuredAt, entry.weightKg]
  );
  return mapEntry(result.rows[0]);
};

/**
 * List weight entries between dates.
 * @param db - Database client.
 * @param userId - User id.
 * @param from - Start date inclusive.
 * @param to - End date inclusive.
 */
export const listWeightEntries = async (
  db: DbClient,
  userId: UserId,
  from?: string,
  to?: string
): Promise<WeightEntry[]> => {
  const clauses = ['user_id = $1'];
  const params: unknown[] = [userId];
  let idx = 2;
  if (from) {
    clauses.push(`measured_at >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    clauses.push(`measured_at <= $${idx++}`);
    params.push(to);
  }
  const result = await query<WeightEntryRow>(
    db,
    `SELECT * FROM weight_entries
     WHERE ${clauses.join(' AND ')}
     ORDER BY measured_at DESC`,
    params
  );
  return result.rows.map(mapEntry);
};

/**
 * Delete a weight entry.
 * @param db - Database client.
 * @param entryId - Entry id.
 * @param userId - Owner id.
 */
export const deleteWeightEntry = async (
  db: DbClient,
  userId: UserId,
  measuredAt: string
): Promise<void> => {
  await query(db, `DELETE FROM weight_entries WHERE user_id = $1 AND measured_at = $2`, [
    userId,
    measuredAt
  ]);
};

