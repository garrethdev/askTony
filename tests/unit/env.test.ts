import { describe, expect, it, afterEach } from 'vitest';
import { loadEnv, resetEnvCache } from '../../src/config/env';

afterEach(() => {
  resetEnvCache();
});

describe('env parsing', () => {
  it('parses required variables', () => {
    process.env.DATABASE_URL = 'postgres://example';
    process.env.JWT_SECRET = 'x'.repeat(32);
    process.env.BCRYPT_ROUNDS = '10';
    process.env.PORT = '4000';
    const env = loadEnv();
    expect(env.PORT).toBe(4000);
    expect(env.JWT_SECRET.length).toBeGreaterThan(10);
  });
});

