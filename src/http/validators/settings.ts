import { z } from 'zod';

export const settingsSchema = z.object({
  remindersEnabled: z.boolean(),
  reminderTime: z.string().optional()
});

