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
import {
  communityReflectionsQuery,
  communityReflectionsResponse,
  communityReflectionCreateRequest,
  communityReflectionCreateResponse,
  communityReflectionDeleteResponse,
  communityMealsQuery,
  communityMealsResponse,
  communityLeaderboardQuery,
  communityLeaderboardResponse,
  communitySupportRequest,
  communitySupportResponse,
  communityUserProfileResponse
} from '../contracts/v1/community';
import { getCurrentCohort } from '../../services/cohorts';
import { fetchProfile } from '../../services/profile';
import { findProfileByUsername } from '../../db/queries/users';
import { leaderboardForWeek } from '../../services/community';

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
    const query = communityReflectionsQuery.parse(req.query);
    const result = await listWeeklyReflections(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.limit,
      query.cursor
    );
    res.json(
      communityReflectionsResponse.parse({
        reflections: result.items.map((r) => ({
          reflection_id: r.id,
          body: r.body,
          created_at: r.createdAt.toISOString()
        })),
        next_cursor: result.nextCursor ?? null
      })
    );
  };

  /**
   * Create a reflection.
   */
  const handleCreateReflection: RequestHandler = async (req, res) => {
    const input = communityReflectionCreateRequest.parse(req.body);
    const reflection = await createReflection(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      input.body
    );
    res.status(201).json(
      communityReflectionCreateResponse.parse({
        reflection_id: reflection.id
      })
    );
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
    res.json(communityReflectionDeleteResponse.parse({ ok: true }));
  };

  /**
   * List community meals for a week.
   */
  const handleMeals: RequestHandler = async (req, res) => {
    const query = communityMealsQuery.parse(req.query);
    const meals = await listMealsForWeek(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.limit,
      query.cursor
    );
    res.json(
      communityMealsResponse.parse({
        meals: meals.items.map((m) => ({
          meal_id: m.id,
          meal_name: m.mealName,
          eaten_at: m.eatenAt.toISOString(),
          metabolic_score: m.metabolicScore,
          tag_keys: m.tagKeys
        })),
        next_cursor: meals.nextCursor ?? null
      })
    );
  };

  /**
   * Leaderboard placeholder for weekly activity.
   */
  const handleLeaderboard: RequestHandler = async (req, res) => {
    const query = communityLeaderboardQuery.parse(req.query);
    const lb = await leaderboardForWeek(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      req.user!.userId,
      query.week_start
    );
    res.json(
      communityLeaderboardResponse.parse({
        rows: lb.rows,
        your_rank: lb.yourRank
      })
    );
  };

  /**
   * Add a support reaction.
   */
  const handleSupport: RequestHandler = async (req, res) => {
    const input = communitySupportRequest.parse(req.body);
    const reaction = await supportReaction(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      {
        actorUserId: req.user!.userId,
        targetType: input.target_type,
        targetId: input.target_id
      }
    );
    res.status(201).json(communitySupportResponse.parse({ ok: true }));
  };

  /**
   * Remove a support reaction.
   */
  const handleRemoveSupport: RequestHandler = async (req, res) => {
    const input = communitySupportRequest.parse(req.query);
    await removeReaction(
      { db: deps.db, idGen: deps.idGen, clock: deps.clock },
      {
        actorUserId: req.user!.userId,
        targetType: input.target_type,
        targetId: input.target_id
      }
    );
    res.json(communitySupportResponse.parse({ ok: true }));
  };

  const handleUserProfile: RequestHandler = async (req, res) => {
    const profile = await findProfileByUsername(deps.db, req.params.username);
    if (!profile) throw new Error('Profile not found');
    res.json(
      communityUserProfileResponse.parse({
        user: {
          nickname: profile.nickname,
          username: profile.username,
          avatar_id: profile.avatarId
        },
        meals: [],
        reflections: []
      })
    );
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
  router.get('/community/users/:username', requireUser(), asyncHandler(handleUserProfile));

  return router;
};

