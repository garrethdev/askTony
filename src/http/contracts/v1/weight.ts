import { z } from 'zod';

export const weightGoalResponse = z.object({
  goal_weight_kg: z.number().nullable()
});

export const weightGoalRequest = z.object({
  goal_weight_kg: z.number().positive()
});

export const weightEntryRequest = z.object({
  measured_at: z.string(),
  weight_kg: z.number().positive()
});

export const weightEntryResponse = z.object({
  measured_at: z.string(),
  weight_kg: z.number().positive()
});

export const weightEntriesQuery = z.object({
  from: z.string().optional(),
  to: z.string().optional()
});

export const weightEntriesResponse = z.object({
  entries: z.array(weightEntryResponse)
});

