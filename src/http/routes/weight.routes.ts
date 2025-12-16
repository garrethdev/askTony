import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { weightEntrySchema, weightGoalSchema, weightQuerySchema } from '../validators/weight';
import {
  addWeightEntry,
  fetchWeightGoal,
  listEntries,
  removeEntry,
  saveWeightGoal
} from '../../services/weight';

/**
 * Build weight routes.
 * @param deps - Route dependencies.
 */
export const weightRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Get weight goal.
   */
  const handleGetGoal: RequestHandler = async (req, res) => {
    const goal = await fetchWeightGoal(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId
    );
    res.json(goal);
  };

  /**
   * Upsert weight goal.
   */
  const handlePutGoal: RequestHandler = async (req, res) => {
    const input = weightGoalSchema.parse(req.body);
    const goal = await saveWeightGoal(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.targetWeight,
      input.unit
    );
    res.json(goal);
  };

  /**
   * Add a weight entry.
   */
  const handleAddEntry: RequestHandler = async (req, res) => {
    const input = weightEntrySchema.parse(req.body);
    const entry = await addWeightEntry(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.weight,
      input.unit,
      input.recordedAt
    );
    res.status(201).json(entry);
  };

  /**
   * List weight entries.
   */
  const handleListEntries: RequestHandler = async (req, res) => {
    const query = weightQuerySchema.parse(req.query);
    const entries = await listEntries(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.from,
      query.to
    );
    res.json(entries);
  };

  router.get('/weight/goal', requireUser(), asyncHandler(handleGetGoal));
  router.put('/weight/goal', requireUser(), asyncHandler(handlePutGoal));
  router.post('/weight/entries', requireUser(), asyncHandler(handleAddEntry));
  router.get('/weight/entries', requireUser(), asyncHandler(handleListEntries));

  return router;
};

