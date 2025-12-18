import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchBodyCheckin, saveBodyCheckin } from '../../services/bodyCheckins';
import { bodyCheckinRequest, bodyCheckinResponse } from '../contracts/v1/bodyCheckins';

/**
 * Build body check-in routes.
 * @param deps - Route dependencies.
 */
export const bodyCheckinsRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Upsert a body check-in.
   */
  const handleUpsert: RequestHandler = async (req, res) => {
    const input = bodyCheckinRequest.parse(req.body);
    const checkin = await saveBodyCheckin(
      { db: deps.db, clock: deps.clock },
      req.user!.userId,
      req.params.date,
      input.energy_level
    );
    res.json(
      bodyCheckinResponse.parse({
        date: checkin.date,
        energy_level: checkin.energyLevel
      })
    );
  };

  /**
   * Get a body check-in for a date.
   */
  const handleGet: RequestHandler = async (req, res) => {
    const checkin = await fetchBodyCheckin(
      { db: deps.db, clock: deps.clock },
      req.user!.userId,
      req.params.date
    );
    res.json(
      bodyCheckinResponse.parse({
        date: req.params.date,
        energy_level: checkin ? checkin.energyLevel : null
      })
    );
  };

  router.put('/body-checkins/:date', requireUser(), asyncHandler(handleUpsert));
  router.get('/body-checkins/:date', requireUser(), asyncHandler(handleGet));

  return router;
};

