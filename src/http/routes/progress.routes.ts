import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { calendarQuerySchema, summaryQuerySchema } from '../validators/progress';
import { fetchProgressCalendar, fetchProgressSummary } from '../../services/progress';

const rangeToDays = (range: string): number => {
  if (range === 'this_week') return 7;
  if (range === '30d') return 30;
  return 90;
};

/**
 * Build progress routes.
 * @param deps - Route dependencies.
 */
export const progressRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Get progress summary.
   */
  const handleSummary: RequestHandler = async (req, res) => {
    const query = summaryQuerySchema.parse(req.query);
    const summary = await fetchProgressSummary(
      { db: deps.db },
      req.user!.userId,
      rangeToDays(query.range),
      query.end_date
    );
    res.json(summary);
  };

  /**
   * Get calendar data for a month.
   */
  const handleCalendar: RequestHandler = async (req, res) => {
    const query = calendarQuerySchema.parse(req.query);
    const calendar = await fetchProgressCalendar(
      { db: deps.db },
      req.user!.userId,
      query.month
    );
    res.json(calendar);
  };

  router.get('/progress/summary', requireUser(), asyncHandler(handleSummary));
  router.get('/progress/calendar', requireUser(), asyncHandler(handleCalendar));

  return router;
};

