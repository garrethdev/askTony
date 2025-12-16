import { DbClient } from '../../db/pool';
import { IdGenerator } from '../../domain/ids';
import { Clock } from '../../domain/time';
import {
  deleteWeightEntry,
  getWeightGoal,
  insertWeightEntry,
  listWeightEntries,
  upsertWeightGoal
} from '../../db/queries/weight';
import { WeightEntry, WeightEntryId, WeightGoal, UserId } from '../../domain/types';
import { notFound } from '../../domain/errors';

export interface WeightDeps {
  db: DbClient;
  idGen: IdGenerator;
  clock: Clock;
}

/**
 * Upsert a user's weight goal.
 * @param deps - Dependencies.
 * @param userId - User id.
 * @param targetWeight - Target value.
 * @param unit - Measurement unit.
 */
export const saveWeightGoal = async (
  deps: WeightDeps,
  userId: UserId,
  targetWeight: number,
  unit: WeightGoal['unit']
): Promise<WeightGoal> => upsertWeightGoal(deps.db, { userId, targetWeight, unit });

/**
 * Get current weight goal.
 * @param deps - Dependencies.
 * @param userId - User id.
 */
export const fetchWeightGoal = async (
  deps: WeightDeps,
  userId: UserId
): Promise<WeightGoal | null> => getWeightGoal(deps.db, userId);

/**
 * Record a weight entry.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param weight - Weight value.
 * @param unit - Measurement unit.
 * @param recordedAt - Record date.
 */
export const addWeightEntry = async (
  deps: WeightDeps,
  userId: UserId,
  weight: number,
  unit: WeightEntry['unit'],
  recordedAt: string
): Promise<WeightEntry> =>
  insertWeightEntry(deps.db, {
    id: deps.idGen.newId(),
    userId,
    weight,
    unit,
    recordedAt: new Date(recordedAt)
  });

/**
 * List weight entries between dates.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param from - Start date.
 * @param to - End date.
 */
export const listEntries = async (
  deps: WeightDeps,
  userId: UserId,
  from?: string,
  to?: string
): Promise<WeightEntry[]> => listWeightEntries(deps.db, userId, from, to);

/**
 * Remove a weight entry.
 * @param deps - Dependencies.
 * @param userId - Owner id.
 * @param entryId - Entry id.
 */
export const removeEntry = async (
  deps: WeightDeps,
  userId: UserId,
  entryId: WeightEntryId
): Promise<void> => deleteWeightEntry(deps.db, entryId, userId);

