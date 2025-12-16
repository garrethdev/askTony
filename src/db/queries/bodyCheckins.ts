import { DbClient, query } from '../pool';
import { BodyCheckin, UserId } from '../../domain/types';

interface BodyCheckinRow {
  user_id: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const mapCheckin = (row: BodyCheckinRow): BodyCheckin => ({
  userId: row.user_id,
  date: row.date,
  notes: row.notes ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

/**
 * Upsert a body check-in.
 * @param db - Database client.
 * @param checkin - Check-in payload.
 */
export const upsertBodyCheckin = async (
  db: DbClient,
  checkin: Omit<BodyCheckin, 'createdAt' | 'updatedAt'>
): Promise<BodyCheckin> => {
  const result = await query<BodyCheckinRow>(
    db,
    `INSERT INTO body_checkins (user_id, date, notes)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE
       SET notes = EXCLUDED.notes,
           updated_at = now()
     RETURNING *`,
    [checkin.userId, checkin.date, checkin.notes ?? null]
  );
  return mapCheckin(result.rows[0]);
};

/**
 * Get a body check-in by date.
 * @param db - Database client.
 * @param userId - User id.
 * @param date - Date key.
 */
export const getBodyCheckin = async (
  db: DbClient,
  userId: UserId,
  date: string
): Promise<BodyCheckin | null> => {
  const result = await query<BodyCheckinRow>(
    db,
    `SELECT * FROM body_checkins WHERE user_id = $1 AND date = $2 LIMIT 1`,
    [userId, date]
  );
  return result.rows[0] ? mapCheckin(result.rows[0]) : null;
};

