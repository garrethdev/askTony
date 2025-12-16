import { DbClient, query } from '../pool';

export interface ProgressSummary {
  avgScore: number;
  meals: number;
  weightEntries: number;
}

export interface ProgressCalendarDay {
  date: string;
  meals: number;
  score: number | null;
}

/**
 * Fetch a lightweight progress summary.
 * @param db - Database client.
 * @param userId - User id.
 * @param endDate - Ending date inclusive.
 * @param days - Number of days to look back.
 */
export const getProgressSummary = async (
  db: DbClient,
  userId: string,
  endDate: string,
  days: number
): Promise<ProgressSummary> => {
  const result = await query<{ avg_score: number | null; meals: number }>(
    db,
    `SELECT AVG(score) as avg_score, COUNT(*) as meals
     FROM meals
     WHERE user_id = $1
       AND consumed_at >= ($2::date - ($3 || ' days')::interval)
       AND consumed_at <= $2::date`,
    [userId, endDate, days]
  );
  const weight = await query<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM weight_entries
     WHERE user_id = $1 AND recorded_at <= $2::date
       AND recorded_at >= ($2::date - ($3 || ' days')::interval)`,
    [userId, endDate, days]
  );
  return {
    avgScore: result.rows[0]?.avg_score ?? 0,
    meals: Number(result.rows[0]?.meals ?? 0),
    weightEntries: Number(weight.rows[0]?.count ?? 0)
  };
};

/**
 * Fetch per-day meal counts for a given month.
 * @param db - Database client.
 * @param userId - User id.
 * @param month - ISO year-month.
 */
export const getProgressCalendar = async (
  db: DbClient,
  userId: string,
  month: string
): Promise<ProgressCalendarDay[]> => {
  const result = await query<ProgressCalendarDay>(
    db,
    `SELECT
        DATE_TRUNC('day', consumed_at)::date AS date,
        COUNT(*) as meals,
        AVG(score) as score
     FROM meals
     WHERE user_id = $1
       AND TO_CHAR(consumed_at, 'YYYY-MM') = $2
     GROUP BY 1
     ORDER BY 1 DESC`,
    [userId, month]
  );
  return result.rows.map((row) => ({
    date: row.date,
    meals: Number(row.meals),
    score: row.score ? Number(row.score) : null
  }));
};

