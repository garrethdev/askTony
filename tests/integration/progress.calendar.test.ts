import request from 'supertest';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';
import { RouteDeps } from '../../src/http/routes/context';
import { systemClock } from '../../src/domain/time';
import { uuidGenerator } from '../../src/domain/ids';

const JWT_SECRET = 'secretsecretsecretsecretsecretsecret';

vi.mock('../../src/services/progress', () => ({
  fetchProgressCalendar: vi.fn().mockResolvedValue([
    { date: '2024-01-01', dailyScore: 7.5 },
    { date: '2024-01-02', dailyScore: null }
  ]),
  fetchProgressSummary: vi.fn()
}));

const deps: RouteDeps = {
  db: {} as any,
  clock: systemClock,
  idGen: uuidGenerator,
  jwtSecret: JWT_SECRET,
  bcryptRounds: 10
};

const authHeader = () =>
  `Bearer ${jwt.sign({ sub: 'user-1' }, JWT_SECRET, { algorithm: 'HS256' })}`;

describe('GET /v1/progress/calendar', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns contract-compliant calendar response', async () => {
    const app = createApp(deps);
    const res = await request(app)
      .get('/v1/progress/calendar')
      .set('Authorization', authHeader())
      .query({ month: '2024-01' })
      .expect(200);

    expect(res.body).toEqual({
      days: [
        { date: '2024-01-01', daily_score: 7.5 },
        { date: '2024-01-02', daily_score: null }
      ]
    });
  });
});

