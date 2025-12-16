import dotenv from 'dotenv';
import { loadEnv } from './config/env';
import { createPool } from './db/pool';
import { createApp } from './app';
import { systemClock } from './domain/time';
import { uuidGenerator } from './domain/ids';

dotenv.config();

const env = loadEnv();
const pool = createPool(env);
const app = createApp({
  db: pool,
  clock: systemClock,
  idGen: uuidGenerator,
  jwtSecret: env.JWT_SECRET,
  bcryptRounds: env.BCRYPT_ROUNDS
});

/**
 * Boot the HTTP server.
 */
export const startServer = (): void => {
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${env.PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

