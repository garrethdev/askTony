import { z } from 'zod';
import { mealTypeSchema, energyLevelSchema, cursorSchema } from './shared';

export const mealFromScanRequest = z.object({
  scan_id: z.string().uuid(),
  meal_name: z.string(),
  meal_type: mealTypeSchema.optional(),
  eaten_at: z.string().optional(),
  energy_level: energyLevelSchema.optional()
});

export const mealManualRequest = z.object({
  meal_name: z.string(),
  meal_description: z.string().optional(),
  meal_type: mealTypeSchema.optional(),
  eaten_at: z.string().optional(),
  energy_level: energyLevelSchema.optional()
});

export const mealCreateResponse = z.object({
  meal_id: z.string().uuid()
});

export const mealGetResponse = z.object({
  meal_id: z.string().uuid(),
  meal_name: z.string(),
  eaten_at: z.string(),
  metabolic_score: z.number(),
  tag_keys: z.array(z.string()),
  explanation_short: z.string()
});

export const mealListQuery = z.object({
  date: z.string().optional(),
  q: z.string().optional(),
  cursor: cursorSchema.optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

export const mealListItem = z.object({
  meal_id: z.string().uuid(),
  meal_name: z.string(),
  eaten_at: z.string(),
  metabolic_score: z.number(),
  tag_keys: z.array(z.string())
});

export const mealListResponse = z.object({
  meals: z.array(mealListItem),
  next_cursor: z.string().nullable()
});

export const mealDeleteResponse = z.object({
  ok: z.literal(true)
});

