import { z } from 'zod';
import { mealTypeSchema, energyLevelSchema } from './shared';

export const scoringManualMealRequest = z.object({
  meal_name: z.string(),
  meal_description: z.string().optional(),
  meal_type: mealTypeSchema.optional(),
  energy_level: energyLevelSchema.optional(),
  eaten_at: z.string().optional()
});

export const scoringManualMealResponse = z.object({
  metabolic_score: z.number(),
  tag_keys: z.array(z.string()),
  explanation_short: z.string()
});

export const scoringCompareQuery = z.object({
  entity_type: z.enum(['meal', 'scan']),
  entity_id: z.string(),
  baseline_days: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 30))
    .pipe(z.number().int().positive())
});

export const scoringCompareResponse = z.object({
  vs_user: z.object({
    balance: z.string(),
    energy: z.string(),
    digestion: z.string()
  }),
  vs_cohort: z.object({
    balance: z.string(),
    energy: z.string(),
    digestion: z.string()
  })
});

