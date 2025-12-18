import request from 'supertest';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from '../../src/app';
import { RouteDeps } from '../../src/http/routes/context';
import { systemClock } from '../../src/domain/time';
import { uuidGenerator } from '../../src/domain/ids';

vi.mock('../../src/services/auth', () => ({
  signup: vi.fn().mockResolvedValue({
    token: 'token-123',
    user_id: '00000000-0000-0000-0000-000000000000'
  }),
  login: vi.fn(),
  logout: vi.fn(),
  session: vi.fn()
}));

const deps: RouteDeps = {
  db: {} as any,
  clock: systemClock,
  idGen: uuidGenerator,
  jwtSecret: 'secretsecretsecretsecretsecretsecret',
  bcryptRounds: 10
};

describe('POST /v1/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns contract-compliant signup response', async () => {
    const app = createApp(deps);
    const res = await request(app)
      .post('/v1/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        auth_provider: 'email',
        timezone: 'UTC',
        nickname: 'Nick',
        username: 'nick1',
        avatar_id: 'avatar-1'
      })
      .expect(201);

    expect(res.body).toEqual({
      token: 'token-123',
      user_id: '00000000-0000-0000-0000-000000000000'
    });
  });
});

