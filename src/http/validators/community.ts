import { z } from 'zod';

export const reflectionSchema = z.object({
  week_start: z.string(),
  body: z.string().min(1)
});

export const reactionSchema = z.object({
  target_type: z.enum(['meal', 'reflection']),
  target_id: z.string()
});

export const communityQuerySchema = z.object({
  week_start: z.string(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

