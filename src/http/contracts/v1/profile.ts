import { z } from 'zod';

export const profileResponse = z.object({
  nickname: z.string(),
  username: z.string(),
  avatar_id: z.string(),
  timezone: z.string()
});

export const profileUpdateRequest = z.object({
  nickname: z.string().optional(),
  username: z.string().optional(),
  avatar_id: z.string().optional(),
  timezone: z.string().optional()
});

