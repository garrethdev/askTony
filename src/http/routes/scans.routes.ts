import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import {
  analyzeScan,
  createScan,
  getScanById,
  listUserScans,
  presignUpload,
  removeScan,
  updateScan
} from '../../services/scans';
import {
  createScanResponse,
  uploadUrlRequest,
  uploadUrlResponse,
  scanAnalyzeResponse,
  scanGetResponse,
  scanListQuery,
  scanListResponse,
  scanDeleteResponse
} from '../contracts/v1/scans';
import { getCurrentCohort } from '../../services/cohorts';

/**
 * Build meal scan routes.
 * @param deps - Route dependencies.
 */
export const scansRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Create a scan entry.
   */
  const handleCreate: RequestHandler = async (_req, res) => {
    const cohort = await getCurrentCohort({ db: deps.db }, req.user!.userId);
    if (!cohort) throw new Error('No cohort');
    const scan = await createScan(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      cohort.id
    );
    res.status(201).json(
      createScanResponse.parse({ scan_id: scan.id, cohort_id: scan.cohortId })
    );
  };

  /**
   * Get a scan by id.
   */
  const handleGet: RequestHandler = async (req, res) => {
    const scan = await getScanById(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.params.scanId,
      req.user!.userId
    );
    res.json(
      scanGetResponse.parse({
        scan_id: scan.id,
        status: scan.status,
        metabolic_score: scan.metabolicScore,
        tag_keys: scan.tagKeys,
        explanation_short: scan.explanationShort
      })
    );
  };

  /**
   * List scans with cursor pagination.
   */
  const handleList: RequestHandler = async (req, res) => {
    const query = scanListQuery.parse(req.query);
    const result = await listUserScans(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.limit,
      query.cursor
    );
    res.json(
      scanListResponse.parse({
        scans: result.items.map((s) => ({
          scan_id: s.id,
          status: s.status,
          created_at: s.createdAt.toISOString(),
          metabolic_score: s.metabolicScore,
          tag_keys: s.tagKeys
        })),
        next_cursor: result.nextCursor ?? null
      })
    );
  };

  /**
   * Return placeholder upload URL for a scan.
   */
  const handleUploadUrl: RequestHandler = async (req, res) => {
    const input = uploadUrlRequest.parse(req.body);
    const presign = presignUpload(req.params.scanId, input.mime_type);
    await updateScan(deps.db, req.params.scanId, req.user!.userId, {
      image_storage_key: presign.storage_key
    });
    res.json(uploadUrlResponse.parse(presign));
  };

  /**
   * Analyze a scan using heuristic scoring.
   */
  const handleAnalyze: RequestHandler = async (req, res) => {
    const analysis = await analyzeScan(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.params.scanId,
      req.user!.userId
    );
    res.json(scanAnalyzeResponse.parse(analysis));
  };

  /**
   * Delete a scan (logical placeholder).
   */
  const handleDelete: RequestHandler = async (req, res) => {
    await removeScan(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      req.params.scanId
    );
    res.json(scanDeleteResponse.parse({ ok: true }));
  };

  router.post('/meal-scans', requireUser(), asyncHandler(handleCreate));
  router.get('/meal-scans', requireUser(), asyncHandler(handleList));
  router.get('/meal-scans/:scanId', requireUser(), asyncHandler(handleGet));
  router.post(
    '/meal-scans/:scanId/upload-url',
    requireUser(),
    asyncHandler(handleUploadUrl)
  );
  router.post(
    '/meal-scans/:scanId/analyze',
    requireUser(),
    asyncHandler(handleAnalyze)
  );
  router.delete('/meal-scans/:scanId', requireUser(), asyncHandler(handleDelete));

  return router;
};

