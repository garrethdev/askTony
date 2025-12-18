import { DbClient, query } from '../pool';
import { BodyCheckin, UserId } from '../../domain/types';

interface BodyCheckinRow {
  user_id: string;
  date: string;
  energy_level: string;
  created_at: string;
}

const mapCheckin = (row: BodyCheckinRow): BodyCheckin => ({
  userId: row.user_id,
  date: row.date,
  energyLevel: row.energy_level as BodyCheckin['energyLevel'],
  createdAt: new Date(row.created_at)
});

export const upsertBodyCheckin = async (
  db: DbClient,
  checkin: Omit<BodyCheckin, 'createdAt'>
): Promise<BodyCheckin> => {
  const result = await query<BodyCheckinRow>(
    db,
    `INSERT INTO body_checkins (user_id, date, energy_level)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE
       SET energy_level = EXCLUDED.energy_level
     RETURNING *`,
    [checkin.userId, checkin.date, checkin.energyLevel]
  );
  return mapCheckin(result.rows[0]);
};

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

