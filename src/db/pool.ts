import { Pool, QueryResult } from 'pg';
import { Env } from '../config/env';

export type DbClient = Pick<Pool, 'query'>;

/**
 * Create a pg pool from environment configuration.
 * @param env - Parsed environment configuration.
 */
export const createPool = (env: Env): Pool =>
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10
  });

/**
 * Execute a query and return typed rows.
 * @param db - Database client.
 * @param text - SQL statement.
 * @param params - Parameter list.
 */
export const query = async <T>(
  db: DbClient,
  text: string,
  params: unknown[]
): Promise<QueryResult<T>> => db.query<T>(text, params);

