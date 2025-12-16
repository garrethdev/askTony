import { z } from 'zod';

export const manualMealSchema = z.object({
  description: z.string().min(1),
  tags: z.array(z.string()).optional()
});

export const compareSchema = z.object({
  entity_type: z.enum(['meal', 'scan']),
  entity_id: z.string(),
  baseline_days: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 30))
    .pipe(z.number().int().positive())
});

