import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import {
  createManualMeal,
  createMealFromScan,
  getMealById,
  listUserMeals,
  removeMeal
} from '../../services/meals';
import {
  mealFromScanRequest,
  mealManualRequest,
  mealCreateResponse,
  mealGetResponse,
  mealListQuery,
  mealListResponse,
  mealDeleteResponse
} from '../contracts/v1/meals';

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
    const input = mealFromScanRequest.parse(req.body);
    const meal = await createMealFromScan(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.scan_id,
      input.meal_name,
      input.meal_type,
      input.eaten_at,
      input.energy_level
    );
    res.status(201).json(mealCreateResponse.parse({ meal_id: meal.id }));
  };

  /**
   * Create a manual meal.
   */
  const handleManual: RequestHandler = async (req, res) => {
    const input = mealManualRequest.parse(req.body);
    const meal = await createManualMeal(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.meal_name,
      input.meal_description,
      input.meal_type,
      input.eaten_at,
      input.energy_level
    );
    res.status(201).json(mealCreateResponse.parse({ meal_id: meal.id }));
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
    res.json(
      mealGetResponse.parse({
        meal_id: meal.id,
        meal_name: meal.mealName,
        eaten_at: meal.eatenAt.toISOString(),
        metabolic_score: meal.metabolicScore,
        tag_keys: meal.tagKeys,
        explanation_short: meal.explanationShort
      })
    );
  };

  /**
   * List meals with filters.
   */
  const handleList: RequestHandler = async (req, res) => {
    const query = mealListQuery.parse(req.query);
    const result = await listUserMeals(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.limit,
      query.cursor,
      query.date,
      query.q
    );
    res.json(
      mealListResponse.parse({
        meals: result.items.map((m) => ({
          meal_id: m.id,
          meal_name: m.mealName,
          eaten_at: m.eatenAt.toISOString(),
          metabolic_score: m.metabolicScore,
          tag_keys: m.tagKeys
        })),
        next_cursor: result.nextCursor ?? null
      })
    );
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
    res.json(mealDeleteResponse.parse({ ok: true }));
  };

  router.post('/meals/from-scan', requireUser(), asyncHandler(handleFromScan));
  router.post('/meals/manual', requireUser(), asyncHandler(handleManual));
  router.get('/meals/:mealId', requireUser(), asyncHandler(handleGet));
  router.get('/meals', requireUser(), asyncHandler(handleList));
  router.delete('/meals/:mealId', requireUser(), asyncHandler(handleDelete));

  return router;
};

