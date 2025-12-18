import { DbClient } from '../../db/pool';
import { query } from '../../db/pool';

export interface ProgressDeps {
  db: DbClient;
}

/**
 * Fetch aggregated progress summary.
 * @param deps - Dependencies.
 * @param userId - User id.
 * @param rangeDays - Number of days to include.
 * @param endDate - End date ISO string.
 */
export const fetchProgressSummary = async (
  deps: ProgressDeps,
  userId: string,
  rangeDays: number,
  endDate: string
): Promise<{ avgScore: number; bestDay: string | null; logFrequency: string; insight?: string }> => {
  const meals = await query<{ date: string; avg: number }>(
    deps.db,
    `SELECT DATE(eaten_at) as date, AVG(metabolic_score) as avg
     FROM meals
     WHERE user_id = $1 AND eaten_at BETWEEN ($2::date - ($3 || ' days')::interval) AND $2::date
     GROUP BY 1`,
    [userId, endDate, rangeDays]
  );
  const scores = meals.rows.map((r) => Number(r.avg ?? 0));
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const best = meals.rows.sort((a, b) => Number(b.avg ?? 0) - Number(a.avg ?? 0))[0];
  const distinctDays = meals.rows.length;
  const logFrequency = `${distinctDays} days out of ${rangeDays}`;
  return { avgScore, bestDay: best ? best.date : null, logFrequency };
};

/**
 * Fetch calendar view of meals for a month.
 * @param deps - Dependencies.
 * @param userId - User id.
 * @param month - Year-month string.
 */
export const fetchProgressCalendar = async (
  deps: ProgressDeps,
  userId: string,
  month: string
): Promise<Array<{ date: string; dailyScore: number | null }>> => {
  const res = await query<{ date: string; score: number | null }>(
    deps.db,
    `SELECT DATE(eaten_at) as date, AVG(metabolic_score) as score
     FROM meals
     WHERE user_id = $1 AND TO_CHAR(eaten_at, 'YYYY-MM') = $2
     GROUP BY 1
     ORDER BY 1`,
    [userId, month]
  );
  return res.rows.map((r) => ({ date: r.date, dailyScore: r.score ? Number(r.score) : null }));
};

