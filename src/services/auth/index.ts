import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DbClient } from '../../db/pool';
import { AppError, badRequest, unauthorized } from '../../domain/errors';
import { Clock } from '../../domain/time';
import { IdGenerator } from '../../domain/ids';
import { normalizeEmail } from '../../utils/strings';
import { insertUser, findUserByEmail, findUserById, upsertProfile } from '../../db/queries/users';
import { User } from '../../domain/types';

export interface AuthDeps {
  db: DbClient;
  clock: Clock;
  idGen: IdGenerator;
  jwtSecret: string;
  bcryptRounds: number;
}

export interface AuthToken {
  token: string;
  user: Pick<User, 'id' | 'email'>;
}

/**
 * Create a signed JWT for a user id.
 * @param jwtSecret - Signing secret.
 * @param clock - Clock abstraction.
 * @param userId - User identifier.
 */
export const signToken = (
  jwtSecret: string,
  clock: Clock,
  userId: string
): string =>
  jwt.sign({ sub: userId }, jwtSecret, {
    issuer: 'asktony',
    expiresIn: '7d',
    notBefore: 0,
    algorithm: 'HS256',
    header: { typ: 'JWT' },
    mutatePayload: false
  });

/**
 * Handle user signup, creating user and profile then issuing a token.
 * @param deps - Auth dependencies.
 * @param email - Email address.
 * @param password - Plain password.
 * @param name - Display name.
 */
export const signup = async (
  deps: AuthDeps,
  email: string,
  password: string,
  name: string
): Promise<AuthToken> => {
  const normalized = normalizeEmail(email);
  const existing = await findUserByEmail(deps.db, normalized);
  if (existing) {
    throw badRequest('Email already registered');
  }
  const hash = await bcrypt.hash(password, deps.bcryptRounds);
  const userId = deps.idGen.newId();
  const user = await insertUser(deps.db, {
    id: userId,
    email: normalized,
    passwordHash: hash
  });
  await upsertProfile(deps.db, { userId, name, avatarUrl: undefined });
  const token = signToken(deps.jwtSecret, deps.clock, user.id);
  return { token, user: { id: user.id, email: user.email } };
};

/**
 * Handle user login and issue a token.
 * @param deps - Auth dependencies.
 * @param email - Email address.
 * @param password - Plain password.
 */
export const login = async (
  deps: AuthDeps,
  email: string,
  password: string
): Promise<AuthToken> => {
  const normalized = normalizeEmail(email);
  const user = await findUserByEmail(deps.db, normalized);
  if (!user) {
    throw unauthorized('Invalid credentials');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw unauthorized('Invalid credentials');
  }
  const token = signToken(deps.jwtSecret, deps.clock, user.id);
  return { token, user: { id: user.id, email: user.email } };
};

/**
 * Validate current session and return user info.
 * @param deps - Auth dependencies.
 * @param userId - Authenticated user id.
 */
export const session = async (
  deps: AuthDeps,
  userId: string
): Promise<Pick<User, 'id' | 'email'>> => {
  const user = await findUserById(deps.db, userId);
  if (!user) {
    throw unauthorized('Session expired');
  }
  return { id: user.id, email: user.email };
};

/**
 * Stateless logout placeholder to align with interface.
 * @param _deps - Auth dependencies.
 */
export const logout = async (_deps: AuthDeps): Promise<void> => undefined;

