import { z } from 'zod';
import { cursorSchema, targetTypeSchema } from './shared';

export const communityReflectionsQuery = z.object({
  week_start: z.string(),
  cursor: cursorSchema.optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

export const communityReflectionsResponse = z.object({
  reflections: z.array(z.any()),
  next_cursor: z.string().nullable()
});

export const communityReflectionCreateRequest = z.object({
  body: z.string()
});

export const communityReflectionCreateResponse = z.object({
  reflection_id: z.string().uuid()
});

export const communityReflectionDeleteResponse = z.object({
  ok: z.literal(true)
});

export const communityMealsQuery = z.object({
  week_start: z.string(),
  cursor: cursorSchema.optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

export const communityMealsResponse = z.object({
  meals: z.array(z.any()),
  next_cursor: z.string().nullable()
});

export const communityLeaderboardQuery = z.object({
  week_start: z.string()
});

export const communityLeaderboardResponse = z.object({
  rows: z.array(
    z.object({
      username: z.string(),
      points: z.number(),
      rank: z.number()
    })
  ),
  your_rank: z.number()
});

export const communitySupportRequest = z.object({
  target_type: targetTypeSchema,
  target_id: z.string().uuid()
});

export const communitySupportResponse = z.object({
  ok: z.literal(true)
});

export const communityUserProfileResponse = z.object({
  user: z.object({
    nickname: z.string(),
    username: z.string(),
    avatar_id: z.string()
  }),
  meals: z.array(z.any()),
  reflections: z.array(z.any())
});

