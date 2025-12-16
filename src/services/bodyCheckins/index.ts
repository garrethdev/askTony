import { DbClient } from '../../db/pool';
import { Clock } from '../../domain/time';
import { BodyCheckin, UserId } from '../../domain/types';
import { getBodyCheckin, upsertBodyCheckin } from '../../db/queries/bodyCheckins';

export interface BodyCheckinDeps {
  db: DbClient;
  clock: Clock;
}

/**
 * Save a body check-in for a specific date.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param date - Date key.
 * @param notes - Optional notes.
 */
export const saveBodyCheckin = async (
  deps: BodyCheckinDeps,
  userId: UserId,
  date: string,
  notes?: string
): Promise<BodyCheckin> =>
  upsertBodyCheckin(deps.db, {
    userId,
    date,
    notes
  });

/**
 * Fetch a body check-in by date.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param date - Date key.
 */
export const fetchBodyCheckin = async (
  deps: BodyCheckinDeps,
  userId: UserId,
  date: string
): Promise<BodyCheckin | null> => getBodyCheckin(deps.db, userId, date);

