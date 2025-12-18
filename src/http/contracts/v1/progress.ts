import { z } from 'zod';

export const progressSummaryQuery = z.object({
  range: z.enum(['this_week', '30d', '90d']),
  end_date: z.string()
});

export const progressSummaryResponse = z.object({
  avg_score: z.number(),
  best_day: z.string().nullable(),
  log_frequency: z.string(),
  insight: z.string().optional()
});

export const progressCalendarQuery = z.object({
  month: z.string()
});

export const progressCalendarResponse = z.object({
  days: z.array(
    z.object({
      date: z.string(),
      daily_score: z.number().nullable()
    })
  )
});

