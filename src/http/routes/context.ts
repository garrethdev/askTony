import { DbClient } from '../../db/pool';
import { Clock } from '../../domain/time';
import { IdGenerator } from '../../domain/ids';

export interface RouteDeps {
  db: DbClient;
  clock: Clock;
  idGen: IdGenerator;
  jwtSecret: string;
  bcryptRounds: number;
}

