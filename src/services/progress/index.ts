import { DbClient } from '../../db/pool';
import { getProgressSummary, getProgressCalendar } from '../../db/queries/progress';

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
): Promise<Awaited<ReturnType<typeof getProgressSummary>>> =>
  getProgressSummary(deps.db, userId, endDate, rangeDays);

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
): Promise<Awaited<ReturnType<typeof getProgressCalendar>>> =>
  getProgressCalendar(deps.db, userId, month);

