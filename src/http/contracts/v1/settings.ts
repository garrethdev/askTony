import { z } from 'zod';

export const settingsResponse = z.object({
  reminders_enabled_meals: z.boolean(),
  reminders_enabled_body_checkin: z.boolean()
});

export const settingsUpdateRequest = z.object({
  reminders_enabled_meals: z.boolean().optional(),
  reminders_enabled_body_checkin: z.boolean().optional()
});

