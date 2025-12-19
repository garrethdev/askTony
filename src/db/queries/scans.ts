import { DbClient, query } from '../pool';
import { MealScan, ScanId, UserId, CohortId } from '../../domain/types';

interface ScanRow {
  id: string;
  user_id: string;
  cohort_id: string;
  status: string;
  image_storage_key: string;
  metabolic_score: string | null;
  tag_keys: string[] | null;
  explanation_short: string | null;
  analysis_payload: any | null;
  created_at: string;
  updated_at: string;
}

const mapScan = (row: ScanRow): MealScan => ({
  id: row.id,
  userId: row.user_id,
  cohortId: row.cohort_id,
  status: row.status as MealScan['status'],
  imageStorageKey: row.image_storage_key,
  metabolicScore: row.metabolic_score ? Number(row.metabolic_score) : undefined,
  tagKeys: row.tag_keys ?? undefined,
  explanationShort: row.explanation_short ?? undefined,
  analysisPayload: row.analysis_payload ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

export const insertScan = async (
  db: DbClient,
  scan: Omit<MealScan, 'createdAt' | 'updatedAt'>
): Promise<MealScan> => {
  const result = await query<ScanRow>(
    db,
    `INSERT INTO meal_scans (id, user_id, cohort_id, status, image_storage_key, analysis_payload)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [scan.id, scan.userId, scan.cohortId, scan.status, scan.imageStorageKey, scan.analysisPayload ?? null]
  );
  return mapScan(result.rows[0]);
};

export const updateScan = async (
  db: DbClient,
  scanId: ScanId,
  userId: UserId,
  patch: Partial<{
    status: string;
    image_storage_key: string;
    metabolic_score: number;
    tag_keys: string[];
    explanation_short: string;
    analysis_payload: any;
  }>
): Promise<MealScan | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  const add = (col: string, val: unknown) => {
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  };
  if (patch.status) add('status', patch.status);
  if (patch.image_storage_key !== undefined) add('image_storage_key', patch.image_storage_key);
  if (patch.metabolic_score !== undefined) add('metabolic_score', patch.metabolic_score);
  if (patch.tag_keys !== undefined) add('tag_keys', patch.tag_keys);
  if (patch.explanation_short !== undefined) add('explanation_short', patch.explanation_short);
  if (patch.analysis_payload !== undefined) add('analysis_payload', patch.analysis_payload);
  add('updated_at', new Date().toISOString());
  values.push(scanId, userId);
  if (!fields.length) return getScan(db, scanId, userId);
  const result = await query<ScanRow>(
    db,
    `UPDATE meal_scans SET ${fields.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING *`,
    values
  );
  return result.rows[0] ? mapScan(result.rows[0]) : null;
};

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

export const deleteScan = async (db: DbClient, scanId: ScanId, userId: UserId): Promise<void> => {
  await query(db, `DELETE FROM meal_scans WHERE id = $1 AND user_id = $2`, [scanId, userId]);
};

