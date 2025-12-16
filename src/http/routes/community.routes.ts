import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import {
  createReflection,
  listMealsForWeek,
  listWeeklyReflections,
  removeReaction,
  removeReflection,
  supportReaction
} from '../../services/community';
import { communityQuerySchema, reactionSchema, reflectionSchema } from '../validators/community';

/**
 * Build community routes.
 * @param deps - Route dependencies.
 */
export const communityRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * List reflections for a week.
   */
  const handleListReflections: RequestHandler = async (req, res) => {
    const query = communityQuerySchema.parse(req.query);
    const result = await listWeeklyReflections(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      query.week_start,
      query.limit,
      query.cursor
    );
    res.json(result);
  };

  /**
   * Create a reflection.
   */
  const handleCreateReflection: RequestHandler = async (req, res) => {
    const input = reflectionSchema.parse(req.body);
    const reflection = await createReflection(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.week_start,
      input.body
    );
    res.status(201).json(reflection);
  };

  /**
   * Delete a reflection.
   */
  const handleDeleteReflection: RequestHandler = async (req, res) => {
    await removeReflection(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      req.params.reflectionId
    );
    res.status(204).send();
  };

  /**
   * List community meals for a week.
   */
  const handleMeals: RequestHandler = async (req, res) => {
    const query = communityQuerySchema.parse(req.query);
    const meals = await listMealsForWeek(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      query.week_start,
      query.limit,
      query.cursor
    );
    res.json(meals);
  };

  /**
   * Leaderboard placeholder for weekly activity.
   */
  const handleLeaderboard: RequestHandler = async (req, res) => {
    res.json({ weekStart: req.query.week_start, leaders: [] });
  };

  /**
   * Add a support reaction.
   */
  const handleSupport: RequestHandler = async (req, res) => {
    const input = reactionSchema.parse(req.body);
    const reaction = await supportReaction(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      {
        userId: req.user!.userId,
        targetType: input.target_type,
        targetId: input.target_id
      }
    );
    res.status(201).json(reaction);
  };

  /**
   * Remove a support reaction.
   */
  const handleRemoveSupport: RequestHandler = async (req, res) => {
    const input = reactionSchema.parse(req.query);
    await removeReaction(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      {
        userId: req.user!.userId,
        targetType: input.target_type,
        targetId: input.target_id
      }
    );
    res.status(204).send();
  };

  router.get('/community/reflections', requireUser(), asyncHandler(handleListReflections));
  router.post('/community/reflections', requireUser(), asyncHandler(handleCreateReflection));
  router.delete(
    '/community/reflections/:reflectionId',
    requireUser(),
    asyncHandler(handleDeleteReflection)
  );
  router.get('/community/meals', requireUser(), asyncHandler(handleMeals));
  router.get('/community/leaderboard', requireUser(), asyncHandler(handleLeaderboard));
  router.post('/community/reactions/support', requireUser(), asyncHandler(handleSupport));
  router.delete(
    '/community/reactions/support',
    requireUser(),
    asyncHandler(handleRemoveSupport)
  );

  return router;
};

