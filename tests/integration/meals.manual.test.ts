import request from 'supertest';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';
import { RouteDeps } from '../../src/http/routes/context';
import { systemClock } from '../../src/domain/time';
import { uuidGenerator } from '../../src/domain/ids';

const JWT_SECRET = 'secretsecretsecretsecretsecretsecret';

vi.mock('../../src/services/meals', () => ({
  createManualMeal: vi.fn().mockResolvedValue({
    id: '00000000-0000-0000-0000-000000000001',
    userId: 'user-1',
    cohortId: 'cohort-1',
    mealName: 'Salad',
    mealDescription: 'Greens',
    mealType: 'lunch',
    eatenAt: new Date('2024-01-01T12:00:00Z'),
    energyLevel: 'ok',
    metabolicScore: 7.5,
    tagKeys: ['balance_green'],
    explanationShort: 'Good balance',
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  createMealFromScan: vi.fn(),
  getMealById: vi.fn(),
  listUserMeals: vi.fn(),
  removeMeal: vi.fn()
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

describe('POST /v1/meals/manual', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns contract-compliant meal creation response', async () => {
    const app = createApp(deps);
    const res = await request(app)
      .post('/v1/meals/manual')
      .set('Authorization', authHeader())
      .send({
        meal_name: 'Salad',
        meal_description: 'Greens',
        meal_type: 'lunch',
        eaten_at: '2024-01-01T12:00:00Z',
        energy_level: 'ok'
      })
      .expect(201);

    expect(res.body).toEqual({
      meal_id: '00000000-0000-0000-0000-000000000001'
    });
  });
});

