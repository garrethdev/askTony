import { describe, expect, it, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { login } from '../../src/services/auth';
import * as userQueries from '../../src/db/queries/users';

vi.mock('../../src/db/queries/users');

describe('auth service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('issues a token for valid credentials', async () => {
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 8);
    vi.mocked(userQueries.findUserByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: hash,
      createdAt: new Date()
    });
    const deps = {
      db: {} as any,
      clock: { now: () => new Date('2023-01-01') },
      idGen: { newId: () => 'id' },
      jwtSecret: 's'.repeat(32),
      bcryptRounds: 8
    };
    const result = await login(deps, 'test@example.com', password);
    expect(result.token).toBeDefined();
    expect(result.user.id).toBe('user-1');
  });
});

