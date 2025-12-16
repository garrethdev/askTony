import fs from 'fs';
import path from 'path';
import { loadEnv } from '../config/env';
import { createPool } from './pool';

/**
 * Run all SQL migration files in order.
 */
export const runMigrations = async (): Promise<void> => {
  const env = loadEnv();
  const pool = createPool(env);
  const dir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`Running migration ${file}`);
    await pool.query(sql);
  }
  await pool.end();
};

if (require.main === module) {
  runMigrations().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

