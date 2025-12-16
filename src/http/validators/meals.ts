import { z } from 'zod';

export const mealFromScanSchema = z.object({
  scanId: z.string().uuid(),
  description: z.string().min(1)
});

export const manualMealSchema = z.object({
  description: z.string().min(1),
  tags: z.array(z.string()).optional()
});

export const mealQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100)),
  date: z.string().optional(),
  q: z.string().optional()
});

