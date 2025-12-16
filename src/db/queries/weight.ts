import { DbClient, query } from '../pool';
import { UserId, WeightEntry, WeightEntryId, WeightGoal } from '../../domain/types';

interface WeightGoalRow {
  user_id: string;
  target_weight: string;
  unit: string;
  updated_at: string;
}

interface WeightEntryRow {
  id: string;
  user_id: string;
  weight: string;
  unit: string;
  recorded_at: string;
  created_at: string;
}

const mapGoal = (row: WeightGoalRow): WeightGoal => ({
  userId: row.user_id,
  targetWeight: Number(row.target_weight),
  unit: row.unit as WeightGoal['unit'],
  updatedAt: new Date(row.updated_at)
});

const mapEntry = (row: WeightEntryRow): WeightEntry => ({
  id: row.id,
  userId: row.user_id,
  weight: Number(row.weight),
  unit: row.unit as WeightEntry['unit'],
  recordedAt: new Date(row.recorded_at),
  createdAt: new Date(row.created_at)
});

/**
 * Upsert a user's weight goal.
 * @param db - Database client.
 * @param goal - Goal payload.
 */
export const upsertWeightGoal = async (
  db: DbClient,
  goal: Omit<WeightGoal, 'updatedAt'>
): Promise<WeightGoal> => {
  const result = await query<WeightGoalRow>(
    db,
    `INSERT INTO weight_goals (user_id, target_weight, unit)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET target_weight = EXCLUDED.target_weight,
           unit = EXCLUDED.unit,
           updated_at = now()
     RETURNING *`,
    [goal.userId, goal.targetWeight, goal.unit]
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
  entry: Omit<WeightEntry, 'createdAt'>
): Promise<WeightEntry> => {
  const result = await query<WeightEntryRow>(
    db,
    `INSERT INTO weight_entries (id, user_id, weight, unit, recorded_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      entry.id,
      entry.userId,
      entry.weight,
      entry.unit,
      entry.recordedAt.toISOString().slice(0, 10)
    ]
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
    clauses.push(`recorded_at >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    clauses.push(`recorded_at <= $${idx++}`);
    params.push(to);
  }
  const result = await query<WeightEntryRow>(
    db,
    `SELECT * FROM weight_entries
     WHERE ${clauses.join(' AND ')}
     ORDER BY recorded_at DESC, created_at DESC`,
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
  entryId: WeightEntryId,
  userId: UserId
): Promise<void> => {
  await query(db, `DELETE FROM weight_entries WHERE id = $1 AND user_id = $2`, [
    entryId,
    userId
  ]);
};

