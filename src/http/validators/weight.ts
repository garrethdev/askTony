import { z } from 'zod';

export const weightGoalSchema = z.object({
  targetWeight: z.number().positive(),
  unit: z.enum(['kg', 'lb'])
});

export const weightEntrySchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['kg', 'lb']),
  recordedAt: z.string()
});

export const weightQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional()
});

