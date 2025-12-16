import { z } from 'zod';

export const createScanSchema = z.object({
  label: z.string().min(1)
});

export const scanListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20))
    .pipe(z.number().int().positive().max(100))
});

