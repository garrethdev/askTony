import { z } from 'zod';

export const summaryQuerySchema = z.object({
  range: z.enum(['this_week', '30d', '90d']),
  end_date: z.string()
});

export const calendarQuerySchema = z.object({
  month: z.string()
});

