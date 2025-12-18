import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import {
  addWeightEntry,
  fetchWeightGoal,
  listEntries,
  removeEntry,
  saveWeightGoal
} from '../../services/weight';
import {
  weightGoalRequest,
  weightGoalResponse,
  weightEntryRequest,
  weightEntryResponse,
  weightEntriesQuery,
  weightEntriesResponse
} from '../contracts/v1/weight';

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
    res.json(
      weightGoalResponse.parse({
        goal_weight_kg: goal ? goal.goalWeightKg : null
      })
    );
  };

  /**
   * Upsert weight goal.
   */
  const handlePutGoal: RequestHandler = async (req, res) => {
    const input = weightGoalRequest.parse(req.body);
    const goal = await saveWeightGoal(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.goal_weight_kg
    );
    res.json(weightGoalResponse.parse({ goal_weight_kg: goal.goalWeightKg }));
  };

  /**
   * Add a weight entry.
   */
  const handleAddEntry: RequestHandler = async (req, res) => {
    const input = weightEntryRequest.parse(req.body);
    const entry = await addWeightEntry(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.weight_kg,
      input.measured_at
    );
    res.status(201).json(
      weightEntryResponse.parse({
        measured_at: entry.measuredAt,
        weight_kg: entry.weightKg
      })
    );
  };

  /**
   * List weight entries.
   */
  const handleListEntries: RequestHandler = async (req, res) => {
    const query = weightEntriesQuery.parse(req.query);
    const entries = await listEntries(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.from,
      query.to
    );
    res.json(
      weightEntriesResponse.parse({
        entries: entries.map((e) => ({
          measured_at: e.measuredAt,
          weight_kg: e.weightKg
        }))
      })
    );
  };

  router.get('/weight/goal', requireUser(), asyncHandler(handleGetGoal));
  router.put('/weight/goal', requireUser(), asyncHandler(handlePutGoal));
  router.post('/weight/entries', requireUser(), asyncHandler(handleAddEntry));
  router.get('/weight/entries', requireUser(), asyncHandler(handleListEntries));

  return router;
};

