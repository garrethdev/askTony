import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchProgressCalendar, fetchProgressSummary } from '../../services/progress';
import {
  progressCalendarQuery,
  progressCalendarResponse,
  progressSummaryQuery,
  progressSummaryResponse
} from '../contracts/v1/progress';

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
    const query = progressSummaryQuery.parse(req.query);
    const summary = await fetchProgressSummary(
      { db: deps.db },
      req.user!.userId,
      rangeToDays(query.range),
      query.end_date
    );
    res.json(
      progressSummaryResponse.parse({
        avg_score: summary.avgScore,
        best_day: summary.bestDay,
        log_frequency: summary.logFrequency,
        insight: summary.insight
      })
    );
  };

  /**
   * Get calendar data for a month.
   */
  const handleCalendar: RequestHandler = async (req, res) => {
    const query = progressCalendarQuery.parse(req.query);
    const calendar = await fetchProgressCalendar(
      { db: deps.db },
      req.user!.userId,
      query.month
    );
    res.json(
      progressCalendarResponse.parse({
        days: calendar.map((d) => ({
          date: d.date,
          daily_score: d.dailyScore
        }))
      })
    );
  };

  router.get('/progress/summary', requireUser(), asyncHandler(handleSummary));
  router.get('/progress/calendar', requireUser(), asyncHandler(handleCalendar));

  return router;
};

