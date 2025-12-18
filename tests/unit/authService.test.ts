import { describe, expect, it, vi, beforeEach } from 'vitest';
import { login } from '../../src/services/auth';
import * as userQueries from '../../src/db/queries/users';

vi.mock('../../src/db/queries/users');

describe('auth service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('issues a token when user exists', async () => {
    vi.mocked(userQueries.findUserByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      authProvider: 'email',
      createdAt: new Date()
    } as any);
    const deps = {
      db: {} as any,
      clock: { now: () => new Date('2023-01-01') },
      idGen: { newId: () => 'id' },
      jwtSecret: 's'.repeat(32)
    };
    const result = await login(deps as any, 'test@example.com', 'Password123!');
    expect(result.token).toBeDefined();
    expect(result.user_id).toBe('user-1');
  });
});

