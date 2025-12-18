import { z } from 'zod';

export const signupRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  auth_provider: z.literal('email'),
  timezone: z.string(),
  nickname: z.string(),
  username: z.string(),
  avatar_id: z.string()
});

export const signupResponse = z.object({
  token: z.string(),
  user_id: z.string().uuid()
});

export const loginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginResponse = z.object({
  token: z.string(),
  user_id: z.string().uuid()
});

export const logoutResponse = z.object({
  ok: z.literal(true)
});

export const sessionResponse = z.object({
  user_id: z.string().uuid(),
  email: z.string().email().nullable()
});

