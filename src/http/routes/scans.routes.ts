import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { createScanSchema, scanListQuerySchema } from '../validators/scans';
import {
  analyzeScan,
  createScan,
  getScanById,
  listUserScans,
  presignUpload
} from '../../services/scans';

/**
 * Build meal scan routes.
 * @param deps - Route dependencies.
 */
export const scansRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Create a scan entry.
   */
  const handleCreate: RequestHandler = async (req, res) => {
    const input = createScanSchema.parse(req.body);
    const scan = await createScan(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.label
    );
    res.status(201).json(scan);
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
    res.json(scan);
  };

  /**
   * List scans with cursor pagination.
   */
  const handleList: RequestHandler = async (req, res) => {
    const query = scanListQuerySchema.parse(req.query);
    const result = await listUserScans(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.limit,
      query.cursor
    );
    res.json(result);
  };

  /**
   * Return placeholder upload URL for a scan.
   */
  const handleUploadUrl: RequestHandler = async (req, res) => {
    const presign = presignUpload(req.params.scanId);
    res.json(presign);
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
    res.json(analysis);
  };

  /**
   * Delete a scan (logical placeholder).
   */
  const handleDelete: RequestHandler = async (_req, res) => {
    res.status(204).send();
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

