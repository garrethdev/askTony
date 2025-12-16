import { z } from 'zod';

export const bodyCheckinSchema = z.object({
  notes: z.string().optional()
});

