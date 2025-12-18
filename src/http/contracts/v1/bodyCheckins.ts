import { z } from 'zod';
import { energyLevelSchema } from './shared';

export const bodyCheckinRequest = z.object({
  energy_level: energyLevelSchema
});

export const bodyCheckinResponse = z.object({
  date: z.string(),
  energy_level: energyLevelSchema.or(z.null())
});

