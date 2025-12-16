import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { mealFromScanSchema, manualMealSchema, mealQuerySchema } from '../validators/meals';
import {
  createManualMeal,
  createMealFromScan,
  getMealById,
  listUserMeals,
  removeMeal
} from '../../services/meals';

/**
 * Build meal routes.
 * @param deps - Route dependencies.
 */
export const mealsRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Create a meal from scan.
   */
  const handleFromScan: RequestHandler = async (req, res) => {
    const input = mealFromScanSchema.parse(req.body);
    const meal = await createMealFromScan(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.scanId,
      input.description
    );
    res.status(201).json(meal);
  };

  /**
   * Create a manual meal.
   */
  const handleManual: RequestHandler = async (req, res) => {
    const input = manualMealSchema.parse(req.body);
    const meal = await createManualMeal(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.description,
      input.tags
    );
    res.status(201).json(meal);
  };

  /**
   * Get a meal by id.
   */
  const handleGet: RequestHandler = async (req, res) => {
    const meal = await getMealById(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      req.params.mealId
    );
    res.json(meal);
  };

  /**
   * List meals with filters.
   */
  const handleList: RequestHandler = async (req, res) => {
    const query = mealQuerySchema.parse(req.query);
    const result = await listUserMeals(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.limit,
      query.cursor,
      query.date,
      query.q
    );
    res.json(result);
  };

  /**
   * Delete a meal.
   */
  const handleDelete: RequestHandler = async (req, res) => {
    await removeMeal(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      req.params.mealId
    );
    res.status(204).send();
  };

  router.post('/meals/from-scan', requireUser(), asyncHandler(handleFromScan));
  router.post('/meals/manual', requireUser(), asyncHandler(handleManual));
  router.get('/meals/:mealId', requireUser(), asyncHandler(handleGet));
  router.get('/meals', requireUser(), asyncHandler(handleList));
  router.delete('/meals/:mealId', requireUser(), asyncHandler(handleDelete));

  return router;
};

