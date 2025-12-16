import { DbClient } from '../../db/pool';
import { Clock } from '../../domain/time';
import { IdGenerator } from '../../domain/ids';
import { MealScan, ScanId, UserId } from '../../domain/types';
import { insertScan, getScan, listScans } from '../../db/queries/scans';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import { notFound } from '../../domain/errors';
import { scoreManualMeal } from '../scoring';

export interface ScanDeps {
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
 * Create a new meal scan row.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param label - Scan label.
 */
export const createScan = async (
  deps: ScanDeps,
  userId: UserId,
  label: string
): Promise<MealScan> =>
  insertScan(deps.db, {
    id: deps.idGen.newId(),
    userId,
    label
  });

/**
 * Get a scan by id.
 * @param deps - Dependencies.
 * @param scanId - Scan id.
 * @param userId - Owner id.
 */
export const getScanById = async (
  deps: ScanDeps,
  scanId: ScanId,
  userId: UserId
): Promise<MealScan> => {
  const scan = await getScan(deps.db, scanId, userId);
  if (!scan) throw notFound('Scan not found');
  return scan;
};

/**
 * List scans for a user.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param limit - Page size.
 * @param cursor - Optional cursor.
 */
export const listUserScans = async (
  deps: ScanDeps,
  userId: UserId,
  limit: number,
  cursor?: string
): Promise<{ items: MealScan[]; nextCursor?: string }> => {
  const { clause, params } = cursorClause(cursor);
  const scans = await listScans(deps.db, userId, limit, clause, params);
  const next =
    scans.length === limit
      ? encodeCursor({
          createdAt: scans[scans.length - 1].createdAt.toISOString(),
          id: scans[scans.length - 1].id
        })
      : undefined;
  return { items: scans, nextCursor: next };
};

/**
 * Produce a placeholder upload URL response.
 * @param scanId - Scan identifier.
 */
export const presignUpload = (scanId: ScanId): { url: string; fields: Record<string, string> } => ({
  url: `https://upload.mock/${scanId}`,
  fields: { key: scanId }
});

/**
 * Rough analysis by reusing manual scoring with the label.
 * @param deps - Dependencies.
 * @param scanId - Scan identifier.
 * @param userId - Owner id.
 */
export const analyzeScan = async (
  deps: ScanDeps,
  scanId: ScanId,
  userId: UserId
): Promise<{ score: number; tags: string[]; explanation: string }> => {
  const scan = await getScanById(deps, scanId, userId);
  return scoreManualMeal({ description: scan.label });
};

