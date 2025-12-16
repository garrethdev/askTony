import { DbClient, query } from '../pool';
import { MealScan, ScanId, UserId } from '../../domain/types';

interface ScanRow {
  id: string;
  user_id: string;
  label: string;
  created_at: string;
}

const mapScan = (row: ScanRow): MealScan => ({
  id: row.id,
  userId: row.user_id,
  label: row.label,
  createdAt: new Date(row.created_at)
});

/**
 * Insert a meal scan row.
 * @param db - Database client.
 * @param scan - Scan payload.
 */
export const insertScan = async (
  db: DbClient,
  scan: Omit<MealScan, 'createdAt'>
): Promise<MealScan> => {
  const result = await query<ScanRow>(
    db,
    `INSERT INTO meal_scans (id, user_id, label)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [scan.id, scan.userId, scan.label]
  );
  return mapScan(result.rows[0]);
};

/**
 * Fetch a scan by id for a user.
 * @param db - Database client.
 * @param scanId - Scan id.
 * @param userId - Owner id.
 */
export const getScan = async (
  db: DbClient,
  scanId: ScanId,
  userId: UserId
): Promise<MealScan | null> => {
  const result = await query<ScanRow>(
    db,
    `SELECT * FROM meal_scans WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [scanId, userId]
  );
  return result.rows[0] ? mapScan(result.rows[0]) : null;
};

/**
 * List scans for a user with cursor pagination.
 * @param db - Database client.
 * @param userId - Owner id.
 * @param limit - Max rows.
 * @param cursorClause - Optional cursor SQL fragment.
 * @param params - Cursor params.
 */
export const listScans = async (
  db: DbClient,
  userId: UserId,
  limit: number,
  cursorClause: string,
  params: unknown[]
): Promise<MealScan[]> => {
  const result = await query<ScanRow>(
    db,
    `SELECT * FROM meal_scans
     WHERE user_id = $1 ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $2`,
    [userId, limit, ...params]
  );
  return result.rows.map(mapScan);
};

