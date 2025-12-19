import { DbClient } from '../../db/pool';
import { Clock } from '../../domain/time';
import { IdGenerator } from '../../domain/ids';
import { MealScan, ScanId, UserId } from '../../domain/types';
import { insertScan, getScan, listScans, updateScan, deleteScan } from '../../db/queries/scans';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import { notFound } from '../../domain/errors';
import { analyzeScanImageV1 } from '../ai/analyzeScanImageV1';
import { getAllowedTags } from '../ai/allowedTags';
import { FakeLlmClient } from '../ai/FakeLlmClient';
import { mapAnalysisToStorage } from '../ai/mappers';

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
  cohortId: string
): Promise<MealScan> =>
  insertScan(deps.db, {
    id: deps.idGen.newId(),
    userId,
    cohortId,
    status: 'uploaded',
    imageStorageKey: ''
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
export const presignUpload = (scanId: ScanId, mimeType: string): { upload_url: string; storage_key: string } => ({
  upload_url: `https://upload.mock/${scanId}`,
  storage_key: `${scanId}-${mimeType}`
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
): Promise<{ scan_id: string; status: 'analyzing' }> => {
  const scan = await getScanById(deps, scanId, userId);
  await updateScan(deps.db, scanId, userId, { status: 'analyzing' });
  try {
    const allowedTags = await getAllowedTags(deps.db);
    const llm = new FakeLlmClient();
    const ai = await analyzeScanImageV1(llm, {
      allowedTags,
      imageUrl: scan.imageStorageKey || 'https://example.com/placeholder',
      mealType: null,
      energyLevel: null,
      eatenAtLocal: null,
      locale: 'en-US'
    });
    const mapped = mapAnalysisToStorage(ai);
    await updateScan(deps.db, scanId, userId, {
      status: 'ready',
      metabolic_score: mapped.contractFields.metabolicScore,
      tag_keys: mapped.contractFields.tagKeys,
      explanation_short: mapped.contractFields.explanationShort,
      analysis_payload: mapped.analysisPayload
    });
    return { scan_id: scanId, status: 'analyzing' };
  } catch (err) {
    await updateScan(deps.db, scanId, userId, { status: 'failed' });
    throw err;
  }
};

export const removeScan = async (
  deps: ScanDeps,
  userId: UserId,
  scanId: ScanId
): Promise<void> => deleteScan(deps.db, scanId, userId);

